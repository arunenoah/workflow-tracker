---
name: project-list
description: List all projects
icon: folder
category: workflow
---

# /project-list

Show all projects with their task counts and status.

## What happens:
1. Displays a table of all projects
2. Shows: Project Name, Task Count, Status, Manager
3. Click a project to switch to it
4. See task breakdown by stage

## Information shown:
- **Name** - Project title
- **Tasks** - Total tasks in project
- **InQueue** - Tasks waiting to start
- **InProgress** - Currently being worked on
- **Under Review** - In code/security/QA review
- **Completed** - Done tasks
- **Manager** - Who's leading the project

## Status indicators:
- 🟢 **Active** - Has tasks in progress
- 🟡 **Planning** - Only backlog tasks
- 🔵 **On Hold** - No active work
- ✅ **Complete** - All tasks done

## Quick actions:
- Click project name to switch to it
- View task breakdown
- See recent activity
- Manage team members

## Examples:

```
Projects shown:
├─ Backend API v2 (8 tasks, 3 in progress)
├─ Mobile App (12 tasks, 4 in progress)
├─ Documentation (5 tasks, 1 in progress)
└─ DevOps Infrastructure (3 tasks, 2 in progress)
```

## Tips:
- Switch projects to focus on specific work
- Monitor task flow across all projects
- Identify bottlenecks (too many in review?)
- Track team workload

See [INTEGRATION_GUIDE.md](../INTEGRATION_GUIDE.md) for managing multiple projects.
