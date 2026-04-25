# CI 检查说明

所有 Pull Request 合并到 `master` 前，必须通过以下自动检查（定义于 [.github/workflows/lint.yml](../../workflows/lint.yml)）。

## 触发时机

- **PR 创建 / 更新**：目标分支为 `master` 时自动触发
- **直接 push 到 master**：同样触发检查

---

## Markdown Lint

**工具**：[markdownlint-cli2-action@v19](https://github.com/DavidAnson/markdownlint-cli2-action)  
**配置**：[.lintrc/docs/markdown/.markdownlint.json](../../../.lintrc/docs/markdown/.markdownlint.json)  
**扫描范围**：`**/*.md`

| 规则 | 状态 | 说明 |
| --- | --- | --- |
| 默认全部规则 | ✅ 启用 | 标题格式、列表缩进、空行等 |
| MD013 行长度 | ⚙️ 放宽 | 最长 400 字符，表格和代码块不限 |
| MD033 内联 HTML | ⚙️ 部分允许 | 仅允许 `<!--` 注释标签 |
| MD041 首行必须是 H1 | ❌ 关闭 | 允许文件不以 H1 开头 |

---

## YAML Lint

**工具**：[yamllint](https://yamllint.readthedocs.io/) 1.35.1  
**配置**：[.lintrc/general/.yamllint.yml](../../../.lintrc/general/.yamllint.yml)  
**扫描范围**：所有 `*.yml` / `*.yaml`，排除 `node_modules`、`vendor`、`dist`

| 规则 | 配置 | 说明 |
| --- | --- | --- |
| 基础规则 | `extends: default` | yamllint 默认规则集 |
| 行长度 | 最长 200 字符 | 放宽默认 80 字符限制（CI workflow 中 run 块较长） |
| 布尔值写法 | `true` / `false` / `on` | 允许 `on` 用于 GitHub Actions 触发器 |
| 注释间距 | 最少 1 个空格 | 允许紧贴内容后添加注释 |

---

## TypeScript Lint

**工具**：ESLint 8 + Prettier 3 + tsc（`yarn typecheck`）  
**配置**：

- ESLint：[.lintrc/frontend/typescript/.eslintrc-ts.json](../../../.lintrc/frontend/typescript/.eslintrc-ts.json)
- Prettier：[.lintrc/frontend/prettier/.prettierrc](../../../.lintrc/frontend/prettier/.prettierrc)
- tsc：[tsconfig.json](../../../tsconfig.json)（lint 专用：[.lintrc/frontend/typescript/tsconfig-lint.json](../../../.lintrc/frontend/typescript/tsconfig-lint.json)）

**扫描范围**：`src/index.ts`、`src/client.ts`、`src/**/*.ts`（排除 `src/client/**` 自动生成文件）

### ESLint 插件

| 插件 | 说明 |
| --- | --- |
| `@typescript-eslint/strict-type-checked` | TypeScript 严格类型规则（需类型信息） |
| `@typescript-eslint/stylistic-type-checked` | TypeScript 风格规则 |
| `eslint-plugin-import` | 模块导入顺序、循环依赖检测 |
| `eslint-plugin-unicorn` | 现代 JS/TS 最佳实践 |
| `eslint-plugin-sonarjs` | SonarQube 代码质量规则 |
| `eslint-plugin-security` | 安全漏洞检测 |
| `eslint-plugin-promise` | Promise 使用规范 |
| `eslint-plugin-n` | Node.js 专属规则 |
| `eslint-plugin-jsdoc` | JSDoc 注释规范 |

### 关键规则

| 规则 | 配置 | 说明 |
| --- | --- | --- |
| `no-explicit-any` | error | 禁止使用 `any` 类型 |
| `explicit-function-return-type` | error | 函数必须声明返回类型 |
| `no-floating-promises` | error | Promise 必须处理或 await |
| `strict-boolean-expressions` | error | 禁止隐式布尔转换 |
| `consistent-type-imports` | error | 类型导入必须使用 `import type` |
| `no-unsafe-*` | error | 禁止不安全的类型操作 |
| `max-lines-per-function` | error | 单函数最多 80 行 |
| `max-lines` | error | 单文件最多 500 行 |
| `complexity` | error | 圈复杂度最大 10 |
| `import/no-cycle` | error | 禁止循环依赖 |

---

## Secret Scan

**工具**：[Gitleaks](https://github.com/gitleaks/gitleaks-action) v2  
**配置**：[.lintrc/security/.gitleaks.toml](../../../.lintrc/security/.gitleaks.toml)

- 基于默认规则集（`useDefault = true`）扫描提交历史中的密钥泄漏
- 自定义检测：通用 API Key、通用 Secret 模式
- 白名单：示例凭证（文档用途）、GitHub Actions `${{ secrets.* }}` 引用、锁文件、二进制文件

---

## Commit Message Lint

**工具**：[@commitlint/cli](https://commitlint.js.org/) 19.6.0  
**配置**：[.lintrc/git/.commitlintrc.cjs](../../../.lintrc/git/.commitlintrc.cjs)  
**触发**：仅在 PR 时运行（不检查直接 push 的提交）

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

| 规则 | 配置 | 说明 |
| --- | --- | --- |
| type 枚举 | feat/fix/docs/style/refactor/perf/test/build/ci/chore/revert/security/deps | 必须使用规定类型 |
| subject 长度 | 10–72 字符 | |
| header 长度 | 最长 100 字符 | |
| header 最短 | 15 字符 | 防止过于简短的描述 |
| subject 大小写 | 禁止首字母大写、PascalCase、全大写 | |

---

## Spelling Check

**工具**：[cspell](https://cspell.org/) 8.17.1  
**配置**：[.lintrc/general/cspell.json](../../../.lintrc/general/cspell.json)  
**扫描范围**：全仓库（排除 `node_modules`、`.git`、`dist`、`.lintrc`、`src/client`、锁文件）

- 使用英语词典（`en_US`）+ 软件术语、TypeScript、Node.js、npm 等专业词典
- 自定义词汇：Bangumi 领域词汇（`Bangumi`、`bangumi`、`bgm`、`nsfw`、`infobox`、`uncollect`、`airdate`、`Geass` 等）及项目使用的工具名
- 扫描排除：`.git/**`、`node_modules`、`.git`、`dist`、`.lintrc`、`src/client`、锁文件
- `minWordLength: 4`，不检测 3 字符以下的单词

---

## Dead Code Detection

**工具**：[Knip](https://knip.dev/) 5.38.0  
**配置**：[.lintrc/frontend/knip.json](../../../.lintrc/frontend/knip.json)

- **入口**：`src/index.ts`，从入口追溯可达性
- **扫描范围**：`src/**/*.ts`
- 检测：未使用文件、未使用依赖、未列出依赖、重复导出等
- 库的公开 API（从入口导出）不纳入死代码检测（`includeEntryExports: false`）
- `@types/*` 类型包不检测使用情况（类型包无显式 import）

---

## File Naming Check

**工具**：[ls-lint](https://ls-lint.org/) 2.3.1  
**配置**：[.lintrc/general/.ls-lint.yml](../../../.lintrc/general/.ls-lint.yml)

| 文件类型 | 规则 | 示例 |
| --- | --- | --- |
| `.ts` | `kebab-case` 或 `camelCase` | `api-client.ts`、`apiClient.ts` |
| `.gen.ts` | `kebab-case` 或 `camelCase` | `types.gen.ts` |
| `.test.ts` | `kebab-case` | `subjects.test.ts` |
| `.config.ts` | `kebab-case` | `openapi-ts.config.ts` |
| `.json` | `kebab-case` 或 `camelCase` | `package.json` |
| `.yml` / `.yaml` | `kebab-case` 或全大写 | `lint.yml` |
| `.md` | `SCREAMING_SNAKE_CASE` 或 `kebab-case` 或 `snake_case` | `README.md`、`contributing.md`、`bug_report_en.md` |

`.github/` 目录下 YAML 文件仅允许 `kebab-case`。
