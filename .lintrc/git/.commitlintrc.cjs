// @ts-check
/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: 'conventional-changelog-conventionalcommits',
  formatter: '@commitlint/format',

  // Ignore commits whose message starts with a UTF-8 BOM (\uFEFF).
  // Such commits may have been created using Windows tools that write
  // BOM-prefixed files, causing the header to fail header-trim validation.
  ignores: [(/** @type {string} */ commit) => /^\uFEFF/.test(commit)],

  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
        'security',
        'deps',
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    'scope-case': [2, 'always', 'lower-case'],
    'scope-empty': [0],

    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-min-length': [2, 'always', 10],
    'subject-max-length': [2, 'always', 100],

    'header-max-length': [2, 'always', 100],
    'header-min-length': [2, 'always', 15],

    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [2, 'always', 200],

    'footer-leading-blank': [2, 'always'],
    'footer-max-line-length': [2, 'always', 100],

    'references-empty': [0],
  },
};
