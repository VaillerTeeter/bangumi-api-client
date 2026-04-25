import type { ClientResult } from '../client.js';
import type { Client } from '../generated/client/index.js';
import type {
  RelatedCharacter,
  RelatedPerson,
  Subject,
  SubjectCategory,
  SubjectType,
  V0SubjectRelation,
} from '../generated/types.gen.js';

/** 每日放送星期信息。 */
export interface CalendarWeekday {
  en: string;
  cn: string;
  ja: string;
  id: number;
}

/** 每日放送条目（字段为 `/calendar` 接口原始结构的规范化版本）。 */
export interface CalendarSubject {
  id: number;
  url: string;
  type: number;
  name: string;
  name_cn: string;
  summary: string;
  air_date: string;
  air_weekday: number;
  images: {
    large: string | null;
    common: string | null;
    medium: string | null;
    small: string | null;
    grid: string | null;
  } | null;
  eps: number | null;
  eps_count: number | null;
  rating: {
    total: number;
    count: Record<string, number>;
    score: number;
  } | null;
  rank: number | null;
  collection: {
    wish: number | null;
    collect: number | null;
    doing: number | null;
    on_hold: number | null;
    dropped: number | null;
  } | null;
}

/** `/calendar` 接口返回的单个星期条目，包含星期信息和当天放送的条目列表。 */
export interface CalendarEntry {
  weekday: CalendarWeekday;
  items: CalendarSubject[];
}

/** `searchSubjects` 的过滤条件，所有字段均为可选，多个字段之间为「且」关系。 */
export interface SearchSubjectsFilter {
  type?: number[];
  meta_tags?: string[];
  tag?: string[];
  air_date?: string[];
  rating?: string[];
  rating_count?: string[];
  rank?: string[];
  nsfw?: boolean;
}

/** `searchSubjects` 的完整入参，包含关键词、排序方式、过滤条件和分页参数。 */
export interface SearchSubjectsOptions {
  keyword: string;
  sort?: 'match' | 'heat' | 'rank' | 'score';
  filter?: SearchSubjectsFilter;
  limit?: number;
  offset?: number;
}

/** `searchSubjects` 的返回数据结构。 */
export interface SearchSubjectsResult {
  total: number;
  limit: number;
  offset: number;
  data: Subject[];
}

/** `getSubjects` 的入参，支持按类型、子分类、年月、平台等条件浏览条目。 */
export interface GetSubjectsOptions {
  type: SubjectType;
  cat?: SubjectCategory;
  series?: boolean;
  platform?: string;
  sort?: 'date' | 'rank';
  year?: number;
  month?: number;
  limit?: number;
  offset?: number;
}

/** `getSubjects` 的返回数据结构。 */
export interface GetSubjectsResult {
  total: number;
  limit: number;
  offset: number;
  data: Subject[];
}

/**
 * 将原始 images 对象规范化为 `CalendarSubject['images']` 结构。
 * 字段缺失或 `undefined` 时统一转为 `null`。
 *
 * @param raw - 原始 images 对象
 * @returns 规范化后的图片 URL 对象
 */
function normalizeImages(raw: Record<string, unknown>): NonNullable<CalendarSubject['images']> {
  return {
    large: (raw.large as string | null | undefined) ?? null,
    common: (raw.common as string | null | undefined) ?? null,
    medium: (raw.medium as string | null | undefined) ?? null,
    small: (raw.small as string | null | undefined) ?? null,
    grid: (raw.grid as string | null | undefined) ?? null,
  };
}

/**
 * 将原始 rating 对象规范化为 `CalendarSubject['rating']` 结构。
 *
 * @param raw - 原始 rating 对象
 * @returns 规范化后的评分对象
 */
function normalizeRating(raw: Record<string, unknown>): NonNullable<CalendarSubject['rating']> {
  return {
    total: raw.total as number,
    count: raw.count as Record<string, number>,
    score: raw.score as number,
  };
}

/**
 * 将原始 collection 对象规范化为 `CalendarSubject['collection']` 结构。
 * 字段缺失或 `undefined` 时统一转为 `null`。
 *
 * @param raw - 原始 collection 对象
 * @returns 规范化后的收藏统计对象
 */
function normalizeCollection(
  raw: Record<string, unknown>,
): NonNullable<CalendarSubject['collection']> {
  return {
    wish: (raw.wish as number | null | undefined) ?? null,
    collect: (raw.collect as number | null | undefined) ?? null,
    doing: (raw.doing as number | null | undefined) ?? null,
    on_hold: (raw.on_hold as number | null | undefined) ?? null,
    dropped: (raw.dropped as number | null | undefined) ?? null,
  };
}

/**
 * 将 `/calendar` 接口返回的原始条目对象规范化为 `CalendarSubject` 结构。
 *
 * 接口返回的字段类型较宽松（部分字段可能缺失或为 `null`），
 * 此函数负责进行类型断言并为可选字段提供默认值，确保输出结构的一致性。
 *
 * @param item - 原始条目对象（`Record<string, unknown>`）
 * @returns 规范化后的 `CalendarSubject` 对象
 */
