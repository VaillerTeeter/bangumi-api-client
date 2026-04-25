# CollectionAPI — 收藏

收藏（Collection）模块提供条目收藏的增删改查、章节收藏状态管理，以及角色/人物收藏查询功能。

**访问方式**：`bgm.collections.*`

---

## 快速上手

```ts
import { createBangumiClient } from 'bangumi-api-client';

// 无需认证的接口（查询他人公开收藏）
const bgm = createBangumiClient();

// 需要认证的接口（操作自己的收藏）
const bgmAuth = createBangumiClient({ token: 'your-access-token' });
```

---

## 接口列表

| # | 方法 | HTTP | 路径 | 是否需要认证 |
| --- | --- | --- | --- | --- |
| 1 | `getUserCollections()` | GET | `/v0/users/{username}/collections` | 否（查私有需要） |
| 2 | `getUserCollectionBySubjectId()` | GET | `/v0/users/{username}/collections/{subject_id}` | 否（查私有需要） |
| 3 | `postUserCollection()` | POST | `/v0/users/-/collections/{subject_id}` | **是** |
| 4 | `patchUserCollection()` | PATCH | `/v0/users/-/collections/{subject_id}` | **是** |
| 5 | `getUserSubjectEpisodeCollection()` | GET | `/v0/users/-/collections/{subject_id}/episodes` | **是** |
| 6 | `patchUserSubjectEpisodeCollection()` | PATCH | `/v0/users/-/collections/{subject_id}/episodes` | **是** |
| 7 | `getUserEpisodeCollection()` | GET | `/v0/users/-/collections/-/episodes/{episode_id}` | **是** |
| 8 | `putUserEpisodeCollection()` | PUT | `/v0/users/-/collections/-/episodes/{episode_id}` | **是** |
| 9 | `getUserCharacterCollections()` | GET | `/v0/users/{username}/collections/-/characters` | 否 |
| 10 | `getUserCharacterCollection()` | GET | `/v0/users/{username}/collections/-/characters/{character_id}` | 否 |
| 11 | `getUserPersonCollections()` | GET | `/v0/users/{username}/collections/-/persons` | 否 |
| 12 | `getUserPersonCollection()` | GET | `/v0/users/{username}/collections/-/persons/{person_id}` | 否 |

---

## 枚举值参考

### SubjectType（条目类型）

| 值 | 含义 |
| --- | --- |
| `1` | 书籍 |
| `2` | 动画 |
| `3` | 音乐 |
| `4` | 游戏 |
| `6` | 三次元 |

### SubjectCollectionType（条目收藏状态）

| 值 | 含义 |
| --- | --- |
| `1` | 想看 |
| `2` | 看过 |
| `3` | 在看 |
| `4` | 搁置 |
| `5` | 抛弃 |

### EpisodeCollectionType（章节收藏状态）

| 值 | 含义 |
| --- | --- |
| `1` | 想看 |
| `2` | 看过 |
| `3` | 抛弃 |

---

## 1. getUserCollections()

获取指定用户的条目收藏列表。查看私有收藏需要认证。

### 签名

```ts
getUserCollections(
  username: string,
  options?: GetUserCollectionsOptions
): Promise<ClientResult<PagedUserCollection>>
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `username` | `string` | 是 | 用户名 |
| `options.subject_type` | `SubjectType` | 否 | 按条目类型过滤 |
| `options.type` | `SubjectCollectionType` | 否 | 按收藏状态过滤 |
| `options.limit` | `number` | 否 | 每页条数，默认 30 |
| `options.offset` | `number` | 否 | 分页偏移，默认 0 |

### 返回

```ts
{
  total: number;
  limit: number;
  offset: number;
  data: UserSubjectCollection[];
}
```

每个 `UserSubjectCollection` 包含：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `subject_id` | `number` | 条目 ID |
| `subject_type` | `number` | 条目类型 |
| `rate` | `number` | 评分（0=未评分，1-10） |
| `type` | `number` | 收藏状态（SubjectCollectionType） |
| `comment` | `string` | 吐槽 |
| `tags` | `string[]` | 标签列表 |
| `ep_status` | `number` | 已看集数（剧集/书籍） |
| `vol_status` | `number` | 已看卷数（书籍） |
| `updated_at` | `string` | 最后更新时间（ISO 8601） |
| `private` | `boolean` | 是否私有收藏 |
| `subject` | `object` | 条目摘要信息 |

### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | 参数有误 |
| 404 | 用户不存在 |

### 示例

```ts
// 获取用户所有已看完的动画
const { data } = await bgm.collections.getUserCollections('sai', {
  subject_type: 2,
  type: 2,
  limit: 20,
});

