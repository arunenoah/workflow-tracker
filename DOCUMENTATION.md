# Workflow-Tracker Documentation Hub

Complete documentation for using the Workflow-Tracker task management system in any project.

---

## Getting Started

New to Workflow-Tracker? Start here:

### 📚 Choose Your Path

#### **I want to use the dashboard (5-10 minutes)**
👉 Start with [QUICKSTART.md](QUICKSTART.md)
- Get the server running
- Create your first project
- Create and manage tasks
- See the board in action

#### **I want detailed usage instructions**
👉 Read [USER_GUIDE.md](USER_GUIDE.md)
- Complete dashboard tour
- All features explained
- Keyboard shortcuts
- Troubleshooting
- Best practices

#### **I want to integrate this into my app**
👉 Follow [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
- Installation options
- REST API usage
- WebSocket real-time events
- Using in Node.js code
- Custom workflows
- Performance tuning

#### **I need the REST API reference**
👉 See [API_REFERENCE.md](API_REFERENCE.md)
- All endpoints documented
- Request/response examples
- Error handling
- Complete examples

---

## Documentation Map

```
Documentation Hub (you are here)
├── Quick Start (5 min) → For immediate hands-on experience
├── User Guide (15 min) → For complete feature overview
├── Integration Guide (20 min) → For developers embedding in projects
└── API Reference (reference) → For API endpoint details
```

---

## What Is Workflow-Tracker?

**Workflow-Tracker** is a professional task management system that:

✅ **Manages tasks** across multiple projects  
✅ **Organizes work** using customizable Kanban boards  
✅ **Automates reviews** with AI agents (code, security, QA)  
✅ **Syncs in real-time** via WebSocket  
✅ **Works offline** with file-based storage  
✅ **Scales to production** with MySQL backend  

---

## Architecture Overview

The system has **3 layers:**

### 1. **Dashboard Layer** (Web UI)
- Kanban board with drag-and-drop
- Task detail modals
- Real-time live sync via WebSocket
- Responsive design

### 2. **API Layer** (REST endpoints)
- Task CRUD operations
- Project management
- Stage configuration
- Agent invocation

### 3. **Storage Layer** (Data persistence)
- File backend (JSON) — for development
- MySQL backend — for production

**Data Flow:**
```
Browser Dashboard
        ↓
   REST API (/api/...)
        ↓
    Managers (TaskManager, ProjectManager)
        ↓
    Storage (File or MySQL)
```

**Real-Time Communication:**
```
Browser Dashboard ←→ WebSocket ←→ Server
(live updates for all connected clients)
```

---

## Quick Links

| Need | Resource | Time |
|------|----------|------|
| See it working | [QUICKSTART.md](QUICKSTART.md) | 5 min |
| Learn all features | [USER_GUIDE.md](USER_GUIDE.md) | 15 min |
| Integrate into app | [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) | 20 min |
| Reference API | [API_REFERENCE.md](API_REFERENCE.md) | 5 min lookup |
| View source | `/src` directory | — |
| Run tests | `npm test` | 2 min |

---

## Installation (All Paths)

### Prerequisites
- Node.js 14+
- npm 6+

### Setup

```bash
# Clone or navigate to workflow-tracker
cd /path/to/workflow-tracker

# Install dependencies
npm install

# Verify installation
npm test
# Expected: 131 tests passing
```

### Start Server

```bash
npm start

# Opens on http://localhost:3000
```

---

## Common Workflows

### Scenario 1: Personal Task Management

1. **Open dashboard:** http://localhost:3000
2. **Create project:** "My Tasks"
3. **Add task:** "Learn Workflow-Tracker"
4. **View board:** See it in Kanban columns
5. **Move to review:** Drag to "Code-Review" → see AI analysis

📖 See [QUICKSTART.md](QUICKSTART.md)

---

### Scenario 2: Team Collaboration

1. **Deploy server** on shared machine
2. **Team members** access: `http://your-server:3000`
3. **Create shared project** with team workflow
4. **Real-time sync:** All changes appear instantly for all users
5. **Automated reviews:** Tasks move through approval gates

📖 See [USER_GUIDE.md](USER_GUIDE.md) → "Real-Time Updates"

---

### Scenario 3: Integrate with Existing App

1. **Install workflow-tracker** npm package
2. **Create managers** from your storage
3. **Mount API** on your Express app
4. **Listen to WebSocket** for real-time events
5. **Trigger workflows** from your app logic

📖 See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) → "Embedded in Existing Express App"