function normalizeSubject(item: Record<string, unknown>): CalendarSubject {
  const rawImages = item.images as Record<string, unknown> | null | undefined;
  const rawRating = item.rating as Record<string, unknown> | null | undefined;
  const rawCollection = item.collection as Record<string, unknown> | null | undefined;

  return {
    id: item.id as number,
    url: item.url as string,
    type: item.type as number,
    name: item.name as string,
    name_cn: (item.name_cn as string | undefined) ?? '',
    summary: (item.summary as string | undefined) ?? '',
    air_date: item.air_date as string,
    air_weekday: item.air_weekday as number,
    images: rawImages === undefined || rawImages === null ? null : normalizeImages(rawImages),
    eps: (item.eps as number | undefined) ?? null,
    eps_count: (item.eps_count as number | undefined) ?? null,
    rating: rawRating === undefined || rawRating === null ? null : normalizeRating(rawRating),
    rank: (item.rank as number | undefined) ?? null,
    collection:
      rawCollection === undefined || rawCollection === null
        ? null
        : normalizeCollection(rawCollection),
  };
}

/**
 * Bangumi 条目模块（Subject）的高层 API 封装。
 *
 * 封装了以下接口：
 * - `GET /calendar` — 每日放送
 * - `POST /v0/search/subjects` — 条目搜索
 * - `GET /v0/subjects` — 浏览条目
 * - `GET /v0/subjects/{subject_id}` — 条目详情
 * - `GET /v0/subjects/{subject_id}/image` — 条目图片
 * - `GET /v0/subjects/{subject_id}/persons` — 相关人物
 * - `GET /v0/subjects/{subject_id}/characters` — 相关角色
 * - `GET /v0/subjects/{subject_id}/subjects` — 关联条目
 */
export class SubjectAPI {
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
   * 获取每日放送时间表。
   *
   * `GET /calendar`
   *
   * 返回按星期分组的正在放送条目列表，每组包含 `weekday`（星期信息）和 `items`（条目列表）。
   * 该接口无需认证，始终返回 HTTP 200。
   *
   * @returns `data` — 按星期排列的放送数据数组（共 7 项）
   */
  async getCalendar(): Promise<ClientResult<CalendarEntry[]>> {
    const result = await this.client.get<CalendarEntry[]>({ url: '/calendar' });
    if (result.data) {
      result.data = (
        result.data as unknown as Array<{
          weekday: CalendarWeekday;
          items: Array<Record<string, unknown>>;
        }>
      ).map((entry) => ({
        weekday: entry.weekday,
        items: entry.items.map((item) => normalizeSubject(item)),
      }));
      if (this.debug) {
        // eslint-disable-next-line no-console
        console.log('[SubjectAPI.getCalendar]', JSON.stringify(result.data, null, 2));
      }
    }
    return result as unknown as ClientResult<CalendarEntry[]>;
  }

