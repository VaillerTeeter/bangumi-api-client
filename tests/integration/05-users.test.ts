import { describe, it, expect, beforeAll } from 'vitest';
import { createBangumiClient } from '../../src/client.js';

/**
 * 集成测试：发送真实网络请求到 https://api.bgm.tv
 * 运行前确保网络可用
 */
describe('UserAPI 集成测试', () => {
  const bgm = createBangumiClient();

  describe('getUserByName() — 获取用户信息', () => {
    it('返回 HTTP 200 且包含用户基本信息', async () => {
      // username=sai 为文档示例用户，id=1
      const result = await bgm.users.getUserByName('sai');

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data!.id).toBe(1);
      expect(result.data!.username).toBe('sai');
    });

    it('返回用户包含所有必要字段', async () => {
      const result = await bgm.users.getUserByName('sai');

      expect(result.error).toBeUndefined();
      const user = result.data!;
      expect(typeof user.id).toBe('number');
      expect(typeof user.username).toBe('string');
      expect(typeof user.nickname).toBe('string');
      expect(typeof user.user_group).toBe('number');
      expect(typeof user.sign).toBe('string');
      expect(user.avatar).toBeDefined();
      expect(typeof user.avatar.large).toBe('string');
      expect(typeof user.avatar.medium).toBe('string');
      expect(typeof user.avatar.small).toBe('string');
    });

    it('传入过长的 username 返回 400', async () => {
      // 超过限制长度的字符串
      const result = await bgm.users.getUserByName('a'.repeat(256));

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(400);
    });

    it('传入不存在的 username 返回 404', async () => {
      const result = await bgm.users.getUserByName('no_such_user_xyzxyz');

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('getUserAvatarByName() — 获取用户头像', () => {
    it('返回用户头像 URL（fetch 跟随 302 后状态为 200）', async () => {
      const result = await bgm.users.getUserAvatarByName('sai', 'large');

      expect(result.error).toBeUndefined();
      expect(result.imageUrl).toBeDefined();
      expect(typeof result.imageUrl).toBe('string');
      expect(result.imageUrl!.startsWith('http')).toBe(true);
    });

    it('三种尺寸参数均返回有效图片 URL', async () => {
      const types = ['small', 'medium', 'large'] as const;
      for (const type of types) {
        const result = await bgm.users.getUserAvatarByName('sai', type);
        expect(result.error).toBeUndefined();
        expect(result.imageUrl).toBeDefined();
        expect(result.imageUrl!.startsWith('http')).toBe(true);
      }
    });

    it('传入过长的 username 返回 400', async () => {
      const result = await bgm.users.getUserAvatarByName('a'.repeat(256), 'large');

      expect(result.imageUrl).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(400);
    });

    it('传入不存在的 username 返回 404', async () => {
      const result = await bgm.users.getUserAvatarByName('no_such_user_xyzxyz', 'large');

      expect(result.imageUrl).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe('getMyself() — 获取当前登录用户信息', () => {
    const token = process.env['BGM_TOKEN'];
    const hasToken = (token?.trim().length ?? 0) > 0;
    let bgmAuth!: ReturnType<typeof createBangumiClient>;

    beforeAll(() => {
      if (token) {
        bgmAuth = createBangumiClient({ token });
      }
    });

    it('未登录时返回 401', async () => {
      const result = await bgm.users.getMyself();

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(401);
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 返回当前用户信息且包含必要字段', async () => {
      const result = await bgmAuth.users.getMyself();

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      const user = result.data!;
      expect(typeof user.id).toBe('number');
      expect(typeof user.username).toBe('string');
      expect(typeof user.nickname).toBe('string');
      expect(typeof user.user_group).toBe('number');
      expect(user.avatar).toBeDefined();
      expect(typeof user.avatar.large).toBe('string');
      expect(typeof user.avatar.medium).toBe('string');
      expect(typeof user.avatar.small).toBe('string');
    });

    it.skipIf(!hasToken)('[需要 BGM_TOKEN] 返回的额外字段符合预期类型', async () => {
      const result = await bgmAuth.users.getMyself();

      expect(result.error).toBeUndefined();
      const user = result.data!;
      // email 可能为空字符串，但类型应为 string
      if (user.email !== undefined) expect(typeof user.email).toBe('string');
      // reg_time 如果存在，应为 ISO 8601 格式字符串
      if (user.reg_time !== undefined) expect(typeof user.reg_time).toBe('string');
      // time_offset 如果存在，应为 number
      if (user.time_offset !== undefined) expect(typeof user.time_offset).toBe('number');
    });
  });
});