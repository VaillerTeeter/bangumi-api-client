import type { ClientResult } from '../client.js';
import type { Client } from '../generated/client/index.js';
import type {
  Person,
  PersonCharacter,
  PersonDetail,
  V0RelatedSubject,
} from '../generated/types.gen.js';

/** `searchPersons` 的可选参数。 */
export interface SearchPersonsOptions {
  career?: string[];
  limit?: number;
  offset?: number;
}

/** `searchPersons` 的返回数据结构。 */
export interface SearchPersonsResult {
  total: number;
  limit: number;
  offset: number;
  data: Person[];
}

/**
 * Bangumi 人物模块（Person）的高层 API 封装。
 *
 * 封装了以下接口：
 * - `POST /v0/search/persons`                — 人物搜索
 * - `GET  /v0/persons/{person_id}`           — 获取人物详情
 * - `GET  /v0/persons/{person_id}/image`     — 获取人物图片（302 重定向）
 * - `GET  /v0/persons/{person_id}/subjects`    — 获取人物相关条目
 * - `GET  /v0/persons/{person_id}/characters`  — 获取人物相关角色
 * - `POST   /v0/persons/{person_id}/collect`     — 收藏人物（需登录）
 * - `DELETE /v0/persons/{person_id}/collect`     — 取消收藏人物（需登录）
 */
export class PersonAPI {
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
   * 全文搜索人物。
   *
   * `POST /v0/search/persons`
   *
   * 搜索无结果时返回 HTTP 200 + 空数组，不返回 404。
   *
   * @param keyword - 搜索关键词（必填）
   * @param options - 可选过滤和分页参数
   * @returns `data.data` — 人物列表；`data.total` — 总匹配数
   */
  async searchPersons(
    keyword: string,
    options: SearchPersonsOptions = {},
  ): Promise<ClientResult<SearchPersonsResult>> {
    const { career, limit, offset } = options;
    const filter = career === undefined ? undefined : { career };
    const result = await this.client.post<SearchPersonsResult>({
      url: '/v0/search/persons',
      body: { keyword, filter },
      query: { limit, offset },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[PersonAPI.searchPersons]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<SearchPersonsResult>;
  }

  /**
   * 获取人物详情。
   *
   * `GET /v0/persons/{person_id}`
   *
   * @param personId - 人物 ID
   * @returns 人物详情对象
   * @throws 400 — 请求参数有误；404 — 人物不存在
   */
  async getPersonById(personId: number): Promise<ClientResult<PersonDetail>> {
    const result = await this.client.get<PersonDetail>({
      url: '/v0/persons/{person_id}',
      path: { person_id: personId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[PersonAPI.getPersonById]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<PersonDetail>;
  }

  /**
   * 获取人物图片，服务端返回 302 重定向到实际图片 URL。
   *
   * `GET /v0/persons/{person_id}/image`
   *
   * @param personId - 人物 ID
   * @param type     - 图片尺寸：`small` | `grid` | `large` | `medium`
   * @returns `imageUrl` — 最终图片 URL（跟随重定向后）；请求失败时为 `undefined`
   */
  async getPersonImageById(
    personId: number,
    type: 'small' | 'grid' | 'large' | 'medium',
  ): Promise<{
    imageUrl: string | undefined;
    error: unknown;
    response: Response;
    request: Request;
  }> {
    const result = (await this.client.get<undefined>({
      url: '/v0/persons/{person_id}/image',
      path: { person_id: personId },
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
      console.log('[PersonAPI.getPersonImageById]', imageUrl);
    }
    return { imageUrl, error: result.error, response: result.response, request: result.request };
  }

  /**
   * 获取人物相关联的条目列表。
   *
   * `GET /v0/persons/{person_id}/subjects`
   *
   * @param personId - 人物 ID
   * @returns `data` — `V0RelatedSubject[]`，含 id / type / staff / eps / name / name_cn / image
   * @throws 400 — 请求参数有误；404 — 人物不存在
   */
  async getRelatedSubjectsByPersonId(personId: number): Promise<ClientResult<V0RelatedSubject[]>> {
    const result = await this.client.get<V0RelatedSubject[]>({
      url: '/v0/persons/{person_id}/subjects',
      path: { person_id: personId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[PersonAPI.getRelatedSubjectsByPersonId]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<V0RelatedSubject[]>;
  }

  /**
   * 获取人物相关联的角色列表。
   *
   * `GET /v0/persons/{person_id}/characters`
   *
   * @param personId - 人物 ID
   * @returns `data` — `PersonCharacter[]`，含 id / name / type / images / subject_id / subject_type / subject_name / subject_name_cn / staff
   * @throws 400 — 请求参数有误；404 — 人物不存在
   */
  async getRelatedCharactersByPersonId(personId: number): Promise<ClientResult<PersonCharacter[]>> {
    const result = await this.client.get<PersonCharacter[]>({
      url: '/v0/persons/{person_id}/characters',
      path: { person_id: personId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log(
        '[PersonAPI.getRelatedCharactersByPersonId]',
        JSON.stringify(result.data, null, 2),
      );
    }
    return result as unknown as ClientResult<PersonCharacter[]>;
  }

  /**
   * 收藏人物。
   *
   * `POST /v0/persons/{person_id}/collect`
   *
   * 需要登录认证（Bearer Token）。未登录时返回 401。
   * 成功时返回 HTTP 204 No Content，`data` 为 `undefined`。
   *
   * @param personId - 人物 ID
   * @returns 成功时 `error` 为 `undefined`，`response.status` 为 204
   * @throws 400 — 参数有误；401 — 未登录；404 — 人物不存在
   */
  async collectPerson(personId: number): Promise<ClientResult<undefined>> {
    const result = await this.client.post<undefined>({
      url: '/v0/persons/{person_id}/collect',
      path: { person_id: personId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[PersonAPI.collectPerson]', result.response.status);
    }
    return result as unknown as ClientResult<undefined>;
  }

  /**
   * 取消收藏人物。
   *
   * `DELETE /v0/persons/{person_id}/collect`
   *
   * 需要登录认证（Bearer Token）。未登录时返回 4xx。
   * 成功时返回 HTTP 204 No Content，`data` 为 `undefined`。
   *
   * @param personId - 人物 ID
   * @returns 成功时 `error` 为 `undefined`，`response.status` 为 204
   * @throws 400 — 参数有误；401 — 未登录；404 — 人物不存在
   */
  async uncollectPerson(personId: number): Promise<ClientResult<undefined>> {
    const result = await this.client.delete<undefined>({
      url: '/v0/persons/{person_id}/collect',
      path: { person_id: personId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[PersonAPI.uncollectPerson]', result.response.status);
    }
    return result as unknown as ClientResult<undefined>;
  }
}
