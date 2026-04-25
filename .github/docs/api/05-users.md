# UserAPI — 用户

用户（User）模块提供用户信息查询、头像获取和当前登录用户信息获取功能。

**访问方式**：`bgm.users.*`

---

## 快速上手

```ts
import { createBangumiClient } from 'bangumi-api-client';

// 无需认证的接口
const bgm = createBangumiClient();

// 需要认证的接口（getMyself）
const bgmAuth = createBangumiClient({ token: 'your-access-token' });
```

---

## 接口列表

| # | 方法 | HTTP | 路径 | 是否需要认证 |
| --- | --- | --- | --- | --- |
| 1 | `getUserByName()` | GET | `/v0/users/{username}` | 否 |
| 2 | `getUserAvatarByName()` | GET | `/v0/users/{username}/avatar` | 否 |
| 3 | `getMyself()` | GET | `/v0/me` | **是** |

---

## 1. getUserByName()

根据用户名获取用户公开信息。无需认证。

> **注意**：用户名与 UID 不同。用户可修改一次用户名，修改后旧用户名失效，必须传当前有效的字符串用户名，不能传数字 UID。

### 签名

```ts
getUserByName(username: string): Promise<ClientResult<User>>
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `username` | `string` | 是 | 用户名（非 UID） |

### 返回

`User` 对象，包含：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `number` | 用户 UID |
| `username` | `string` | 用户名 |
| `nickname` | `string` | 昵称 |
| `user_group` | `number` | 用户组（1=管理员 2=Bangumi 管理猿 ... 10=普通用户） |
| `avatar` | `object` | 头像 URL（large/medium/small） |
| `sign` | `string` | 个人签名 |

### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | `username` 超过长度限制 |
| 404 | 用户不存在 |

### 示例

```ts
const { data, response } = await bgm.users.getUserByName('sai');

if (response.status === 404) {
  console.log('用户不存在');
} else if (data) {
  console.log(`${data.nickname}（@${data.username}）`);
  console.log('签名：', data.sign);
}
```

---

## 2. getUserAvatarByName()

获取用户头像的最终 URL。无需认证。

> 服务端返回 302 重定向，`fetch` 自动跟随。`response.status` 为最终 CDN 响应状态（200），图片地址取自 `response.url`。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getUserAvatarByName(
  username: string,
  type: 'small' | 'medium' | 'large'
): Promise<{ imageUrl: string | undefined; error: unknown; response: Response; request: Request }>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `username` | `string` | 是 | 用户名 |
| `type` | `string` | 是 | 头像尺寸规格 |

### 头像尺寸参考

| 值 | 说明 |
| --- | --- |
| `small` | 小（列表缩略图） |
| `medium` | 中 |
| `large` | 大（原图） |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `imageUrl` | `string \| undefined` | 头像最终 URL；失败时为 `undefined` |
| `error` | `unknown` | 错误信息（成功时为 `undefined`） |
| `response` | `Response` | Fetch Response 对象 |
| `request` | `Request` | Fetch Request 对象 |

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | `username` 超过长度限制 |
| 404 | 用户不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { imageUrl } = await bgm.users.getUserAvatarByName('sai', 'large');

if (imageUrl) {
  console.log('头像 URL：', imageUrl);
}
```

---

## 3. getMyself()

获取当前登录用户的完整信息。**需要认证**。

返回的字段比 `getUserByName()` 更丰富，包含邮箱、注册时间等私有字段。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getMyself(): Promise<ClientResult<GetMyselfResponse>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 返回

`GetMyselfResponse` 对象，在 `User` 基础上额外包含：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `number` | 用户 UID |
| `username` | `string` | 用户名 |
| `nickname` | `string` | 昵称 |
| `user_group` | `number` | 用户组 |
| `avatar` | `object` | 头像 URL（large/medium/small） |
| `sign` | `string` | 个人签名 |
| `email?` | `string` | 注册邮箱（私有字段，可能因账号隐私或 API 返回行为而缺失） |
| `reg_time?` | `string` | 注册时间（ISO 8601，可能因账号状态或 API 返回行为而缺失） |
| `time_offset?` | `number` | 时区偏移（小时，可能因账号状态或 API 返回行为而缺失） |

> 注意：`email`、`reg_time` 和 `time_offset` 在部分情况下可能不会返回，请在使用前做好 `undefined` 判断。

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 401 | 未提供 Token 或 Token 无效 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const bgmAuth = createBangumiClient({ token: 'your-access-token' });

const { data, response } = await bgmAuth.users.getMyself();

if (response.status === 401) {
  console.log('请先登录');
} else if (data) {
  console.log(`当前用户：${data.nickname}（UID: ${data.id}）`);
  console.log('注册时间：', data.reg_time);
}
```

---

## 通用说明

### 返回值结构

```ts
{
  data: T | undefined;    // 成功时的响应体，失败时为 undefined
  error: unknown;         // 失败时的错误详情，成功时为 undefined
  response: Response;     // 原始 Fetch Response 对象
  request: Request;       // 原始 Fetch Request 对象
}
```

> `getUserAvatarByName()` 例外，返回 `imageUrl` 代替 `data`。

### 调试日志

```ts
bgm.users.debug = true; // 开启后每次请求都会打印响应体到 console
```
