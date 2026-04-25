import type { ClientResult } from '../client.js';
import type { Client } from '../generated/client/index.js';
import type { Character, CharacterPerson, V0RelatedSubject } from '../generated/types.gen.js';

/** `searchCharacters` 的可选参数。 */
export interface SearchCharactersOptions {
  /**
   * NSFW 过滤：
   * - `undefined`（默认）— 返回全部结果（含 R18）
   * - `true` — 仅返回 R18 角色
   * - `false` — 仅返回非 R18 角色
   *
   * 无权限的用户此字段会被忽略，始终不返回 R18 内容。
   */
  nsfw?: boolean;
  limit?: number;
  offset?: number;
}

/** `searchCharacters` 的返回数据结构。 */
export interface SearchCharactersResult {
  total: number;
  limit: number;
  offset: number;
  data: Character[];
}

/**
 * Bangumi 角色模块（Character）的高层 API 封装。
 *
 * 封装了以下接口：
 * - `POST /v0/search/characters` — 角色搜索（实验性 API）
 * - `GET  /v0/characters/{character_id}` — 获取角色详情
 * - `GET  /v0/characters/{character_id}/image` — 获取角色图片
 * - `GET  /v0/characters/{character_id}/subjects` — 获取角色相关条目
 * - `GET  /v0/characters/{character_id}/persons` — 获取角色相关人物
 * - `POST   /v0/characters/{character_id}/collect` — 收藏角色（需登录）
 * - `DELETE /v0/characters/{character_id}/collect` — 取消收藏角色（需登录）
 */
export class CharacterAPI {
  /** 是否输出调试日志，默认 `false`。可在构造时传入或运行时直接赋值切换。 */
  public debug: boolean;

  /**
   * @param client - 由 `@hey-api/client-fetch` 创建的 HTTP 客户端实例
   * @param debug  - 是否开启调试日志（默认 `false`）
   */
  constructor(
    private readonly client: Client,
    debug = false,
  ) {
    this.debug = debug;
  }

