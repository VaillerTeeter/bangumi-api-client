/**
 * 公开 API 入口
 *
 * ⚠️  在 build 之前，必须先运行 `npm run generate` 生成 src/generated/ 目录。
 */

// ── 客户端工厂（核心导出）────────────────────────────────────────────────
export { createBangumiClient } from './client.js';
export type { BangumiClient, BangumiClientOptions } from './client.js';

// ── 高层封装 API 类（可选，供需要依赖注入的场景使用）────────────────────
export { SubjectAPI } from './api/01-subjects.js';
export type {
  CalendarWeekday,
  CalendarSubject,
  CalendarEntry,
  SearchSubjectsFilter,
  SearchSubjectsOptions,
  SearchSubjectsResult,
  GetSubjectsOptions,
  GetSubjectsResult,
} from './api/01-subjects.js';

export { EpisodeAPI } from './api/02-episodes.js';
export type { GetEpisodesOptions, GetEpisodesResult } from './api/02-episodes.js';

export { CharacterAPI } from './api/03-characters.js';
export type { SearchCharactersOptions, SearchCharactersResult } from './api/03-characters.js';

export { PersonAPI } from './api/04-persons.js';
export type { SearchPersonsOptions, SearchPersonsResult } from './api/04-persons.js';

export { UserAPI } from './api/05-users.js';

export { CollectionAPI } from './api/06-collections.js';
export type {
  GetUserCollectionsOptions,
  GetUserSubjectEpisodeCollectionOptions,
  PatchUserSubjectEpisodeCollectionPayload,
} from './api/06-collections.js';

export { RevisionAPI } from './api/07-revisions.js';
export type { GetPersonRevisionsOptions } from './api/07-revisions.js';

export { IndexAPI } from './api/08-indices.js';

// ── 生成层（运行 npm run generate 后自动创建）────────────────────────────
// 导出所有 TypeScript 类型供消费者直接使用
export type * from './generated/types.gen.js';
// 导出原始 SDK 函数供需要直接访问底层接口的场景使用
export * from './generated/sdk.gen.js';