data?.data.forEach(c => {
  console.log(`[${c.subject_id}] 评分: ${c.rate} 标签: ${c.tags.join(', ')}`);
});
```

---

## 2. getUserCollectionBySubjectId()

获取指定用户对某条目的收藏详情。查看私有收藏需要认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getUserCollectionBySubjectId(
  username: string,
  subjectId: number
): Promise<ClientResult<UserSubjectCollection>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `username` | `string` | 是 | 用户名 |
| `subjectId` | `number` | 是 | 条目 ID |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

`UserSubjectCollection` 对象（字段同上）。

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | 参数有误 |
| 404 | 用户不存在、条目未收藏或收藏为私有 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data, response } = await bgm.collections.getUserCollectionBySubjectId('sai', 374791);

if (response.status === 404) {
  console.log('未收藏或收藏为私有');
} else if (data) {
  console.log(`收藏状态: ${data.type}，评分: ${data.rate}`);
}
```

---

## 3. postUserCollection()

新增或修改当前登录用户对某条目的收藏。**需要认证**。

- 若该条目**尚未收藏**：创建新收藏记录
- 若该条目**已收藏**：更新现有记录

> `ep_status` / `vol_status` 仅对书籍类条目生效，直接修改剧集条目完成度可能产生意料外效果。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
postUserCollection(
  subjectId: number,
  payload?: UserSubjectCollectionModifyPayload
): Promise<ClientResult<undefined>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `subjectId` | `number` | 是 | 条目 ID |
| `payload.type` | `SubjectCollectionType` | 否 | 收藏状态 |
| `payload.rate` | `number` | 否 | 评分（0=清除，1-10） |
| `payload.comment` | `string` | 否 | 吐槽文本 |
| `payload.private` | `boolean` | 否 | 是否设为私有 |
| `payload.tags` | `string[]` | 否 | 标签列表 |
| `payload.ep_status` | `number` | 否 | 已看集数（仅书籍） |
| `payload.vol_status` | `number` | 否 | 已看卷数（仅书籍） |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

成功时 `response.status` 为 `204`，`data` 为 `undefined`。

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | 参数有误 |
| 401 | 未登录或 Token 无效 |
| 404 | 条目不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
// 标记条目为"看过"并评 9 分
const { response } = await bgmAuth.collections.postUserCollection(374791, {
  type: 2,
  rate: 9,
  comment: '很好看！',
  tags: ['科幻', '机战'],
});

console.log(response.status); // 204
```

---

## 4. patchUserCollection()

修改当前登录用户对某条目的现有收藏。**需要认证**。

与 `postUserCollection()` 的区别：条目**必须已有收藏记录**，否则返回 404。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
patchUserCollection(
  subjectId: number,
  payload?: UserSubjectCollectionModifyPayload
): Promise<ClientResult<undefined>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

与 `postUserCollection()` 相同（见上）。

<!-- markdownlint-disable-next-line MD024 -->
### 返回

成功时 `response.status` 为 `204`，`data` 为 `undefined`。

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | 参数有误 |
| 401 | 未登录或 Token 无效 |
| 404 | 条目不存在或未收藏 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
// 仅更新评分，不改变其他字段
await bgmAuth.collections.patchUserCollection(374791, { rate: 10 });
```

---

## 5. getUserSubjectEpisodeCollection()

获取当前登录用户在某条目下各章节的收藏状态列表。**需要认证**。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getUserSubjectEpisodeCollection(
  subjectId: number,
  options?: GetUserSubjectEpisodeCollectionOptions
): Promise<ClientResult<Page & { data?: UserEpisodeCollection[] }>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `subjectId` | `number` | 是 | 条目 ID |
| `options.episode_type` | `EpType` | 否 | 章节类型过滤（见 EpisodeAPI 文档） |
| `options.limit` | `number` | 否 | 每页条数 |
| `options.offset` | `number` | 否 | 分页偏移 |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

```ts
{
  total: number;
  limit: number;
  offset: number;
  data: UserEpisodeCollection[];
}
```

每个 `UserEpisodeCollection` 包含：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `episode` | `Episode` | 章节详情 |
| `type` | `number` | 收藏状态（EpisodeCollectionType） |
| `updated_at` | `string` | 最后更新时间（ISO 8601） |

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | 参数有误 |
| 401 | 未登录或 Token 无效 |
| 404 | 条目不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
// 获取条目所有章节的收藏状态
const { data } = await bgmAuth.collections.getUserSubjectEpisodeCollection(374791, {
  episode_type: 0, // 仅本篇
});

