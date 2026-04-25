# SubjectAPI — 条目

条目（Subject）是 Bangumi 的核心资源，涵盖动画、书籍、音乐、游戏、三次元等五种类型。

**访问方式**：`bgm.subjects.*`

---

## 快速上手

```ts
import { createBangumiClient } from 'bangumi-api-client';

const bgm = createBangumiClient();

// 需要认证的接口（本模块所有接口均无需认证）
// const bgm = createBangumiClient({ token: 'your-access-token' });
```

---

## 接口列表

| 方法 | HTTP | 路径 | 是否需要认证 |
|---|---|---|---|
| `getCalendar()` | GET | `/calendar` | 否 |
| `searchSubjects()` | POST | `/v0/search/subjects` | 否 |
| `getSubjects()` | GET | `/v0/subjects` | 否 |
| `getSubjectById()` | GET | `/v0/subjects/{subject_id}` | 否 |
| `getSubjectImageById()` | GET | `/v0/subjects/{subject_id}/image` | 否 |
| `getRelatedPersonsBySubjectId()` | GET | `/v0/subjects/{subject_id}/persons` | 否 |
| `getRelatedCharactersBySubjectId()` | GET | `/v0/subjects/{subject_id}/characters` | 否 |
| `getRelatedSubjectsBySubjectId()` | GET | `/v0/subjects/{subject_id}/subjects` | 否 |

---

## 1. getCalendar()

获取每日放送时间表，返回按星期分组的正在放送条目列表。无需认证。

### 签名

```ts
getCalendar(): Promise<ClientResult<CalendarEntry[]>>
```

### 返回

`data` 是长度为 7 的数组，每项包含：

| 字段 | 类型 | 说明 |
|---|---|---|
| `weekday.id` | `number` | 星期编号（1=周一 … 7=周日） |
| `weekday.cn` | `string` | 星期中文名（"星期一" 等） |
| `weekday.en` | `string` | 星期英文名（"Mon" 等） |
| `weekday.ja` | `string` | 星期日文名（"月曜日" 等） |
| `items` | `CalendarSubject[]` | 该星期正在放送的条目列表 |

每个 `CalendarSubject` 包含 `id`、`name`、`name_cn`、`type`、`air_date`、`images`、`rating`、`rank`、`collection` 等字段。

### 示例

```ts
const { data, error, response } = await bgm.subjects.getCalendar();

if (error) {
  console.error('请求失败', response.status);
  return;
}

for (const entry of data!) {
  console.log(`${entry.weekday.cn}（${entry.weekday.en}）`);
  for (const item of entry.items) {
    console.log(`  [${item.id}] ${item.name_cn || item.name}`);
  }
}
```

---

## 2. searchSubjects()

全文搜索条目，支持多维度过滤和排序。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
searchSubjects(options: SearchSubjectsOptions): Promise<ClientResult<SearchSubjectsResult>>
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `options.keyword` | `string` | 是 | 搜索关键词 |
| `options.sort` | `'match' \| 'heat' \| 'rank' \| 'score'` | 否 | 排序方式，默认 `match`（相关度） |
| `options.filter` | `SearchSubjectsFilter` | 否 | 过滤条件（见下表） |
| `options.limit` | `number` | 否 | 每页条数，最大 25，默认 25 |
| `options.offset` | `number` | 否 | 分页偏移，默认 0 |

**过滤条件（`SearchSubjectsFilter`）**

| 字段 | 类型 | 说明 |
|---|---|---|
| `type` | `number[]` | 条目类型：1=书籍 2=动画 3=音乐 4=游戏 6=三次元 |
| `tag` | `string[]` | 按标签过滤（与关系） |
| `air_date` | `string[]` | 放送日期范围，格式 `">=2020-01-01"` |
| `rating` | `string[]` | 评分范围，格式 `">=8"` |
| `rank` | `string[]` | 排名范围，格式 `"<100"` |
| `nsfw` | `boolean` | 是否包含 NSFW 内容，默认 `false` |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

```ts
{
  total: number;   // 符合条件的总数
  limit: number;   // 本次每页条数
  offset: number;  // 本次偏移
  data: Subject[]; // 当页结果
}
```

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
// 搜索 2023 年评分 8 分以上的动画，按评分排序
const { data, error } = await bgm.subjects.searchSubjects({
  keyword: '魔法少女',
  sort: 'score',
  filter: {
    type: [2],
    air_date: ['>=2023-01-01'],
    rating: ['>=8'],
  },
  limit: 10,
  offset: 0,
});

