---
name: task-list
description: List all tasks in current project
icon: list
category: workflow
---

# /task-list

Show all tasks in the current project with their status.

## What happens:
1. Shows a table of all tasks in the selected project
2. Displays: Title, Priority, Stage, Assigned To, Due Date
3. Can filter by stage, priority, or status
4. Click any task to see full details

## Display options:
- **All tasks** - Everything in the project
- **By stage** - Group by workflow stage
- **By priority** - Sort by urgency (CRITICAL first)
- **By assignee** - Who's working on what
- **Overdue** - Tasks past their due date

## Filters:
```
/task-list --stage=InProgress
/task-list --priority=CRITICAL
/task-list --assigned=john@example.com
/task-list --status=overdue
```

## Task statuses:
- 🔴 **CRITICAL** - Highest priority, urgent
- 🟠 **HIGH** - Important, next in queue
- 🟡 **MEDIUM** - Normal priority
- 🔵 **LOW** - Backlog priority

## Stages:
- **InQueue** - Not started yet
- **InProgress** - Currently being worked on
- **Code-Review** - Waiting for review
- **Security-Review** - Security validation
- **QA-Testing** - Testing phase
- **Completed** - Done

See [USER_GUIDE.md](../USER_GUIDE.md) for task management.
