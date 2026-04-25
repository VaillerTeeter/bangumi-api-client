import type { ClientResult } from '../client.js';
import type { Client } from '../generated/client/index.js';
import type {
  EpisodeCollectionType,
  EpType,
  Page,
  PagedUserCharacterCollection,
  PagedUserPersonCollection,
  PagedUserCollection,
  SubjectType,
  SubjectCollectionType,
  UserCharacterCollection,
  UserEpisodeCollection,
  UserPersonCollection,
  UserSubjectCollection,
  UserSubjectCollectionModifyPayload,
} from '../generated/types.gen.js';

/** `getUserCollections` 的可选参数。 */
export interface GetUserCollectionsOptions {
  subject_type?: SubjectType;
  type?: SubjectCollectionType;
  limit?: number;
  offset?: number;
}

/** `getUserSubjectEpisodeCollection` 的可选参数。 */
export interface GetUserSubjectEpisodeCollectionOptions {
  offset?: number;
  limit?: number;
  episode_type?: EpType;
}

/** `patchUserSubjectEpisodeCollection` 的必填请求体。 */
export interface PatchUserSubjectEpisodeCollectionPayload {
  episode_id: number[];
  type: EpisodeCollectionType;
}

/**
 * Bangumi 收藏模块（Collection）的高层 API 封装。
 *
 * 封装了以下接口：
 * - `GET /v0/users/{username}/collections` — 获取用户收藏列表
 * - `GET /v0/users/{username}/collections/{subject_id}` — 获取用户单个条目收藏
 * - `POST /v0/users/-/collections/{subject_id}` — 新增或修改用户单个条目收藏
 * - `PATCH /v0/users/-/collections/{subject_id}` — 修改用户单个收藏
 * - `GET /v0/users/-/collections/{subject_id}/episodes` — 获取条目下各章节的收藏状态
 * - `PATCH /v0/users/-/collections/{subject_id}/episodes` — 批量修改条目章节收藏状态
 * - `GET /v0/users/-/collections/-/episodes/{episode_id}` — 获取单个章节收藏信息
 * - `PUT /v0/users/-/collections/-/episodes/{episode_id}` — 更新单个章节收藏状态
 * - `GET /v0/users/{username}/collections/-/characters` — 获取用户角色收藏列表
 * - `GET /v0/users/{username}/collections/-/characters/{character_id}` — 获取用户单个角色收藏信息
 * - `GET /v0/users/{username}/collections/-/persons` — 获取用户人物收藏列表
 * - `GET /v0/users/{username}/collections/-/persons/{person_id}` — 获取用户单个人物收藏信息
 */
