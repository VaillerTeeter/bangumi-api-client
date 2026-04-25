import type { ClientResult } from '../client.js';
import type { Client } from '../generated/client/index.js';
import type {
  PagedRevision,
  PersonRevision,
  CharacterRevision,
  SubjectRevision,
  DetailedRevision,
} from '../generated/types.gen.js';

/** 编辑历史列表查询的可选参数。 */
export interface GetRevisionsOptions {
  limit?: number;
  offset?: number;
}

/**
 * Bangumi 编辑历史模块（Revision）的高层 API 封装。
 *
 * 封装了以下接口：
 * - `GET /v0/revisions/persons` — 获取人物编辑历史列表
 * - `GET /v0/revisions/persons/{revision_id}` — 获取人物单条编辑历史
 * - `GET /v0/revisions/characters` — 获取角色编辑历史列表
 * - `GET /v0/revisions/characters/{revision_id}` — 获取角色单条编辑历史
 * - `GET /v0/revisions/subjects` — 获取条目编辑历史列表
 * - `GET /v0/revisions/subjects/{revision_id}` — 获取条目单条编辑历史
 * - `GET /v0/revisions/episodes` — 获取章节编辑历史列表
 * - `GET /v0/revisions/episodes/{revision_id}` — 获取章节单条编辑历史
 */
export class RevisionAPI {
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
   * 获取人物编辑历史列表。
   *
   * `GET /v0/revisions/persons`
   *
   * @param personId - 人物 ID（必填）
   * @param options  - 可选分页参数
   * @returns `PagedRevision`
   * @throws 400 — 参数有误
   */
  async getPersonRevisions(
    personId: number,
    options: GetRevisionsOptions = {},
  ): Promise<ClientResult<PagedRevision>> {
    const { limit, offset } = options;
    const result = await this.client.get<PagedRevision>({
      url: '/v0/revisions/persons',
      query: { person_id: personId, limit, offset },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[RevisionAPI.getPersonRevisions]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<PagedRevision>;
  }

  /**
   * 获取人物单条编辑历史。
   *
   * `GET /v0/revisions/persons/{revision_id}`
   *
   * @param revisionId - 历史版本 ID
   * @returns `PersonRevision`
   * @throws 400 — revision ID 无效；404 — 记录不存在
   */
  async getPersonRevisionByRevisionId(revisionId: number): Promise<ClientResult<PersonRevision>> {
    const result = await this.client.get<PersonRevision>({
      url: '/v0/revisions/persons/{revision_id}',
      path: { revision_id: revisionId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log(
        '[RevisionAPI.getPersonRevisionByRevisionId]',
        JSON.stringify(result.data, null, 2),
      );
    }
    return result as unknown as ClientResult<PersonRevision>;
  }

  /**
   * 获取角色编辑历史列表。
   *
   * `GET /v0/revisions/characters`
   *
   * @param characterId - 角色 ID（必填）
   * @param options     - 可选分页参数
   * @returns `PagedRevision`
   * @throws 400 — 参数有误
   */
  async getCharacterRevisions(
    characterId: number,
    options: GetRevisionsOptions = {},
  ): Promise<ClientResult<PagedRevision>> {
    const { limit, offset } = options;
    const result = await this.client.get<PagedRevision>({
      url: '/v0/revisions/characters',
      query: { character_id: characterId, limit, offset },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[RevisionAPI.getCharacterRevisions]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<PagedRevision>;
  }

  /**
   * 获取角色单条编辑历史。
   *
   * `GET /v0/revisions/characters/{revision_id}`
   *
   * @param revisionId - 历史版本 ID
   * @returns `CharacterRevision`
   * @throws 400 — revision ID 无效；404 — 记录不存在
   */
  async getCharacterRevisionByRevisionId(
    revisionId: number,
  ): Promise<ClientResult<CharacterRevision>> {
    const result = await this.client.get<CharacterRevision>({
      url: '/v0/revisions/characters/{revision_id}',
      path: { revision_id: revisionId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log(
        '[RevisionAPI.getCharacterRevisionByRevisionId]',
        JSON.stringify(result.data, null, 2),
      );
    }
    return result as unknown as ClientResult<CharacterRevision>;
  }

  /**
   * 获取条目编辑历史列表。
   *
   * `GET /v0/revisions/subjects`
   *
   * @param subjectId - 条目 ID（必填）
   * @param options   - 可选分页参数 `limit` / `offset`
   * @returns `PagedRevision`
   * @throws 400 — 参数无效
   */
  async getSubjectRevisions(
    subjectId: number,
    options: GetRevisionsOptions = {},
  ): Promise<ClientResult<PagedRevision>> {
    const { limit, offset } = options;
    const result = await this.client.get<PagedRevision>({
      url: '/v0/revisions/subjects',
      query: { subject_id: subjectId, limit, offset },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[RevisionAPI.getSubjectRevisions]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<PagedRevision>;
  }

  /**
   * 获取条目单条编辑历史。
   *
   * `GET /v0/revisions/subjects/{revision_id}`
   *
   * @param revisionId - 历史版本 ID
   * @returns `SubjectRevision`
   * @throws 400 — revision ID 无效；404 — 记录不存在
   */
  async getSubjectRevisionByRevisionId(revisionId: number): Promise<ClientResult<SubjectRevision>> {
    const result = await this.client.get<SubjectRevision>({
      url: '/v0/revisions/subjects/{revision_id}',
      path: { revision_id: revisionId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log(
        '[RevisionAPI.getSubjectRevisionByRevisionId]',
        JSON.stringify(result.data, null, 2),
      );
    }
    return result as unknown as ClientResult<SubjectRevision>;
  }

  /**
   * 获取章节编辑历史列表。
   *
   * `GET /v0/revisions/episodes`
   *
   * @param episodeId - 章节 ID（必填）
   * @param options   - 可选分页参数 `limit` / `offset`
   * @returns `PagedRevision`
   * @throws 400 — 参数无效
   */
  async getEpisodeRevisions(
    episodeId: number,
    options: GetRevisionsOptions = {},
  ): Promise<ClientResult<PagedRevision>> {
    const { limit, offset } = options;
    const result = await this.client.get<PagedRevision>({
      url: '/v0/revisions/episodes',
      query: { episode_id: episodeId, limit, offset },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[RevisionAPI.getEpisodeRevisions]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<PagedRevision>;
  }

  /**
   * 获取章节单条编辑历史。
   *
   * `GET /v0/revisions/episodes/{revision_id}`
   *
   * @param revisionId - 历史版本 ID
   * @returns `DetailedRevision`
   * @throws 400 — revision ID 无效；404 — 记录不存在
   */
  async getEpisodeRevisionByRevisionId(
    revisionId: number,
  ): Promise<ClientResult<DetailedRevision>> {
    const result = await this.client.get<DetailedRevision>({
      url: '/v0/revisions/episodes/{revision_id}',
      path: { revision_id: revisionId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log(
        '[RevisionAPI.getEpisodeRevisionByRevisionId]',
        JSON.stringify(result.data, null, 2),
      );
    }
    return result as unknown as ClientResult<DetailedRevision>;
  }
}
