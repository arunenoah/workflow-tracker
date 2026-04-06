# Workflow Tracker Plugin - Specification Document

**Version:** 1.0.0  
**Created:** 2026-04-06  
**Status:** Approved for Implementation  
**Author:** Technical Architecture Team

---

## Executive Summary

Workflow Tracker is a global Claude Code plugin that provides professional-grade multi-project task management with customizable Kanban workflows, automatic agent routing, and a browser-based dashboard. It enables seamless task progression through configurable workflow stages with intelligent approval gates and agent automation.

---

## 1. System Overview

### 1.1 Purpose
Enable developers and teams to:
- Manage tasks across multiple projects simultaneously
- Define custom workflow stages per project
- Automatically route work to appropriate agents at each stage
- Approve/reject/edit tasks before agent execution
- Track progress with a Kanban board interface
- Maintain task history and audit logs

### 1.2 Core Capabilities
- **Flexible Workflows** — Default 7-stage template or custom stages per project
- **Kanban Board UI** — Drag-and-drop columns, visual priority indicators, real-time updates
- **Agent Integration** — Auto-invoke agents with conditional approval gates
- **Task Management** — Create, edit, delete, move, approve tasks
- **Priority Levels** — CRITICAL, HIGH, MEDIUM, LOW with automatic task ordering
- **Hybrid Dashboard** — Auto-opens on work start, manual access via `/workflow:dashboard`
- **Flexible Storage** — JSON/TOML files or MySQL database
- **Multi-Project Support** — Independent workflows per project

---

## 2. Architecture

### 2.1 System Components

```
┌──────────────────────────────────────────────────────────────────┐
│                     Claude Code CLI                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │         Slash Command Handler Layer                     │    │
│  │  /workflow:create  /workflow:move  /workflow:dashboard  │    │
│  └────────────────┬────────────────────────────────────────┘    │
│                   │                                              │
│  ┌────────────────▼────────────────────────────────────────┐    │
│  │          Workflow Engine (Core Logic)                   │    │
│  │  • State management                                     │    │
│  │  • Task transitions                                     │    │
│  │  • Agent routing & approval gates                       │    │
│  │  • Priority ordering                                    │    │
│  └────────────────┬────────────────────────────────────────┘    │
│                   │                                              │
│  ┌────────────────▼────────────────────────────────────────┐    │
│  │          Storage Abstraction Layer                      │    │
│  │  ┌──────────────────┐  ┌──────────────────────────┐   │    │
│  │  │ File Backend     │  │  MySQL Backend          │   │    │
│  │  │ (JSON/TOML)      │  │  (Database Connection)  │   │    │
│  │  └──────────────────┘  └──────────────────────────┘   │    │
│  └────────────────┬────────────────────────────────────────┘    │
│                   │                                              │
│  ┌────────────────▼────────────────────────────────────────┐    │
│  │          Agent Integration Layer                        │    │
│  │  • Agent router                                         │    │
│  │  • Approval gate handler                                │    │
│  │  • Status updater                                       │    │
│  └────────────────┬────────────────────────────────────────┘    │
│                   │                                              │
└───────────────────┼──────────────────────────────────────────────┘
                    │
    ┌───────────────┴────────────────────────┐
    │                                        │
┌───▼──────────────────────┐    ┌───────────▼────────────────────┐
│   Browser Dashboard       │    │   Agent Execution              │
│  (Kanban Board)           │    │   (Terminal/Background)        │
│  • Visual task mgmt       │    │                                │
│  • Stage configuration    │    │  code-reviewer                 │
│  • Real-time updates      │    │  security-reviewer             │
│  • Approval UI            │    │  qa-tester                     │
└──────────────────────────┘    │  tech-lead                     │
                                └────────────────────────────────┘
```

### 2.2 Data Flow

**Task Creation & Progression:**
```
1. User runs: /workflow:create "Task name" --project=dll_git
   ↓
2. CLI captures input → Workflow Engine validates
   ↓
3. Engine creates task with initial status (InQueue by default)
   ↓
4. Storage layer persists to JSON/TOML or MySQL
   ↓
5. Dashboard updates (if open) or displays confirmation
   ↓
6. Task ready for user interaction (move, edit, delete)
```

