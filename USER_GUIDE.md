# Workflow-Tracker User Guide

Complete guide to using the Workflow-Tracker dashboard to manage tasks, projects, and automated reviews.

---

## Table of Contents

1. [Quick Start (5 minutes)](#quick-start)
2. [Web Dashboard](#web-dashboard)
3. [Managing Projects](#managing-projects)
4. [Managing Tasks](#managing-tasks)
5. [Understanding the Workflow](#understanding-the-workflow)
6. [Agent Reviews](#agent-reviews)
7. [Real-Time Updates](#real-time-updates)

---

## Quick Start

### 1. Start the Server

```bash
cd /path/to/workflow-tracker

npm install  # If dependencies not installed

npm start
```

Expected output:
```
✓ Dashboard server running on http://localhost:3000
✓ WebSocket ready for real-time updates
```

### 2. Open the Dashboard

Navigate to: **http://localhost:3000**

You should see:
- **Top bar:** Project selector, view toggles (Board/List), filters, settings
- **Kanban board:** Columns for each stage (InQueue, InProgress, Under Review, etc.)
- **Task cards:** Color-coded by priority (🔴 Critical, 🟠 High, 🟡 Medium, 🔵 Low)

### 3. Create Your First Project

Click **Settings ⚙️** → **Manage Projects** → **+ New Project**

Fill in:
- **Name:** e.g., "Q2 Feature Development"
- **Description:** e.g., "All features scheduled for Q2 2026"

Click **Create**

### 4. Create Your First Task

Select your project from the dropdown, then click **+ Add Task** in the "InQueue" column

Fill in:
- **Title:** e.g., "Implement user authentication"
- **Description:** e.g., "Add JWT-based auth with refresh tokens"
- **Priority:** Select from dropdown (CRITICAL, HIGH, MEDIUM, LOW)
- **Stage:** InQueue (default)

Click **Create Task**

### 5. View the Board

Your task should appear as a card in the **InQueue** column with a priority badge.

---

## Web Dashboard

### Layout Overview

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 Workflow-Tracker  [Project ▼]  [Board] [List]  [⚙️]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  InQueue (3)    │ InProgress (2)  │ Under Review (1)        │
│  ────────────   │ ──────────────  │ ───────────────         │
│                 │                 │                         │
│  🔴 Auth Task   │ 🟠 API Build    │ 🟡 DB Schema           │
│  High: Ready    │ In: 2 days      │ Review: Pending        │
│  +7d            │ +5d             │                        │
│                 │                 │                        │
│  🟠 API Routes  │ 🔵 Testing      │                        │
│  +2d            │ +1d             │                        │
│                 │                 │                        │
│  + Add Task     │ + Add Task      │ + Add Task             │
│                 │                 │                        │
└─────────────────────────────────────────────────────────────┘
```

### Top Navigation Bar

| Element | Purpose |
|---------|---------|
| **Project Selector** | Switch between projects |
| **Board/List Toggle** | Switch between Kanban and list view |
| **Filters** | Filter by priority, stage, assigned user |
| **⚙️ Settings** | Configure stages, projects, workflow rules |

### Task Cards

Each card displays:
- **Priority Badge:** 🔴 (Critical) 🟠 (High) 🟡 (Medium) 🔵 (Low)
- **Title:** Task name
- **Status Line:** Current stage, due date
- **Action Icons:** Details, edit, delete, approve/reject (if under review)

**Click any card** to open the task detail modal.

---

## Managing Projects

### View All Projects

1. Click **Settings ⚙️**
2. Look for "Projects" section
3. See list of all projects with stats

### Create a New Project

1. Click **Settings ⚙️**
2. Click **+ New Project**
3. Fill in details:
   - **Name** (required)
   - **Description** (optional)
   - **Manager/Owner** (optional)
4. Click **Create**

### Delete a Project

1. Click **Settings ⚙️**
2. Find project in list
3. Click **Delete** button
4. Confirm deletion

---

## Managing Tasks

### Create a Task

**From Board:**
1. Click **+ Add Task** in any column
2. Fill in form fields (see below)
3. Click **Create Task**

**Task Fields:**
- **Title** (required) — What needs to be done
- **Description** — Details, requirements, acceptance criteria
- **Priority** — CRITICAL, HIGH, MEDIUM, LOW
- **Assigned To** — Team member (optional)
- **Due Date** — When it should be done (optional)
- **Stage** — Which column it appears in

### View Task Details

Click any task card to open the detail modal showing:
- Full description
- Priority, due date, assigned person
- Activity log (all changes and reviews)
- Agent analysis (if under review)
- Action buttons

### Edit a Task

1. Click the task card
2. Click **Edit** button in modal
3. Change any fields
4. Click **Save**

### Move a Task to Another Stage

**Method 1 - Drag & Drop:**
1. Click and hold a task card
2. Drag to another column
3. Drop to move

**Method 2 - Context Menu:**
1. Right-click task card
2. Select "Move to Stage"
3. Choose target stage

**Method 3 - Detail Modal:**
1. Click task card
2. In modal, select new stage from dropdown
3. Click **Move Task**

### Delete a Task

1. Click task card
2. Click **Delete** button
3. Confirm deletion

---

## Understanding the Workflow

### Default Workflow Stages

```
InQueue
   ↓
InProgress
   ↓
Code-Review (auto-invokes code-reviewer agent)
   ↓
Security-Review (auto-invokes security-reviewer agent)
   ↓
QA-Testing (auto-invokes qa-tester agent)
   ↓
Completed
```

### Automatic Stage Transitions

When a task is **moved to a review stage**, an AI agent automatically analyzes it:

- **Code-Review:** Checks for testing, code quality, documentation
- **Security-Review:** Checks for SQL injection, XSS, auth issues, exposed secrets
- **QA-Testing:** Checks for test coverage, assertions, edge cases

**Score-based decisions:**
- **Score ≥ Threshold:** Task auto-moves to next stage
- **Score < Threshold:** Task stays in current stage with findings

### Manual Workflow Override

You can manually approve/reject tasks:

1. Click task in review stage
2. See agent findings and score
3. Click **Approve** to move forward
4. Click **Reject** with reason to stop

---

## Agent Reviews

### How Agent Reviews Work

When a task moves to a review stage, an AI agent analyzes the **task description** to find potential issues.

**Example Flow:**

```
You create task:
  Title: "Add user authentication"
  Description: "Use bcrypt, validate email, generate JWT tokens"
  
  ↓
  
Move to "Code-Review" stage
  
  ↓
  
Code-Reviewer Agent analyzes description:
  ✓ Mentions testing approach
  ✓ No hardcoded values
  ✓ Clear requirements
  
  Score: 82/100
  
  ↓
  
Score ≥ Threshold (70)?
  YES → Auto-move to "Security-Review"
  
  ↓
  
Security-Reviewer Agent analyzes:
  ⚠️ Password handling needs validation
  Score: 75/100
  
  ↓
  
Score ≥ Threshold (80)?
  NO → Task stays in Security-Review
  → You see findings and can click "Approve" to override
```

### Viewing Agent Findings

1. Click task being reviewed
2. Scroll to "Agent Analysis" section
3. See:
   - **Score:** Numeric score (0-100)
   - **Findings:** List of issues found
   - **Summary:** Overall assessment

**Example findings:**

```
CODE-REVIEWER
Score: 65/100 ❌ REJECTED

Findings:
  • Missing test coverage (penalty: -20)
  • Hardcoded database port 5432 (penalty: -15)
  • No error handling for network failures (penalty: -10)

Summary: Implementation needs tests and configuration cleanup
```

### Approving Despite Low Score

If you disagree with the agent:

1. Click task card
2. Review the findings
3. Click **Approve** button
4. Optionally add a reason: "Approved - legacy system compatibility"
5. Task moves to next stage

---

## Real-Time Updates

The dashboard updates **live** without refreshing:

- **New tasks** appear instantly in their column
- **Moved tasks** slide to new stage in real-time
- **Deleted tasks** disappear from board
- **Agent scores** update as analysis completes
- **Other users' changes** sync automatically

**WebSocket Connection:**
- Automatically established when page loads
- Auto-reconnects if connection lost (every 3 seconds)
- Status shown in bottom-right corner

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Esc` | Close modal |
| `↑ ↓` | Navigate tasks (in list view) |
| `Enter` | Open selected task |
| `D` | Toggle dark mode (if available) |

---

## Troubleshooting

### "Cannot connect to dashboard"

**Problem:** Port 3000 already in use  
**Solution:** Start with different port:
```bash
npm start -- --port 3001
```

### "WebSocket disconnected"

**Problem:** Server crashed or network issue  
**Solution:** 
- Check server logs
- Refresh browser (automatic reconnect in 3 seconds)
- Restart server: `npm start`

### "Agent analysis not running"

**Problem:** Task not moving to review stage  
**Solution:**
- Check task description has enough detail
- Verify stage is configured to auto-invoke agent
- Check server logs for errors

### "Changes not syncing to other users"

**Problem:** Real-time updates stopped  
**Solution:**
- Refresh browser page
- Check WebSocket connection status
- Restart server

---

## Best Practices

### Writing Good Task Descriptions

✅ **Good:**
```
Implement user authentication with JWT tokens

Requirements:
- Use bcrypt for password hashing (min 10 rounds)
- Generate JWT tokens with 7-day expiry
- Validate email format before signup
- Add rate limiting (5 attempts per minute)
- Include refresh token mechanism

Edge cases:
- Handle expired tokens gracefully
- Prevent token reuse attacks
- Support logout functionality
```

❌ **Poor:**
```
Add login
```

### Organizing Tasks

1. **Break down large features** into smaller tasks
2. **Write clear acceptance criteria** in description
3. **Set realistic due dates** with buffer
4. **Assign to team members** for ownership
5. **Review findings** before moving to next stage

### Workflow Strategy

- **InQueue:** Planning phase - refine requirements
- **InProgress:** Active development
- **Code-Review:** Self-review before peer review
- **Security-Review:** Check security assumptions
- **QA-Testing:** Final validation before release
- **Completed:** Done and ready to ship

---

## Integration with Other Systems

### Using the REST API

All dashboard features available via REST API:

```bash
# List projects
curl http://localhost:3000/api/projects

# Get project tasks
curl http://localhost:3000/api/projects/my-project/tasks

# Create task
curl -X POST http://localhost:3000/api/projects/my-project/tasks \
  -H "Content-Type: application/json" \
  -d '{"name":"New Task","priority":"HIGH"}'

# Move task
curl -X POST http://localhost:3000/api/projects/my-project/tasks/task-1/move \
  -H "Content-Type: application/json" \
  -d '{"to_stage":"InProgress"}'

# Get agent findings
curl http://localhost:3000/api/projects/my-project/tasks/task-1
```

See **API_REFERENCE.md** for full endpoint documentation.

### Listening to WebSocket Events

```javascript
const ws = new WebSocket('ws://localhost:3000');

ws.onmessage = (event) => {
  const { type, payload } = JSON.parse(event.data);
  
  if (type === 'task-created') {
    console.log('New task:', payload.task);
  }
  if (type === 'task-moved') {
    console.log('Task moved to:', payload.task.stage);
  }
  if (type === 'task-updated') {
    console.log('Task updated:', payload.task);
  }
};
```

---

## Next Steps

- [API Reference](API_REFERENCE.md) — For developers integrating with other tools
- [Configuration Guide](CONFIG_GUIDE.md) — Customize stages, agents, thresholds
- [Admin Guide](ADMIN_GUIDE.md) — Manage users, permissions, settings

