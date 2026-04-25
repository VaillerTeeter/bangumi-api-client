# CharacterAPI — 角色

角色（Character）是条目中的虚构人物、机体、舰船或组织。本模块提供角色搜索、详情查询、图片获取及收藏管理功能。

**访问方式**：`bgm.characters.*`

---

## 快速上手

```ts
import { createBangumiClient } from 'bangumi-api-client';

// 无需认证的接口
const bgm = createBangumiClient();

// 需要认证的接口（collectCharacter / uncollectCharacter）
const bgmAuth = createBangumiClient({ token: 'your-access-token' });
```

---

## 接口列表

| # | 方法 | HTTP | 路径 | 是否需要认证 |
|---|---|---|---|---|
| 1 | `searchCharacters()` | POST | `/v0/search/characters` | 否 |
| 2 | `getCharacterById()` | GET | `/v0/characters/{character_id}` | 否 |
| 3 | `getCharacterImageById()` | GET | `/v0/characters/{character_id}/image` | 否 |
| 4 | `getRelatedSubjectsByCharacterId()` | GET | `/v0/characters/{character_id}/subjects` | 否 |
| 5 | `getRelatedPersonsByCharacterId()` | GET | `/v0/characters/{character_id}/persons` | 否 |
| 6 | `collectCharacter()` | POST | `/v0/characters/{character_id}/collect` | **是** |
| 7 | `uncollectCharacter()` | DELETE | `/v0/characters/{character_id}/collect` | **是** |

---

## 1. searchCharacters()

全文搜索角色（实验性 API，行为可能随时变化）。无需认证。

### 签名

```ts
searchCharacters(
  keyword: string,
  options?: SearchCharactersOptions
): Promise<ClientResult<SearchCharactersResult>>
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `keyword` | `string` | 是 | 搜索关键词 |
| `options.nsfw` | `boolean` | 否 | NSFW 过滤：`true`=仅 R18，`false`=仅非 R18，不传=全部（无权限用户始终过滤 R18） |
| `options.limit` | `number` | 否 | 每页条数，默认 20 |
| `options.offset` | `number` | 否 | 分页偏移，默认 0 |

### 返回

```ts
{
  total: number;        // 符合条件的角色总数
  limit: number;
  offset: number;
  data: Character[];    // 当页角色列表
}
```

> 搜索无结果时返回 HTTP 200 + 空数组，不会返回 404。

### 示例

```ts
const { data } = await bgm.characters.searchCharacters('初音未来', { limit: 5 });

data?.data.forEach(c => console.log(`[${c.id}] ${c.name}`));
```

---

## 2. getCharacterById()

根据角色 ID 获取完整角色详情。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getCharacterById(characterId: number): Promise<ClientResult<Character>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `characterId` | `number` | 是 | 角色 ID（正整数） |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

`Character` 对象，包含：

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | `number` | 角色 ID |
| `name` | `string` | 角色名 |
| `type` | `number` | 类型：1=角色 2=机体 3=舰船 4=组织 |
| `summary` | `string` | 简介 |
| `locked` | `boolean` | 是否锁定编辑 |
| `images` | `object` | 图片 URL（large/medium/small/grid） |
| `infobox` | `array` | Infobox 元数据（原始键值对） |
| `gender` | `string` | 性别（`"male"` / `"female"`） |
| `blood_type` | `number` | 血型（1=A 2=B 3=AB 4=O） |
| `birth_year` | `number` | 生日年份 |
| `birth_mon` | `number` | 生日月份 |
| `birth_day` | `number` | 生日日期 |
| `stat` | `object` | 统计数据（`collect` 收藏数，`comment` 评论数） |
| `nsfw` | `boolean` | 是否为 NSFW |

### 错误

| 状态码 | 含义 |
|---|---|
| 400 | `characterId` 为 0 或非法 |
| 404 | 角色不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data, response } = await bgm.characters.getCharacterById(1);

if (response.status === 404) {
  console.log('角色不存在');
} else if (data) {
  console.log(data.name, data.summary);
}
```

---

## 3. getCharacterImageById()

获取角色图片的最终 URL。无需认证。

