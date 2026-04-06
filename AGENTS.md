# Agent Definitions - Workflow Tracker Plugin

This document defines the agents that handle tasks in the Workflow Tracker workflow and their responsibilities.

## Agent Roles in Default Workflow

```
InQueue (No Agent)
    ↓ [Human assigns work]
InProgress (No Agent)
    ↓ [Human moves to Dev-code-review]
Dev-code-review → code-reviewer agent
    ↓ [Reviews code, approves/rejects]
Security-review → security-reviewer agent
    ↓ [Reviews security, approves/rejects]
QA-engineer → qa-tester agent
    ↓ [Runs QA tests, approves/rejects]
Final-review (Human/Tech-lead)
    ↓ [Final approval before deployment]
Completed (Archive)
```

## Core Agents

### 1. code-reviewer Agent

**Stage:** `Dev-code-review`
**Responsibility:** Automated code review and quality checks
**Trigger:** Auto-invoked when task moves to Dev-code-review stage
**Approval:** Requires human approval before proceeding

**What it does:**
- Reviews code against CLAUDE.md standards
- Checks for:
  - Code style and formatting
  - Test coverage
  - Documentation completeness
  - SOLID principle violations
  - Performance issues
  - Security concerns

**Output:**
- Pass: Task auto-moves to Security-review
- Fail: Task returns to InProgress with feedback
- Request Changes: Task waits for code update

**Configuration:**
```javascript
{
  stage: 'Dev-code-review',
  agent: 'code-reviewer',
  auto_invoke_agent: true,
  requires_approval: true
}
```

### 2. security-reviewer Agent

**Stage:** `Security-review`
**Responsibility:** Security assessment and vulnerability scanning
**Trigger:** Auto-invoked when task moves to Security-review stage
**Approval:** Requires human approval before proceeding

**What it does:**
- Runs security checks:
  - Dependency vulnerability scan (npm audit)
  - OWASP top 10 checks
  - Authentication/authorization review
  - Data exposure risks
  - SQL injection prevention
  - XSS prevention

**Output:**
- Pass: Task auto-moves to QA-engineer
- Fail: Task returns with security findings
- Risk Accepted: Option to proceed with documented risk

**Configuration:**
```javascript
{
  stage: 'Security-review',
  agent: 'security-reviewer',
  auto_invoke_agent: true,
  requires_approval: true
}
```

### 3. qa-tester Agent

**Stage:** `QA-engineer`
**Responsibility:** Quality assurance testing
**Trigger:** Manual invocation (not auto-invoked)
**Approval:** QA engineer reviews results

**What it does:**
- Runs QA test suite:
  - Unit test execution
  - Integration test execution
  - End-to-end test execution
  - Coverage verification
  - Performance benchmarks

**Output:**
- All Pass: Task moves to Final-review
- Some Fail: Task returns with test failures
- Coverage Low: Task requires more tests

**Configuration:**
```javascript
{
  stage: 'QA-engineer',
  agent: 'qa-tester',
  auto_invoke_agent: false,
  requires_approval: true
}
```

## Special Cases

### CRITICAL Priority Tasks

**Behavior:** Bypass approval gates, auto-proceed

When a task has priority `CRITICAL`:
- Approval gates are skipped
- Agents still execute (code-reviewer, security-reviewer)
- Results are logged but don't block
- Task progresses regardless of findings
- Risk is documented in activity log

**When to use CRITICAL:**
- Production hotfixes
- Security patches
- Critical bug fixes
- Urgent feature deadlines

**Example:**
```bash
workflow task create "HOTFIX: Security vulnerability" \
  --project=my-project \
  --priority=CRITICAL \
  --assigned=senior-engineer
# This will auto-approve through all stages
```

## Custom Agents

### Adding a Custom Agent

Define in project workflow:

```javascript
// Add custom stage with custom agent
await projectManager.addStage('my-project', 'Design-Review', 2);

// Configure agent routing
const project = await projectManager.get('my-project');
const designStage = project.stages.find(s => s.name === 'Design-Review');
designStage.auto_invoke_agent = true;
designStage.agent = 'design-reviewer'; // Custom agent
designStage.requires_approval = true;

await projectManager.updateStages('my-project', project.stages);
```

### Implementing a Custom Agent

1. **Create agent handler** in `src/agent/handlers/`:

```javascript
// src/agent/handlers/design-reviewer.js
class DesignReviewerAgent {
  async review(task, project) {
    // Implement design review logic
    return {
      status: 'approved', // or 'rejected' or 'changes_requested'
      findings: [],
      recommendations: []
    };
  }
}

module.exports = DesignReviewerAgent;
```

2. **Register in agent router** (`src/agent/invoker.js`):

```javascript
const agentMap = {
  'code-reviewer': CodeReviewerAgent,
  'security-reviewer': SecurityReviewerAgent,
  'qa-tester': QATesterAgent,
  'design-reviewer': DesignReviewerAgent // Add custom
};
```

3. **Configure in project workflow**:

