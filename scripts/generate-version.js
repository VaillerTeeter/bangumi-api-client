import { readFileSync, writeFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync('package.json', 'utf-8'));
writeFileSync('src/version.ts', `export const VERSION = '${version}';\n`);
