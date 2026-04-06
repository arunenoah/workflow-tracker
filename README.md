# Workflow Tracker Plugin

A professional-grade multi-project task management plugin for Claude Code with customizable Kanban workflows, browser dashboard, and automatic agent routing.

## Overview

Workflow Tracker enables seamless task progression through configurable workflow stages with intelligent approval gates and automatic agent invocation. Perfect for managing complex development workflows across multiple projects.

## Quick Start

### Installation

```bash
cd ~/.claude/workflow-tracker
npm install
```

### First Use

```bash
# Create a project
node src/cli/index.js project create my-project "My Project"

# Create a task
node src/cli/index.js task create "Feature: User Auth" \
  --project=my-project \
  --priority=HIGH \
  --assigned="senior-engineer"

# List tasks
node src/cli/index.js task list --project=my-project

# Open dashboard
node src/cli/index.js dashboard --project=my-project
```

## Features

### ✅ Phase 1: Core CLI & Storage (COMPLETE)
- **CLI Commands**: Create, list, move, delete tasks and projects
- **Flexible Storage**: JSON/TOML files or MySQL database
- **Task Management**: Full CRUD with priority ordering and activity logs
- **Project Management**: Custom workflow stages per project
- **Agent Routing**: Intelligent routing with approval gates
- **Priority System**: CRITICAL, HIGH, MEDIUM, LOW with auto-approve for CRITICAL

### 🔨 Phase 2: Dashboard UI (IN PROGRESS)
- **Kanban Board**: Drag-and-drop task cards
- **Real-time Updates**: WebSocket synchronization
- **Stage Configuration**: Add/remove/reorder workflow stages
- **Task Details**: Expanded view with full history

### 🔄 Phase 3: Agent Integration (PLANNED)
- **code-reviewer Agent**: Automatic code review routing
- **security-reviewer Agent**: Security assessment
- **qa-tester Agent**: QA testing coordination

### 📚 Phase 4: Quality & Documentation (PLANNED)
- **Comprehensive Tests**: 80%+ coverage
- **Professional Docs**: Setup guides, API reference, examples
- **User Guide**: Workflow best practices

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

## Documentation

- **SPEC.md** - Complete architecture and design
- **IMPLEMENTATION_PLAN.md** - Development roadmap with task breakdowns
- **CLAUDE.md** - Development guidelines and conventions
- **AGENTS.md** - Agent definitions and roles
- **docs/** - User guides, examples, troubleshooting

## Roadmap

### Phase 2: Dashboard UI (Tasks 7-12)
- [ ] Kanban board with drag-and-drop
- [ ] Real-time WebSocket updates
- [ ] Stage configuration UI
- [ ] Task details panel
- [ ] Responsive design

### Phase 3: Agent Integration (Tasks 13-16)
- [ ] code-reviewer agent routing
- [ ] security-reviewer agent routing
- [ ] qa-tester agent routing
- [ ] Status update handlers

### Phase 4: Quality & Docs (Tasks 17-20)
- [ ] 80%+ test coverage
- [ ] Integration tests
- [ ] User documentation
- [ ] Examples and templates

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

---

**Status:** Phase 1 Complete (6/20 tasks) | Phase 2 In Progress
**Last Updated:** 2026-04-06
**Maintainer:** Technical Architecture Team
