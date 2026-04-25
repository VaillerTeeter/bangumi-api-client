# PersonAPI — 人物

人物（Person）是 Bangumi 中的现实人物或组织，包括个人、公司和组合。本模块提供人物搜索、详情查询、图片获取及收藏管理功能。

**访问方式**：`bgm.persons.*`

---

## 快速上手

```ts
import { createBangumiClient } from 'bangumi-api-client';

// 无需认证的接口
const bgm = createBangumiClient();

// 需要认证的接口（collectPerson / uncollectPerson）
const bgmAuth = createBangumiClient({ token: 'your-access-token' });
```

---

## 接口列表

| # | 方法 | HTTP | 路径 | 是否需要认证 |
| --- | --- | --- | --- | --- |
| 1 | `searchPersons()` | POST | `/v0/search/persons` | 否 |
| 2 | `getPersonById()` | GET | `/v0/persons/{person_id}` | 否 |
| 3 | `getPersonImageById()` | GET | `/v0/persons/{person_id}/image` | 否 |
| 4 | `getRelatedSubjectsByPersonId()` | GET | `/v0/persons/{person_id}/subjects` | 否 |
| 5 | `getRelatedCharactersByPersonId()` | GET | `/v0/persons/{person_id}/characters` | 否 |
| 6 | `collectPerson()` | POST | `/v0/persons/{person_id}/collect` | **是** |
| 7 | `uncollectPerson()` | DELETE | `/v0/persons/{person_id}/collect` | **是** |

---

## 1. searchPersons()

全文搜索人物，支持按职业分类过滤。无需认证。

### 签名

```ts
searchPersons(
  keyword: string,
  options?: SearchPersonsOptions
): Promise<ClientResult<SearchPersonsResult>>
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `keyword` | `string` | 是 | 搜索关键词 |
| `options.career` | `string[]` | 否 | 按职业过滤（见下表，可多选） |
| `options.limit` | `number` | 否 | 每页条数，默认 20 |
| `options.offset` | `number` | 否 | 分页偏移，默认 0 |

**`career` 可选值**

| 值 | 含义 |
| --- | --- |
| `"producer"` | 制作人 |
| `"mangaka"` | 漫画家 |
| `"artist"` | 音乐人 |
| `"seiyu"` | 声优 |
| `"writer"` | 作家 |
| `"illustrator"` | 插画师 |
| `"actor"` | 演员 |

### 返回

```ts
{
  total: number;      // 符合条件的人物总数
  limit: number;
  offset: number;
  data: Person[];     // 当页人物列表
}
```

> 搜索无结果时返回 HTTP 200 + 空数组，不返回 404。

### 示例

```ts
// 搜索声优"神谷浩史"
const { data } = await bgm.persons.searchPersons('神谷浩史', {
  career: ['seiyu'],
  limit: 5,
});

data?.data.forEach(p => console.log(`[${p.id}] ${p.name}`));
```

---

## 2. getPersonById()

根据人物 ID 获取完整人物详情。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getPersonById(personId: number): Promise<ClientResult<PersonDetail>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `personId` | `number` | 是 | 人物 ID（正整数） |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

`PersonDetail` 对象，包含：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `number` | 人物 ID |
| `name` | `string` | 姓名 |
| `type` | `number` | 类型：1=个人 2=公司 3=组合 |
| `career` | `string[]` | 职业分类列表 |
| `summary` | `string` | 简介 |
| `locked` | `boolean` | 是否锁定编辑 |
| `images` | `object` | 图片 URL（large/medium/small/grid） |
| `infobox` | `array` | Infobox 元数据（原始键值对） |
| `gender` | `string` | 性别（`"male"` / `"female"`） |
| `blood_type` | `number` | 血型（1=A 2=B 3=AB 4=O） |
| `birth_year` | `number` | 出生年份 |
| `birth_mon` | `number` | 出生月份 |
| `birth_day` | `number` | 出生日期 |
| `stat` | `object` | 统计数据（`collect` 收藏数，`comment` 评论数） |

### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | `personId` 为 0 或非法 |
| 404 | 人物不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data, response } = await bgm.persons.getPersonById(1);

if (response.status === 404) {
  console.log('人物不存在');
} else if (data) {
  console.log(data.name, data.career.join('、'));
}
```

---

## 3. getPersonImageById()

获取人物图片的最终 URL。无需认证。

