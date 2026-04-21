export * from './generated/index.js';

import { client } from './generated/client.gen.js';
export { client };

/**
 * Configure the Bangumi API client with an access token.
 *
 * @param accessToken - Bearer token from https://next.bgm.tv/demo/access-token
 * @param userAgent   - Required User-Agent header (see https://github.com/bangumi/api/blob/master/docs-raw/user%20agent.md)
 */
export function configureBangumiClient(accessToken: string, userAgent: string): void {
  client.setConfig({
    baseUrl: 'https://api.bgm.tv',
    // auth callback is only invoked for endpoints that declare a security scheme,
    // so the Bearer token is never sent to unauthenticated endpoints.
    auth: () => accessToken,
    headers: {
      'User-Agent': userAgent,
    },
  });
}
