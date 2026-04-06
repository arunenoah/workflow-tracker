# Workflow-Tracker as Claude Code Plugin

Workflow-Tracker is now integrated as a **Claude Code plugin** that auto-starts and provides seamless slash commands.

---

## 🚀 How It Works

### Auto-Start
When you open Claude Code, Workflow-Tracker:
1. ✅ Auto-detects from `.claude/workflow-tracker/plugin.json`
2. ✅ Starts the server automatically (port 3000)
3. ✅ Opens the Kanban dashboard in your browser
4. ✅ Syncs with Claude Code chat

### Slash Commands

Use these commands in Claude Code chat:

```
/dashboard              → Open Kanban board
/task-create          → Create new task
/task-list            → Show all tasks
/project-create       → Create new project
/project-list         → Show all projects
```

---

## 📋 Plugin Structure

```
~/.claude/workflow-tracker/
├── plugin.json                 ← Plugin configuration (auto-loaded)
├── commands/                   ← Slash command definitions
│   ├── dashboard.md           → /dashboard command
│   ├── task-create.md         → /task-create command
│   ├── task-list.md           → /task-list command
│   ├── project-create.md      → /project-create command
│   └── project-list.md        → /project-list command
│
├── src/
│   ├── dashboard/server.js    ← Entry point for auto-start
│   ├── core/
│   ├── agents/
│   └── storage/
│
├── data/                       ← Task data (created at runtime)
└── package.json
```

---

## 🎯 Getting Started

### Step 1: Already Installed
The plugin is in `.claude/workflow-tracker/` with `plugin.json` configured.

### Step 2: Start Claude Code
```bash
# If not already running
claude
```

Claude Code automatically:
- ✅ Detects the plugin
- ✅ Starts Workflow-Tracker server
- ✅ Registers slash commands

### Step 3: Use Slash Commands

In Claude Code chat:

```
/dashboard

→ Dashboard opens in browser
→ Shows Kanban board
→ Ready to use
```

---

## 💬 Slash Commands Reference

### `/dashboard`
**Open the Kanban board**

```
Usage: /dashboard
Opens: http://localhost:3000
Shows: Kanban board with all projects and tasks
```

**What you can do:**
- Create projects
- Create tasks
- Drag tasks between stages
- See AI agent reviews
- Collaborate in real-time

---

### `/task-create`
**Create a new task**

```
/task-create
Title: Implement payment gateway
Description: Add Stripe integration with webhook support
Priority: HIGH
Project: Backend API
```

**Fields:**
- Title (required) - What needs to be done
- Description - Details and requirements
- Priority - CRITICAL, HIGH, MEDIUM, LOW
- Project - Which project it belongs to
- Assigned To - Who will work on it
- Due Date - When it should be done

---

### `/task-list`
**Show all tasks in current project**

```
/task-list
/task-list --stage=InProgress
/task-list --priority=CRITICAL
/task-list --assigned=john@example.com
```

**Shows:**
- Title, Priority, Stage, Assigned To, Due Date
- Task counts per stage
- Color-coded by priority

---

### `/project-create`
**Create a new project**

```
/project-create
Name: Backend API v2
Description: Complete rewrite with modern patterns
Manager: john@example.com
```

**Creates:**
- New project with default workflow stages
- InQueue, InProgress, Code-Review, Security-Review, QA-Testing, Completed
- Ready to add tasks

---

### `/project-list`
**Show all projects**

```
/project-list
```

**Shows:**
- All projects with task counts
- Tasks per stage
- Project manager
- Status indicators

---

## ⚙️ Plugin Configuration

### Auto-Start Settings
Edit `plugin.json` to customize:

```json
{
  "autoStart": true,              // Auto-start on Claude Code open
  "autoLaunchBrowser": true,      // Auto-open dashboard
  "port": 3000,                   // Server port
  "portFallback": true,           // Try next port if busy
  "settings": {
    "storage": "file",            // "file" or "mysql"
    "autoOpenDashboard": true     // Open dashboard automatically
  }
}
```

---

## 🔌 Environment Variables

Set these in `.env`:

```env
# Storage
STORAGE_TYPE=file          # "file" for JSON, "mysql" for database

# Dashboard
DASHBOARD_PORT=3000
DASHBOARD_AUTO_OPEN=true

# MySQL (if using database backend)
MYSQL_HOST=localhost
MYSQL_USER=workflow_user
MYSQL_PASSWORD=password
MYSQL_DATABASE=workflow_tracker
```

---

## 🚀 Quick Start in Claude Code

1. **Chat:** "I need to track tasks for my projects"
   → Claude suggests using `/dashboard`

2. **Chat:** "Create a new project for my backend work"
   → Use `/project-create`

3. **Chat:** "Show me all my tasks"
   → Use `/task-list`

4. **Chat:** "I completed the authentication feature"
   → Use `/dashboard` → drag task to Completed

---

## 📊 Real Example

**In Claude Code Chat:**

```
You: I'm starting a new project. Set up task tracking.

Claude: I'll help you set up Workflow-Tracker. Let me:

1. Open the dashboard:
   /dashboard

2. Create a project:
   /project-create
   Name: Q2 Development
   Description: All features for Q2 2026

3. You're ready to create tasks! Use:
   /task-create

Want to create your first task?
```

**You:** "Create a task: Implement user authentication"

**Claude:** Creates the task via `/task-create`

**Then:** You drag it to Code-Review in the dashboard → AI analyzes it → Gives score and findings

---

## 🔄 Workflow

```
Claude Code Chat
    ↓
/dashboard command
    ↓
Browser opens (Kanban board)
    ↓
Create project + tasks
    ↓
Move tasks through stages
    ↓
AI agents analyze
    ↓
Get approvals
    ↓
Mark complete
    ↓
Back to Claude Code with insights
```

---

## 🛠️ Troubleshooting

### Dashboard not opening?
```bash
# Check if server is running
curl http://localhost:3000

# If not, Claude Code auto-restarts it
# Wait 5 seconds and try again
/dashboard
```

### Commands not showing?
```bash
# Claude Code auto-loads commands from:
~/.claude/workflow-tracker/commands/

# If they don't appear, restart Claude Code
```

### Port already in use?
```bash
# Claude Code automatically tries:
3000 → 3001 → 3002 → 3003

# Set portFallback: true in plugin.json
```

---

## 📚 Documentation

- **[USER_GUIDE.md](USER_GUIDE.md)** — Complete feature reference
- **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** — Integration examples
- **[API_REFERENCE.md](API_REFERENCE.md)** — REST API endpoints
- **[START_HERE.md](START_HERE.md)** — Quick start guide

---

## ✨ What Makes This Special

### As a Claude Code Plugin:

✅ **Auto-starts** — No manual `npm install` or `npm start`  
✅ **Seamless integration** — Works like built-in Claude Code features  
✅ **Slash commands** — Use `/dashboard`, `/task-create`, etc.  
✅ **Browser sync** — Dashboard and chat in sync  
✅ **Real-time updates** — All users see changes instantly  
✅ **AI agents** — Code, security, QA analysis built-in  
✅ **Multiple projects** — Manage everything in one place  

### Not needed:
❌ Terminal commands  
❌ Manual port management  
❌ Browser URL typing  
❌ External setup  

---

## 🎯 Next Steps

1. **Open Claude Code** → Workflow-Tracker auto-starts
2. **Type:** `/dashboard` → Board opens
3. **Type:** `/project-create` → Create first project
4. **Type:** `/task-create` → Add first task
5. **Done!** → Use the dashboard

---

**Status:** ✅ Production-ready Claude Code plugin  
**Version:** 1.0.0  
**License:** MIT