---

### Scenario 4: Automate from External Systems

**GitHub → Workflow-Tracker:**
- Pull request opened → Create task in "Code-Review"
- CI pipeline passes → Move task to "Testing"

**Slack → Workflow-Tracker:**
- `/task Add feature request` → Create task
- Task approved → Slack notification

**Webhook integration:**
```javascript
app.post('/webhooks/github', async (req, res) => {
  // Create task from GitHub PR
  await taskManager.create('project', {
    name: `PR: ${req.body.pull_request.title}`,
    stage: 'Code-Review'
  });
  res.json({ ok: true });
});
```

📖 See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) → "Integrating with External Systems"

---

## Key Concepts

### Projects
Container for related tasks. Each project has its own:
- Workflow stages (InQueue → Completed)
- Task list
- Customizable rules

**Example:** "Q2 Development", "Mobile App", "Documentation"

### Tasks
Individual work items. Each task has:
- Title and description
- Priority (CRITICAL, HIGH, MEDIUM, LOW)
- Stage (which column it's in)
- Assigned person
- Due date
- Full audit trail

**Example:** "Implement user auth", "Fix login bug", "Write API docs"

### Stages
Workflow columns. Represent task progression:
- **InQueue** → Initial backlog
- **InProgress** → Active work
- **Code-Review** → Auto-analyzes for quality (score needed: 70+)
- **Security-Review** → Auto-analyzes for vulnerabilities (score: 80+)
- **QA-Testing** → Auto-analyzes test coverage (score: 75+)
- **Completed** → Done

### Agents
AI analysis tools that automatically review tasks:
- **Code-Reviewer** — Checks: testing, hardcoded values, error handling
- **Security-Reviewer** — Checks: SQL injection, XSS, auth, secrets
- **QA-Tester** — Checks: test coverage, assertions, edge cases

When a task enters a review stage, the agent:
1. Analyzes the task description
2. Scores it 0-100
3. If score ≥ threshold: auto-moves to next stage
4. If score < threshold: stays in review, shows findings

### Activity Log
Every task tracks all changes:
- Created, modified, deleted
- Stage moves
- Agent analyses
- Approvals/rejections
- Who made each change and when

---

## Frequently Asked Questions

**Q: Can I use my own database?**  
A: Yes. Workflow-Tracker supports:
- File backend (JSON) — default
- MySQL backend — for production
- Create custom backend extending FileBackend

See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) → "Choose Storage Backend"

---

**Q: Can I customize workflow stages?**  
A: Yes. You can:
- Add/remove/reorder stages
- Enable/disable agent auto-invocation
- Set approval requirements
- Create completely custom workflows

See [USER_GUIDE.md](USER_GUIDE.md) → "Managing the Workflow"

---

**Q: How do I disable agent analysis?**  
A: In stage configuration, set "Auto-invoke agent" to "None". Tasks won't be analyzed when moved to that stage.

See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) → "Configuration"

---

**Q: Can multiple users use this?**  
A: Yes. Deploy the server, users access via browser. All changes sync in real-time via WebSocket.

See [USER_GUIDE.md](USER_GUIDE.md) → "Real-Time Updates"

---

**Q: How do I export task data?**  
A: Use the REST API:
```bash
curl http://localhost:3000/api/projects/my-project/tasks > tasks.json
```

All task data is available as JSON via the API.

See [API_REFERENCE.md](API_REFERENCE.md)

---

**Q: What if the server crashes?**  
A: Data is persisted to disk. Simply restart:
```bash
npm start
```
All tasks and projects are recovered from storage.

---

**Q: Can I self-host this?**  
A: Yes. Deploy Node.js + workflow-tracker anywhere:
- Your own server
- AWS EC2
- Heroku
- Docker container
- Home server

