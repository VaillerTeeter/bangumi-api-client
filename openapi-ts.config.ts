import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  // Use OPENAPI_SPEC_URL env var to point at a local snapshot for reproducible / offline builds.
  // Falls back to the upstream URL when unset.
  input: process.env.OPENAPI_SPEC_URL ?? 'https://bangumi.github.io/api/dist.json',
  output: 'src/generated',
});
