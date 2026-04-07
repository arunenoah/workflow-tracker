---
name: mark-done
description: Mark project as complete
icon: check-all
category: workflow
---

# /mark-done

Mark all tasks in current project as complete.

## What it does:
1. Gets all tasks in the project
2. Moves incomplete tasks to "Completed" stage
3. Creates completion summary
4. Ready for next project

## Usage:

```
/mark-done
```

## Output:
```
✓ Project "backend-api" marked complete
✓ 12 tasks finished
✓ 2 tasks already completed
✓ Ready for next project
```

## When to use:
- After implementation is fully complete
- Before starting a new project
- To wrap up and document completion

## Next time you resume:
When you open Claude Code next session, just ask:
```
"Resume work" or "Check pending tasks"
```

Workflow-Tracker will:
- Check for pending tasks
- Suggest resuming from in-progress work
- Show any review items waiting for fixes

See [CLAUDE_CODE_PLUGIN.md](../CLAUDE_CODE_PLUGIN.md) for workflow automation.
