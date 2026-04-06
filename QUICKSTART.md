# Quick Start Guide — 10 Minutes to Your First Board

Get the Workflow-Tracker dashboard running and see your first task board.

---

## Installation (1 minute)

```bash
# Clone the repository
git clone https://github.com/your-org/workflow-tracker.git
cd workflow-tracker

# Install dependencies
npm install

# Verify installation
npm test
# You should see: 131 tests passing
```

---

## Start the Server (1 minute)

```bash
npm start
```

Expected output:
```
✓ Dashboard server running on http://localhost:3000
✓ API available at http://localhost:3000/api
✓ WebSocket ready for real-time updates
```

---

## Open the Dashboard (30 seconds)

Open your browser and go to:

**http://localhost:3000**

You should see:
- A top navigation bar with project selector and settings
- An empty Kanban board with columns for each stage
- Each column has a "+ Add Task" button

---

## Create Your First Project (2 minutes)

1. Click **Settings ⚙️** (top right)
2. Click **+ New Project**
3. Fill in:
   - **Name:** "My First Project"
   - **Description:** "Testing Workflow-Tracker"
4. Click **Create**

You'll see it appear in the project dropdown at the top.

---

## Create Your First Task (2 minutes)

1. Make sure your project is selected in the dropdown
2. Click **+ Add Task** in the "InQueue" column
3. Fill in the form:

   ```
   Title: "Implement user login"
   Description: "Add email/password authentication with JWT tokens
                 - Use bcrypt for password hashing
                 - Generate 7-day JWT tokens
                 - Add rate limiting"
   Priority: HIGH
   ```

4. Click **Create Task**

Your task appears as a card in the InQueue column:
```
🟠 Implement user login
HIGH | due date | assigned user
```

---

## Move the Task to Review (2 minutes)

1. **Drag the task** from "InQueue" column to "Code-Review" column
   - Or right-click and select "Move to Stage"

2. Watch as the **AI agent analyzes** your task
   - Returns a score (0-100)
   - Lists any issues found
   - Shows a summary

3. **See the result:**
   - If score ≥ 70: Task auto-moves to next stage
   - If score < 70: Task stays, shows findings

4. Click the task card to see details:
   - Agent findings (what issues were detected)
   - Full score breakdown
   - Approval/rejection options

---

## Try More Features (2 minutes)

### Create Multiple Tasks

Click "+ Add Task" in different columns:

```
InQueue:
  - 🔴 Setup database (CRITICAL)
  - 🟠 Configure CI/CD (HIGH)
  - 🟡 Write API docs (MEDIUM)

InProgress:
  - 🟠 Fix user validation (HIGH)
```

### Drag Cards Around

Click and drag any card to move it between columns. Watch as:
- The card slides to the new column
- If it's a review stage, the agent analyzes it
- Real-time notifications show the move

### View Task Details

Click any card to open the detail modal:
- Full description and requirements
- Who it's assigned to
- When it's due
- Complete activity log of all changes
- Agent analysis (if reviewed)

### Approve Tasks

When a task is under review:
1. Click the card
2. Scroll to "Agent Analysis" section
3. See the score and findings
4. Click **Approve** to move forward
5. Click **Reject** if you disagree

---

## Test Real-Time Updates (1 minute)

1. **Open two browser windows** with the same project
2. In window 1: Create a task called "Test sync"
3. Watch window 2: The task appears instantly
4. In window 2: Move the task to a different stage
5. Watch window 1: The task moves in real-time

This shows the **WebSocket live-sync** working.

---

## Check Test Coverage (1 minute)

See what's tested:

```bash
npm test

# Output:
# PASS  tests/unit/task-manager.test.js
# PASS  tests/unit/project-manager.test.js
# PASS  tests/unit/file-backend.test.js
# PASS  tests/unit/code-reviewer.test.js
# PASS  tests/unit/security-reviewer.test.js
# PASS  tests/unit/qa-tester.test.js
# ...
#
# Test Suites: 10 passed
# Tests:       131 passed
# Coverage:    ~85% across all modules
```

---

## Architecture Overview

The system has three layers:

```
User Browser
    ↓
    ├─ Dashboard UI (Kanban board)
    ├─ REST API (/api/...)
    └─ WebSocket (real-time updates)
    ↓
Express Server + Node.js
    ├─ TaskManager (CRUD operations)
    ├─ ProjectManager (workflow management)
    ├─ Agents (code-reviewer, security-reviewer, qa-tester)
    └─ StatusHandler (auto-transitions)
    ↓
Storage Layer
    ├─ File Backend (JSON files) - for development
    └─ MySQL Backend (database) - for production
```

---

## Default Workflow

Every project starts with these stages:

```
1. InQueue         → Initial backlog
2. InProgress      → Active development
3. Code-Review     → Automated code analysis
4. Security-Review → Automated security check
5. QA-Testing      → Automated test validation
6. Completed       → Ready to ship
```

When you move a task to "Code-Review":
- The **Code-Reviewer Agent** analyzes the description
- Checks for testing, hardcoded values, error handling
- Scores it 0-100
- If score ≥ 70: moves to next stage
- If score < 70: stays in review, shows findings

---

## Next Steps

Now that you have the basics:

1. **Read Full Guide:** [USER_GUIDE.md](USER_GUIDE.md) — Complete dashboard documentation
2. **Integrate into your project:** [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) — Add to your app
3. **REST API Reference:** [API_REFERENCE.md](API_REFERENCE.md) — All endpoints
4. **Customize workflows:** [CONFIG_GUIDE.md](CONFIG_GUIDE.md) — Custom stages, agents, rules

---

## Troubleshooting

### Port Already in Use

```bash
npm start -- --port 3001
# Opens on http://localhost:3001
```

### Database Issues

Delete test data and restart:

```bash
rm -rf ./data
npm start
```

### Agent Analysis Not Running

Check server logs:

```bash
# Server output should show agent analysis
# [Agent] code-reviewer analyzing task...
# [Agent] Task score: 82/100
```

If nothing appears, verify:
1. Task has a description (agents analyze the description)
2. You moved to a review stage (Code-Review, Security-Review, QA-Testing)
3. Server logs show no errors

---

## Common Questions

**Q: Can I use this with my existing database?**  
A: Yes, see INTEGRATION_GUIDE.md for MySQL backend setup.

**Q: How do I customize the workflow stages?**  
A: Click Settings ⚙️ → Manage Stages. You can add, remove, reorder.

**Q: Can agents be disabled?**  
A: Yes, in stage configuration, set "Auto-invoke agent" to "None".

**Q: How do I export task data?**  
A: Use the REST API: `GET /api/projects/:id/tasks` returns JSON.

**Q: Can multiple users use the dashboard?**  
A: Yes, all users see real-time updates via WebSocket.

---

## What You Now Have

✅ **Running dashboard** on http://localhost:3000  
✅ **REST API** for programmatic task management  
✅ **Real-time sync** via WebSocket  
✅ **Automated agents** for code/security/QA reviews  
✅ **Activity logs** for all task changes  
✅ **131 tests** proving reliability  

You're ready to start using Workflow-Tracker!

---

Still have questions? See [USER_GUIDE.md](USER_GUIDE.md) for detailed documentation.