```javascript
await projectManager.addStage('proj', 'Design-Review', 2);
// Update stage config with agent mapping
```

## Agent Invocation Flow

```
Task moves to stage
    ↓
Check stage configuration
    ↓
    ├─ auto_invoke_agent = true
    │  ├─ requires_approval = true
    │  │  └─ CRITICAL priority?
    │  │     ├─ YES → Skip approval, invoke agent
    │  │     └─ NO → Show approval UI, wait for user
    │  └─ requires_approval = false
    │     └─ Invoke agent immediately
    │
    └─ auto_invoke_agent = false
       └─ Wait for manual trigger
          (agent shows as available but not auto-invoked)

Agent executes
    ↓
Update task status with results
    ↓
Auto-move to next stage (if approved)
    OR
Return to previous stage (if rejected)
    OR
Wait for user action (if changes requested)
```

## Agent Status Tracking

Each task maintains agent activity log:

```javascript
{
  id: 'task-001',
  // ... other fields
  activity_log: [
    {
      action: 'created',
      timestamp: '2026-04-06T10:00:00Z',
      actor: 'senior-engineer'
    },
    {
      action: 'moved',
      from_stage: 'InProgress',
      to_stage: 'Dev-code-review',
      timestamp: '2026-04-06T10:15:00Z',
      actor: 'senior-engineer'
    },
    {
      action: 'agent_invoked',
      agent: 'code-reviewer',
      timestamp: '2026-04-06T10:15:30Z',
      status: 'RUNNING'
    },
    {
      action: 'agent_completed',
      agent: 'code-reviewer',
      result: 'passed',
      findings: ['Test coverage could be higher'],
      timestamp: '2026-04-06T10:20:00Z'
    }
  ]
}
```

## Best Practices

### Approval Gate Strategy

**For PUBLIC/USER-FACING features:**
- ✅ Enable approval at Dev-code-review
- ✅ Enable approval at Security-review
- ✅ Enable approval at QA-engineer
- ✅ Human sign-off at Final-review

**For INTERNAL/INFRASTRUCTURE features:**
- ✅ Enable approval at Dev-code-review
- ⚠️ Optional approval at Security-review (if needed)
- ⚠️ Optional approval at QA-engineer
- ✅ Human sign-off at Final-review

**For HOTFIXES:**
- ✅ Mark as CRITICAL
- ✅ Skip approval gates
- ✅ Log security review findings but don't block
- ✅ Require QA verification post-deployment

### When to Use Agents

**Use code-reviewer for:**
- New feature code
- Bug fixes
- Refactoring
- Library updates

**Use security-reviewer for:**
- Dependencies changes
- Authentication changes
- Database schema changes
- Secrets/keys handling
- Public API changes

**Use qa-tester for:**
- All code changes pre-deployment
- Database migrations
- Configuration changes
- Release candidates

## Agent API (Phase 3)

When agents are implemented, they'll follow this API:

```javascript
class AgentBase {
  /**
   * Review/test the task
   * @param {Object} task - Task to review
   * @param {Object} project - Project context
   * @param {Object} options - Agent-specific options
   * @returns {Promise<AgentResult>}
   */
  async execute(task, project, options = {}) {
    // Implementation
  }
}

/**
 * Agent execution result
 * @typedef {Object} AgentResult
 * @property {string} status - 'approved', 'rejected', 'changes_requested'
 * @property {Array<string>} findings - Issues found
 * @property {Array<string>} recommendations - Suggestions
 * @property {number} severity - 0-10 severity score (0 = info, 10 = critical)
 */
```

## Troubleshooting

### Agent Not Invoking

1. Check stage configuration:
```bash
node -e "
const pm = new ProjectManager(storage);
const proj = pm.get('my-project');
const stage = proj.stages.find(s => s.name === 'Dev-code-review');
console.log('auto_invoke_agent:', stage.auto_invoke_agent);
console.log('agent:', stage.agent);
"
```

2. Verify agent is registered:
```bash
node -e "
const agentMap = require('./src/agent/invoker');
console.log('Available agents:', Object.keys(agentMap));
"
```

3. Check approval requirement for CRITICAL:
```bash
# CRITICAL tasks should skip approval
workflow task create "Test" --project=proj --priority=CRITICAL
# Should immediately invoke agent without approval
```

### Agent Failing

1. Check task activity log:
```bash
workflow task show task-001 --project=my-project
# Look for agent_completed with status and findings
```

2. Review agent logs:
```bash
CLI_DEBUG=true workflow task move task-001 --to=Dev-code-review --project=my-project
```

## Related Documentation

- **README.md** - User guide and quick start
- **CLAUDE.md** - Development guidelines
- **SPEC.md** - Architecture and design
- **IMPLEMENTATION_PLAN.md** - Development roadmap (Phase 3 covers agents)

---

**Status:** Phase 1 Complete, Phase 3 (Agent Implementation) Coming
**Last Updated:** 2026-04-06
**Agent Framework:** Designed, Implementation in Phase 3
