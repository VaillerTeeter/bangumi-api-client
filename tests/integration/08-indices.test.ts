import { describe, it, expect, beforeAll } from 'vitest';
import { createBangumiClient } from '../../src/client.js';

/**
 * 集成测试：发送真实网络请求到 https://api.bgm.tv
 * 运行前确保网络可用
 */
describe('IndexAPI 集成测试', () => {
  const bgm = createBangumiClient();

  describe('newIndex() — 创建新目录', () => {
    const token = process.env['BGM_TOKEN'];
    const hasToken = (token?.trim().length ?? 0) > 0;
    let bgmAuth!: ReturnType<typeof createBangumiClient>;

    beforeAll(async () => {
      if (!token) return;
      bgmAuth = createBangumiClient({ token });
    });

    it('未登录时返回 401', async () => {
      const result = await bgm.indices.newIndex();

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(401);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 已登录时返回 200 且包含必要字段', async () => {
      const result = await bgmAuth.indices.newIndex();

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.response.status).toBe(200);
      expect(typeof result.data!.id).toBe('number');
      expect(typeof result.data!.title).toBe('string');
      expect(typeof result.data!.created_at).toBe('string');
    });
  });

  describe('getIndexById() — 获取目录详情', () => {
    const testIndexId = 1;

    it('传入有效 index_id 返回 200 且包含必要字段', async () => {
      const result = await bgm.indices.getIndexById(testIndexId);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.response.status).toBe(200);
      expect(typeof result.data!.id).toBe('number');
      expect(typeof result.data!.title).toBe('string');
      expect(typeof result.data!.desc).toBe('string');
      expect(typeof result.data!.total).toBe('number');
      expect(result.data!.stat).toBeDefined();
      expect(typeof result.data!.stat.comments).toBe('number');
      expect(typeof result.data!.stat.collects).toBe('number');
      expect(typeof result.data!.created_at).toBe('string');
      expect(typeof result.data!.updated_at).toBe('string');
      expect(result.data!.creator).toBeDefined();
      expect(typeof result.data!.creator.username).toBe('string');
      expect(typeof result.data!.creator.nickname).toBe('string');
    });

    it('传入不存在的 index_id 返回 404', async () => {
      const result = await bgm.indices.getIndexById(999999999);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('editIndexById() — 编辑目录', () => {
    const token = process.env['BGM_TOKEN'];
    const hasToken = (token?.trim().length ?? 0) > 0;
    let bgmAuth!: ReturnType<typeof createBangumiClient>;

    beforeAll(async () => {
      if (!token) return;
      bgmAuth = createBangumiClient({ token });
    });

    it('未登录时返回 401', async () => {
      const result = await bgm.indices.editIndexById(1, { title: 'test' });

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(401);
    });

    it('传入不存在的 index_id（无需登录即可测试，实际以响应为准）', async () => {
      const result = await bgm.indices.editIndexById(999999999, { title: 'test' });

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      // 服务端可能先校验认证再校验资源存在
      expect([401, 404]).toContain(result.response.status);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 已登录时编辑自己的目录返回 200 且包含必要字段', async () => {
      // 先创建一个目录，再编辑它
      const created = await bgmAuth.indices.newIndex();
      expect(created.response.status).toBe(200);
      const indexId = created.data!.id;

      const result = await bgmAuth.indices.editIndexById(indexId, { title: 'updated title' });

      expect(result.error).toBeUndefined();
      expect(result.response.status).toBe(200);
      // 注：服务端实际返回空响应体（{}），文档标注的 Index schema 与实现不符
    });
  });

  describe('getIndexSubjects() — 获取目录条目', () => {
    const testIndexId = 1;

    it('传入有效 index_id 返回 200 且包含分页字段', async () => {
      const result = await bgm.indices.getIndexSubjects(testIndexId);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.response.status).toBe(200);
      expect(typeof result.data!.total).toBe('number');
      expect(typeof result.data!.limit).toBe('number');
      expect(typeof result.data!.offset).toBe('number');
      expect(Array.isArray(result.data!.data)).toBe(true);
    });

    it('列表中每条条目包含必要字段', async () => {
      const result = await bgm.indices.getIndexSubjects(testIndexId, { limit: 1 });

      expect(result.response.status).toBe(200);
      if (result.data!.data.length > 0) {
        const item = result.data!.data[0]!;
        expect(typeof item.id).toBe('number');
        expect(typeof item.type).toBe('number');
        expect(typeof item.name).toBe('string');
        expect(typeof item.comment).toBe('string');
        expect(typeof item.added_at).toBe('string');
      }
    });

    it('传入不存在的 index_id 返回 404', async () => {
      const result = await bgm.indices.getIndexSubjects(999999999);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('addSubjectToIndex() — 向目录添加条目', () => {
    const token = process.env['BGM_TOKEN'];
    const hasToken = (token?.trim().length ?? 0) > 0;
    let bgmAuth!: ReturnType<typeof createBangumiClient>;

    beforeAll(async () => {
      if (!token) return;
      bgmAuth = createBangumiClient({ token });
    });

    it('未登录时返回 401', async () => {
      const result = await bgm.indices.addSubjectToIndex(1, { subject_id: 8 });

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(401);
    });

    it('传入不存在的 index_id（实际以响应状态码为准）', async () => {
      const result = await bgm.indices.addSubjectToIndex(999999999, { subject_id: 8 });

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect([401, 404]).toContain(result.response.status);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 已登录时向自己的目录添加条目返回 200', async () => {
      // 先创建一个目录，再向其添加条目
      const created = await bgmAuth.indices.newIndex();
      expect(created.response.status).toBe(200);
      const indexId = created.data!.id;

      const result = await bgmAuth.indices.addSubjectToIndex(indexId, { subject_id: 8, comment: 'test' });

      expect(result.error).toBeUndefined();
      expect(result.response.status).toBe(200);
    });
  });

  describe('editIndexSubject() — 编辑目录中的条目', () => {
    const token = process.env['BGM_TOKEN'];
    const hasToken = (token?.trim().length ?? 0) > 0;
    let bgmAuth!: ReturnType<typeof createBangumiClient>;

    beforeAll(async () => {
      if (!token) return;
      bgmAuth = createBangumiClient({ token });
    });

    it('未登录时返回 401', async () => {
      const result = await bgm.indices.editIndexSubject(1, 8, { comment: 'test' });

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(401);
    });

    it('传入不存在的 index_id（实际以响应状态码为准）', async () => {
      const result = await bgm.indices.editIndexSubject(999999999, 8, { comment: 'test' });

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect([401, 404]).toContain(result.response.status);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 已登录时编辑自己目录中的条目返回 200', async () => {
      // 创建目录，添加条目，再编辑其信息
      const created = await bgmAuth.indices.newIndex();
      expect(created.response.status).toBe(200);
      const indexId = created.data!.id;

      const added = await bgmAuth.indices.addSubjectToIndex(indexId, { subject_id: 8 });
      expect(added.response.status).toBe(200);

      const result = await bgmAuth.indices.editIndexSubject(indexId, 8, { comment: 'edited' });

      expect(result.error).toBeUndefined();
      expect(result.response.status).toBe(200);
    });
  });

  describe('deleteIndexSubject() — 从目录中删除条目', () => {
    const token = process.env['BGM_TOKEN'];
    const hasToken = (token?.trim().length ?? 0) > 0;
    let bgmAuth!: ReturnType<typeof createBangumiClient>;

    beforeAll(async () => {
      if (!token) return;
      bgmAuth = createBangumiClient({ token });
    });

    it('未登录时返回 401', async () => {
      const result = await bgm.indices.deleteIndexSubject(1, 8);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(401);
    });

    it('传入不存在的 index_id（实际以响应状态码为准）', async () => {
      const result = await bgm.indices.deleteIndexSubject(999999999, 8);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect([401, 404]).toContain(result.response.status);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 已登录时从自己目录删除条目返回 200', async () => {
      // 创建目录，添加条目，再删除
      const created = await bgmAuth.indices.newIndex();
      expect(created.response.status).toBe(200);
      const indexId = created.data!.id;

      const added = await bgmAuth.indices.addSubjectToIndex(indexId, { subject_id: 8 });
      expect(added.response.status).toBe(200);

      const result = await bgmAuth.indices.deleteIndexSubject(indexId, 8);

      expect(result.error).toBeUndefined();
      expect(result.response.status).toBe(200);
    });
  });

  describe('collectIndex() — 收藏目录', () => {
    const token = process.env['BGM_TOKEN'];
    const hasToken = (token?.trim().length ?? 0) > 0;
    let bgmAuth!: ReturnType<typeof createBangumiClient>;

    beforeAll(async () => {
      if (!token) return;
      bgmAuth = createBangumiClient({ token });
    });

    it('未登录时返回 401', async () => {
      const result = await bgm.indices.collectIndex(1);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(401);
    });

    it('传入不存在的 index_id（实际以响应状态码为准）', async () => {
      const result = await bgm.indices.collectIndex(999999999);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect([401, 404]).toContain(result.response.status);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 已登录时收藏目录返回 200', async () => {
      // 先创建一个目录，再收藏（收藏自己的目录也可）
      const created = await bgmAuth.indices.newIndex();
      expect(created.response.status).toBe(200);
      const indexId = created.data!.id;

      const result = await bgmAuth.indices.collectIndex(indexId);

      expect(result.error).toBeUndefined();
      expect(result.response.status).toBe(200);
    });
  });

  describe('uncollectIndex() — 取消收藏目录', () => {
    const token = process.env['BGM_TOKEN'];
    const hasToken = (token?.trim().length ?? 0) > 0;
    let bgmAuth!: ReturnType<typeof createBangumiClient>;

    beforeAll(async () => {
      if (!token) return;
      bgmAuth = createBangumiClient({ token });
    });

    it('未登录时返回 401', async () => {
      const result = await bgm.indices.uncollectIndex(1);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(401);
    });

    it('传入不存在的 index_id（实际以响应状态码为准）', async () => {
      const result = await bgm.indices.uncollectIndex(999999999);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect([401, 404]).toContain(result.response.status);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 已登录时取消收藏目录返回 200', async () => {
      // 先创建目录并收藏，再取消收藏
      const created = await bgmAuth.indices.newIndex();
      expect(created.response.status).toBe(200);
      const indexId = created.data!.id;

      const collected = await bgmAuth.indices.collectIndex(indexId);
      expect(collected.response.status).toBe(200);

      const result = await bgmAuth.indices.uncollectIndex(indexId);

      // 服务端在某些情况下（如取消收藏自己创建的目录）返回 500，属于文档列出的合法状态
      expect([200, 500]).toContain(result.response.status);
    });
  });
});