data?.data?.forEach(ec => {
  console.log(`第 ${ec.episode.sort} 话：状态 ${ec.type}`);
});
```

---

## 6. patchUserSubjectEpisodeCollection()

批量修改当前登录用户在某条目下的章节收藏状态，并自动重新计算条目完成度。**需要认证**。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
patchUserSubjectEpisodeCollection(
  subjectId: number,
  payload: PatchUserSubjectEpisodeCollectionPayload
): Promise<ClientResult<undefined>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `subjectId` | `number` | 是 | 条目 ID |
| `payload.episode_id` | `number[]` | 是 | 要修改的章节 ID 列表 |
| `payload.type` | `EpisodeCollectionType` | 是 | 目标收藏状态（1=想看 2=看过 3=抛弃） |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

成功时 `response.status` 为 `204`，`data` 为 `undefined`。

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | 参数有误 |
| 401 | 未登录或 Token 无效 |
| 404 | 条目不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
// 批量标记多个章节为"看过"
await bgmAuth.collections.patchUserSubjectEpisodeCollection(374791, {
  episode_id: [1077185, 1077186, 1077187],
  type: 2,
});
```

---

## 7. getUserEpisodeCollection()

获取当前登录用户对某章节的收藏信息。**需要认证**。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getUserEpisodeCollection(episodeId: number): Promise<ClientResult<UserEpisodeCollection>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `episodeId` | `number` | 是 | 章节 ID |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

`UserEpisodeCollection` 对象（字段同第 5 个接口）。

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | 章节 ID 无效 |
| 401 | 未登录或 Token 无效 |
| 404 | 条目或章节不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data } = await bgmAuth.collections.getUserEpisodeCollection(1077185);

console.log(`章节状态：${data?.type}，更新于：${data?.updated_at}`);
```

---

## 8. putUserEpisodeCollection()

更新当前登录用户对某章节的收藏状态。**需要认证**。

> 所属条目必须已在收藏中，否则返回 400。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
putUserEpisodeCollection(
  episodeId: number,
  type: EpisodeCollectionType
): Promise<ClientResult<undefined>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `episodeId` | `number` | 是 | 章节 ID |
| `type` | `EpisodeCollectionType` | 是 | 收藏状态（1=想看 2=看过 3=抛弃） |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

成功时 `response.status` 为 `204`，`data` 为 `undefined`。

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | 章节 ID 无效或所属条目未收藏 |
| 401 | 未登录或 Token 无效 |
| 404 | 条目或章节不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
// 标记章节为"看过"
await bgmAuth.collections.putUserEpisodeCollection(1077185, 2);
```

---

## 9. getUserCharacterCollections()

获取指定用户的角色收藏列表。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getUserCharacterCollections(username: string): Promise<ClientResult<PagedUserCharacterCollection>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `username` | `string` | 是 | 用户名 |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

分页的 `UserCharacterCollection` 列表，每项包含角色摘要和收藏时间。

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 404 | 用户不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data } = await bgm.collections.getUserCharacterCollections('sai');

console.log(`共收藏角色 ${data?.total} 个`);
```

---

## 10. getUserCharacterCollection()

获取指定用户对某角色的收藏信息。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getUserCharacterCollection(
  username: string,
  characterId: number
): Promise<ClientResult<UserCharacterCollection>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `username` | `string` | 是 | 用户名 |
| `characterId` | `number` | 是 | 角色 ID |

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | `characterId` 无效 |
| 404 | 用户或角色不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data, response } = await bgm.collections.getUserCharacterCollection('sai', 1);

if (response.status === 404) {
  console.log('未收藏该角色');
} else {
  console.log(data);
}
```

---

## 11. getUserPersonCollections()

获取指定用户的人物收藏列表。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getUserPersonCollections(username: string): Promise<ClientResult<PagedUserPersonCollection>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `username` | `string` | 是 | 用户名 |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

分页的 `UserPersonCollection` 列表，每项包含人物摘要和收藏时间。

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 404 | 用户不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data } = await bgm.collections.getUserPersonCollections('sai');

console.log(`共收藏人物 ${data?.total} 个`);
```

---

## 12. getUserPersonCollection()

获取指定用户对某人物的收藏信息。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getUserPersonCollection(
  username: string,
  personId: number
): Promise<ClientResult<UserPersonCollection>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `username` | `string` | 是 | 用户名 |
| `personId` | `number` | 是 | 人物 ID |

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
| --- | --- |
| 400 | `personId` 无效 |
| 404 | 用户或人物不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data, response } = await bgm.collections.getUserPersonCollection('sai', 1);

if (response.status === 404) {
  console.log('未收藏该人物');
} else {
  console.log(data);
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
bgm.collections.debug = true; // 开启后每次请求都会打印响应体到 console
```
