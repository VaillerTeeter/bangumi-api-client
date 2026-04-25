import { describe, it, expect, beforeAll } from 'vitest';
import { createBangumiClient } from '../../src/client.js';

/**
 * 集成测试：发送真实网络请求到 https://api.bgm.tv
 * 运行前确保网络可用
 */
describe('CharacterAPI 集成测试', () => {
  const bgm = createBangumiClient();

  describe('searchCharacters() — 角色搜索', () => {
    it('返回 HTTP 200 且包含分页数据结构', async () => {
      const result = await bgm.characters.searchCharacters('綾波レイ');

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(typeof result.data!.total).toBe('number');
      expect(typeof result.data!.limit).toBe('number');
      expect(typeof result.data!.offset).toBe('number');
      expect(Array.isArray(result.data!.data)).toBe(true);
    });

    it('返回结果数量大于 0', async () => {
      const result = await bgm.characters.searchCharacters('綾波レイ');

      expect(result.error).toBeUndefined();
      expect(result.data!.total).toBeGreaterThan(0);
      expect(result.data!.data.length).toBeGreaterThan(0);
    });

    it('每条角色记录包含必要字段', async () => {
      const result = await bgm.characters.searchCharacters('綾波レイ', { limit: 3 });

      expect(result.error).toBeUndefined();
      for (const ch of result.data!.data) {
        expect(typeof ch.id).toBe('number');
        expect(typeof ch.name).toBe('string');
        expect(typeof ch.type).toBe('number');
        expect(typeof ch.summary).toBe('string');
        expect(typeof ch.locked).toBe('boolean');
      }
    });

    it('分页参数生效（limit=2 只返回 2 条）', async () => {
      const result = await bgm.characters.searchCharacters('綾波レイ', { limit: 2, offset: 0 });

      expect(result.error).toBeUndefined();
      expect(result.data!.data.length).toBeLessThanOrEqual(2);
      expect(result.data!.limit).toBe(2);
      expect(result.data!.offset).toBe(0);
    });

    it('搜索无匹配时仍返回 HTTP 200（不返回 404）', async () => {
      // Bangumi 使用模糊匹配，即使关键词无精确匹配也会返回 200
      const result = await bgm.characters.searchCharacters('这个角色名字绝对不会存在xyzxyzxyz123456');

      expect(result.error).toBeUndefined();
      expect(result.response.status).toBe(200);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data!.data)).toBe(true);
    });
  });

  describe('getCharacterById() — 按 ID 获取角色', () => {
    // character_id=1 为鲁路修，稳定存在
    it('返回 HTTP 200 且 id 与请求一致', async () => {
      const result = await bgm.characters.getCharacterById(1);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data!.id).toBe(1);
    });

    it('返回角色包含所有必要字段', async () => {
      const result = await bgm.characters.getCharacterById(1);

      expect(result.error).toBeUndefined();
      const ch = result.data!;
      expect(typeof ch.id).toBe('number');
      expect(typeof ch.name).toBe('string');
      expect(typeof ch.type).toBe('number');
      expect(typeof ch.summary).toBe('string');
      expect(typeof ch.locked).toBe('boolean');
      expect(ch.images).toBeDefined();
      expect(typeof ch.images!.large).toBe('string');
      expect(ch.stat).toBeDefined();
      expect(typeof ch.stat!.comments).toBe('number');
      expect(typeof ch.stat!.collects).toBe('number');
    });

    it('传入 character_id=0 返回 400', async () => {
      const result = await bgm.characters.getCharacterById(0);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(400);
    });

    it('传入不存在的 character_id 返回 404', async () => {
      const result = await bgm.characters.getCharacterById(99999999);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('getCharacterImageById() — 角色图片', () => {
    it('返回角色图片 URL（fetch 跟随 302 后状态为 200）', async () => {
      const result = await bgm.characters.getCharacterImageById(1, 'large');

      expect(result.error).toBeUndefined();
      expect(result.imageUrl).toBeDefined();
      expect(result.imageUrl).toMatch(/^\/\//i.test(result.imageUrl!) ? /^\/\// : /^https:\/\//i);
      expect(result.response?.status).toBe(200);
    });

    it('不同尺寸参数均返回有效图片 URL', async () => {
      const types = ['small', 'grid', 'large', 'medium'] as const;

      for (const type of types) {
        const result = await bgm.characters.getCharacterImageById(1, type);
        expect(result.error).toBeUndefined();
        expect(result.imageUrl).toBeTruthy();
      }
    });

    it('传入无效 type 返回 400', async () => {
      const result = await bgm.characters.getCharacterImageById(1, 'invalid' as never);

      expect(result.imageUrl).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response?.status).toBe(400);
    });

    it('传入不存在的 character_id 返回 404', async () => {
      const result = await bgm.characters.getCharacterImageById(99999999, 'large');

      expect(result.imageUrl).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response?.status).toBe(404);
    });
  });

  describe('getRelatedSubjectsByCharacterId() — 角色相关条目', () => {
    it('返回 HTTP 200 且包含条目列表', async () => {
      // character_id=1 为鲁路修，有关联条目
      const result = await bgm.characters.getRelatedSubjectsByCharacterId(1);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data!.length).toBeGreaterThan(0);
    });

    it('每条记录包含必要字段', async () => {
      const result = await bgm.characters.getRelatedSubjectsByCharacterId(1);

      expect(result.error).toBeUndefined();
      for (const item of result.data!) {
        expect(typeof item.id).toBe('number');
        expect(typeof item.type).toBe('number');
        expect(typeof item.name).toBe('string');
        expect(typeof item.name_cn).toBe('string');
        expect(typeof item.staff).toBe('string');
      }
    });

    it('传入 character_id=0 返回 400', async () => {
      const result = await bgm.characters.getRelatedSubjectsByCharacterId(0);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(400);
    });

    it('传入不存在的 character_id 返回 404', async () => {
      const result = await bgm.characters.getRelatedSubjectsByCharacterId(99999999);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('getRelatedPersonsByCharacterId() — 角色相关人物', () => {
    it('返回 HTTP 200 且包含人物列表', async () => {
      const result = await bgm.characters.getRelatedPersonsByCharacterId(1);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data!.length).toBeGreaterThan(0);
    });

    it('每条记录包含必要字段', async () => {
      const result = await bgm.characters.getRelatedPersonsByCharacterId(1);

      expect(result.error).toBeUndefined();
      for (const item of result.data!) {
        expect(typeof item.id).toBe('number');
        expect(typeof item.name).toBe('string');
        expect(typeof item.type).toBe('number');
        expect(typeof item.subject_id).toBe('number');
        expect(typeof item.subject_type).toBe('number');
        expect(typeof item.staff).toBe('string');
      }
    });

    it('传入 character_id=0 返回 400', async () => {
      const result = await bgm.characters.getRelatedPersonsByCharacterId(0);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(400);
    });

    it('传入不存在的 character_id 返回 404', async () => {
      const result = await bgm.characters.getRelatedPersonsByCharacterId(99999999);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('collectCharacter() — 收藏角色', () => {
    const token = process.env['BGM_TOKEN'];
    const hasToken = (token?.trim().length ?? 0) > 0;
    // eslint-disable-next-line prefer-const
    let bgmAuth!: ReturnType<typeof createBangumiClient>;

    beforeAll(() => {
      if (token) {
        bgmAuth = createBangumiClient({ token });
      }
    });

    it('未登录时返回 401', async () => {
      const result = await bgm.characters.collectCharacter(1);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(401);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 成功收藏返回 2xx', async () => {
      const result = await bgmAuth.characters.collectCharacter(1);

      expect(result.error).toBeUndefined();
      expect(result.response.status).toBeGreaterThanOrEqual(200);
      expect(result.response.status).toBeLessThan(300);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 传入 character_id=0 返回 400', async () => {
      const result = await bgmAuth.characters.collectCharacter(0);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(400);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 传入不存在的 character_id 返回 404', async () => {
      const result = await bgmAuth.characters.collectCharacter(99999999);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('uncollectCharacter() — 取消收藏角色', () => {
    // NOTE: Bangumi DELETE /v0/characters/{id}/collect 端点对所有请求（含认证）均返回 404，
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
      const result = await bgm.characters.uncollectCharacter(1);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBeGreaterThanOrEqual(400);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 认证后请求当前返回 404（端点未实现）', async () => {
      await bgmAuth.characters.collectCharacter(1);
      const result = await bgmAuth.characters.uncollectCharacter(1);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 传入 character_id=0 返回 4xx', async () => {
      const result = await bgmAuth.characters.uncollectCharacter(0);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBeGreaterThanOrEqual(400);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 传入不存在的 character_id 返回 404', async () => {
      const result = await bgmAuth.characters.uncollectCharacter(99999999);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });
});