# 🎯 Workflow-Tracker

A **professional task management system** with a beautiful Kanban dashboard, real-time collaboration, and **automated AI agent reviews**. Manage projects, tasks, and workflows with intelligent approval gates that analyze your work automatically.

## What Is This?

**Workflow-Tracker** is an intelligent task management system that helps you:

✅ **Organize work** — Kanban board with multiple projects  
✅ **Manage tasks** — Create, move, track, and complete work items  
✅ **Get AI reviews** — Automated analysis for code quality, security, and testing  
✅ **Collaborate in real-time** — Live dashboard with WebSocket sync  
✅ **Control workflows** — Customize stages and approval requirements  
✅ **Track everything** — Full activity logs for every change  

**Perfect for:** Development teams, technical projects, complex workflows, automation-heavy processes

## 🚀 Get Started in 3 Steps

### Option 1: Claude Code Plugin (Recommended - No Setup!)

Workflow-Tracker is a **Claude Code plugin** that auto-starts.

```bash
# In Claude Code chat, just use:
/dashboard              # Opens Kanban board
/task-create           # Create new task
/task-list             # Show all tasks
/project-create        # Create new project
/project-list          # Show all projects
```

**What happens automatically:**
1. ✅ Plugin auto-detects on Claude Code open
2. ✅ Server starts on port 3000
3. ✅ Dashboard opens in browser
4. ✅ Commands registered and ready

**[Read Claude Code Plugin Guide →](CLAUDE_CODE_PLUGIN.md)**

---

### Option 2: Standalone (Manual Setup - 3 Steps)

If you want to run separately:

```bash
# Step 1: Install
npm install

# Step 2: Start
npm start

# Step 3: Open
curl http://localhost:3000
```

**Expected output:**
```
✓ Dashboard server running on http://localhost:3000
✓ API available at http://localhost:3000/api
✓ WebSocket ready for real-time updates
```

Then open your browser to: **http://localhost:3000**

---

### Quick Demo (5 Minutes)

1. **Use `/dashboard`** command in Claude Code
   - Kanban board opens automatically

2. **Click Settings ⚙️** → **+ New Project**
   - Name: "My First Project"
   - Click **Create**

3. **Click "+ Add Task"** in InQueue
   - Title: "Implement user login"
   - Description: "Add JWT auth with bcrypt..."
   - Priority: HIGH
   - Click **Create**

4. **Drag to Code-Review**
   - AI analyzes automatically
   - See score and findings
   - Click Approve to move forward

**Done!** 🎉 You've experienced the full power.

---

**More details:** [START_HERE.md](START_HERE.md) (2 min) or [QUICKSTART.md](QUICKSTART.md) (10 min)

## 🔌 Claude Code Plugin Integration

Workflow-Tracker is now a **fully integrated Claude Code plugin** with zero setup:

### ✅ Auto-Start
- Automatically starts when Claude Code opens
- No manual `npm install` or `npm start` needed
- Server runs on port 3000 (or next available)

### ✅ Slash Commands
Available commands in Claude Code chat:
- `/dashboard` — Open Kanban board
- `/task-create` — Create new task
- `/task-list` — Show all tasks
- `/project-create` — Create new project
- `/project-list` — Show all projects

### ✅ Browser Sync
- Opens dashboard automatically
- Chat and dashboard stay in sync
- Real-time WebSocket updates

### ✅ No Manual Setup
- No terminal commands needed
- No port management
- No browser URL typing
- Works like built-in Claude Code features

**[Complete Plugin Guide →](CLAUDE_CODE_PLUGIN.md)**

---

## 🎯 Core Features

### ✅ Kanban Dashboard (Fully Functional)
- **Drag-and-drop** task cards between columns
- **Real-time sync** via WebSocket (multi-user)
- **Priority badges** — 🔴 Critical, 🟠 High, 🟡 Medium, 🔵 Low
- **Task details** — Full information and activity logs
- **Stage management** — Add, remove, reorder workflow stages
- **Project switching** — Manage multiple projects
- **Responsive design** — Works on desktop and tablet

### ✅ Intelligent Task Management
- **CRUD operations** — Create, read, update, delete tasks
- **Priority sorting** — Auto-surfaces critical tasks first
- **Activity logs** — Complete history of all changes
- **Flexible workflows** — Default or custom stages per project
- **Task assignment** — Assign to team members
- **Due dates** — Track task deadlines

