---
name: resume
description: Resume from pending tasks
icon: play
category: workflow
---

# /resume

Resume work from where you left off - checks for pending tasks.

## What it does:
1. Checks all projects for pending/incomplete tasks
2. Shows tasks in progress
3. Shows tasks waiting for review
4. Suggests next steps to continue

## Usage:

```
/resume
```

## Output example:
```
📊 Project: backend-api
  Total tasks: 12
  ✓ Completed: 8
  ⏳ Pending: 4
  
In Progress (2 tasks):
  • Implement payment gateway
  • Add error handling

Waiting for Review (2 tasks):
  • [code-reviewer] Missing test coverage
  • [security-reviewer] Input validation needed

Next steps:
→ Continue with 2 in-progress tasks
→ Address 2 tasks waiting for review
```

## When to use:
- On Claude Code startup (auto-triggered)
- When resuming after switching projects
- To see what's blocking progress

## If issues found:
Issues from code review, security review, and QA testing are automatically added as new tasks.

Just continue working and fixing them!

See [CLAUDE_CODE_PLUGIN.md](../CLAUDE_CODE_PLUGIN.md) for workflow automation.