> 服务端返回 302 重定向，`fetch` 自动跟随。`response.status` 为最终 CDN 响应状态（200），图片地址取自 `response.url`。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getPersonImageById(
  personId: number,
  type: 'small' | 'grid' | 'large' | 'medium'
): Promise<{ imageUrl: string | undefined; error: unknown; response: Response; request: Request }>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `personId` | `number` | 是 | 人物 ID |
| `type` | `string` | 是 | 图片尺寸规格 |

### 图片尺寸参考

| 值 | 说明 |
| --- | --- |
| `grid` | 最小（列表缩略图） |
| `small` | 小 |
| `medium` | 中 |
| `large` | 最大（原图） |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `imageUrl` | `string \| undefined` | 图片最终 URL；失败时为 `undefined` |
| `error` | `unknown` | 错误信息（成功时为 `undefined`） |
| `response` | `Response` | Fetch Response 对象 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { imageUrl } = await bgm.persons.getPersonImageById(1, 'large');

if (imageUrl) {
  console.log('人物图片：', imageUrl);
}
```

---

## 4. getRelatedSubjectsByPersonId()

获取人物参与制作的条目列表。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getRelatedSubjectsByPersonId(personId: number): Promise<ClientResult<V0RelatedSubject[]>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `personId` | `number` | 是 | 人物 ID |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

`V0RelatedSubject[]`，每项包含：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `number` | 条目 ID |
| `type` | `number` | 条目类型 |
| `name` | `string` | 原名 |
| `name_cn` | `string` | 中文名 |
| `image` | `string` | 封面图 URL |
| `staff` | `string` | 担任的职位（如 "导演" "原作"） |
| `eps` | `string` | 参与的章节范围（如 `"1-12"`） |

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | `personId` 为 0 或非法 |
| 404 | 人物不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data } = await bgm.persons.getRelatedSubjectsByPersonId(1);

data?.forEach(s => {
  console.log(`${s.staff}：[${s.id}] ${s.name_cn || s.name}`);
});
```

---

## 5. getRelatedCharactersByPersonId()

获取人物配音的角色列表。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getRelatedCharactersByPersonId(personId: number): Promise<ClientResult<PersonCharacter[]>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `personId` | `number` | 是 | 人物 ID |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

`PersonCharacter[]`，每项包含：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `number` | 角色 ID |
| `name` | `string` | 角色名 |
| `type` | `number` | 角色类型（1=角色 2=机体 3=舰船 4=组织） |
| `images` | `object` | 角色图片 URL |
| `subject_id` | `number` | 所属条目 ID |
| `subject_type` | `number` | 所属条目类型 |
| `subject_name` | `string` | 所属条目原名 |
| `subject_name_cn` | `string` | 所属条目中文名 |
| `staff` | `string` | 职位（通常为 "CV"） |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data } = await bgm.persons.getRelatedCharactersByPersonId(1);

data?.forEach(c => {
  console.log(`${c.name}（来自《${c.subject_name_cn || c.subject_name}》）`);
});
```

---

## 6. collectPerson()

收藏人物。**需要认证**。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
collectPerson(personId: number): Promise<ClientResult<undefined>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `personId` | `number` | 是 | 人物 ID |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

成功时 `response.status` 为 `204`，`data` 为 `undefined`，`error` 为 `undefined`。

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | 参数有误 |
| 401 | 未登录或 Token 无效 |
| 404 | 人物不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const bgmAuth = createBangumiClient({ token: 'your-access-token' });

const { response } = await bgmAuth.persons.collectPerson(1);

if (response.status === 204) {
  console.log('收藏成功');
} else if (response.status === 401) {
  console.log('请先登录');
}
```

---

## 7. uncollectPerson()

取消收藏人物。**需要认证**。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
uncollectPerson(personId: number): Promise<ClientResult<undefined>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `personId` | `number` | 是 | 人物 ID |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

成功时 `response.status` 为 `204`，`data` 为 `undefined`，`error` 为 `undefined`。

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | 参数有误 |
| 401 | 未登录或 Token 无效 |
| 404 | 人物不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { response } = await bgmAuth.persons.uncollectPerson(1);

if (response.status === 204) {
  console.log('已取消收藏');
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

> `getPersonImageById()` 例外，返回 `imageUrl` 代替 `data`。

### 调试日志

```ts
bgm.persons.debug = true; // 开启后每次请求都会打印响应体到 console
```
