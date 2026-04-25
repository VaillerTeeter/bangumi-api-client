#!/usr/bin/env bash
# git-guard.sh — PreToolUse hook
# 拦截 AI 未经授权执行的 git 写操作
# 触发时向用户弹出确认，而非静默执行

set -euo pipefail

INPUT=$(cat)

# 提取 toolName 和 command（兼容解析失败的情况）
TOOL_NAME=$(printf '%s' "$INPUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('toolName', ''))
except Exception:
    print('')
" 2>/dev/null || echo "")

COMMAND=$(printf '%s' "$INPUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('toolInput', {}).get('command', ''))
except Exception:
    print('')
" 2>/dev/null || echo "")

# ── 分支 1：run_in_terminal（git / gh CLI）────────────────────────────────────
if [ "$TOOL_NAME" = "run_in_terminal" ]; then

  # 匹配危险的 git 写操作
  # 覆盖：add / commit / push / reset / restore / rm / merge / rebase / cherry-pick / branch -d / tag / stash drop|pop
  if echo "$COMMAND" | grep -qiE '^\s*git\s+(add|commit|push|reset|restore|rm|merge|rebase|cherry-pick)\b'; then
    REASON="git 写操作 / 历史变更操作"
  elif echo "$COMMAND" | grep -qiE '^\s*git\s+tag\s+(-[adsfADSF]|[a-zA-Z0-9])'; then
    REASON="git tag 写操作（创建/删除标签）"
  elif echo "$COMMAND" | grep -qiE '^\s*git\s+branch\s+(-d|-D|--delete)\b'; then
    REASON="git 删除分支"
  elif echo "$COMMAND" | grep -qiE '^\s*git\s+stash\s+(drop|pop|clear)\b'; then
    REASON="git stash 销毁操作"
  # 匹配危险的 gh CLI 操作
  # 覆盖：pr create/merge/close、release create、repo delete、issue close
  elif echo "$COMMAND" | grep -qiE '^\s*gh\s+pr\s+(create|merge|close|edit)\b'; then
    REASON="gh PR 操作（create/merge/close/edit）"
  elif echo "$COMMAND" | grep -qiE '^\s*gh\s+release\s+create\b'; then
    REASON="gh release create（创建发布版本）"
  elif echo "$COMMAND" | grep -qiE '^\s*gh\s+repo\s+delete\b'; then
    REASON="gh repo delete（删除仓库）"
  elif echo "$COMMAND" | grep -qiE '^\s*gh\s+issue\s+(close|delete)\b'; then
    REASON="gh issue close/delete"
  else
    exit 0
  fi

# ── 分支 2：GitHub MCP 写操作 ──────────────────────────────────────────────────
elif echo "$TOOL_NAME" | grep -qiE '^mcp_github_(create_pull_request|merge_pull_request|push_files|create_or_update_file|create_branch|create_repository|fork_repository|update_pull_request_branch|create_pull_request_review|add_issue_comment|update_issue|create_issue)$'; then

  # 提取关键参数作为摘要展示
  COMMAND=$(printf '%s' "$INPUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    ti = d.get('toolInput', {})
    keys = ['title', 'path', 'branch', 'base', 'head', 'pull_number', 'issue_number', 'owner', 'repo']
    parts = [f'{k}={str(ti[k])[:60]}' for k in keys if k in ti]
    print(', '.join(parts) if parts else '(无参数摘要)')
except Exception:
    print('(解析失败)')
" 2>/dev/null || echo "(解析失败)")

  REASON="GitHub MCP 写操作: $TOOL_NAME"

else
  exit 0
fi

REASON="$REASON" COMMAND="$COMMAND" python3 -c "
import json, os
reason = os.environ.get('REASON', '')
command = os.environ.get('COMMAND', '')
output = {
    'hookSpecificOutput': {
        'hookEventName': 'PreToolUse',
        'permissionDecision': 'ask',
        'permissionDecisionReason': (
            '⛔ 检测到需要用户明确授权的操作\n'
            '类型: ' + reason + '\n'
            '命令: ' + command + '\n\n'
            '根据项目规范，AI 不得自行发起此类操作。\n'
            '请确认：你是否已明确指示执行此命令？'
        )
    }
}
print(json.dumps(output))
"
exit 0