See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) → "Standalone Mode"

---

## Testing & Quality

**Run full test suite:**
```bash
npm test
# Expected: 131 tests passing (100%)
```

**Test coverage includes:**
- ✅ Task management (create, read, update, delete, move)
- ✅ Project management (stages, configuration)
- ✅ Agent analysis (code review, security, QA)
- ✅ REST API endpoints
- ✅ WebSocket real-time sync
- ✅ Storage backends (file and MySQL)

---

## Production Checklist

Before deploying to production:

- [ ] **Choose MySQL backend** (not file-based)
- [ ] **Set environment variables** (.env file)
- [ ] **Add authentication** (JWT or OAuth)
- [ ] **Add rate limiting** (express-rate-limit)
- [ ] **Configure HTTPS** (reverse proxy)
- [ ] **Set up monitoring** (logs, health checks)
- [ ] **Regular backups** (database snapshots)
- [ ] **Load testing** (verify performance)

See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) → "Production Checklist"

---

## Support & Troubleshooting

### Common Issues

**"Port 3000 already in use"**
```bash
npm start -- --port 3001
```

**"WebSocket disconnected"**
- Refresh browser (auto-reconnects)
- Check server logs
- Restart server: `npm start`

**"Agent analysis not running"**
- Ensure task has a description
- Check server logs for errors
- Verify stage auto-invokes agent (Settings)

**"Changes not syncing to other users"**
- Refresh browser page
- Check WebSocket connection status
- Restart server

See [USER_GUIDE.md](USER_GUIDE.md) → "Troubleshooting"

---

## Project Structure

```
workflow-tracker/
├── src/
│   ├── core/                    # Business logic
│   │   ├── task-manager.js      # Task CRUD
│   │   ├── project-manager.js   # Project management
│   │   ├── agent-router.js      # Agent invocation
│   │   ├── agent-invoker.js     # Async agent execution
│   │   └── status-handler.js    # Result processing
│   │
│   ├── agents/                  # AI agents
│   │   ├── code-reviewer.js     # Code quality analysis
│   │   ├── security-reviewer.js # Security analysis
│   │   └── qa-tester.js         # Test coverage analysis
│   │
│   ├── storage/                 # Data persistence
│   │   ├── file-backend.js      # JSON file storage
│   │   ├── mysql-backend.js     # MySQL storage
│   │   └── index.js             # Storage factory
│   │
│   ├── dashboard/               # Web UI
│   │   ├── server.js            # Express + WebSocket
│   │   ├── routes/api.js        # REST endpoints
│   │   ├── public/              # HTML/CSS/JS
│   │   └── utils/
│   │
│   └── cli/                     # CLI commands
│       ├── index.js             # CLI entry
│       └── commands/
│
├── tests/
│   ├── unit/                    # Unit tests (73)
│   └── integration/             # Integration tests (17)
│
├── data/                        # Task data (created at runtime)
├── package.json
├── README.md                    # Main readme
├── QUICKSTART.md               # 5-min quick start
├── USER_GUIDE.md               # Complete guide
├── INTEGRATION_GUIDE.md         # Integration manual
├── API_REFERENCE.md            # API endpoints
└── DOCUMENTATION.md            # This file
```

---

## Next Steps

1. **Start here:** [QUICKSTART.md](QUICKSTART.md) (5 minutes)
2. **Learn features:** [USER_GUIDE.md](USER_GUIDE.md) (15 minutes)
3. **Integrate:** [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) (if needed)
4. **API details:** [API_REFERENCE.md](API_REFERENCE.md) (reference)
5. **Run tests:** `npm test`
6. **Explore code:** `/src` directory

---

## Resources

| Resource | Purpose |
|----------|---------|
| [GitHub Repository](#) | Source code |
| [Issues](#) | Report bugs |
| [Discussions](#) | Ask questions |
| [Contributing](#) | How to contribute |

---

## License

MIT License — Use freely in any project.

---

**Ready to get started?** → [QUICKSTART.md](QUICKSTART.md) (5 minutes)