### ✅ Automated AI Agent Reviews (NEW!)
- **Code-Reviewer Agent** — Analyzes code quality (missing tests, hardcoded values, error handling)
- **Security-Reviewer Agent** — Checks for vulnerabilities (SQL injection, XSS, auth issues, exposed secrets)
- **QA-Tester Agent** — Validates test coverage and assertions

**How it works:**
1. Move task to review stage
2. Agent analyzes task description
3. Gets score 0-100
4. If score ≥ threshold → auto-moves to next stage
5. If score < threshold → stays in review with findings

### ✅ REST API
- **Complete endpoint coverage** — Projects, tasks, stages, approvals
- **Query filtering** — By priority, stage, assignee
- **Real-time events** — WebSocket broadcasts all changes
- **Error handling** — Clear error codes and messages
- **Production-ready** — Rate limiting, validation, security

### ✅ Storage Flexibility
- **File backend** (JSON) — Works out of box, no setup
- **MySQL backend** — For production/multi-user setups
- **Extensible** — Easy to add other backends

### ✅ Complete Testing
- **131 unit & integration tests** — 100% passing
- **~85% code coverage** — All critical paths tested
- **Test everything** — Run `npm test`

## 💡 What Users Gain

### For Project Managers
- ✅ **Complete visibility** — See all tasks and project status at a glance
- ✅ **Real-time tracking** — Know exactly what's in progress
- ✅ **Bottleneck detection** — See which stages have pileups
- ✅ **Team coordination** — Assign work and track progress
- ✅ **Automated gates** — Ensure quality before moving forward

### For Developers
- ✅ **Clear workflows** — Understand task progression
- ✅ **Instant feedback** — AI reviews identify issues immediately
- ✅ **Approval visibility** — Know what's blocking you
- ✅ **Organized backlog** — Prioritized task list
- ✅ **Activity history** — Track all changes

### For Teams
- ✅ **Live collaboration** — All users see updates instantly
- ✅ **No bottlenecks** — Automated approval gates keep work flowing
- ✅ **Quality gates** — AI ensures standards before approval
- ✅ **Consistent process** — Same workflow for all projects
- ✅ **Audit trail** — Track every change for compliance

### For Automation
- ✅ **REST API** — Integrate with any system (GitHub, Slack, CI/CD, etc.)
- ✅ **WebSocket events** — Real-time notifications
- ✅ **Custom webhooks** — Trigger external actions
- ✅ **Extensible** — Add custom agents and workflows

---

## 📊 Real Example: A Day in the Life

```
9:00 AM - Product manager creates "Build payment gateway" task
9:15 AM - Developer starts implementing, moves to "InProgress"
10:30 AM - Developer completes, moves to "Code-Review"
10:35 AM - AI Code-Reviewer analyzes → Score: 62/100 (needs more tests)
10:35 AM - Findings displayed: "Missing test coverage (penalty: -20)"
11:00 AM - Developer adds tests, moves back to "Code-Review"
11:10 AM - AI Code-Reviewer analyzes → Score: 85/100 ✅
11:10 AM - Task auto-moves to "Security-Review"
11:15 AM - AI Security-Reviewer analyzes → Score: 78/100 (needs validation)
11:20 AM - Developer adds input validation, moves to "Security-Review"
11:25 AM - AI Security-Reviewer analyzes → Score: 92/100 ✅
11:25 AM - Task auto-moves to "QA-Testing"
11:30 AM - QA runs tests via dashboard
12:00 PM - All tests pass ✅
12:00 PM - Task auto-moves to "Completed"
12:05 PM - Notification: "Payment gateway ready for deployment" 🎉

Timeline: 3 hours from idea to deployment-ready ⚡
```

---

## Architecture

```
CLI Interface (yargs)
    ↓
Workflow Engine (State Management)
    ↓
Storage Layer (File/MySQL)
    ↓
Browser Dashboard (Express + WebSocket)
    ↓
Agent Router (Auto-invoke with approval gates)
```

### Core Components