  /**
   * 全文搜索条目。
   *
   * `POST /v0/search/subjects`
   *
   * 支持按关键词、条目类型、标签、评分、排名等多维度过滤，并可指定排序方式和分页参数。
   *
   * @param options         - 搜索参数
   * @param options.keyword - 搜索关键词（必填）
   * @param options.sort    - 排序方式：`match`=相关度 | `heat`=热度 | `rank`=排名 | `score`=评分
   * @param options.filter  - 过滤条件，支持类型、标签、评分、日期等
   * @param options.limit   - 每页条数（默认 25，最大 25）
   * @param options.offset  - 分页偏移（默认 0）
   * @returns `data.total` — 符合条件的总数；`data.data` — 当页条目列表
   */
  async searchSubjects(
    options: SearchSubjectsOptions,
  ): Promise<ClientResult<SearchSubjectsResult>> {
    const { limit, offset, keyword, sort, filter } = options;
    const result = await this.client.post<SearchSubjectsResult>({
      url: '/v0/search/subjects',
      body: { keyword, sort, filter },
      query: { limit, offset },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[SubjectAPI.searchSubjects]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<SearchSubjectsResult>;
  }

  /**
   * 按条目类型浏览条目列表。
   *
   * `GET /v0/subjects`
   *
   * 可按子分类、年份、月份、平台等条件筛选，支持按日期或排名排序。
   * 无结果时返回 HTTP 200 + 空数组，不返回 404。
   *
   * @param options          - 浏览参数
   * @param options.type     - 条目类型（必填）：1=书籍 2=动画 3=音乐 4=游戏 6=三次元
   * @param options.cat      - 子分类，不同 type 对应不同可选值
   * @param options.sort     - 排序方式：`date` | `rank`
   * @param options.year     - 按年份筛选，如 `2024`
   * @param options.month    - 按月份筛选（需配合 year），如 `4`
   * @param options.limit    - 每页条数（默认 25，最大 25）
   * @param options.offset   - 分页偏移（默认 0）
   * @returns `data.total` — 符合条件的总数；`data.data` — 当页条目列表
   */
  async getSubjects(options: GetSubjectsOptions): Promise<ClientResult<GetSubjectsResult>> {
    const { type, cat, series, platform, sort, year, month, limit, offset } = options;
    const result = await this.client.get<GetSubjectsResult>({
      url: '/v0/subjects',
      query: { type, cat, series, platform, sort, year, month, limit, offset },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[SubjectAPI.getSubjects]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<GetSubjectsResult>;
  }

  /**
   * 根据条目 ID 获取条目详情。
   *
   * `GET /v0/subjects/{subject_id}`
   *
   * 返回完整条目信息，包括基础字段、评分、收藏统计、图片、infobox、标签等。
   *
   * @param subjectId - 条目 ID（正整数，传 0 或负数将返回 HTTP 400）
   * @returns `data` — 完整 `Subject` 对象；不存在时返回 HTTP 404
   */
  async getSubjectById(subjectId: number): Promise<ClientResult<Subject>> {
    const result = await this.client.get<Subject>({
      url: '/v0/subjects/{subject_id}',
      path: { subject_id: subjectId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[SubjectAPI.getSubjectById]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<Subject>;
  }

  /**
   * 获取条目封面图片的最终 URL。
   *
   * `GET /v0/subjects/{subject_id}/image`
   *
   * 服务端返回 HTTP 302 重定向到 CDN 图片地址，fetch 会自动跟随重定向。
   * 因此 `response.status` 为 200（CDN），真实图片 URL 取自 `response.url`。
   *
   * @param subjectId - 条目 ID
   * @param type      - 图片尺寸：`small` | `grid` | `large` | `medium` | `common`
   * @returns `imageUrl` — 最终图片 URL（跟随重定向后）；请求失败时为 `undefined`
   */
  async getSubjectImageById(
    subjectId: number,
    type: 'small' | 'grid' | 'large' | 'medium' | 'common',
  ): Promise<{
    imageUrl: string | undefined;
    error: unknown;
    response: Response;
    request: Request;
  }> {
    const result = (await this.client.get<undefined>({
      url: '/v0/subjects/{subject_id}/image',
      path: { subject_id: subjectId },
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
      console.log('[SubjectAPI.getSubjectImageById]', imageUrl);
    }
    return { imageUrl, error: result.error, response: result.response, request: result.request };
  }

  /**
   * 获取条目关联的人物列表（制作人员等）。
   *
   * `GET /v0/subjects/{subject_id}/persons`
   *
   * 返回与该条目相关的真实人物或组织，包含 `relation`（职位/关系）和 `eps`（参与章节）字段。
   *
   * @param subjectId - 条目 ID
   * @returns `data` — `RelatedPerson[]`，含 id / name / type / career / relation / eps
   */
  async getRelatedPersonsBySubjectId(subjectId: number): Promise<ClientResult<RelatedPerson[]>> {
    const result = await this.client.get<RelatedPerson[]>({
      url: '/v0/subjects/{subject_id}/persons',
      path: { subject_id: subjectId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log(
        '[SubjectAPI.getRelatedPersonsBySubjectId]',
        JSON.stringify(result.data, null, 2),
      );
    }
    return result as unknown as ClientResult<RelatedPerson[]>;
  }

  /**
   * 获取条目关联的虚构角色列表。
   *
   * `GET /v0/subjects/{subject_id}/characters`
   *
   * 返回该条目的角色信息，包含角色类型（主角/配角等）、简介、图片及对应的声优列表（`actors`）。
   * 注意：部分条目可能没有录入角色数据，此时返回 HTTP 200 + 空数组。
   *
   * @param subjectId - 条目 ID
   * @returns `data` — `RelatedCharacter[]`，含 id / name / summary / type / images / relation / actors
   */
  async getRelatedCharactersBySubjectId(
    subjectId: number,
  ): Promise<ClientResult<RelatedCharacter[]>> {
    const result = await this.client.get<RelatedCharacter[]>({
      url: '/v0/subjects/{subject_id}/characters',
      path: { subject_id: subjectId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log(
        '[SubjectAPI.getRelatedCharactersBySubjectId]',
        JSON.stringify(result.data, null, 2),
      );
    }
    return result as unknown as ClientResult<RelatedCharacter[]>;
  }

  /**
   * 获取与该条目存在关联关系的其他条目列表。
   *
   * `GET /v0/subjects/{subject_id}/subjects`
   *
   * 关联类型由 `relation` 字段描述，如「续集」「前传」「番外篇」「主题曲」等。
   *
   * @param subjectId - 条目 ID
   * @returns `data` — `V0SubjectRelation[]`，含 id / type / name / name_cn / images / relation
   */
  async getRelatedSubjectsBySubjectId(
    subjectId: number,
  ): Promise<ClientResult<V0SubjectRelation[]>> {
    const result = await this.client.get<V0SubjectRelation[]>({
      url: '/v0/subjects/{subject_id}/subjects',
      path: { subject_id: subjectId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log(
        '[SubjectAPI.getRelatedSubjectsBySubjectId]',
        JSON.stringify(result.data, null, 2),
      );
    }
    return result as unknown as ClientResult<V0SubjectRelation[]>;
  }
}