> 服务端返回 302 重定向，`fetch` 自动跟随。`response.status` 为最终 CDN 响应状态（200），图片地址取自 `response.url`。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getCharacterImageById(
  characterId: number,
  type: 'small' | 'grid' | 'large' | 'medium'
): Promise<{ imageUrl: string | undefined; error: unknown; response: Response; request: Request }>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `characterId` | `number` | 是 | 角色 ID |
| `type` | `string` | 是 | 图片尺寸规格 |

### 图片尺寸参考

| 值 | 说明 |
|---|---|
| `grid` | 最小（列表缩略图） |
| `small` | 小 |
| `medium` | 中 |
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
const { imageUrl } = await bgm.characters.getCharacterImageById(1, 'large');

if (imageUrl) {
  console.log('角色图片：', imageUrl);
}
```

---

## 4. getRelatedSubjectsByCharacterId()

获取角色关联的条目列表。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getRelatedSubjectsByCharacterId(characterId: number): Promise<ClientResult<V0RelatedSubject[]>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `characterId` | `number` | 是 | 角色 ID |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

`V0RelatedSubject[]`，每项包含：

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | `number` | 条目 ID |
| `type` | `number` | 条目类型 |
| `name` | `string` | 原名 |
| `name_cn` | `string` | 中文名 |
| `image` | `string` | 封面图 URL |
| `staff` | `string` | 角色在该条目中的身份（如 "主角"） |

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
|---|---|
| 400 | `characterId` 为 0 或非法 |
| 404 | 角色不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data } = await bgm.characters.getRelatedSubjectsByCharacterId(1);

data?.forEach(s => {
  console.log(`${s.staff}：[${s.id}] ${s.name_cn || s.name}`);
});
```

---

## 5. getRelatedPersonsByCharacterId()

获取为该角色配音的现实人物（CV）列表。无需认证。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
getRelatedPersonsByCharacterId(characterId: number): Promise<ClientResult<CharacterPerson[]>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `characterId` | `number` | 是 | 角色 ID |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

`CharacterPerson[]`，每项包含：

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | `number` | 人物 ID |
| `name` | `string` | 人物名 |
| `type` | `number` | 类型（1=个人 2=公司 3=组合） |
| `images` | `object` | 头像 URL |
| `subject_id` | `number` | 该配音所属的条目 ID |
| `subject_type` | `number` | 所属条目类型 |
| `staff` | `string` | 角色职位（通常为 "CV"） |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { data } = await bgm.characters.getRelatedPersonsByCharacterId(1);

data?.forEach(p => {
  console.log(`CV：${p.name}（来自条目 ${p.subject_id}）`);
});
```

---

## 6. collectCharacter()

收藏角色。**需要认证**。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
collectCharacter(characterId: number): Promise<ClientResult<undefined>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `characterId` | `number` | 是 | 角色 ID |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

成功时 `response.status` 为 `204`，`data` 为 `undefined`，`error` 为 `undefined`。

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
|---|---|
| 400 | 参数有误 |
| 401 | 未登录或 Token 无效 |
| 404 | 角色不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const bgmAuth = createBangumiClient({ token: 'your-access-token' });

const { error, response } = await bgmAuth.characters.collectCharacter(1);

if (response.status === 204) {
  console.log('收藏成功');
} else if (response.status === 401) {
  console.log('请先登录');
}
```

---

## 7. uncollectCharacter()

取消收藏角色。**需要认证**。

<!-- markdownlint-disable-next-line MD024 -->
### 签名

```ts
uncollectCharacter(characterId: number): Promise<ClientResult<undefined>>
```

<!-- markdownlint-disable-next-line MD024 -->
### 参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `characterId` | `number` | 是 | 角色 ID |

<!-- markdownlint-disable-next-line MD024 -->
### 返回

成功时 `response.status` 为 `204`，`data` 为 `undefined`，`error` 为 `undefined`。

<!-- markdownlint-disable-next-line MD024 -->
### 错误

| 状态码 | 含义 |
|---|---|
| 400 | 参数有误 |
| 401 | 未登录或 Token 无效 |
| 404 | 角色不存在 |

<!-- markdownlint-disable-next-line MD024 -->
### 示例

```ts
const { response } = await bgmAuth.characters.uncollectCharacter(1);

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

> `getCharacterImageById()` 例外，返回 `imageUrl` 代替 `data`。

### 调试日志

```ts
bgm.characters.debug = true; // 开启后每次请求都会打印响应体到 console
```