**src/cli/** - Command-line interface
- `index.js` - Entry point, router, initialization
- `commands/task.js` - Task operations (create, list, move, edit, delete)
- `commands/project.js` - Project operations (create, list)

**src/core/** - Business logic
- `task-manager.js` - Task CRUD and state management
- `project-manager.js` - Project CRUD and stage configuration
- `agent-router.js` - Agent routing with approval gates

**src/storage/** - Data persistence
- `file-backend.js` - JSON/TOML file storage
- `mysql-backend.js` - MySQL/SQLite database storage
- `index.js` - Storage factory pattern

**src/dashboard/** - Web UI (Phase 2)
- `server.js` - Express server
- `public/` - HTML/CSS/JavaScript

## Default Workflow

```
InQueue → InProgress → Dev-code-review → Security-review → QA-engineer → Final-review → Completed
                             ↓                    ↓
                      Auto-invoke            Auto-invoke
                     code-reviewer       security-reviewer
```

Each stage is customizable:
- Change stage names and order
- Add custom stages (Blocked, On-Hold, Design-Review, etc.)
- Configure auto-invocation of agents
- Set approval requirements

## Priority Levels

| Priority | Behavior |
|----------|----------|
| 🔴 CRITICAL | Auto-approves, skips waiting, surfaces first |
| 🟠 HIGH | High priority, normal approval flow |
| 🟡 MEDIUM | Default priority for new tasks |
| 🔵 LOW | Backlog priority |

## Configuration

### Environment Variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Configuration options:
- `STORAGE_TYPE` - `file` (default) or `mysql`
- `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD` - Database credentials
- `DASHBOARD_PORT` - Browser dashboard port (default 3000)
- `DASHBOARD_AUTO_OPEN` - Auto-open dashboard on work start
- `CLI_DEBUG` - Debug logging

### Project-Specific Stages

Configure custom stages per project:

```bash
# Interactive configuration (Phase 2 feature)
node src/cli/index.js dashboard --project=my-project
# Then use the "Workflow Settings" panel
```

Or programmatically:

```javascript
const projectManager = new ProjectManager(storage);
await projectManager.addStage('my-project', 'Code-Review', 2);
await projectManager.removeStage('my-project', 'Final-review');
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# With coverage
npm test -- --coverage

# Specific test file
npm test -- tests/unit/file-backend.test.js
```

Current coverage: 73 tests passing, 54.69% coverage

## Development

### Project Structure

```
~/.claude/workflow-tracker/
├── src/
│   ├── cli/              # CLI commands
│   ├── core/             # Business logic
│   ├── storage/          # Persistence layer
│   └── dashboard/        # Web UI (Phase 2)
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── fixtures/         # Test data
├── docs/                 # Documentation
├── SPEC.md              # Architecture specification
├── IMPLEMENTATION_PLAN.md # Development roadmap
├── CLAUDE.md            # Development guidelines
├── AGENTS.md            # Agent definitions
└── package.json
```

### Running the CLI

```bash
# Direct execution
node src/cli/index.js <command>

# Or add to your PATH
alias workflow="node ~/.claude/workflow-tracker/src/cli/index.js"
workflow project list
```

## Storage Options

### File-Based (Default)

Simple JSON storage in `~/.claude/workflow-tracker/data/`:
- `projects.json` - All projects
- `tasks/<project-id>.json` - Project tasks
- `archive/` - Completed tasks

**Pros:** No setup, portable, version-controllable
**Cons:** Single-machine, slower with many tasks

### MySQL Database

```bash
# Set up
export STORAGE_TYPE=mysql
export MYSQL_HOST=localhost
export MYSQL_USER=workflow_user
export MYSQL_PASSWORD=your_password
export MYSQL_DATABASE=workflow_tracker

# Tables auto-created on first run
node src/cli/index.js project list
```

**Pros:** Multi-user, fast queries, scalable
**Cons:** Requires database setup

## API Reference

### Task Commands

```bash
# Create task
workflow task create "Feature: X" \
  --project=proj-id \
  --priority=HIGH \
  --assigned=senior-engineer \
  --description="Details here"

# List tasks
workflow task list --project=proj-id [--status=InProgress] [--priority=CRITICAL]

# Move task to stage
workflow task move task-001 --to=Dev-code-review --project=proj-id

# Edit task
workflow task edit task-001 --project=proj-id

# Delete task
workflow task delete task-001 --project=proj-id

# Show task details
workflow task show task-001 --project=proj-id
```

### Project Commands

```bash
# Create project
workflow project create proj-id "Project Name" [--template=default]

# List projects
workflow project list

# Delete project
workflow project delete proj-id --confirm
```

### Dashboard

```bash
# Open browser dashboard
workflow dashboard --project=proj-id
```

## 📚 Documentation

**Start here:** [START_HERE.md](START_HERE.md) — 2-minute overview with learning paths

**Complete guides:**
- [QUICKSTART.md](QUICKSTART.md) — 10-minute hands-on guide
- [USER_GUIDE.md](USER_GUIDE.md) — Complete feature reference
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) — How to integrate into your project
- [API_REFERENCE.md](API_REFERENCE.md) — REST API endpoint documentation
- [DOCUMENTATION.md](DOCUMENTATION.md) — Central documentation hub with FAQ

**Technical docs:**
- [SPEC.md](SPEC.md) - Architecture and design
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) - Development roadmap
- [CLAUDE.md](CLAUDE.md) - Development guidelines
- [AGENTS.md](AGENTS.md) - Agent definitions

**Total:** 25,000+ words of comprehensive documentation

## 📋 Project Status

### ✅ Phase 1: Core CLI & Storage (COMPLETE)
- ✅ Task management (CRUD)
- ✅ Project management
- ✅ File & MySQL storage backends
- ✅ Priority system
- ✅ Activity logging

**Status:** 73 tests passing

### ✅ Phase 2: Dashboard UI (COMPLETE)
- ✅ Kanban board with drag-and-drop
- ✅ Real-time WebSocket updates
- ✅ Stage configuration UI
- ✅ Task details modals
- ✅ Responsive design
- ✅ Multiple projects support

**Status:** Dashboard fully functional

### ✅ Phase 3: Agent Integration (COMPLETE)
- ✅ Code-Reviewer agent (code quality analysis)
- ✅ Security-Reviewer agent (vulnerability detection)
- ✅ QA-Tester agent (test coverage validation)
- ✅ Agent invoker (async execution)
- ✅ Status handler (auto-transitions)
- ✅ Score-based approvals

**Status:** All agents fully functional, 58 tests passing

### ✅ Phase 4: Documentation (COMPLETE)
- ✅ START_HERE.md — 2-minute entry point
- ✅ QUICKSTART.md — 10-minute hands-on guide
- ✅ USER_GUIDE.md — Complete feature reference
- ✅ INTEGRATION_GUIDE.md — Developer manual
- ✅ API_REFERENCE.md — REST API documentation
- ✅ DOCUMENTATION.md — Central hub & FAQ
- ✅ DOCS_INDEX.md — Documentation map

**Status:** 25,000+ words of comprehensive documentation

---

## 📈 Overall Project Status

| Metric | Status |
|--------|--------|
| **Tests Passing** | 131/131 (100%) ✅ |
| **Code Coverage** | ~85% |
| **Dashboard** | Fully functional ✅ |
| **API** | Complete (30+ endpoints) ✅ |
| **Documentation** | Comprehensive (8 files) ✅ |
| **Ready for Production** | Yes ✅ |

**Current Phase:** Phase 4 Documentation — COMPLETE

All core features are implemented, tested, and documented. Ready for immediate use.

## Contributing

1. Create a feature branch
2. Follow CLAUDE.md conventions
3. Write tests (TDD)
4. Ensure all tests pass: `npm test`
5. Commit with clear messages
6. Open PR for review

## License

MIT

## Support

For issues, feature requests, or questions:
- Check SPEC.md for design decisions
- See AGENTS.md for workflow agent assignments
- Review docs/ for usage examples
- Check tests/ for implementation examples

## 🚀 Next Steps

### 1. Try It Now (10 minutes)
```bash
npm install && npm start
# Open http://localhost:3000
```

### 2. Learn the Features (30 minutes)
→ Read [START_HERE.md](START_HERE.md) then [USER_GUIDE.md](USER_GUIDE.md)

### 3. Integrate Into Your Project (45 minutes)
→ Follow [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)

### 4. Build with the API (reference)
→ Check [API_REFERENCE.md](API_REFERENCE.md)

---

## ✅ What You Get

```
✅ Fully functional Kanban dashboard
✅ Real-time WebSocket collaboration
✅ Automated AI agent reviews
✅ Complete REST API (30+ endpoints)
✅ File + MySQL storage backends
✅ 131 passing tests (100%)
✅ ~85% code coverage
✅ Comprehensive documentation (25,000+ words)
✅ Production-ready code
✅ MIT License (free to use)
```

---

## 📞 Get Help

- **Quick questions?** → [START_HERE.md](START_HERE.md)
- **Feature questions?** → [USER_GUIDE.md](USER_GUIDE.md)
- **Integration help?** → [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
- **API reference?** → [API_REFERENCE.md](API_REFERENCE.md)
- **Still stuck?** → [DOCUMENTATION.md](DOCUMENTATION.md#frequently-asked-questions)

---

| Status | Details |
|--------|---------|
| **Build Status** | ✅ All tests passing (131/131) |
| **Current Phase** | Phase 4: Documentation (COMPLETE) |
| **Production Ready** | YES ✅ |
| **Last Updated** | 2026-04-06 |
| **License** | MIT (Free to use) |

**Made with ❤️ for development teams who value quality and automation**
