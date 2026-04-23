import { readFileSync } from 'node:fs';
import { createClient } from './generated/client/index.js';
import { SubjectAPI } from './api/01-subjects.js';
import { EpisodeAPI } from './api/02-episodes.js';
import { CharacterAPI } from './api/03-characters.js';
import { PersonAPI } from './api/04-persons.js';
import { UserAPI } from './api/05-users.js';
import { CollectionAPI } from './api/06-collections.js';
import { RevisionAPI } from './api/07-revisions.js';
import { IndexAPI } from './api/08-indices.js';

const DEFAULT_BASE_URL = 'https://api.bgm.tv';

const { version: PKG_VERSION } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as { version: string };

const DEFAULT_USER_AGENT = `bangumi-api-client/${PKG_VERSION} (https://github.com/VaillerTeeter/bangumi-api-client)`;

export interface BangumiClientOptions {
  /** Bearer access token，用于需要认证的接口和写操作 */
  token?: string;
  /** API 基础 URL，默认 https://api.bgm.tv */
  baseUrl?: string;
  /**
   * User-Agent 字符串。Bangumi 要求所有客户端设置具描述性的 User-Agent。
   * @see https://github.com/bangumi/api/blob/master/docs-raw/user%20agent.md
   */
  userAgent?: string;
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
  /** 底层 @hey-api/client-fetch 实例，供高级用法使用 */
  readonly _client: ReturnType<typeof createClient>;
}

/**
 * 创建 Bangumi API 客户端。
 *
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
  const { token, baseUrl = DEFAULT_BASE_URL, userAgent = DEFAULT_USER_AGENT } = options;

  const headers: Record<string, string> = { 'User-Agent': userAgent };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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
