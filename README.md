# bangumi-api-client

基于 [Bangumi API v0](https://github.com/bangumi/api) 的 TypeScript 封装库，提供类型安全的高层调用接口。覆盖全部 56 个接口，包含条目、章节、角色、人物、用户、收藏、编辑历史和目录八大资源模块。

## 特性

- **双层架构** — 底层由 `@hey-api/openapi-ts` 从官方 OpenAPI YAML 自动生成，顶层提供面向对象的高层封装
- **完整类型支持** — 所有请求参数与响应数据均有完整 TypeScript 类型，方法返回值统一为 `Promise<ClientResult<T>>`，开箱即用
- **ESM 优先** — 使用 `"type": "module"`，支持 Tree-shaking
- **认证支持** — 可选传入 Access Token，自动附加 `Authorization: Bearer` 头
- **User-Agent 合规** — 按 Bangumi API 要求自动设置 `User-Agent` 请求头
- **按资源分类** — `SubjectAPI` / `EpisodeAPI` / `CharacterAPI` / `PersonAPI` / `UserAPI` / `CollectionAPI` / `RevisionAPI` / `IndexAPI`

## 目录结构

```text
.
├── .editorconfig                          # 编辑器通用格式规范（缩进/换行/编码）
├── .env.example                           # 环境变量模板（GH_TOKEN / BGM_TOKEN）
├── .gitignore                             # Git 忽略规则
├── .github/                               # GitHub 仓库配置与文档
│   ├── dependabot.yml                     # Dependabot 自动依赖更新配置
│   ├── docs/                              # 项目文档
│   │   ├── api/                           # API 使用文档（各模块方法说明与示例）
│   │   │   ├── 01-subjects.md             # SubjectAPI — 条目（8 个接口）
│   │   │   ├── 02-episodes.md             # EpisodeAPI — 章节（2 个接口）
│   │   │   ├── 03-characters.md           # CharacterAPI — 角色（7 个接口）
│   │   │   ├── 04-persons.md              # PersonAPI — 人物（7 个接口）
│   │   │   ├── 05-users.md                # UserAPI — 用户（3 个接口）
│   │   │   ├── 06-collections.md          # CollectionAPI — 收藏（12 个接口）
│   │   │   ├── 07-revisions.md            # RevisionAPI — 编辑历史（8 个接口）
│   │   │   └── 08-indices.md              # IndexAPI — 目录（9 个接口）
│   │   ├── ci/                            # CI 文档
│   │   │   └── ci-checks.md               # CI 检查规则说明
│   │   ├── hooks/                         # Git Hook 文档
│   │   │   └── git-guard.md               # git-guard PreToolUse hook 说明
│   │   ├── mcp/                           # MCP 工具文档
│   │   │   └── github-tools.md            # GitHub MCP Server 工具清单（26 个工具）
│   │   └── settings/                      # 仓库 Settings 配置操作记录
│   ├── hooks/                             # Git Hook 脚本
│   │   ├── git-guard.json                 # Claude Code PreToolUse hook 注册配置
│   │   └── scripts/                       # Hook 脚本目录
│   │       └── git-guard.sh               # git/gh 危险写操作拦截脚本
│   ├── instructions/                      # GitHub Copilot 指令文件
│   │   └── git-workflow.instructions.md   # AI git 操作行为规范（授权要求/分支/提交/PR）
│   ├── ISSUE_TEMPLATE/                    # Issue 模板
│   │   ├── bug_report_en.md               # Bug 报告模板（英文）
│   │   ├── bug_report_zh.md               # Bug 报告模板（中文）
│   │   ├── config.yml                     # Issue 模板配置（禁用空白 Issue）
│   │   ├── feature_request_en.md          # 功能请求模板（英文）
│   │   └── feature_request_zh.md          # 功能请求模板（中文）
│   ├── PULL_REQUEST_TEMPLATE.md           # PR 描述模板
│   └── workflows/                         # GitHub Actions 工作流
│       └── lint.yml                       # CI Lint 工作流
├── .vscode/                               # VS Code 工作区配置
│   ├── mcp.json                           # MCP Server 配置（GitHub MCP）
│   └── settings.json                      # 工作区设置（工具审批策略 / cSpell 词典）
├── .lintrc/                               # 各工具 Lint 配置
│   ├── docs/                              # 文档相关
│   │   └── markdown/                      # Markdown 相关
│   │       └── .markdownlint.json         # Markdown lint 规则
│   ├── frontend/                          # 前端/TypeScript 相关
│   │   ├── knip.json                      # Knip 未使用导出检查配置
│   │   ├── prettier/                      # Prettier 配置
│   │   │   └── .prettierrc                # Prettier 格式化配置
│   │   └── typescript/                    # TypeScript 相关
│   │       ├── .eslintrc-ts.json          # ESLint TypeScript 规则
│   │       └── tsconfig-lint.json         # ESLint 专用 tsconfig
│   ├── general/                           # 通用规范
│   │   ├── .ls-lint.yml                   # 文件命名规范检查
│   │   ├── .yamllint.yml                  # YAML lint 规则
│   │   └── cspell.json                    # 拼写检查词典配置
│   ├── git/                               # Git 提交规范
│   │   └── .commitlintrc.cjs              # Commit message 规范
│   └── security/                          # 安全扫描
│       └── .gitleaks.toml                 # 密钥泄露扫描规则
├── scripts/                               # 构建辅助脚本
│   └── generate-version.js                # 从 package.json 读取版本号并写入 src/version.ts
├── src/                                   # 源代码
│   ├── api/                               # 高层手写封装（Layer 2）
│   │   ├── 01-subjects.ts                 # SubjectAPI — 条目（8 个接口）
│   │   ├── 02-episodes.ts                 # EpisodeAPI — 章节（2 个接口）
│   │   ├── 03-characters.ts               # CharacterAPI — 角色（7 个接口）
│   │   ├── 04-persons.ts                  # PersonAPI — 人物（7 个接口）
│   │   ├── 05-users.ts                    # UserAPI — 用户（3 个接口）
│   │   ├── 06-collections.ts              # CollectionAPI — 收藏（12 个接口）
│   │   ├── 07-revisions.ts                # RevisionAPI — 编辑历史（8 个接口）
│   │   └── 08-indices.ts                  # IndexAPI — 目录（9 个接口）
│   ├── generated/                         # 自动生成代码，勿手动修改（`yarn generate` 产物）
│   │   ├── client/                        # 生成的 HTTP 客户端实现
│   │   │   ├── client.gen.ts              # createClient() 实现（fetch 封装、拦截器、请求生命周期）
│   │   │   ├── index.ts                   # client 层统一导出
│   │   │   ├── types.gen.ts               # Client/Config/Options 等客户端类型定义
│   │   │   └── utils.gen.ts               # URL 构建、Header 合并、配置合并等工具函数
│   │   ├── core/                          # 生成的核心工具（auth/序列化/SSE 等）
│   │   │   ├── auth.gen.ts                # Bearer/Basic 认证参数处理
│   │   │   ├── bodySerializer.gen.ts      # JSON/FormData/URLSearchParams 请求体序列化
│   │   │   ├── params.gen.ts              # 请求参数构建工具
│   │   │   ├── pathSerializer.gen.ts      # URL 路径参数序列化
│   │   │   ├── queryKeySerializer.gen.ts  # Query Key 序列化（供 React Query 等使用）
│   │   │   ├── serverSentEvents.gen.ts    # SSE（Server-Sent Events）客户端实现
│   │   │   ├── types.gen.ts               # 核心共享类型（HttpMethod/Config 等）
│   │   │   └── utils.gen.ts               # 请求体校验等通用工具
│   │   ├── client.gen.ts                  # 预配置的默认客户端实例（baseUrl 已设置）
│   │   ├── index.ts                       # 生成层统一导出
│   │   ├── sdk.gen.ts                     # 所有 API 函数（按 operationId 组织，60+ 个函数）
│   │   └── types.gen.ts                   # 所有请求/响应类型定义（Subject/Episode/Character 等）
│   ├── client.ts                          # createBangumiClient() 工厂函数、ClientResult<T> 接口定义
│   └── index.ts                           # 库公共 API 入口
├── tests/                                 # 测试
│   ├── integration/                       # 集成测试（需联网访问 api.bgm.tv）
│   │   ├── 01-subjects.test.ts            # SubjectAPI 集成测试（8 个接口）
│   │   ├── 02-episodes.test.ts            # EpisodeAPI 集成测试（2 个接口）
│   │   ├── 03-characters.test.ts          # CharacterAPI 集成测试（7 个接口）
│   │   ├── 04-persons.test.ts             # PersonAPI 集成测试（7 个接口）
│   │   ├── 05-users.test.ts               # UserAPI 集成测试（3 个接口）
│   │   ├── 06-collections.test.ts         # CollectionAPI 集成测试（12 个接口）
│   │   ├── 07-revisions.test.ts           # RevisionAPI 集成测试（8 个接口）
│   │   └── 08-indices.test.ts             # IndexAPI 集成测试（9 个接口）
│   └── tsconfig.json                      # 测试专用 TypeScript 配置
├── CODE_OF_CONDUCT.md                     # 行为准则
├── CONTRIBUTING.md                        # 贡献指南
├── LICENSE                                # GPL-3.0 许可证
├── openapi-ts.config.ts                   # @hey-api/openapi-ts 代码生成配置
├── package.json                           # 包定义、scripts、依赖声明
├── README.md                              # 本文件
├── SECURITY.md                            # 安全漏洞披露政策
├── tsconfig.json                          # TypeScript 编译配置（ESM/NodeNext/ES2022）
├── vitest.config.ts                       # Vitest 测试配置
└── yarn.lock                              # 依赖版本锁定文件
```

> `generated/` 下所有文件由 `yarn generate` 自动生成，不要手动修改。

## 本地配置

1. 复制 Token 模板文件：

   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env`，填入对应 Token：

   ```ini
   # GitHub CLI 操作（PR / Issue / Release 等）
   GH_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

   # Bangumi 认证接口集成测试（收藏/取消收藏等需要登录的接口）
   BGM_TOKEN=your_bangumi_personal_access_token_here
   ```

   > - `GH_TOKEN`：GitHub → Settings → Developer settings → Personal access tokens
   > - `BGM_TOKEN`：[next.bgm.tv/demo/access-token](https://next.bgm.tv/demo/access-token)

3. 加载环境变量（每次新开终端执行一次）：

   ```bash
   export $(grep -E "^(GH_TOKEN|BGM_TOKEN)=" .env | xargs)
   ```

4. 验证配置：

   ```bash
   gh auth status
   ```

## 开发工作流

### 初次克隆后

```bash
# 安装所有依赖
yarn install
```

之后直接运行任意命令即可，底层代码会在需要时**自动生成**（见下文说明）。

---

### 日常开发

`build` / `typecheck` / `test` 均配置了 `pre*` 钩子，执行前会自动调用 `yarn generate` 重新生成 `src/generated/`，无需手动触发：

```bash
yarn build        # 生成 → 编译 TypeScript 到 dist/
yarn typecheck    # 生成 → 仅类型检查，不输出产物
yarn test         # 生成 → 运行集成测试（需联网访问 api.bgm.tv）
```

> 认证相关测试须在 `.env` 中配置 `BGM_TOKEN`。

如果只想单独刷新生成代码（例如官方 OpenAPI YAML 有更新）：

```bash
yarn generate
```

> `src/generated/` 下所有文件均为自动生成产物，不要手动修改，每次执行后会被完全覆盖。

---

### 发布新版本

```bash
# 1. 更新 package.json 中的 version 字段
# 2. 生成 + 构建（prepare 脚本自动完成两步）
yarn prepare

# 3. 发布到 npm
npm publish
```

## API 使用文档

各模块的详细说明和示例代码已独立维护，请点击对应链接查阅：

| 模块 | 接口数 | 文档 |
| --- | --- | --- |
| SubjectAPI — 条目 | 8 | [01-subjects.md](.github/docs/api/01-subjects.md) |
| EpisodeAPI — 章节 | 2 | [02-episodes.md](.github/docs/api/02-episodes.md) |
| CharacterAPI — 角色 | 7 | [03-characters.md](.github/docs/api/03-characters.md) |
| PersonAPI — 人物 | 7 | [04-persons.md](.github/docs/api/04-persons.md) |
| UserAPI — 用户 | 3 | [05-users.md](.github/docs/api/05-users.md) |
| CollectionAPI — 收藏 | 12 | [06-collections.md](.github/docs/api/06-collections.md) |
| RevisionAPI — 编辑历史 | 8 | [07-revisions.md](.github/docs/api/07-revisions.md) |
| IndexAPI — 目录 | 9 | [08-indices.md](.github/docs/api/08-indices.md) |

## CI 检查说明

> 详细的 CI 检查规则文档已独立维护，请参阅 [ci-checks.md](.github/docs/ci/ci-checks.md)。

## AI Agent 开发说明

本项目主要通过 AI Agent（GitHub Copilot / Claude）进行日常开发和维护工作。

在每次会话开始时，请发送以下提示词，让 AI 优先读取项目规范后再开始工作：

> 开始工作前，先读取 `.github/instructions/` 目录下所有 `.instructions.md` 文件，完全理解其中的规则后再响应。

目前包含的指令文件：

| 文件 | 说明 |
| --- | --- |
| [git-workflow.instructions.md](.github/instructions/git-workflow.instructions.md) | AI git 操作行为规范（授权要求、分支命名、提交规范、PR 工作流） |

## 相关链接

### 本项目

- [bangumi-api-client](https://github.com/VaillerTeeter/bangumi-api-client) — 本仓库
- [模板仓库 0-Example](https://github.com/VaillerTeeter/0-Example) — CI 配置、lint 规则、Issue/PR 模板、行为准则等通用配置均继承自此仓库

### Bangumi

- [Bangumi 番组计划](https://bgm.tv) — 目标 API 所属平台
- [bangumi/api](https://github.com/bangumi/api) — Bangumi 官方 API 仓库
- [OpenAPI v0.yaml](https://github.com/bangumi/api/blob/master/open-api/v0.yaml) — 本库底层代码生成所用的 OpenAPI 规范文件
- [Bangumi API 文档](https://bangumi.github.io/api/) — 在线 API 文档（Swagger UI）
- [Bangumi Personal Access Token](https://next.bgm.tv/demo/access-token) — 创建用于认证接口测试的 Access Token（`BGM_TOKEN`）

### 依赖

- [@hey-api/openapi-ts](https://github.com/hey-api/openapi-ts) — OpenAPI → TypeScript 代码生成器（开发依赖）
- [@hey-api/client-fetch](https://github.com/hey-api/openapi-ts/tree/main/packages/client-fetch) — 生成代码使用的 Fetch HTTP 客户端（运行时依赖）

### 作者

- [GitHub Profile](https://github.com/VaillerTeeter)
