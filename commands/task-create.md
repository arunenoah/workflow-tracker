---
name: task-create
description: Create a new task
icon: plus
category: workflow
---

# /task-create

Create a new task in your current project.

## What happens:
1. Opens a form to enter task details
2. Creates the task in Workflow-Tracker
3. Task appears in the "InQueue" stage by default
4. All team members see it instantly (real-time sync)

## Fields:
- **Title** (required) - What needs to be done
- **Description** - Detailed requirements and context
- **Priority** - CRITICAL, HIGH, MEDIUM, or LOW
- **Project** - Which project this task belongs to
- **Assigned To** - Who will work on this (optional)
- **Due Date** - When it should be completed (optional)

## Examples:

```
/task-create
Title: Implement user authentication
Description: Add JWT-based auth with bcrypt password hashing
Priority: HIGH
Project: Backend API
```

## Tips:
- Be detailed in the description - AI agents analyze it
- Higher priority = surfaces first in the board
- CRITICAL tasks auto-approve through review stages
- Descriptions with requirements help agents provide better feedback

See [USER_GUIDE.md](../USER_GUIDE.md) for best practices.