if (data) {
  console.log(`共找到 ${data.total} 条结果`);
  data.data.forEach(s => console.log(`[${s.id}] ${s.name} (${s.rating?.score})`));
}
```

---

## 3. getSubjects()

按条件浏览条目列表（非全文搜索），支持按类型、子分类、年月、平台等条件筛选。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getSubjects(options: GetSubjectsOptions): Promise<ClientResult<GetSubjectsResult>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `options.type` | `SubjectType` | 是 | 条目类型（见下） |
| `options.cat` | `SubjectCategory` | 否 | 子分类 |
| `options.series` | `boolean` | 否 | 仅显示系列作品 |
| `options.platform` | `string` | 否 | 平台（如 `"TV"` `"Web"`） |
| `options.sort` | `'date' \| 'rank'` | 否 | 排序方式 |
| `options.year` | `number` | 否 | 筛选年份 |
| `options.month` | `number` | 否 | 筛选月份（需配合 `year` 使用） |
| `options.limit` | `number` | 否 | 每页条数，最大 50，默认 30 |
| `options.offset` | `number` | 否 | 分页偏移，默认 0 |

**`SubjectType` 枚举值**

| 值 | 含义 |
|---|---|
| `1` | 书籍 |
| `2` | 动画 |
| `3` | 音乐 |
| `4` | 游戏 |
| `6` | 三次元 |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

```ts
{
  total: number;
  limit: number;
  offset: number;
  data: Subject[];
}
```

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
// 浏览 2024 年 4 月新番，按排名排序
const { data } = await bgm.subjects.getSubjects({
  type: 2,        // 动画
  year: 2024,
  month: 4,
  sort: 'rank',
  limit: 20,
});

data?.data.forEach(s => console.log(`#${s.rating?.rank} ${s.name_cn || s.name}`));
```

---

## 4. getSubjectById()

根据条目 ID 获取完整条目详情。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getSubjectById(subjectId: number): Promise<ClientResult<Subject>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 说明 |
|---|---|---|
| `subjectId` | `number` | 条目 ID（正整数） |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

完整 `Subject` 对象，包含：

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | `number` | 条目 ID |
| `type` | `number` | 类型（见 SubjectType） |
| `name` | `string` | 原名 |
| `name_cn` | `string` | 中文名 |
| `summary` | `string` | 简介 |
| `air_date` | `string` | 放送日期 |
| `images` | `object` | 封面图 URL（large/common/medium/small/grid） |
| `infobox` | `array` | Infobox 元数据（原始键值对） |
| `tags` | `array` | 用户标签列表 |
| `rating` | `object` | 评分信息（score/rank/total/count） |
| `collection` | `object` | 收藏统计（wish/collect/doing/on_hold/dropped） |
| `eps` | `number` | 话数 |
| `locked` | `boolean` | 是否锁定编辑 |
| `nsfw` | `boolean` | 是否为 NSFW |
| `platform` | `string` | 播出平台 |

### 错误

| 状态码 | 含义 |
|---|---|
| 404 | 条目不存在 |
| 400 | `subjectId` 为 0 或负数 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data, error, response } = await bgm.subjects.getSubjectById(374791);

if (response.status === 404) {
  console.log('条目不存在');
} else if (data) {
  console.log(data.name_cn || data.name);
  console.log(`评分：${data.rating?.score}，排名：#${data.rating?.rank}`);
}
```

---

## 5. getSubjectImageById()

获取条目封面图片的最终 URL。无需认证。

> 服务端返回 302 重定向，`fetch` 自动跟随。`response.status` 为最终 CDN 响应状态（200），图片地址取自 `response.url`。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getSubjectImageById(
  subjectId: number,
  type: 'small' | 'grid' | 'large' | 'medium' | 'common'
): Promise<{ imageUrl: string | undefined; error: unknown; response: Response; request: Request }>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 说明 |
|---|---|---|
| `subjectId` | `number` | 条目 ID |
| `type` | `string` | 图片尺寸规格 |

### 图片尺寸参考

| 值 | 尺寸 |
|---|---|
| `grid` | 最小（列表缩略图） |
| `small` | 小 |
| `medium` | 中 |
| `common` | 标准 |
| `large` | 最大（原图） |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

| 字段 | 类型 | 说明 |
|---|---|---|
| `imageUrl` | `string \| undefined` | 图片最终 URL；失败时为 `undefined` |
| `error` | `unknown` | 错误信息（成功时为 `undefined`） |
| `response` | `Response` | Fetch Response 对象 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { imageUrl } = await bgm.subjects.getSubjectImageById(374791, 'large');

if (imageUrl) {
  console.log('封面图：', imageUrl);
  // https://lain.bgm.tv/pic/cover/l/...
}
```

