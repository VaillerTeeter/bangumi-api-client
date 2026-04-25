import type { ClientResult } from '../client.js';
import type { Client } from '../generated/client/index.js';
import type { GetMyselfResponse, User } from '../generated/types.gen.js';

/**
 * Bangumi 用户模块（User）的高层 API 封装。
 *
 * 封装了以下接口：
 * - `GET /v0/users/{username}`        — 获取用户信息
 * - `GET /v0/users/{username}/avatar` — 获取用户头像（302 重定向）
 * - `GET /v0/me`                      — 获取当前登录用户信息（需登录）
 */
export class UserAPI {
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
   * 获取用户信息。
   *
   * `GET /v0/users/{username}`
   *
   * 注意：设置了用户名之后无法使用 UID，必须传字符串用户名。
   *
   * @param username - 用户名（唯一，初始与 UID 相同，可修改一次）
   * @returns 用户信息对象，含 id / username / nickname / user_group / avatar / sign
   * @throws 400 — username 太长；404 — 对应用户不存在
   */
  async getUserByName(username: string): Promise<ClientResult<User>> {
    const result = await this.client.get<User>({
      url: '/v0/users/{username}',
      path: { username },
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[UserAPI.getUserByName]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<User>;
  }

  /**
   * 获取用户头像（302 重定向到图片 URL）。
   *
   * `GET /v0/users/{username}/avatar`
   *
   * @param username - 用户名
   * @param type     - 头像尺寸：`'small'` / `'medium'` / `'large'`
   * @returns `imageUrl` — 跟随重定向后的最终图片 URL；失败时为 `undefined`
   * @throws 400 — username 太长；404 — 对应用户不存在
   */
  async getUserAvatarByName(
    username: string,
    type: 'small' | 'medium' | 'large',
  ): Promise<{
    imageUrl: string | undefined;
    error: unknown;
    response: Response;
    request: Request;
  }> {
    const result = (await this.client.get<undefined>({
      url: '/v0/users/{username}/avatar',
      path: { username },
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
      console.log('[UserAPI.getUserAvatarByName]', imageUrl);
    }
    return { imageUrl, error: result.error, response: result.response, request: result.request };
  }

  /**
   * 获取当前登录用户信息（需要 Bearer Token 认证）。
   *
   * `GET /v0/me`
   *
   * 除标准用户字段外，还可能返回 `email`、`reg_time`、`time_offset` 等额外字段。
   *
   * @returns 当前登录用户的完整信息
   * @throws 401 — 未提供有效 Token
   */
  async getMyself(): Promise<ClientResult<GetMyselfResponse>> {
    const result = await this.client.get<GetMyselfResponse>({
      url: '/v0/me',
    });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[UserAPI.getMyself]', JSON.stringify(result.data, null, 2));
    }
    return result as unknown as ClientResult<GetMyselfResponse>;
  }
}
