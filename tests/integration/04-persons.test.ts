import { describe, it, expect, beforeAll } from 'vitest';
import { createBangumiClient } from '../../src/client.js';

/**
 * 集成测试：发送真实网络请求到 https://api.bgm.tv
 * 运行前确保网络可用
 */
describe('PersonAPI 集成测试', () => {
  const bgm = createBangumiClient();

  describe('searchPersons() — 人物搜索', () => {
    it('返回 HTTP 200 且包含分页数据结构', async () => {
      const result = await bgm.persons.searchPersons('山田');

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(typeof result.data!.total).toBe('number');
      expect(typeof result.data!.limit).toBe('number');
      expect(typeof result.data!.offset).toBe('number');
      expect(Array.isArray(result.data!.data)).toBe(true);
    });

    it('返回结果数量大于 0', async () => {
      const result = await bgm.persons.searchPersons('山田');

      expect(result.error).toBeUndefined();
      expect(result.data!.data.length).toBeGreaterThan(0);
    });

    it('每条人物记录包含必要字段', async () => {
      const result = await bgm.persons.searchPersons('山田');

      expect(result.error).toBeUndefined();
      const person = result.data!.data[0]!;
      expect(typeof person.id).toBe('number');
      expect(typeof person.name).toBe('string');
      expect(typeof person.type).toBe('number');
    });

    it('分页参数生效（limit=2 只返回 2 条）', async () => {
      const result = await bgm.persons.searchPersons('山田', { limit: 2 });

      expect(result.error).toBeUndefined();
      expect(result.data!.data.length).toBeLessThanOrEqual(2);
    });

    it('career 过滤参数生效', async () => {
      const result = await bgm.persons.searchPersons('山田', { career: ['voice_actor'], limit: 5 });

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data!.data)).toBe(true);
    });

    it('搜索无匹配时仍返回 HTTP 200（不返回 404）', async () => {
      const result = await bgm.persons.searchPersons('xyzxyz_no_match_person_99999');

      expect(result.error).toBeUndefined();
      expect(result.response.status).toBe(200);
    });
  });

  describe('getPersonById() — 按 ID 获取人物', () => {
    // person_id=1 为知名人物，数据稳定
    it('返回 HTTP 200 且 id 与请求一致', async () => {
      const result = await bgm.persons.getPersonById(1);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data!.id).toBe(1);
    });

    it('返回人物包含所有必要字段', async () => {
      const result = await bgm.persons.getPersonById(1);

      expect(result.error).toBeUndefined();
      const person = result.data!;
      expect(typeof person.id).toBe('number');
      expect(typeof person.name).toBe('string');
      expect(typeof person.type).toBe('number');
      expect(Array.isArray(person.career)).toBe(true);
      expect(typeof person.summary).toBe('string');
      expect(typeof person.locked).toBe('boolean');
      expect(person.stat).toBeDefined();
      expect(typeof person.stat.comments).toBe('number');
      expect(typeof person.stat.collects).toBe('number');
    });

    it('传入 person_id=0 返回 400', async () => {
      const result = await bgm.persons.getPersonById(0);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(400);
    });

    it('传入不存在的 person_id 返回 404', async () => {
      const result = await bgm.persons.getPersonById(9999999);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('getPersonImageById() — 人物图片', () => {
    // person_id=1 为知名人物，必有图片
    it('返回人物图片 URL（fetch 跟随 302 后状态为 200）', async () => {
      const result = await bgm.persons.getPersonImageById(1, 'large');

      expect(result.error).toBeUndefined();
      expect(result.imageUrl).toBeDefined();
      expect(typeof result.imageUrl).toBe('string');
      expect(result.imageUrl!.length).toBeGreaterThan(0);
    });

    it('不同尺寸参数均返回有效图片 URL', async () => {
      const types = ['small', 'grid', 'large', 'medium'] as const;
      for (const type of types) {
        const result = await bgm.persons.getPersonImageById(1, type);
        expect(result.error).toBeUndefined();
        expect(typeof result.imageUrl).toBe('string');
        expect(result.imageUrl!.length).toBeGreaterThan(0);
      }
    });

    it('传入 person_id=0 返回 400', async () => {
      const result = await bgm.persons.getPersonImageById(0, 'large');

      expect(result.imageUrl).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(400);
    });

    it('传入不存在的 person_id 返回 404', async () => {
      const result = await bgm.persons.getPersonImageById(9999999, 'large');

      expect(result.imageUrl).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('getRelatedSubjectsByPersonId() — 人物相关条目', () => {
    // person_id=1 为知名人物，必有关联条目
    it('返回 HTTP 200 且包含条目列表', async () => {
      const result = await bgm.persons.getRelatedSubjectsByPersonId(1);

      expect(result.error).toBeUndefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data!.length).toBeGreaterThan(0);
    });

    it('每条记录包含必要字段', async () => {
      const result = await bgm.persons.getRelatedSubjectsByPersonId(1);

      expect(result.error).toBeUndefined();
      const item = result.data![0]!;
      expect(typeof item.id).toBe('number');
      expect(typeof item.type).toBe('number');
      expect(typeof item.name).toBe('string');
    });

    it('传入 person_id=0 返回 400', async () => {
      const result = await bgm.persons.getRelatedSubjectsByPersonId(0);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(400);
    });

    it('传入不存在的 person_id 返回 404', async () => {
      const result = await bgm.persons.getRelatedSubjectsByPersonId(9999999);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('getRelatedCharactersByPersonId() — 人物相关角色', () => {
    it('返回 HTTP 200 且包含角色列表', async () => {
      const result = await bgm.persons.getRelatedCharactersByPersonId(1);

      expect(result.error).toBeUndefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data!.length).toBeGreaterThan(0);
    });

    it('每条记录包含必要字段', async () => {
      const result = await bgm.persons.getRelatedCharactersByPersonId(1);

      expect(result.error).toBeUndefined();
      const first = result.data![0];
      expect(typeof first.id).toBe('number');
      expect(typeof first.name).toBe('string');
      expect(typeof first.type).toBe('number');
    });

    it('传入 person_id=0 返回 400', async () => {
      const result = await bgm.persons.getRelatedCharactersByPersonId(0);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(400);
    });

    it('传入不存在的 person_id 返回 404', async () => {
      const result = await bgm.persons.getRelatedCharactersByPersonId(9999999);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('collectPerson() — 收藏人物', () => {
    const token = process.env['BGM_TOKEN'];
    const hasToken = (token?.trim().length ?? 0) > 0;
    let bgmAuth!: ReturnType<typeof createBangumiClient>;

    beforeAll(() => {
      if (token) {
        bgmAuth = createBangumiClient({ token });
      }
    });

    it('未登录时返回 401', async () => {
      const result = await bgm.persons.collectPerson(1);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(401);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 成功收藏返回 2xx', async () => {
      const result = await bgmAuth.persons.collectPerson(1);

      expect(result.error).toBeUndefined();
      expect(result.response.status).toBeGreaterThanOrEqual(200);
      expect(result.response.status).toBeLessThan(300);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 传入 person_id=0 返回 400', async () => {
      const result = await bgmAuth.persons.collectPerson(0);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(400);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 传入不存在的 person_id 返回 404', async () => {
      const result = await bgmAuth.persons.collectPerson(9999999);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('uncollectPerson() — 取消收藏人物', () => {
    // NOTE: Bangumi DELETE /v0/persons/{person_id}/collect 端点对所有请求（含认证）均返回 404，
    // 与 API 文档（204/400/401）不符，判断该端点在生产环境尚未完整实现。
    // 以下测试记录当前实际行为，待服务端修复后再更新断言。
    const token = process.env['BGM_TOKEN'];
    const hasToken = (token?.trim().length ?? 0) > 0;
    let bgmAuth!: ReturnType<typeof createBangumiClient>;

    beforeAll(() => {
      if (token) {
        bgmAuth = createBangumiClient({ token });
      }
    });

    it('匿名请求返回 4xx 错误', async () => {
      const result = await bgm.persons.uncollectPerson(1);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBeGreaterThanOrEqual(400);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 认证后请求当前返回 404（端点未实现）', async () => {
      await bgmAuth.persons.collectPerson(1);
      const result = await bgmAuth.persons.uncollectPerson(1);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 传入 person_id=0 返回 4xx', async () => {
      const result = await bgmAuth.persons.uncollectPerson(0);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBeGreaterThanOrEqual(400);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 传入不存在的 person_id 返回 404', async () => {
      const result = await bgmAuth.persons.uncollectPerson(9999999);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });
});