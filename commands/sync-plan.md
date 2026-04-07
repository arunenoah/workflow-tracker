---
name: sync-plan
description: Sync plan to Workflow-Tracker (create project and tasks)
icon: link
category: workflow
---

# /sync-plan

Sync your plan to Workflow-Tracker by creating a project and adding tasks.

## What it does:
1. Reads the plan from `.claude/plans/`
2. Extracts project name and all tasks
3. Creates project in Workflow-Tracker (if it doesn't exist)
4. Adds all tasks from the plan to the project
5. Sets up workflow stages for code review → QA → completion

## Usage:

After running `/plan`, use:
```
/sync-plan
```

This will:
- ✅ Create project (named from plan)
- ✅ Create tasks for each step
- ✅ Ready for code review, QA testing
- ✅ Track all work in one place

## Auto-Sync (Recommended):
Set `autoSyncPlan: true` in plugin.json to automatically sync after plan mode completes.

## Example output:
```
✓ Created project: "Q2 Feature Development"
✓ Added 12 tasks from plan
✓ Ready to track implementation
✓ Review tasks at: /dashboard
```

## Next steps:
1. View tasks: `/dashboard` or `/task-list`
2. During implementation, issues from code review will auto-create tasks
3. When done, use `/mark-done` to mark completion

See [CLAUDE_CODE_PLUGIN.md](../CLAUDE_CODE_PLUGIN.md) for more.
