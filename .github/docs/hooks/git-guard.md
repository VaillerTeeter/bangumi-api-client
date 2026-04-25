# git-guard Hook

`PreToolUse` 生命周期钩子，在 AI Agent 执行终端命令前拦截危险的 `git` / `gh` 写操作，弹出用户确认。

## 文件结构

```text
.github/hooks/
├── git-guard.json          # Hook 注册配置
└── scripts/
    └── git-guard.sh        # 拦截逻辑脚本
```

## 工作原理

```text
AI 发起工具调用
        │
        ▼
  git-guard.sh 读取 stdin JSON
        │
   ┌────┴────────────────────────────────────┐
   │                                         │
toolName ==                      toolName 匹配
run_in_terminal?                 mcp_github_* 写操作?
   │                                         │
   ├── 否 → exit 0（放行）       ├── 否 → exit 0（放行）
   └── 是 → 正则匹配 command     └── 是 → 提取参数摘要
              │                               │
        命中拦截规则?                          │
              ├── 否 → exit 0（放行）          │
              └── 是 ──────────────────────►──┘
                            │
                返回 permissionDecision: "ask"
                （Copilot 弹出用户确认框）
```

Hook 返回 `ask` 时，Copilot 会暂停执行并弹窗，由用户决定是否放行。用户拒绝后 AI 不会重试。

## 拦截规则

### git 写操作 / 历史变更

| 命令 | 说明 |
| --- | --- |
| `git add` | 暂存文件变更 |
| `git commit` | 提交变更 |
| `git push` | 推送到远程 |
| `git reset` | 重置 HEAD / 工作区 |
| `git restore` | 还原工作区文件 |
| `git rm` | 从索引删除文件 |
| `git merge` | 合并分支 |
| `git rebase` | 变基 |
| `git cherry-pick` | 移植 commit |
| `git tag <name>` | 创建标签（轻量标签） |
| `git tag -a/-s/-f` | 创建附注 / 签名 / 强制覆盖标签 |
| `git tag -d` | 删除标签 |

### git 分支删除

| 命令 | 说明 |
| --- | --- |
| `git branch -d` | 删除已合并分支 |
| `git branch -D` | 强制删除分支 |
| `git branch --delete` | 同 `-d` |

### git stash 销毁

| 命令 | 说明 |
| --- | --- |
| `git stash drop` | 删除指定 stash |
| `git stash pop` | 弹出并删除 stash |
| `git stash clear` | 清空所有 stash |

### gh CLI 操作

| 命令 | 说明 |
| --- | --- |
| `gh pr create` | 创建 Pull Request |
| `gh pr merge` | 合并 Pull Request |
| `gh pr close` | 关闭 Pull Request |
| `gh pr edit` | 修改 Pull Request 信息 |
| `gh release create` | 创建发布版本 |
| `gh repo delete` | 删除仓库 |
| `gh issue close` | 关闭 Issue |
| `gh issue delete` | 删除 Issue |

### GitHub MCP 写操作

| 工具 | 说明 |
| --- | --- |
| `mcp_github_create_pull_request` | 创建 PR |
| `mcp_github_merge_pull_request` | 合并 PR |
| `mcp_github_push_files` | 推送多个文件 |
| `mcp_github_create_or_update_file` | 创建 / 更新单个文件 |
| `mcp_github_create_branch` | 创建分支 |
| `mcp_github_create_repository` | 创建仓库 |
| `mcp_github_fork_repository` | Fork 仓库 |
| `mcp_github_update_pull_request_branch` | 更新 PR 分支 |
| `mcp_github_create_pull_request_review` | 提交 PR Review |
| `mcp_github_add_issue_comment` | 添加 Issue 评论 |
| `mcp_github_update_issue` | 更新 Issue |
| `mcp_github_create_issue` | 创建 Issue |

拦截时展示关键参数摘要（`title`、`branch`、`pull_number` 等）方便用户判断。

### 放行（不拦截）

只读操作直接通过，包括但不限于：

```text
git status / log / diff / show / fetch / clone
git branch / git branch -v/-a/-r（无 -d/-D）
git tag / git tag -l（仅列出）
git stash list / git stash show
gh pr list / gh pr view / gh pr status
gh issue list / gh issue view
gh repo view / gh run list / gh workflow list
mcp_github_get_* / mcp_github_list_* / mcp_github_search_*
```

## 测试方法

在项目根目录执行：

```bash
# 应被拦截（输出 JSON 且 permissionDecision == "ask"）
echo '{"toolName":"run_in_terminal","toolInput":{"command":"git add ."}}' \
  | bash .github/hooks/scripts/git-guard.sh

echo '{"toolName":"run_in_terminal","toolInput":{"command":"gh pr merge 42 --squash"}}' \
  | bash .github/hooks/scripts/git-guard.sh

# 应直接放行（无输出，exit 0）
echo '{"toolName":"run_in_terminal","toolInput":{"command":"git log --oneline"}}' \
  | bash .github/hooks/scripts/git-guard.sh && echo "PASS"

echo '{"toolName":"run_in_terminal","toolInput":{"command":"npm install"}}' \
  | bash .github/hooks/scripts/git-guard.sh && echo "PASS"
```

## 维护说明

- 新增拦截规则：在 `git-guard.sh` 中追加 `elif` 分支，遵循现有正则格式
- 修改超时：调整 `git-guard.json` 中的 `timeout`（单位：秒，当前 5s）
- 此 Hook 对全体团队成员生效（配置存于 `.github/hooks/`，随仓库提交）
