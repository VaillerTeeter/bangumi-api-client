# IndexAPI — 目录

目录（Index）是用户自建的条目合集，类似于"片单"或"书单"。本模块提供目录的创建、编辑、条目管理及收藏功能。

**访问方式**：`bgm.indices.*`

---

## 快速上手

```ts
import { createBangumiClient } from 'bangumi-api-client';

// 无需认证的接口（查询目录信息）
const bgm = createBangumiClient();

// 需要认证的接口（创建、编辑、收藏）
const bgmAuth = createBangumiClient({ token: 'your-access-token' });
```

---

## 接口列表

| # | 方法 | HTTP | 路径 | 是否需要认证 |
| --- | --- | --- | --- | --- |
| 1 | `newIndex()` | POST | `/v0/indices` | **是** |
| 2 | `getIndexById()` | GET | `/v0/indices/{index_id}` | 否 |
| 3 | `editIndexById()` | PUT | `/v0/indices/{index_id}` | **是**（须为创建者） |
| 4 | `getIndexSubjects()` | GET | `/v0/indices/{index_id}/subjects` | 否 |
| 5 | `addSubjectToIndex()` | POST | `/v0/indices/{index_id}/subjects` | **是**（须为创建者） |
| 6 | `editIndexSubject()` | PUT | `/v0/indices/{index_id}/subjects/{subject_id}` | **是**（须为创建者） |
| 7 | `deleteIndexSubject()` | DELETE | `/v0/indices/{index_id}/subjects/{subject_id}` | **是**（须为创建者） |
| 8 | `collectIndex()` | POST | `/v0/indices/{index_id}/collect` | **是** |
| 9 | `uncollectIndex()` | DELETE | `/v0/indices/{index_id}/collect` | **是** |

---

## 1. newIndex()

创建一个新的空目录。**需要认证**。

### 签名

```ts
newIndex(): Promise<ClientResult<Index>>
```

### 返回

新建的 `Index` 对象，包含：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `number` | 目录 ID |
| `title` | `string` | 标题（新建时为空字符串） |
| `desc` | `string` | 描述 |
| `total` | `number` | 条目总数 |
| `stat` | `object` | 统计（`collect` 收藏数，`comment` 评论数） |
| `created_at` | `string` | 创建时间（ISO 8601） |
| `creator` | `object` | 创建者信息（含 `username`） |
| `ban` | `number` | 是否被屏蔽 |

### 错误

| 状态码 | 含义 |
| --- | --- |
| 401 | 未登录或 Token 无效 |

### 示例

```ts
const { data, response } = await bgmAuth.indices.newIndex();

if (response.status === 401) {
  console.log('请先登录');
} else if (data) {
  console.log(`目录已创建，ID: ${data.id}`);
}
```

---

## 2. getIndexById()

根据目录 ID 获取目录详情。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getIndexById(indexId: number): Promise<ClientResult<Index>>
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `indexId` | `number` | 是 | 目录 ID |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

`Index` 对象（字段同上）。

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 404 | 目录不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data, response } = await bgm.indices.getIndexById(12345);

if (response.status === 404) {
  console.log('目录不存在');
} else if (data) {
  console.log(`《${data.title}》— ${data.total} 个条目`);
}
```

---

## 3. editIndexById()

编辑目录的标题和描述。**需要认证，且必须是目录创建者**。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
editIndexById(
  indexId: number,
  body?: IndexBasicInfo
): Promise<ClientResult<Index>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `indexId` | `number` | 是 | 目录 ID |
| `body.title` | `string` | 否 | 新标题 |
| `body.description` | `string` | 否 | 新描述 |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

更新后的 `Index` 对象。

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | 参数有误 |
| 401 | 未登录或 Token 无效 |
| 404 | 目录不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data } = await bgmAuth.indices.editIndexById(12345, {
  title: '2024 年度最佳动画',
  description: '个人年度总结片单',
});

console.log(data?.title);
```

---

## 4. getIndexSubjects()

获取目录中的条目列表（分页）。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getIndexSubjects(
  indexId: number,
  options?: { type?: number; limit?: number; offset?: number }
): Promise<ClientResult<{ total: number; limit: number; offset: number; data: IndexSubject[] }>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `indexId` | `number` | 是 | 目录 ID |
| `options.type` | `number` | 否 | 按条目类型过滤（SubjectType） |
| `options.limit` | `number` | 否 | 每页条数 |
| `options.offset` | `number` | 否 | 分页偏移 |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