**Task Progression with Agent:**
```
1. User moves task: /workflow:move task-001 --to=Dev-code-review
   ↓
2. Engine checks stage config for agent auto-invoke setting
   ↓
3. If requires_approval=true AND auto_accept=false:
   → Dashboard shows "Pending Approval" UI
   → User can: APPROVE, EDIT, REJECT, DELETE
   ↓
4. User clicks APPROVE (or /workflow:approve task-001)
   ↓
5. Engine invokes agent (code-reviewer)
   → Dashboard shows "Agent Working" status
   → Agent executes, updates task status
   ↓
6. Agent completes → Task auto-moves to next stage OR marked completed
```

---

## 3. Workflow & Stages

### 3.1 Default Workflow Template

**7-Stage Pipeline (with agent mapping):**

| # | Stage | Role | Auto-Invoke | Requires Approval | Next Stage |
|---|-------|------|-------------|--------------------|-----------|
| 1 | **InQueue** | Tech Lead | ❌ | ❌ | InProgress |
| 2 | **InProgress** | Senior Engineer | ❌ | ❌ | Dev-code-review |
| 3 | **Dev-code-review** | code-reviewer agent | ✅ | ✅ | Security-review |
| 4 | **Security-review** | security-reviewer agent | ✅ | ✅ | QA-engineer |
| 5 | **QA-engineer** | qa-tester agent | ❌ | ✅ | Final-review |
| 6 | **Final-review** | Tech Lead | ❌ | ✅ | Completed |
| 7 | **Completed** | N/A | ❌ | ❌ | Archive |

### 3.2 Custom Workflows

Users can:
- Create project-specific workflows from scratch
- Add custom stages (e.g., "Blocked", "On-Hold", "Design-Review")
- Remove default stages not needed
- Reorder stages
- Configure auto-invoke agent per stage
- Set approval requirements per stage

---

## 4. User Interface

### 4.1 Browser Dashboard (Kanban Board)

**Layout:**
```
Top Navigation:
├─ Project Selector: [dll_git ▼]
├─ View Toggle: [Board] [List] [Calendar]
├─ Filter: [Priority] [Assignee] [Status]
└─ Settings: [⚙️]

Kanban Board (Drag & Drop):
├─ Column 1: InQueue (10)
│  ├─ Card: 🔴 Feature X | High | SE
│  ├─ Card: 🟠 Bug Fix | Med | SR
│  └─ [+ Add Task]
│
├─ Column 2: InProgress (5)
│  ├─ Card: 🔴 Auth | Crit | SR
│  └─ [+ Add Task]
│
└─ ... (additional columns)
```

**Task Card Features:**
- Priority badge with color (🔴🟠🟡🔵)
- Task title (truncated with hover preview)
- Assignee avatar
- Priority indicator
- Quick actions: [Edit] [Move] [Delete]
- Click to expand full details

**Task Details Panel (Expanded):**
- Full task name & description
- Status & next stage options
- Priority with selector
- Assignee with avatar
- Created/Updated dates
- Activity log (state changes, agent activity)
- Action buttons: [Approve] [Reject] [Edit] [Delete] [Move to...]

### 4.2 Stage Configuration UI

**Settings Panel:**
```
┌─────────────────────────────────────┐
│ Project Workflow Settings           │
├─────────────────────────────────────┤
│ Template: [Default ▼] [Start Custom]│
│                                     │
│ Stages (drag to reorder):           │
│ 1. ◼ InQueue [Edit] [Delete]       │
│ 2. ◼ InProgress [Edit] [Delete]    │
│ ...                                 │
│                                     │
│ [+ Add New Stage]                   │
│ [Save Workflow] [Cancel]            │
└─────────────────────────────────────┘
```

**Edit Stage Modal:**
- Name & description
- Color selector
- Auto-invoke agent toggle
- Agent dropdown (if auto-invoke enabled)
- Requires approval toggle
- Auto-accept toggle

### 4.3 Approval UI

**When task moves to stage with approval required:**
```
┌─────────────────────────────────────┐
│ ⏳ Pending Approval                  │
│ Task: Feature X                     │
│ Moving to: Dev-code-review          │
│ Agent: code-reviewer                │
├─────────────────────────────────────┤
│ [APPROVE] [REJECT] [EDIT] [DELETE]  │
└─────────────────────────────────────┘
```

