# EpisodeAPI — 章节

章节（Episode）是条目的组成单元，包含本篇、SP、OP、ED 等类型。

**访问方式**：`bgm.episodes.*`

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
|---|---|---|---|---|
| 1 | `getEpisodes()` | GET | `/v0/episodes` | 否 |
| 2 | `getEpisodeById()` | GET | `/v0/episodes/{episode_id}` | 否 |

---

## 1. getEpisodes()

获取指定条目的章节列表，支持按章节类型过滤和分页。无需认证。

### 签名

```ts
getEpisodes(
  subjectId: number,
  options?: GetEpisodesOptions
): Promise<ClientResult<GetEpisodesResult>>
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `subjectId` | `number` | 是 | 条目 ID（传 0 返回 400） |
| `options.type` | `EpType` | 否 | 章节类型（见下表），不传则返回所有类型 |
| `options.limit` | `number` | 否 | 每页条数，默认 100 |
| `options.offset` | `number` | 否 | 分页偏移，默认 0 |

**`EpType` 枚举值**

| 值 | 含义 |
|---|---|
| `0` | 本篇 |
| `1` | SP |
| `2` | OP |
| `3` | ED |
| `4` | 预告/宣传/广告 |
| `5` | MAD |
| `6` | 其他 |

### 返回

```ts
{
  total: number;     // 满足条件的章节总数
  limit: number;     // 本次每页条数
  offset: number;    // 本次偏移
  data: Episode[];   // 当页章节列表
}
```

每个 `Episode` 包含：

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | `number` | 章节 ID |
| `subject_id` | `number` | 所属条目 ID |
| `type` | `number` | 章节类型（同 EpType） |
| `name` | `string` | 章节原名 |
| `name_cn` | `string` | 章节中文名 |
| `sort` | `number` | 章节序号（如第 1 话 = `1`） |
| `ep` | `number` | 播出集数 |
| `airdate` | `string` | 放送日期（`YYYY-MM-DD`） |
| `duration` | `string` | 时长（如 `"24m"`） |
| `desc` | `string` | 简介 |
| `disc` | `number` | 所在碟号（音乐类条目） |
| `comment` | `number` | 评论数 |

### 错误

| 状态码 | 含义 |
|---|---|
| 400 | `subjectId` 为 0 或非法 |
| 404 | 条目不存在 |

### 示例

```ts
// 获取条目 374791 的所有本篇章节
const { data, error, response } = await bgm.episodes.getEpisodes(374791, { type: 0 });

if (response.status === 404) {
  console.log('条目不存在');
} else if (data) {
  console.log(`共 ${data.total} 话`);
  data.data.forEach(ep => {
    console.log(`第 ${ep.sort} 话 ${ep.name_cn || ep.name}（${ep.airdate}）`);
  });
}

// 分页获取
const page2 = await bgm.episodes.getEpisodes(374791, { limit: 10, offset: 10 });
```

---

## 2. getEpisodeById()

根据章节 ID 获取单个章节的完整详情。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getEpisodeById(episodeId: number): Promise<ClientResult<EpisodeDetail>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `episodeId` | `number` | 是 | 章节 ID（传 0 或负数返回 400） |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

`EpisodeDetail` 对象，在 `Episode` 基础上额外包含：

| 字段 | 类型 | 说明 |
|---|---|---|
| `subject_id` | `number` | 所属条目 ID |

其余字段与 `Episode` 相同（见上方字段表）。

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
|---|---|
| 400 | `episodeId` 为 0 或负数 |
| 404 | 章节不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data, error, response } = await bgm.episodes.getEpisodeById(1077185);

if (response.status === 404) {
  console.log('章节不存在');
} else if (data) {
  console.log(`[条目 ${data.subject_id}] 第 ${data.sort} 话`);
  console.log(data.name_cn || data.name);
  console.log(`放送日期：${data.airdate}`);
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
bgm.episodes.debug = true; // 开启后每次请求都会打印响应体到 console
```
