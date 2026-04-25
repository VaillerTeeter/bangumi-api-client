import type { ClientResult } from '../client.js';
import type { Client } from '../generated/client/index.js';
import type {
  Index,
  IndexBasicInfo,
  IndexSubject,
  IndexSubjectAddInfo,
  IndexSubjectEditInfo,
} from '../generated/types.gen.js';

/**
 * Bangumi 目录模块（Index）的高层 API 封装。
 *
 * 封装了以下接口：
 * - `POST /v0/indices` — 创建新目录
 * - `GET /v0/indices/{index_id}` — 获取目录详情
 * - `PUT /v0/indices/{index_id}` — 编辑目录
 * - `GET /v0/indices/{index_id}/subjects` — 获取目录中的条目
 * - `POST /v0/indices/{index_id}/subjects` — 向目录添加条目
 * - `PUT /v0/indices/{index_id}/subjects/{subject_id}` — 编辑目录中的条目信息
 * - `DELETE /v0/indices/{index_id}/subjects/{subject_id}` — 从目录中删除条目
 * - `POST /v0/indices/{index_id}/collect` — 收藏目录
 * - `DELETE /v0/indices/{index_id}/collect` — 取消收藏目录
 */
export class IndexAPI {
  /** 是否输出调试日志，默认 `false`。 */
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
   * 创建新目录。需要登录认证。
   *
   * `POST /v0/indices`
   *
   * @returns `Index`
   * @throws 401 — 未登录
   */
  async newIndex(): Promise<ClientResult<Index>> {
    const result = await this.client.post<Index>({
      url: '/v0/indices',
      body: {},
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[IndexAPI.newIndex]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<Index>;
  }

  /**
   * 获取目录详情。
   *
   * `GET /v0/indices/{index_id}`
   *
   * @param indexId - 目录 ID
   * @returns `Index`
   * @throws 404 — 目录不存在
   */
  async getIndexById(indexId: number): Promise<ClientResult<Index>> {
    const result = await this.client.get<Index>({
      url: '/v0/indices/{index_id}',
      path: { index_id: indexId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[IndexAPI.getIndexById]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<Index>;
  }

  /**
   * 编辑目录。需要登录认证，且必须是目录创建者。
   *
   * `PUT /v0/indices/{index_id}`
   *
   * @param indexId - 目录 ID
   * @param body    - 要修改的字段（title、description）
   * @returns `Index`
   * @throws 400 — 请求参数错误
   * @throws 401 — 未登录
   * @throws 404 — 目录不存在
   */
  async editIndexById(indexId: number, body?: IndexBasicInfo): Promise<ClientResult<Index>> {
    const result = await this.client.put<Index>({
      url: '/v0/indices/{index_id}',
      path: { index_id: indexId },
      body,
      headers: { 'Content-Type': 'application/json' },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[IndexAPI.editIndexById]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<Index>;
  }

  /**
   * 获取目录中的条目列表（分页）。
   *
   * `GET /v0/indices/{index_id}/subjects`
   *
   * @param indexId      - 目录 ID
   * @param options      - 可选过滤/分页参数
   * @param options.type   - 条目类型过滤（可选）
   * @param options.limit  - 每页条数（可选）
   * @param options.offset - 分页偏移（可选）
   * @returns 分页列表，包含 `total`、`limit`、`offset`、`data`
   * @throws 400 — 请求参数错误
   * @throws 404 — 目录不存在
   */
  async getIndexSubjects(
    indexId: number,
    options?: { type?: number; limit?: number; offset?: number },
  ): Promise<ClientResult<{ total: number; limit: number; offset: number; data: IndexSubject[] }>> {
    const result = await this.client.get<{
      total: number;
      limit: number;
      offset: number;
      data: IndexSubject[];
    }>({
      url: '/v0/indices/{index_id}/subjects',
      path: { index_id: indexId },
      query: options,
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[IndexAPI.getIndexSubjects]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<{
      total: number;
      limit: number;
      offset: number;
      data: IndexSubject[];
    }>;
  }

  /**
   * 向目录添加条目。需要登录认证，且必须是目录创建者。
   *
   * `POST /v0/indices/{index_id}/subjects`
   *
   * @param indexId - 目录 ID
   * @param body    - 条目信息（subject_id、sort、comment）
   * @returns 成功时 `error` 为 `undefined`
   * @throws 400 — 请求参数错误
   * @throws 401 — 未登录
   * @throws 404 — 目录不存在
   */
  async addSubjectToIndex(
    indexId: number,
    body?: IndexSubjectAddInfo,
  ): Promise<ClientResult<unknown>> {
    const result = await this.client.post({
      url: '/v0/indices/{index_id}/subjects',
      path: { index_id: indexId },
      body,
      headers: { 'Content-Type': 'application/json' },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[IndexAPI.addSubjectToIndex]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<unknown>;
  }

  /**
   * 编辑目录中条目的信息（排序、留言）。需要登录认证，且必须是目录创建者。
   *
   * `PUT /v0/indices/{index_id}/subjects/{subject_id}`
   *
   * @param indexId   - 目录 ID
   * @param subjectId - 条目 ID
   * @param body      - 要修改的字段（sort、comment）
   * @returns 成功时 `error` 为 `undefined`
   * @throws 400 — 请求参数错误
   * @throws 401 — 未登录
   * @throws 404 — 目录或条目不存在
   */
  async editIndexSubject(
    indexId: number,
    subjectId: number,
    body?: IndexSubjectEditInfo,
  ): Promise<ClientResult<unknown>> {
    const result = await this.client.put({
      url: '/v0/indices/{index_id}/subjects/{subject_id}',
      path: { index_id: indexId, subject_id: subjectId },
      body,
      headers: { 'Content-Type': 'application/json' },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[IndexAPI.editIndexSubject]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<unknown>;
  }

  /**
   * 从目录中删除条目。需要登录认证，且必须是目录创建者。
   *
   * `DELETE /v0/indices/{index_id}/subjects/{subject_id}`
   *
   * @param indexId   - 目录 ID
   * @param subjectId - 条目 ID
   * @returns 成功时 `error` 为 `undefined`
   * @throws 401 — 未登录
   * @throws 404 — 目录或条目不存在
   */
  async deleteIndexSubject(indexId: number, subjectId: number): Promise<ClientResult<unknown>> {
    const result = await this.client.delete({
      url: '/v0/indices/{index_id}/subjects/{subject_id}',
      path: { index_id: indexId, subject_id: subjectId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[IndexAPI.deleteIndexSubject]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<unknown>;
  }

  /**
   * 收藏目录。需要登录认证。
   *
   * `POST /v0/indices/{index_id}/collect`
   *
   * @param indexId - 目录 ID
   * @returns 成功时 `error` 为 `undefined`
   * @throws 401 — 未登录
   * @throws 404 — 目录不存在
   * @throws 500 — 服务器内部错误
   */
  async collectIndex(indexId: number): Promise<ClientResult<unknown>> {
    const result = await this.client.post({
      url: '/v0/indices/{index_id}/collect',
      path: { index_id: indexId },
      body: {},
      headers: { 'Content-Type': 'application/json' },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[IndexAPI.collectIndex]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<unknown>;
  }

  /**
   * 取消收藏目录。需要登录认证。
   *
   * `DELETE /v0/indices/{index_id}/collect`
   *
   * @param indexId - 目录 ID
   * @returns 成功时 `error` 为 `undefined`
   * @throws 401 — 未登录
   * @throws 404 — 目录不存在
   * @throws 500 — 服务器内部错误
   */
  async uncollectIndex(indexId: number): Promise<ClientResult<unknown>> {
    const result = await this.client.delete({
      url: '/v0/indices/{index_id}/collect',
      path: { index_id: indexId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[IndexAPI.uncollectIndex]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<unknown>;
  }
}
