# RevisionAPI — 编辑历史

编辑历史（Revision）模块提供对条目、章节、角色、人物编辑记录的查询功能，可用于追溯 Wiki 数据的变更历史。

**访问方式**：`bgm.revisions.*`

---

## 快速上手

```ts
import { createBangumiClient } from 'bangumi-api-client';

const bgm = createBangumiClient();
// 本模块所有接口均无需认证
```

---

## 接口列表

| # | 方法 | HTTP | 路径 | 是否需要认证 |
| --- | --- | --- | --- | --- |
| 1 | `getPersonRevisions()` | GET | `/v0/revisions/persons` | 否 |
| 2 | `getPersonRevisionByRevisionId()` | GET | `/v0/revisions/persons/{revision_id}` | 否 |
| 3 | `getCharacterRevisions()` | GET | `/v0/revisions/characters` | 否 |
| 4 | `getCharacterRevisionByRevisionId()` | GET | `/v0/revisions/characters/{revision_id}` | 否 |
| 5 | `getSubjectRevisions()` | GET | `/v0/revisions/subjects` | 否 |
| 6 | `getSubjectRevisionByRevisionId()` | GET | `/v0/revisions/subjects/{revision_id}` | 否 |
| 7 | `getEpisodeRevisions()` | GET | `/v0/revisions/episodes` | 否 |
| 8 | `getEpisodeRevisionByRevisionId()` | GET | `/v0/revisions/episodes/{revision_id}` | 否 |

---

## 通用数据结构

### PagedRevision（历史列表）

历史列表接口（第 1、3、5、7 个）均返回此结构：

```ts
{
  total: number;
  limit: number;
  offset: number;
  data: Revision[];
}
```

每个 `Revision` 条目包含：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `number` | 历史版本 ID（revision_id） |
| `type` | `number` | 修改类型 |
| `summary` | `string` | 编辑摘要（编辑者填写的备注） |
| `creator` | `object` | 编辑者信息（含 `username`） |
| `created_at` | `string` | 编辑时间（ISO 8601） |

### 单条历史详情

详情接口（第 2、4、6、8 个）返回的对象类型因资源类型而异（`PersonRevision` / `CharacterRevision` / `SubjectRevision` / `DetailedRevision`），但均包含以上基础字段，额外附带 `data` 字段（存放本次变更的实际数据 diff）。

---

## 1. getPersonRevisions()

获取指定人物的编辑历史列表。无需认证。

### 签名

```ts
getPersonRevisions(
  personId: number,
  options?: { limit?: number; offset?: number }
): Promise<ClientResult<PagedRevision>>
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `personId` | `number` | 是 | 人物 ID |
| `options.limit` | `number` | 否 | 每页条数 |
| `options.offset` | `number` | 否 | 分页偏移 |

### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | 参数有误 |

### 示例

```ts
const { data } = await bgm.revisions.getPersonRevisions(1, { limit: 10 });

data?.data.forEach(r => {
  console.log(`[${r.id}] ${r.creator.username} — ${r.summary} (${r.created_at})`);
});
```

---

## 2. getPersonRevisionByRevisionId()

获取人物的单条编辑历史详情。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getPersonRevisionByRevisionId(revisionId: number): Promise<ClientResult<PersonRevision>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `revisionId` | `number` | 是 | 历史版本 ID |

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | `revisionId` 无效 |
| 404 | 记录不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data } = await bgm.revisions.getPersonRevisionByRevisionId(1234);

console.log(data?.summary);
console.log(data?.data); // 本次变更的详细 diff
```

---

## 3. getCharacterRevisions()

获取指定角色的编辑历史列表。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getCharacterRevisions(
  characterId: number,
  options?: { limit?: number; offset?: number }
): Promise<ClientResult<PagedRevision>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `characterId` | `number` | 是 | 角色 ID |
| `options.limit` | `number` | 否 | 每页条数 |
| `options.offset` | `number` | 否 | 分页偏移 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data } = await bgm.revisions.getCharacterRevisions(1, { limit: 5 });

data?.data.forEach(r => console.log(`[${r.id}] ${r.summary}`));
```

---

## 4. getCharacterRevisionByRevisionId()

获取角色的单条编辑历史详情。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getCharacterRevisionByRevisionId(revisionId: number): Promise<ClientResult<CharacterRevision>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `revisionId` | `number` | 是 | 历史版本 ID |

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | `revisionId` 无效 |
| 404 | 记录不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data } = await bgm.revisions.getCharacterRevisionByRevisionId(5678);

console.log(data?.creator.username, data?.created_at);
```

---

## 5. getSubjectRevisions()

获取指定条目的编辑历史列表。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getSubjectRevisions(
  subjectId: number,
  options?: { limit?: number; offset?: number }
): Promise<ClientResult<PagedRevision>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `subjectId` | `number` | 是 | 条目 ID |
| `options.limit` | `number` | 否 | 每页条数 |
| `options.offset` | `number` | 否 | 分页偏移 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data } = await bgm.revisions.getSubjectRevisions(374791, { limit: 20 });

console.log(`条目共有 ${data?.total} 条编辑历史`);
```

---

## 6. getSubjectRevisionByRevisionId()

获取条目的单条编辑历史详情。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getSubjectRevisionByRevisionId(revisionId: number): Promise<ClientResult<SubjectRevision>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `revisionId` | `number` | 是 | 历史版本 ID |

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | `revisionId` 无效 |
| 404 | 记录不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data } = await bgm.revisions.getSubjectRevisionByRevisionId(9999);

console.log(data?.summary, data?.data);
```

---

## 7. getEpisodeRevisions()

获取指定章节的编辑历史列表。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getEpisodeRevisions(
  episodeId: number,
  options?: { limit?: number; offset?: number }
): Promise<ClientResult<PagedRevision>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `episodeId` | `number` | 是 | 章节 ID |
| `options.limit` | `number` | 否 | 每页条数 |
| `options.offset` | `number` | 否 | 分页偏移 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data } = await bgm.revisions.getEpisodeRevisions(1077185);

data?.data.forEach(r => console.log(`[${r.id}] ${r.summary}`));
```

---

## 8. getEpisodeRevisionByRevisionId()

获取章节的单条编辑历史详情。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getEpisodeRevisionByRevisionId(revisionId: number): Promise<ClientResult<DetailedRevision>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `revisionId` | `number` | 是 | 历史版本 ID |

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | `revisionId` 无效 |
| 404 | 记录不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data } = await bgm.revisions.getEpisodeRevisionByRevisionId(8888);

console.log(data?.creator.username, data?.created_at);
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
bgm.revisions.debug = true; // 开启后每次请求都会打印响应体到 console
```
