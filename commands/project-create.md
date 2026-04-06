---
name: project-create
description: Create a new project
icon: folder-plus
category: workflow
---

# /project-create

Create a new project to organize tasks by initiative.

## What happens:
1. Opens a form to enter project details
2. Creates the project with default workflow stages
3. Project appears in the project selector dropdown
4. You can now add tasks to this project

## Fields:
- **Name** (required) - Project title
- **Description** (optional) - What this project is about
- **Manager** (optional) - Who's leading this project

## Default stages created:
1. **InQueue** - Backlog and planning
2. **InProgress** - Active development
3. **Code-Review** - AI code quality analysis
4. **Security-Review** - AI security analysis
5. **QA-Testing** - AI test validation
6. **Completed** - Ready to deploy

## Examples:

```
/project-create
Name: Backend API v2
Description: Complete rewrite of REST API with modern patterns
Manager: john@example.com
```

## Tips:
- One project = one initiative or feature
- You can customize stages per project
- Share projects with your team
- Projects are independent but visible in one dashboard

See [USER_GUIDE.md](../USER_GUIDE.md) for project management.
