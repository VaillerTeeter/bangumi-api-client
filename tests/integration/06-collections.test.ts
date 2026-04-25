import { describe, it, expect, beforeAll } from 'vitest';
import { createBangumiClient } from '../../src/client.js';

/**
 * 集成测试：发送真实网络请求到 https://api.bgm.tv
 * 运行前确保网络可用
 */
describe('CollectionAPI 集成测试', () => {
  const bgm = createBangumiClient();

  // 使用已知存在的公开用户
  const testUsername = 'sai';

  describe('getUserCollections() — 获取用户收藏', () => {
    it('返回 HTTP 200 且包含分页数据结构', async () => {
      const result = await bgm.collections.getUserCollections(testUsername);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(typeof result.data!.total).toBe('number');
      expect(typeof result.data!.limit).toBe('number');
      expect(typeof result.data!.offset).toBe('number');
      expect(Array.isArray(result.data!.data)).toBe(true);
    });

    it('返回结果数量大于 0', async () => {
      const result = await bgm.collections.getUserCollections(testUsername);

      expect(result.error).toBeUndefined();
      expect(result.data!.total).toBeGreaterThan(0);
    });

    it('每条收藏记录包含必要字段', async () => {
      const result = await bgm.collections.getUserCollections(testUsername, { limit: 5 });

      expect(result.error).toBeUndefined();
      const items = result.data!.data!;
      expect(items.length).toBeGreaterThan(0);
      for (const item of items) {
        expect(typeof item.subject_id).toBe('number');
        expect(typeof item.subject_type).toBe('number');
        expect(typeof item.rate).toBe('number');
        expect(typeof item.type).toBe('number');
        expect(Array.isArray(item.tags)).toBe(true);
        expect(typeof item.ep_status).toBe('number');
        expect(typeof item.vol_status).toBe('number');
        expect(typeof item.updated_at).toBe('string');
        expect(typeof item.private).toBe('boolean');
      }
    });

    it('分页参数生效（limit=2 只返回 2 条）', async () => {
      const result = await bgm.collections.getUserCollections(testUsername, { limit: 2 });

      expect(result.error).toBeUndefined();
      expect(result.data!.data!.length).toBeLessThanOrEqual(2);
      expect(result.data!.limit).toBe(2);
    });

    it('subject_type 过滤参数生效（动画=2）', async () => {
      const result = await bgm.collections.getUserCollections(testUsername, {
        subject_type: 2,
        limit: 5,
      });

      expect(result.error).toBeUndefined();
      const items = result.data!.data!;
      for (const item of items) {
        expect(item.subject_type).toBe(2);
      }
    });

    it('传入过长的 username 返回 4xx', async () => {
      // NOTE: 该端点对过长 username 不做长度校验，直接返回 404（用户不存在）
      const result = await bgm.collections.getUserCollections('a'.repeat(256));

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBeGreaterThanOrEqual(400);
    });

    it('传入不存在的 username 返回 404', async () => {
      const result = await bgm.collections.getUserCollections('no_such_user_xyz');

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('getUserCollections() — 带 token 查看私有收藏', () => {
    const token = process.env['BGM_TOKEN'];
    const hasToken = (token?.trim().length ?? 0) > 0;
    let bgmAuth!: ReturnType<typeof createBangumiClient>;
    let selfUsername!: string;

    beforeAll(async () => {
      if (!token) return;
      bgmAuth = createBangumiClient({ token });
      // 通过 getMyself() 动态获取当前 token 对应的用户名
      const result = await bgmAuth.users.getMyself();
      selfUsername = result.data!.username;
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 认证后查询自己的收藏返回 200', async () => {
      const result = await bgmAuth.collections.getUserCollections(selfUsername);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(typeof result.data!.total).toBe('number');
      expect(Array.isArray(result.data!.data)).toBe(true);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 认证后返回的收藏记录包含 private 字段', async () => {
      const result = await bgmAuth.collections.getUserCollections(selfUsername, { limit: 5 });

      expect(result.error).toBeUndefined();
      const items = result.data!.data!;
      for (const item of items) {
        // private 字段只有认证后才会返回真实值（匿名时私有条目会被过滤掉）
        expect(typeof item.private).toBe('boolean');
      }
    });
  });

  describe('getUserCollectionBySubjectId() — 获取用户单个条目收藏', () => {
    let knownSubjectId!: number;

    beforeAll(async () => {
      // 先拿 sai 的第一条公开收藏，取得 subject_id 供后续测试使用
      const r = await bgm.collections.getUserCollections(testUsername, { limit: 1 });
      knownSubjectId = r.data!.data![0]!.subject_id;
    });

    it('返回 HTTP 200 且包含完整收藏数据', async () => {
      const result = await bgm.collections.getUserCollectionBySubjectId(testUsername, knownSubjectId);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.response.status).toBe(200);
    });

    it('返回的 subject_id 与请求一致', async () => {
      const result = await bgm.collections.getUserCollectionBySubjectId(testUsername, knownSubjectId);

      expect(result.error).toBeUndefined();
      expect(result.data!.subject_id).toBe(knownSubjectId);
    });

    it('返回数据包含必要字段', async () => {
      const result = await bgm.collections.getUserCollectionBySubjectId(testUsername, knownSubjectId);

      expect(result.error).toBeUndefined();
      const item = result.data!;
      expect(typeof item.subject_id).toBe('number');
      expect(typeof item.subject_type).toBe('number');
      expect(typeof item.rate).toBe('number');
      expect(typeof item.type).toBe('number');
      expect(Array.isArray(item.tags)).toBe(true);
      expect(typeof item.ep_status).toBe('number');
      expect(typeof item.vol_status).toBe('number');
      expect(typeof item.updated_at).toBe('string');
      expect(typeof item.private).toBe('boolean');
      // subject 字段应包含条目详情
      expect(item.subject).toBeDefined();
      expect(typeof item.subject!.id).toBe('number');
      expect(typeof item.subject!.name).toBe('string');
    });

    it('传入 subject_id=0 返回 400', async () => {
      const result = await bgm.collections.getUserCollectionBySubjectId(testUsername, 0);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(400);
    });

    it('传入不存在的 username 返回 404', async () => {
      const result = await bgm.collections.getUserCollectionBySubjectId('no_such_user_xyz', knownSubjectId);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });

    it('传入未收藏的 subject_id 返回 404', async () => {
      // 使用一个存在但 sai 未收藏的条目（极大 ID）
      const result = await bgm.collections.getUserCollectionBySubjectId(testUsername, 9999999);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('getUserCollectionBySubjectId() — 带 token 查看私有收藏', () => {
    const token = process.env['BGM_TOKEN'];
    const hasToken = (token?.trim().length ?? 0) > 0;
    let bgmAuth!: ReturnType<typeof createBangumiClient>;
    let selfUsername!: string;
    let selfSubjectId = 0;

    beforeAll(async () => {
      if (!token) return;
      bgmAuth = createBangumiClient({ token });
      const meResult = await bgmAuth.users.getMyself();
      selfUsername = meResult.data!.username;
      // 获取自己的第一条收藏（含私有），取得 subject_id
      const collResult = await bgmAuth.collections.getUserCollections(selfUsername, { limit: 1 });
      selfSubjectId = collResult.data?.data?.[0]?.subject_id ?? 0;
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 认证后获取自己的单个条目收藏返回 200', async () => {
      if (!selfSubjectId) return; // token 账号无收藏，跳过
      const result = await bgmAuth.collections.getUserCollectionBySubjectId(selfUsername, selfSubjectId);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.response.status).toBe(200);
      expect(result.data!.subject_id).toBe(selfSubjectId);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 认证后返回的 private 字段为真实值', async () => {
      if (!selfSubjectId) return; // token 账号无收藏，跳过
      const result = await bgmAuth.collections.getUserCollectionBySubjectId(selfUsername, selfSubjectId);

      expect(result.error).toBeUndefined();
      expect(typeof result.data!.private).toBe('boolean');
    });
  });

  describe('postUserCollection() — 新增或修改用户单个条目收藏', () => {
    const token = process.env['BGM_TOKEN'];
    const hasToken = (token?.trim().length ?? 0) > 0;
    let bgmAuth!: ReturnType<typeof createBangumiClient>;

    // 使用一个已知存在的动画条目（凉宫春日的忧郁 subject_id=976）
    const testSubjectId = 976;

    beforeAll(async () => {
      if (!token) return;
      bgmAuth = createBangumiClient({ token });
    });

    it('未登录时返回 401', async () => {
      const result = await bgm.collections.postUserCollection(testSubjectId, { type: 1 });

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(401);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 收藏或更新收藏返回 202', async () => {
      const result = await bgmAuth.collections.postUserCollection(testSubjectId, {
        type: 2, // 在看
        rate: 0, // 不评分
        private: false,
      });

      expect(result.error).toBeUndefined();
      expect(result.response.status).toBe(202);
    });

    it('传入 subject_id=0 未登录返回 401', async () => {
      // NOTE: POST 端点需要认证，匿名请求在 subject_id 校验前即返回 401
      const result = await bgm.collections.postUserCollection(0, { type: 1 });

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(401);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 传入 subject_id=0 返回 400', async () => {
      const result = await bgmAuth.collections.postUserCollection(0, { type: 1 });

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(400);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 传入不存在的 subject_id 返回 404', async () => {
      const result = await bgmAuth.collections.postUserCollection(9999999, { type: 1 });

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('patchUserCollection() — 修改用户单个收藏', () => {
    const token = process.env['BGM_TOKEN'];
    const hasToken = (token?.trim().length ?? 0) > 0;
    let bgmAuth!: ReturnType<typeof createBangumiClient>;

    // 使用一个已知已收藏的条目（先通过 POST 保证存在）
    const testSubjectId = 976; // 凉宫春日的忧郁

    beforeAll(async () => {
      if (!token) return;
      bgmAuth = createBangumiClient({ token });
    });

    it('未登录时返回 401', async () => {
      const result = await bgm.collections.patchUserCollection(testSubjectId, { type: 2 });

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(401);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 修改已收藏条目返回 204', async () => {
      // 先确保已收藏，再 PATCH
      await bgmAuth.collections.postUserCollection(testSubjectId, { type: 2 });
      const result = await bgmAuth.collections.patchUserCollection(testSubjectId, {
        rate: 0,
        private: false,
      });

      expect(result.error).toBeUndefined();
      expect(result.response.status).toBe(204);
    });

    it('传入 subject_id=0 未登录返回 401', async () => {
      // NOTE: PATCH 端点需要认证，匿名请求在 subject_id 校验前即返回 401
      const result = await bgm.collections.patchUserCollection(0, { type: 2 });

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(401);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 传入 subject_id=0 返回 400', async () => {
      const result = await bgmAuth.collections.patchUserCollection(0, { type: 2 });

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(400);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 传入未收藏的 subject_id 返回 404', async () => {
      const result = await bgmAuth.collections.patchUserCollection(9999999, { type: 2 });

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('getUserSubjectEpisodeCollection() — 获取条目章节收藏信息', () => {
    const token = process.env['BGM_TOKEN'];
    const hasToken = (token?.trim().length ?? 0) > 0;
    let bgmAuth!: ReturnType<typeof createBangumiClient>;

    // 凉宫春日的忧郁 subject_id=976（已通过 postUserCollection 确保在收藏中）
    const testSubjectId = 976;

    beforeAll(async () => {
      if (!token) return;
      bgmAuth = createBangumiClient({ token });
    });

    it('未登录时返回 401', async () => {
      const result = await bgm.collections.getUserSubjectEpisodeCollection(testSubjectId);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(401);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 返回 200 且包含分页数据结构', async () => {
      const result = await bgmAuth.collections.getUserSubjectEpisodeCollection(testSubjectId);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.response.status).toBe(200);
      expect(typeof result.data!.total).toBe('number');
      expect(typeof result.data!.limit).toBe('number');
      expect(typeof result.data!.offset).toBe('number');
      expect(Array.isArray(result.data!.data)).toBe(true);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 每条记录包含必要字段', async () => {
      const result = await bgmAuth.collections.getUserSubjectEpisodeCollection(testSubjectId, { limit: 5 });

      expect(result.error).toBeUndefined();
      const items = result.data!.data!;
      for (const item of items) {
        expect(item.episode).toBeDefined();
        expect(typeof item.episode.id).toBe('number');
        expect(typeof item.type).toBe('number');
        expect(typeof item.updated_at).toBe('number');
      }
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] episode_type 筛选参数生效（type=0 仅本篇）', async () => {
      const result = await bgmAuth.collections.getUserSubjectEpisodeCollection(testSubjectId, {
        episode_type: 0,
        limit: 5,
      });

      expect(result.error).toBeUndefined();
      expect(result.response.status).toBe(200);
    });

    it('传入 subject_id=0 未登录返回 401', async () => {
      // NOTE: 端点需要认证，匿名请求在 subject_id 校验前即返回 401
      const result = await bgm.collections.getUserSubjectEpisodeCollection(0);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(401);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 传入 subject_id=0 返回 400', async () => {
      const result = await bgmAuth.collections.getUserSubjectEpisodeCollection(0);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(400);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 传入不存在的 subject_id 返回 404', async () => {
      const result = await bgmAuth.collections.getUserSubjectEpisodeCollection(9999999);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('patchUserSubjectEpisodeCollection() — 批量修改条目章节收藏', () => {
    const token = process.env['BGM_TOKEN'];
    const hasToken = (token?.trim().length ?? 0) > 0;
    let bgmAuth!: ReturnType<typeof createBangumiClient>;
    let episodeIds: number[] = [];

    // 凉宫春日的忧阳 subject_id=976（已通过 postUserCollection 确保在收藏中）
    const testSubjectId = 976;

    beforeAll(async () => {
      if (!token) return;
      bgmAuth = createBangumiClient({ token });
      // 取前 3 个章节 ID 供批量修改测试使用
      const r = await bgmAuth.collections.getUserSubjectEpisodeCollection(testSubjectId, { limit: 3 });
      episodeIds = r.data?.data?.map(e => e.episode.id) ?? [];
    });

    it('未登录时返回 401', async () => {
      const result = await bgm.collections.patchUserSubjectEpisodeCollection(testSubjectId, {
        episode_id: [1],
        type: 2,
      });

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(401);
    });

    it.skipIf(!hasToken)('[\u9700\u8981 BGM_TOKEN] 批量标记章节收藏返回 204', async () => {
      if (!episodeIds.length) return;
      const result = await bgmAuth.collections.patchUserSubjectEpisodeCollection(testSubjectId, {
        episode_id: episodeIds,
        type: 2, // 看过
      });

      expect(result.error).toBeUndefined();
      expect(result.response.status).toBe(204);
    });

    it('传入 subject_id=0 未登录返回 401', async () => {
      // NOTE: PATCH 端点需要认证，匿名请求在 subject_id 校验前即返回 401
      const result = await bgm.collections.patchUserSubjectEpisodeCollection(0, {
        episode_id: [1],
        type: 2,
      });

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(401);
    });

    it.skipIf(!hasToken)('[\u9700\u8981 BGM_TOKEN] 传入 subject_id=0 返回 400', async () => {
      const result = await bgmAuth.collections.patchUserSubjectEpisodeCollection(0, {
        episode_id: [1],
        type: 2,
      });

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(400);
    });

    it.skipIf(!hasToken)('[\u9700\u8981 BGM_TOKEN] 传入不存在的 subject_id 返回 404', async () => {
      const result = await bgmAuth.collections.patchUserSubjectEpisodeCollection(9999999, {
        episode_id: [1],
        type: 2,
      });

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('getUserEpisodeCollection() — 获取单章节收藏信息', () => {
    const token = process.env['BGM_TOKEN'];
    const hasToken = (token?.trim().length ?? 0) > 0;
    let bgmAuth!: ReturnType<typeof createBangumiClient>;
    let knownEpisodeId = 0;

    beforeAll(async () => {
      if (!token) return;
      bgmAuth = createBangumiClient({ token });
      // 从 subject_id=976（凉宫春日的忧郁）获取一个已收藏的章节 ID
      const r = await bgmAuth.collections.getUserSubjectEpisodeCollection(976, { limit: 1 });
      knownEpisodeId = r.data?.data?.[0]?.episode.id ?? 0;
    });

    it('未登录时返回 401', async () => {
      const result = await bgm.collections.getUserEpisodeCollection(1);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(401);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 返回 200 且包含必要字段', async () => {
      if (!knownEpisodeId) return;
      const result = await bgmAuth.collections.getUserEpisodeCollection(knownEpisodeId);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.response.status).toBe(200);
      expect(result.data!.episode).toBeDefined();
      expect(typeof result.data!.episode.id).toBe('number');
      expect(typeof result.data!.type).toBe('number');
    });

    it('传入 episode_id=0 未登录返回 401', async () => {
      // NOTE: 端点需要认证，匿名请求在参数校验前即返回 401
      const result = await bgm.collections.getUserEpisodeCollection(0);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(401);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 传入 episode_id=0 返回 400', async () => {
      const result = await bgmAuth.collections.getUserEpisodeCollection(0);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(400);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 传入不存在的 episode_id 返回 404', async () => {
      const result = await bgmAuth.collections.getUserEpisodeCollection(9999999);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('putUserEpisodeCollection() — 更新单章节收藏状态', () => {
    const token = process.env['BGM_TOKEN'];
    const hasToken = (token?.trim().length ?? 0) > 0;
    let bgmAuth!: ReturnType<typeof createBangumiClient>;
    let knownEpisodeId = 0;

    beforeAll(async () => {
      if (!token) return;
      bgmAuth = createBangumiClient({ token });
      // 从 subject_id=976（凉宫春日的忧郁）获取一个已收藏的章节 ID
      const r = await bgmAuth.collections.getUserSubjectEpisodeCollection(976, { limit: 1 });
      knownEpisodeId = r.data?.data?.[0]?.episode.id ?? 0;
    });

    it('未登录时返回 401', async () => {
      const result = await bgm.collections.putUserEpisodeCollection(1, 2);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(401);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 更新章节收藏状态返回 204', async () => {
      if (!knownEpisodeId) return;
      const result = await bgmAuth.collections.putUserEpisodeCollection(knownEpisodeId, 2);

      expect(result.error).toBeUndefined();
      expect(result.response.status).toBe(204);
    });

    it('传入 episode_id=0 未登录返回 401', async () => {
      // NOTE: 端点需要认证，匿名请求在参数校验前即返回 401
      const result = await bgm.collections.putUserEpisodeCollection(0, 2);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(401);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 传入 episode_id=0 返回 400', async () => {
      const result = await bgmAuth.collections.putUserEpisodeCollection(0, 2);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(400);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 传入不存在的 episode_id 返回 404', async () => {
      const result = await bgmAuth.collections.putUserEpisodeCollection(9999999, 2);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('getUserCharacterCollections() — 获取用户角色收藏列表', () => {
    it('返回 HTTP 200 且包含分页数据结构', async () => {
      const result = await bgm.collections.getUserCharacterCollections(testUsername);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.response.status).toBe(200);
      expect(typeof result.data!.total).toBe('number');
      expect(typeof result.data!.limit).toBe('number');
      expect(typeof result.data!.offset).toBe('number');
      expect(Array.isArray(result.data!.data)).toBe(true);
    });

    it('返回的角色收藏记录包含必要字段', async () => {
      const result = await bgm.collections.getUserCharacterCollections(testUsername);

      expect(result.error).toBeUndefined();
      const items = result.data!.data!;
      if (items.length > 0) {
        const item = items[0]!;
        expect(typeof item.id).toBe('number');
        expect(typeof item.name).toBe('string');
        expect(typeof item.type).toBe('number');
        expect(typeof item.created_at).toBe('string');
      }
    });

    it('传入不存在的 username 返回 404', async () => {
      const result = await bgm.collections.getUserCharacterCollections('no_such_user_xyz');

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('getUserCharacterCollection() — 获取用户单个角色收藏信息', () => {
    let knownCharacterId = 0;

    beforeAll(async () => {
      // 从 testUsername 的角色收藏列表取第一条的 character_id
      const r = await bgm.collections.getUserCharacterCollections(testUsername);
      knownCharacterId = r.data?.data?.[0]?.id ?? 0;
    });

    it('返回 HTTP 200 且包含必要字段', async () => {
      if (!knownCharacterId) return;
      const result = await bgm.collections.getUserCharacterCollection(testUsername, knownCharacterId);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.response.status).toBe(200);
      expect(typeof result.data!.id).toBe('number');
      expect(typeof result.data!.name).toBe('string');
      expect(typeof result.data!.type).toBe('number');
      expect(typeof result.data!.created_at).toBe('string');
    });

    it('传入 character_id=0 返回 400', async () => {
      const result = await bgm.collections.getUserCharacterCollection(testUsername, 0);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(400);
    });

    it('传入不存在的 username 返回 404', async () => {
      if (!knownCharacterId) return;
      const result = await bgm.collections.getUserCharacterCollection('no_such_user_xyz', knownCharacterId);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });

    it('传入不存在的 character_id 返回 404', async () => {
      const result = await bgm.collections.getUserCharacterCollection(testUsername, 9999999);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('getUserPersonCollections() — 获取用户人物收藏列表', () => {
    it('返回 HTTP 200 且包含必要字段', async () => {
      const result = await bgm.collections.getUserPersonCollections(testUsername);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.response.status).toBe(200);
      expect(typeof result.data!.total).toBe('number');
      expect(Array.isArray(result.data!.data)).toBe(true);
    });

    it('传入不存在的 username 返回 404', async () => {
      const result = await bgm.collections.getUserPersonCollections('no_such_user_xyz');

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('getUserPersonCollection() — 获取用户单个人物收藏信息', () => {
    let knownPersonId = 0;

    beforeAll(async () => {
      const r = await bgm.collections.getUserPersonCollections(testUsername);
      knownPersonId = r.data?.data?.[0]?.id ?? 0;
    });

    it('返回 HTTP 200 且包含必要字段', async () => {
      if (!knownPersonId) return;
      const result = await bgm.collections.getUserPersonCollection(testUsername, knownPersonId);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.response.status).toBe(200);
      expect(typeof result.data!.id).toBe('number');
      expect(typeof result.data!.name).toBe('string');
      expect(typeof result.data!.type).toBe('number');
      expect(typeof result.data!.created_at).toBe('string');
    });

    it('传入 person_id=0 返回 400', async () => {
      const result = await bgm.collections.getUserPersonCollection(testUsername, 0);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(400);
    });

    it('传入不存在的 username 返回 404', async () => {
      if (!knownPersonId) return;
      const result = await bgm.collections.getUserPersonCollection('no_such_user_xyz', knownPersonId);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });

    it('传入不存在的 person_id 返回 404', async () => {
      const result = await bgm.collections.getUserPersonCollection(testUsername, 9999999);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });
});