export class CollectionAPI {
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
   * 获取对应用户的条目收藏列表。
   *
   * `GET /v0/users/{username}/collections`
   *
   * 查看私有收藏需要 access token。
   *
   * @param username - 用户名（设置了用户名后无法使用 UID）
   * @param options  - 可选过滤和分页参数
   * @returns `data.data` — `UserSubjectCollection[]`；`data.total` — 总数
   * @throws 400 — 请求参数有误；404 — 用户不存在
   */
  async getUserCollections(
    username: string,
    options: GetUserCollectionsOptions = {},
  ): Promise<ClientResult<PagedUserCollection>> {
    const { subject_type, type, limit, offset } = options;
    const result = await this.client.get<PagedUserCollection>({
      url: '/v0/users/{username}/collections',
      path: { username },
      query: { subject_type, type, limit, offset },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[CollectionAPI.getUserCollections]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<PagedUserCollection>;
  }

  /**
   * 获取对应用户的单个条目收藏。
   *
   * `GET /v0/users/{username}/collections/{subject_id}`
   *
   * 查看私有收藏需要 access token。
   *
   * @param username  - 用户名
   * @param subjectId - 条目 ID
   * @returns `UserSubjectCollection`（含 subject 详情）
   * @throws 400 — 请求参数有误；404 — 用户不存在、条目未收藏或条目为私有收藏
   */
  async getUserCollectionBySubjectId(
    username: string,
    subjectId: number,
  ): Promise<ClientResult<UserSubjectCollection>> {
    const result = await this.client.get<UserSubjectCollection>({
      url: '/v0/users/{username}/collections/{subject_id}',
      path: { username, subject_id: subjectId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log(
        '[CollectionAPI.getUserCollectionBySubjectId]',
        JSON.stringify(result.data, null, 2),
      );
    }
    return result as unknown as ClientResult<UserSubjectCollection>;
  }

  /**
   * 新增或修改当前登录用户的单个条目收藏。
   *
   * `POST /v0/users/-/collections/{subject_id}`
   *
   * 修改条目收藏状态，不存在则创建，存在则修改。所有请求体字段均可选。
   * 由于直接修改剧集条目的完成度可能引起意料之外效果，`ep_status`/`vol_status`
   * 只能用于修改书籍类条目的完成度。
   *
   * **需要 access token（认证）。**
   *
   * @param subjectId - 条目 ID
   * @param payload   - 可选的收藏信息（type / rate / comment / private / tags / ep_status / vol_status）
   * @returns 成功时 HTTP 204，无响应体
   * @throws 400 — 参数有误；401 — 未登录；404 — 条目不存在
   */
  async postUserCollection(
    subjectId: number,
    payload: UserSubjectCollectionModifyPayload = {},
  ): Promise<ClientResult<undefined>> {
    const result = await this.client.post<undefined>({
      url: '/v0/users/-/collections/{subject_id}',
      path: { subject_id: subjectId },
      body: payload,
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[CollectionAPI.postUserCollection]', result.response.status);
    }
    return result as unknown as ClientResult<undefined>;
  }

  /**
   * 修改当前登录用户的单个条目收藏（条目必须已收藏）。
   *
   * `PATCH /v0/users/-/collections/{subject_id}`
   *
   * 与 POST 的区别：条目不存在收藏记录时返回 404。所有请求体字段均可选。
   * 由于直接修改剧集条目的完成度可能引起意料之外效果，`ep_status`/`vol_status`
   * 只能用于修改书籍类条目的完成度。
   *
   * **需要 access token（认证）。**
   *
   * @param subjectId - 条目 ID
   * @param payload   - 可选的收藏信息（type / rate / comment / private / tags / ep_status / vol_status）
   * @returns 成功时 HTTP 204，无响应体
   * @throws 400 — 参数有误；401 — 未登录；404 — 条目不存在或未收藏
   */
  async patchUserCollection(
    subjectId: number,
    payload: UserSubjectCollectionModifyPayload = {},
  ): Promise<ClientResult<undefined>> {
    const result = await this.client.patch<undefined>({
      url: '/v0/users/-/collections/{subject_id}',
      path: { subject_id: subjectId },
      body: payload,
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[CollectionAPI.patchUserCollection]', result.response.status);
    }
    return result as unknown as ClientResult<undefined>;
  }

  /**
   * 获取当前登录用户在某条目下各章节的收藏状态。
   *
   * `GET /v0/users/-/collections/{subject_id}/episodes`
   *
   * **需要 access token（认证）。**
   *
   * @param subjectId - 条目 ID
   * @param options   - 可选分页与章节类型过滤参数
   * @returns 分页的 `UserEpisodeCollection` 列表，每条含 `episode`、`type`、`updated_at`
   * @throws 400 — 参数有误；401 — 未登录；404 — 条目不存在
   */
  async getUserSubjectEpisodeCollection(
    subjectId: number,
    options: GetUserSubjectEpisodeCollectionOptions = {},
  ): Promise<ClientResult<Page & { data?: UserEpisodeCollection[] }>> {
    const { offset, limit, episode_type } = options;
    const result = await this.client.get<Page & { data?: UserEpisodeCollection[] }>({
      url: '/v0/users/-/collections/{subject_id}/episodes',
      path: { subject_id: subjectId },
      query: { offset, limit, episode_type },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log(
        '[CollectionAPI.getUserSubjectEpisodeCollection]',
        JSON.stringify(result.data, null, 2),
      );
    }
    return result as unknown as ClientResult<Page & { data?: UserEpisodeCollection[] }>;
  }

  /**
   * 批量修改当前登录用户在某条目下的章节收藏状态，同时重新计算条目完成度。
   *
   * `PATCH /v0/users/-/collections/{subject_id}/episodes`
   *
   * **需要 access token（认证）。**
   *
   * @param subjectId - 条目 ID
   * @param payload   - 必填：`episode_id`（章节 ID 列表）和 `type`（收藏状态 1/2/3）
   * @returns 成功时 HTTP 204，无响应体
   * @throws 400 — 参数有误；401 — 未登录；404 — 条目不存在
   */
  async patchUserSubjectEpisodeCollection(
    subjectId: number,
    payload: PatchUserSubjectEpisodeCollectionPayload,
  ): Promise<ClientResult<undefined>> {
    const result = await this.client.patch<undefined>({
      url: '/v0/users/-/collections/{subject_id}/episodes',
      path: { subject_id: subjectId },
      body: payload,
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[CollectionAPI.patchUserSubjectEpisodeCollection]', result.response.status);
    }
    return result as unknown as ClientResult<undefined>;
  }

  /**
   * 获取当前登录用户对某章节的收藏信息。
   *
   * `GET /v0/users/-/collections/-/episodes/{episode_id}`
   *
   * **需要 access token（认证）。**
   *
   * @param episodeId - 章节 ID
   * @returns `UserEpisodeCollection`（含 `episode`、`type`、`updated_at`）
   * @throws 400 — episode ID 无效；401 — 未登录；404 — 条目或章节不存在
   */
  async getUserEpisodeCollection(episodeId: number): Promise<ClientResult<UserEpisodeCollection>> {
    const result = await this.client.get<UserEpisodeCollection>({
      url: '/v0/users/-/collections/-/episodes/{episode_id}',
      path: { episode_id: episodeId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[CollectionAPI.getUserEpisodeCollection]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<UserEpisodeCollection>;
  }

  /**
   * 更新当前登录用户对某章节的收藏状态。
   *
   * `PUT /v0/users/-/collections/-/episodes/{episode_id}`
   *
   * **需要 access token（认证）。**
   *
   * @param episodeId - 章节 ID
   * @param type      - 收藏状态：1=想看 / 2=看过 / 3=抛弃
   * @returns 成功时 HTTP 204，无响应体
   * @throws 400 — episode ID 无效或所属条目未收藏；401 — 未登录；404 — 条目或章节不存在
   */
  async putUserEpisodeCollection(
    episodeId: number,
    type: EpisodeCollectionType,
  ): Promise<ClientResult<undefined>> {
    const result = await this.client.put<undefined>({
      url: '/v0/users/-/collections/-/episodes/{episode_id}',
      path: { episode_id: episodeId },
      body: { type },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[CollectionAPI.putUserEpisodeCollection]', result.response.status);
    }
    return result as unknown as ClientResult<undefined>;
  }

  /**
   * 获取对应用户的角色收藏列表。
   *
   * `GET /v0/users/{username}/collections/-/characters`
   *
   * @param username - 用户名（设置了用户名后无法使用 UID）
   * @returns 分页的 `UserCharacterCollection` 列表
   * @throws 404 — 用户不存在
   */
  async getUserCharacterCollections(
    username: string,
  ): Promise<ClientResult<PagedUserCharacterCollection>> {
    const result = await this.client.get<PagedUserCharacterCollection>({
      url: '/v0/users/{username}/collections/-/characters',
      path: { username },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log(
        '[CollectionAPI.getUserCharacterCollections]',
        JSON.stringify(result.data, null, 2),
      );
    }
    return result as unknown as ClientResult<PagedUserCharacterCollection>;
  }

  /**
   * 获取对应用户的单个角色收藏信息。
   *
   * `GET /v0/users/{username}/collections/-/characters/{character_id}`
   *
   * @param username    - 用户名
   * @param characterId - 角色 ID
   * @returns `UserCharacterCollection`
   * @throws 400 — character ID 无效；404 — 用户或角色不存在
   */
  async getUserCharacterCollection(
    username: string,
    characterId: number,
  ): Promise<ClientResult<UserCharacterCollection>> {
    const result = await this.client.get<UserCharacterCollection>({
      url: '/v0/users/{username}/collections/-/characters/{character_id}',
      path: { username, character_id: characterId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log(
        '[CollectionAPI.getUserCharacterCollection]',
        JSON.stringify(result.data, null, 2),
      );
    }
    return result as unknown as ClientResult<UserCharacterCollection>;
  }

  /**
   * 获取对应用户的人物收藏列表。
   *
   * `GET /v0/users/{username}/collections/-/persons`
   *
   * @param username - 用户名
   * @returns `PagedUserPersonCollection`
   * @throws 404 — 用户不存在
   */
  async getUserPersonCollections(
    username: string,
  ): Promise<ClientResult<PagedUserPersonCollection>> {
    const result = await this.client.get<PagedUserPersonCollection>({
      url: '/v0/users/{username}/collections/-/persons',
      path: { username },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[CollectionAPI.getUserPersonCollections]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<PagedUserPersonCollection>;
  }

  /**
   * 获取对应用户的单个人物收藏信息。
   *
   * `GET /v0/users/{username}/collections/-/persons/{person_id}`
   *
   * @param username - 用户名
   * @param personId - 人物 ID
   * @returns `UserPersonCollection`
   * @throws 400 — person ID 无效；404 — 用户或人物不存在
   */
  async getUserPersonCollection(
    username: string,
    personId: number,
  ): Promise<ClientResult<UserPersonCollection>> {
    const result = await this.client.get<UserPersonCollection>({
      url: '/v0/users/{username}/collections/-/persons/{person_id}',
      path: { username, person_id: personId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[CollectionAPI.getUserPersonCollection]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<UserPersonCollection>;
  }
}