---

## 6. getRelatedPersonsBySubjectId()

获取条目关联的真实人物或组织（如导演、声优、音乐等制作人员）。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getRelatedPersonsBySubjectId(subjectId: number): Promise<ClientResult<RelatedPerson[]>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 说明 |
|---|---|---|
| `subjectId` | `number` | 条目 ID |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

`RelatedPerson[]`，每项包含：

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | `number` | 人物 ID |
| `name` | `string` | 姓名 |
| `type` | `number` | 类型（1=个人 2=公司 3=组合） |
| `relation` | `string` | 与条目的关系/职位（如 "导演" "原作"） |
| `eps` | `string` | 参与的章节（如 "1-12"） |
| `career` | `string[]` | 职业分类 |
| `images` | `object` | 头像 URL |

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
|---|---|
| 404 | 条目不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data } = await bgm.subjects.getRelatedPersonsBySubjectId(374791);

data?.forEach(p => {
  console.log(`${p.relation}：${p.name}`);
});
```

---

## 7. getRelatedCharactersBySubjectId()

获取条目的虚构角色列表及其对应声优。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getRelatedCharactersBySubjectId(subjectId: number): Promise<ClientResult<RelatedCharacter[]>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 说明 |
|---|---|---|
| `subjectId` | `number` | 条目 ID |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

`RelatedCharacter[]`，每项包含：

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | `number` | 角色 ID |
| `name` | `string` | 角色名 |
| `type` | `number` | 类型（1=角色 2=机体 3=舰船 4=组织） |
| `relation` | `string` | 角色类型（"主角" "配角" 等） |
| `images` | `object` | 角色图片 URL |
| `summary` | `string` | 简介 |
| `actors` | `Person[]` | 声优列表（含 id/name/images） |

> 部分条目没有角色录入，此时返回空数组（HTTP 200）。

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data } = await bgm.subjects.getRelatedCharactersBySubjectId(374791);

data?.forEach(c => {
  const voiceActors = c.actors?.map(a => a.name).join('、') || '未录入';
  console.log(`${c.relation} ${c.name}（CV：${voiceActors}）`);
});
```

---

## 8. getRelatedSubjectsBySubjectId()

获取与该条目存在关联关系的其他条目（如续集、前传、番外篇等）。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getRelatedSubjectsBySubjectId(subjectId: number): Promise<ClientResult<V0SubjectRelation[]>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 说明 |
|---|---|---|
| `subjectId` | `number` | 条目 ID |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

`V0SubjectRelation[]`，每项包含：

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | `number` | 关联条目 ID |
| `type` | `number` | 条目类型 |
| `name` | `string` | 原名 |
| `name_cn` | `string` | 中文名 |
| `images` | `object` | 封面图 URL |
| `relation` | `string` | 关联类型（"续集" "前传" "番外篇" "主题曲" 等） |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data } = await bgm.subjects.getRelatedSubjectsBySubjectId(374791);

data?.forEach(s => {
  console.log(`${s.relation}：[${s.id}] ${s.name_cn || s.name}`);
});
```

---

## 通用说明

### 返回值结构

本模块（及整个库）所有方法均返回以下结构：

```ts
{
  data: T | undefined;    // 成功时的响应体，失败时为 undefined
  error: unknown;         // 失败时的错误详情，成功时为 undefined
  response: Response;     // 原始 Fetch Response 对象
  request: Request;       // 原始 Fetch Request 对象
}
```

> `getSubjectImageById()` 例外，返回 `imageUrl` 代替 `data`。

### 调试日志

```ts
const bgm = createBangumiClient();
bgm.subjects.debug = true; // 开启后每次请求都会打印响应体到 console
```
