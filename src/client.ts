import { SubjectAPI } from './api/01-subjects.js';
import { EpisodeAPI } from './api/02-episodes.js';
import { CharacterAPI } from './api/03-characters.js';
import { PersonAPI } from './api/04-persons.js';
import { UserAPI } from './api/05-users.js';
import { CollectionAPI } from './api/06-collections.js';
import { RevisionAPI } from './api/07-revisions.js';
import { IndexAPI } from './api/08-indices.js';
import { createClient } from './generated/client/index.js';
import { VERSION } from './version.js';

const DEFAULT_BASE_URL = 'https://api.bgm.tv';

const DEFAULT_USER_AGENT = `bangumi-api-client/${VERSION} (https://github.com/VaillerTeeter/bangumi-api-client)`;

export interface BangumiClientOptions {
  token?: string;
  baseUrl?: string;
  userAgent?: string;
}

/**
 * 所有 API 方法的通用返回结构。
 *
 * `T` 为 `data` 字段的具体类型，与底层 `@hey-api/client-fetch` 的调用结果形状一致，
 * 替代原先的 `return result as never` 类型擦除写法。
 */
export interface ClientResult<T> {
  data: T | undefined;
  error: unknown;
  response: Response;
  request: Request;
}

export interface BangumiClient {
  readonly subjects: SubjectAPI;
  readonly episodes: EpisodeAPI;
  readonly characters: CharacterAPI;
  readonly persons: PersonAPI;
  readonly users: UserAPI;
  readonly collections: CollectionAPI;
  readonly revisions: RevisionAPI;
  readonly indices: IndexAPI;
  readonly _client: ReturnType<typeof createClient>;
}

/**
 * 创建 Bangumi API 客户端。
 *
 * @param options - 客户端初始化选项（均为可选）
 * @returns 初始化后的 {@link BangumiClient} 实例
 * @example
 * ```ts
 * // 匿名访问（不需要 token 的接口）
 * const bgm = createBangumiClient();
 *
 * // 带 token 的认证访问
 * const bgm = createBangumiClient({ token: 'your-access-token' });
 *
 * const { data } = await bgm.subjects.get(374791);
 * const { data: results } = await bgm.subjects.search('鬼灭之刃', { sort: 'rank' });
 * ```
 */
export function createBangumiClient(options: BangumiClientOptions = {}): BangumiClient {
  const { baseUrl = DEFAULT_BASE_URL, userAgent = DEFAULT_USER_AGENT } = options;

  const headers: Record<string, string> = { 'User-Agent': userAgent };
  if (options.token !== undefined && options.token.trim().length > 0) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const client = createClient({ baseUrl, headers });

  return {
    subjects: new SubjectAPI(client),
    episodes: new EpisodeAPI(client),
    characters: new CharacterAPI(client),
    persons: new PersonAPI(client),
    users: new UserAPI(client),
    collections: new CollectionAPI(client),
    revisions: new RevisionAPI(client),
    indices: new IndexAPI(client),
    _client: client,
  };
}