  /**
   * 全文搜索角色。
   *
   * `POST /v0/search/characters`
   *
   * 实验性 API，行为可能随时变化。筛选条件目前仅支持 `nsfw`。
   * 搜索无结果时返回 HTTP 200 + 空数组，不返回 404。
   *
   * @param keyword - 搜索关键词（必填）
   * @param options - 可选过滤和分页参数
   * @returns `data.data` — 角色列表；`data.total` — 总匹配数
   */
  async searchCharacters(
    keyword: string,
    options: SearchCharactersOptions = {},
  ): Promise<ClientResult<SearchCharactersResult>> {
    const { nsfw, limit, offset } = options;
    const filter = nsfw === undefined ? undefined : { nsfw };
    const result = await this.client.post<SearchCharactersResult>({
      url: '/v0/search/characters',
      body: { keyword, filter },
      query: { limit, offset },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[CharacterAPI.searchCharacters]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<SearchCharactersResult>;
  }

  /**
   * 获取角色详情。
   *
   * `GET /v0/characters/{character_id}`
   *
   * @param characterId - 角色 ID
   * @returns 角色详情对象
   * @throws 400 — 请求参数有误；404 — 角色不存在
   */
  async getCharacterById(characterId: number): Promise<ClientResult<Character>> {
    const result = await this.client.get<Character>({
      url: '/v0/characters/{character_id}',
      path: { character_id: characterId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[CharacterAPI.getCharacterById]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<Character>;
  }

  /**
   * 获取角色图片的最终 URL。
   *
   * `GET /v0/characters/{character_id}/image`
   *
   * 服务端返回 HTTP 302 重定向到 CDN 图片地址，fetch 会自动跟随重定向。
   * 因此 `response.status` 为 200（CDN），真实图片 URL 取自 `response.url`。
   *
   * @param characterId - 角色 ID
   * @param type        - 图片尺寸：`small` | `grid` | `large` | `medium`
   * @returns `imageUrl` — 最终图片 URL（跟随重定向后）；请求失败时为 `undefined`
   */
  async getCharacterImageById(
    characterId: number,
    type: 'small' | 'grid' | 'large' | 'medium',
  ): Promise<{
    imageUrl: string | undefined;
    error: unknown;
    response: Response;
    request: Request;
  }> {
    const result = (await this.client.get<undefined>({
      url: '/v0/characters/{character_id}/image',
      path: { character_id: characterId },
      query: { type },
    })) as unknown as {
      error: unknown;
      response: Response;
      request: Request;
    };
    const imageUrl =
      result.error === null || result.error === undefined ? result.response.url : undefined;
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[CharacterAPI.getCharacterImageById]', imageUrl);
    }
    return { imageUrl, error: result.error, response: result.response, request: result.request };
  }

  /**
   * 获取角色相关联的条目列表。
   *
   * `GET /v0/characters/{character_id}/subjects`，
   *
   * @param characterId - 角色 ID
   * @returns `data` — `V0RelatedSubject[]`，含 id / type / staff / name / name_cn / image
   * @throws 400 — 请求参数有误；404 — 角色不存在
   */
  async getRelatedSubjectsByCharacterId(
    characterId: number,
  ): Promise<ClientResult<V0RelatedSubject[]>> {
    const result = await this.client.get<V0RelatedSubject[]>({
      url: '/v0/characters/{character_id}/subjects',
      path: { character_id: characterId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log(
        '[CharacterAPI.getRelatedSubjectsByCharacterId]',
        JSON.stringify(result.data, null, 2),
      );
    }
    return result as unknown as ClientResult<V0RelatedSubject[]>;
  }

  /**
   * 获取角色相关联的现实人物/CV 列表。
   *
   * `GET /v0/characters/{character_id}/persons`
   *
   * @param characterId - 角色 ID
   * @returns `data` — `CharacterPerson[]`，含 id / name / type / subject_id / subject_type / staff
   * @throws 400 — 请求参数有误；404 — 角色不存在
   */
  async getRelatedPersonsByCharacterId(
    characterId: number,
  ): Promise<ClientResult<CharacterPerson[]>> {
    const result = await this.client.get<CharacterPerson[]>({
      url: '/v0/characters/{character_id}/persons',
      path: { character_id: characterId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log(
        '[CharacterAPI.getRelatedPersonsByCharacterId]',
        JSON.stringify(result.data, null, 2),
      );
    }
    return result as unknown as ClientResult<CharacterPerson[]>;
  }

  /**
   * 收藏角色。
   *
   * `POST /v0/characters/{character_id}/collect`
   *
   * 需要登录认证（Bearer Token）。未登录时返回 401。
   * 成功时返回 HTTP 204 No Content，`data` 为 `undefined`。
   *
   * @param characterId - 角色 ID
   * @returns 成功时 `error` 为 `undefined`，`response.status` 为 204
   * @throws 400 — 参数有误；401 — 未登录；404 — 角色不存在
   */
  async collectCharacter(characterId: number): Promise<ClientResult<undefined>> {
    const result = await this.client.post<undefined>({
      url: '/v0/characters/{character_id}/collect',
      path: { character_id: characterId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[CharacterAPI.collectCharacter]', result.response.status);
    }
    return result as unknown as ClientResult<undefined>;
  }

  /**
   * 取消收藏角色。
   *
   * `DELETE /v0/characters/{character_id}/collect`
   *
   * 需要登录认证（Bearer Token）。未登录时返回 401。
   * 成功时返回 HTTP 204 No Content，`data` 为 `undefined`。
   *
   * @param characterId - 角色 ID
   * @returns 成功时 `error` 为 `undefined`，`response.status` 为 204
   * @throws 400 — 参数有误；401 — 未登录；404 — 角色不存在
   */
  async uncollectCharacter(characterId: number): Promise<ClientResult<undefined>> {
    const result = await this.client.delete<undefined>({
      url: '/v0/characters/{character_id}/collect',
      path: { character_id: characterId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[CharacterAPI.uncollectCharacter]', result.response.status);
    }
    return result as unknown as ClientResult<undefined>;
  }
}