```ts
{
  total: number;
  limit: number;
  offset: number;
  data: IndexSubject[];
}
```

每个 `IndexSubject` 包含：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `number` | 条目 ID |
| `type` | `number` | 条目类型 |
| `name` | `string` | 原名 |
| `name_cn` | `string` | 中文名 |
| `images` | `object` | 封面图 URL |
| `date` | `string` | 放送/发售日期 |
| `comment` | `string` | 创建者为该条目添加的留言 |

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | 参数有误 |
| 404 | 目录不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data } = await bgm.indices.getIndexSubjects(12345, { limit: 20 });

data?.data.forEach(s => {
  console.log(`[${s.id}] ${s.name_cn || s.name}`);
  if (s.comment) console.log(`  留言：${s.comment}`);
});
```

---

## 5. addSubjectToIndex()

向目录添加一个条目。**需要认证，且必须是目录创建者**。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
addSubjectToIndex(
  indexId: number,
  body?: IndexSubjectAddInfo
): Promise<ClientResult<unknown>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `indexId` | `number` | 是 | 目录 ID |
| `body.subject_id` | `number` | 否 | 要添加的条目 ID |
| `body.sort` | `number` | 否 | 排序权重 |
| `body.comment` | `string` | 否 | 留言 |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

成功时 `response.status` 为 `200`。

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | 参数有误 |
| 401 | 未登录或 Token 无效 |
| 404 | 目录不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
await bgmAuth.indices.addSubjectToIndex(12345, {
  subject_id: 374791,
  comment: '年度最佳',
  sort: 1,
});
```

---

## 6. editIndexSubject()

修改目录中某条目的排序或留言。**需要认证，且必须是目录创建者**。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
editIndexSubject(
  indexId: number,
  subjectId: number,
  body?: IndexSubjectEditInfo
): Promise<ClientResult<unknown>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `indexId` | `number` | 是 | 目录 ID |
| `subjectId` | `number` | 是 | 条目 ID |
| `body.sort` | `number` | 否 | 新排序权重 |
| `body.comment` | `string` | 否 | 新留言 |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

成功时 `response.status` 为 `200`。

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | 参数有误 |
| 401 | 未登录或 Token 无效 |
| 404 | 目录或条目不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
await bgmAuth.indices.editIndexSubject(12345, 374791, {
  sort: 10,
  comment: '修改后的留言',
});
```

---

## 7. deleteIndexSubject()

从目录中删除某条目。**需要认证，且必须是目录创建者**。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
deleteIndexSubject(
  indexId: number,
  subjectId: number
): Promise<ClientResult<unknown>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `indexId` | `number` | 是 | 目录 ID |
| `subjectId` | `number` | 是 | 条目 ID |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

成功时 `response.status` 为 `200`。

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 401 | 未登录或 Token 无效 |
| 404 | 目录或条目不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { response } = await bgmAuth.indices.deleteIndexSubject(12345, 374791);

console.log(response.status); // 200
```

---

## 8. collectIndex()

收藏目录。**需要认证**。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
collectIndex(indexId: number): Promise<ClientResult<unknown>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `indexId` | `number` | 是 | 目录 ID |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

成功时 `response.status` 为 `200`。

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 401 | 未登录或 Token 无效 |
| 404 | 目录不存在 |
| 500 | 服务器内部错误 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { response } = await bgmAuth.indices.collectIndex(12345);

console.log(response.status); // 200
```

---

## 9. uncollectIndex()

取消收藏目录。**需要认证**。

> **注意**：取消收藏**自己创建**的目录时，服务端可能返回 `500`（"delete index collect failed"），这是已知的服务端行为，并非请求错误。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
uncollectIndex(indexId: number): Promise<ClientResult<unknown>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `indexId` | `number` | 是 | 目录 ID |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

成功时 `response.status` 为 `200`；取消收藏自建目录时可能返回 `500`。

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 401 | 未登录或 Token 无效 |
| 404 | 目录不存在 |
| 500 | 服务端已知问题（取消收藏自建目录时） |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { response } = await bgmAuth.indices.uncollectIndex(12345);

if ([200, 500].includes(response.status)) {
  console.log('操作完成（服务端返回', response.status, '）');
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

### 调试日志

```ts
bgm.indices.debug = true; // 开启后每次请求都会打印响应体到 console
```
