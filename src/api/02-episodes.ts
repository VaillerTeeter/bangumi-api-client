import type { Client } from '../generated/client/index.js';
import type { Episode, EpisodeDetail, EpType } from '../generated/types.gen.js';

/** `getEpisodes` 的可选参数。 */
export interface GetEpisodesOptions {
  type?: EpType;
  limit?: number;
  offset?: number;
}

/** `getEpisodes` 的返回数据结构。 */
export interface GetEpisodesResult {
  total: number;
  limit: number;
  offset: number;
  data: Episode[];
}

/**
 * Bangumi 章节模块（Episode）的高层 API 封装。
 *
 * 封装了以下接口：
 * - `GET /v0/episodes` — 获取条目章节列表
 * - `GET /v0/episodes/{episode_id}` — 获取单个章节详情
 */
export class EpisodeAPI {
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
   * 获取条目的章节列表。
   *
   * `GET /v0/episodes`
   *
   * 可按章节类型过滤（本篇、SP、OP、ED 等），支持分页。
   * 条目 ID 无效时返回 HTTP 400，条目不存在时返回 HTTP 404。
   *
   * @param subjectId  - 条目 ID（必填，传 0 返回 400）
   * @param options    - 可选过滤和分页参数
   * @returns `data.data` — 章节列表；`data.total` — 总章节数
   */
  async getEpisodes(
    subjectId: number,
    options: GetEpisodesOptions = {},
  ): Promise<{
    data: GetEpisodesResult | undefined;
    error: unknown;
    response: Response;
    request: Request;
  }> {
    const { type, limit, offset } = options;
    const result = await this.client.get<GetEpisodesResult>({
      url: '/v0/episodes',
      query: { subject_id: subjectId, type, limit, offset },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[EpisodeAPI.getEpisodes]', JSON.stringify(result.data, null, 2));
    }
    return result as never;
  }

  /**
   * 根据章节 ID 获取章节详情。
   *
   * `GET /v0/episodes/{episode_id}`
   *
   * 返回单个章节的完整信息，包含所属条目 ID（`subject_id`）。
   * 传入 0 或负数返回 HTTP 400，章节不存在返回 HTTP 404。
   *
   * @param episodeId - 章节 ID（正整数）
   * @returns `data` — `EpisodeDetail` 对象，含 `subject_id` 字段
   */
  async getEpisodeById(episodeId: number): Promise<{
    data: EpisodeDetail | undefined;
    error: unknown;
    response: Response;
    request: Request;
  }> {
    const result = await this.client.get<EpisodeDetail>({
      url: '/v0/episodes/{episode_id}',
      path: { episode_id: episodeId },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[EpisodeAPI.getEpisodeById]', JSON.stringify(result.data, null, 2));
    }
    return result as never;
  }
}