---

## 5. Task Management

### 5.1 Task Properties

```json
{
  "id": "task-001",
  "project": "dll_git",
  "name": "Feature: User Authentication",
  "description": "Add comprehensive user auth system",
  "status": "InProgress",
  "stage": "Dev-code-review",
  "priority": "HIGH",
  "assigned_to": "senior-engineer",
  "created_by": "tech-lead",
  "created_at": "2026-04-06T10:30:00Z",
  "updated_at": "2026-04-06T14:45:00Z",
  "due_date": "2026-04-10",
  "labels": ["security", "backend"],
  "activity_log": [
    {
      "action": "created",
      "timestamp": "2026-04-06T10:30:00Z",
      "actor": "tech-lead"
    },
    {
      "action": "moved",
      "from_stage": "InProgress",
      "to_stage": "Dev-code-review",
      "timestamp": "2026-04-06T14:30:00Z",
      "actor": "senior-engineer"
    }
  ]
}
```

### 5.2 Task Operations

**Create:**
```
/workflow:create "Task name" \
  --project=dll_git \
  --assigned=senior-engineer \
  --priority=HIGH \
  [--description="..."] \
  [--due-date=2026-04-10]
```

**Move:**
```
/workflow:move task-001 --to=Dev-code-review
→ Opens browser approval UI if stage requires it
```

**Edit:**
```
/workflow:edit task-001
→ Opens browser edit modal
```

**Delete:**
```
/workflow:delete task-001 [--confirm]
```

**List & Filter:**
```
/workflow:list --project=dll_git [--status=InProgress] [--priority=CRITICAL]
```

**Dashboard:**
```
/workflow:dashboard --project=dll_git [--priority-filter=HIGH]
```

---

## 6. Agent Integration

### 6.1 Agent Routing Logic

**When task moves to a stage:**

```
1. Check stage config:
   - auto_invoke_agent = true/false?
   - requires_approval = true/false?
   - assigned_agent = ?

2. If auto_invoke_agent = false:
   → Show UI, wait for user action

3. If auto_invoke_agent = true AND requires_approval = true:
   → Show approval UI
   → Wait for user approval (or auto-accept if enabled)
   → Invoke agent

4. If auto_invoke_agent = true AND requires_approval = false:
   → Auto-invoke agent immediately
   → Show "Agent Working" status
```

### 6.2 Supported Agents

Default agent mappings:
- **Dev-code-review** → `code-reviewer`
- **Security-review** → `security-reviewer`
- **QA-engineer** → `qa-tester`
- **Final-review** → `tech-lead` (manual approval)

Users can map custom agents to custom stages.

### 6.3 Agent Status Handling

**Agent execution flow:**
1. Agent starts → Task shows "🔄 code-reviewer (working)"
2. Agent completes → Task updates status
3. Task auto-moves to next stage (if configured)
4. Dashboard updates in real-time

**Agent failure handling:**
- If agent fails → Task shows "❌ Agent Error"
- User can retry, edit, or move to different stage

---

## 7. Priority System

### 7.1 Priority Levels

| Level | Badge | Color | Meaning |
|-------|-------|-------|---------|
| CRITICAL | 🔴 | Red | Must start immediately |
| HIGH | 🟠 | Orange | Start soon (this week) |
| MEDIUM | 🟡 | Yellow | Normal priority (default) |
| LOW | 🔵 | Blue | When available (backlog) |

### 7.2 Impact on Workflow

- **CRITICAL tasks auto-invoke agents** (skip approval wait)
- **Tasks sorted by priority first**, then status, then created date
- **Dashboard always shows CRITICAL at top**

---

## 8. Storage

### 8.1 File-Based Storage (Default)

**Directory Structure:**
```
~/.claude/workflow-tracker/
├── config.toml              # Global settings
├── projects.json            # Project list & configs
├── tasks/
│   ├── dll_git.json        # Tasks for dll_git project
│   └── other_project.json  # Tasks for other_project
├── agent-mappings.json     # Custom agent routing
└── archive/
    ├── dll_git-archive.json # Completed tasks
    └── ...
```

**File Format (JSON):**
```json
{
  "projects": {
    "dll_git": {
      "name": "DLL Git Project",
      "template": "default",
      "stages": [...],
      "created_at": "2026-04-06"
    }
  },
  "tasks": [
    {
      "id": "task-001",
      "project": "dll_git",
      ...
    }
  ]
}
```

### 8.2 MySQL Storage

**Connection setup:**
```toml
[storage]
type = "mysql"
host = "localhost"
port = 3306
username = "workflow_user"
password = "secure_password"
database = "workflow_tracker"
```

**Auto-creates schema:**
- `projects` table
- `tasks` table
- `stages` table
- `activity_log` table

### 8.3 Storage Selection

First-run setup:
```
Choose storage type:
  [1] JSON/TOML (default, file-based)
  [2] MySQL database
```

---

## 9. API & Commands

### 9.1 Project Commands

```
/workflow:init-project <project-name> [--template=default|custom]
/workflow:list-projects
/workflow:delete-project <project-name> [--confirm]
/workflow:project-settings <project-name>
```

### 9.2 Stage Commands

```
/workflow:add-stage <project> <stage-name> [--order=<position>]
/workflow:remove-stage <project> <stage-name> [--confirm]
/workflow:reorder-stages <project> <stage1,stage2,stage3...>
/workflow:set-stage-agent <project> <stage> --agent=<agent-name>
/workflow:set-stage-approval <project> <stage> [--required=true|false]
/workflow:list-stages <project>
```

### 9.3 Task Commands

```
/workflow:create "Task name" --project=<name> [--assigned=<role>] [--priority=CRITICAL|HIGH|MEDIUM|LOW]
/workflow:list [--project=<name>] [--status=<stage>] [--priority=<level>]
/workflow:move <task-id> --to=<stage-name>
/workflow:show <task-id>
/workflow:edit <task-id>
/workflow:delete <task-id> [--confirm]
/workflow:set-priority <task-id> --priority=<level>
/workflow:approve <task-id>
/workflow:reject <task-id> [--reason="..."]
```

### 9.4 Dashboard Commands

```
/workflow:dashboard [--project=<name>] [--filter=status|priority]
/workflow:dashboard-close
/workflow:dashboard-settings
```

---

## 10. Professional Documentation

Plugin includes comprehensive documentation:

```
~/.claude/workflow-tracker/docs/
├── README.md                    # Overview & quick start
├── QUICK-START.md              # 5-minute setup guide
├── KANBAN-GUIDE.md             # Using the board
├── CUSTOM-WORKFLOWS.md         # Creating custom stages
├── AGENT-INTEGRATION.md        # Setting up agents
├── API-REFERENCE.md            # All commands
├── STORAGE-SETUP.md            # File vs MySQL
├── TROUBLESHOOTING.md          # Common issues
├── BEST-PRACTICES.md           # Recommended workflows
└── EXAMPLES/
    ├── project-setup.md        # Example project setup
    ├── custom-workflow.md      # Custom stage example
    └── agent-mapping.md        # Agent routing example
```

---

## 11. Implementation Notes

### 11.1 Technology Stack

- **Frontend:** HTML/CSS/JavaScript (browser dashboard)
- **Backend:** Node.js or Python CLI interface
- **Storage:** JSON/TOML (file) or MySQL (database)
- **Integration:** Claude Code plugin API

### 11.2 Security Considerations

- Project data isolated per workspace
- No credentials stored in task data
- Audit logs for all task changes
- Support for role-based access (future)

### 11.3 Performance

- Dashboard loads within 500ms (even with 500+ tasks)
- Drag-and-drop optimized for smooth UX
- Agent routing processed in background
- Storage queries indexed for speed

---

## 12. Success Criteria

✅ All features implemented and tested
✅ Documentation complete and reviewed
✅ Default template works out of the box
✅ Custom workflows configurable via UI
✅ Agent routing functional with approval gates
✅ Dashboard responsive and intuitive
✅ Storage abstraction supports JSON and MySQL
✅ Works across multiple projects simultaneously
✅ Professional-grade code & documentation

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-04-06 | Tech Lead | Initial specification |

---

**Approval Status:** ✅ APPROVED FOR IMPLEMENTATION
