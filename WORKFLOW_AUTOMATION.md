# Workflow Automation — Plan to Completion

Workflow-Tracker now automatically tracks your work from plan through implementation, review, and completion.

---

## 🎯 Complete Workflow

### Phase 1: Plan (In Claude Code Chat)

```
You: "Plan a new feature: payment gateway integration"
       ↓
Claude creates /plan
       ↓
Plan file generated: .claude/plans/xxx.md
       ↓
You approve the plan
```

### Phase 2: Sync Plan to Tasks (Auto or Manual)

**Option A: Auto-Sync (Recommended)**
```
Plan approved
       ↓
Auto-triggered: /sync-plan
       ↓
✓ Project created: "payment-gateway-integration"
✓ Tasks created: 12 tasks from plan steps
       ↓
All tasks in Workflow-Tracker, ready to track
```

**Option B: Manual Sync**
```
You: /sync-plan
       ↓
Project created, tasks added
```

### Phase 3: Implementation & Review

```
Claude implements code
       ↓
Moves tasks: InQueue → InProgress
       ↓
Code-Reviewer analyzes each task
       ↓
If issues found:
  → Auto-create issue task: "[code-reviewer] Missing tests"
  → Auto-create task: "[security-reviewer] Input validation"
  → Task stays in review stage
       ↓
You fix issues
       ↓
Task re-reviewed
       ↓
Score ≥ threshold?
  YES → Auto-move to next stage
  NO → Stays, shows findings
```

### Phase 4: QA Testing

```
QA tests run
       ↓
QA-Tester finds issues
       ↓
Auto-create issue tasks:
  • "[QA-tester] Missing edge case test"
  • "[QA-tester] Performance issue"
       ↓
You fix each issue
       ↓
All tasks pass review
```

### Phase 5: Completion

```
All tasks in "Completed" stage
       ↓
You: /mark-done
       ↓
✓ Project marked complete
✓ 12 tasks finished
```

### Phase 6: Resume Next Session

```
Claude Code opens (next day)
       ↓
Auto-triggered: /resume
       ↓
📊 Pending tasks:
  → 0 pending (all done!)
  → Ready for next feature
       ↓
You: "Plan next feature"
       ↓
Cycle repeats
```

---

## 📋 Slash Commands

### Sync Phase

| Command | When | What |
|---------|------|------|
| `/sync-plan` | After plan approved | Create project + tasks from plan |
| `/dashboard` | Anytime | View Kanban board |

### Implementation Phase

| Command | When | What |
|---------|------|------|
| `/task-list` | Anytime | Show all tasks |
| `/task-create` | Need to add task | Create new task |

### Review Phase

**Automatic** — No commands needed:
- Code-Reviewer analyzes → Creates issue tasks
- Security-Reviewer analyzes → Creates issue tasks
- QA-Tester analyzes → Creates issue tasks

### Completion Phase

| Command | When | What |
|---------|------|------|
| `/mark-done` | All tasks done | Mark project complete |
| `/resume` | Next session | Check pending tasks |

---

## 🔄 Automatic Issue Syncing

When agents find issues, they are **automatically added as tasks**:

### Code-Reviewer Issues
```
Code-Reviewer score: 65/100 (below threshold 70)

Findings:
  • Missing test coverage
  • Hardcoded value: port 5432
  • No error handling

Action: 3 new tasks created automatically
  • [code-reviewer] Missing test coverage
  • [code-reviewer] Remove hardcoded port 5432
  • [code-reviewer] Add error handling for network failures
```

### Security-Reviewer Issues
```
Security-Reviewer score: 72/100 (below threshold 80)

Findings:
  • Missing input validation
  • Exposed API key in logs

Action: 2 new tasks created automatically
  • [security-reviewer] Add input validation
  • [security-reviewer] Remove API key from logs
```

### QA-Tester Issues
```
QA-Tester score: 68/100 (below threshold 75)

Findings:
  • Missing edge case test
  • Race condition in async code

Action: 2 new tasks created automatically
  • [QA-tester] Add edge case test
  • [QA-tester] Fix race condition in async code
```

---

## 📊 Example: Real Workflow

### Day 1: Plan → Implement

```
Morning
You: Plan a new feature

Claude: Creates /plan
You: Approve plan

Claude: /sync-plan
→ Project "payment-gateway" created
→ 8 tasks added to Workflow-Tracker

Afternoon
Claude: Starts implementation
→ Moves tasks: InQueue → InProgress
→ Implements task 1: Database schema

Code-Reviewer analyzes
→ Score: 82/100 ✅
→ Task 1 auto-moves to Security-Review

Security-Reviewer analyzes
→ Score: 78/100 (below 80 threshold ⚠️)
→ Creates issue task: "[security-reviewer] Add password hashing"
→ Task 1 stays in Security-Review

Evening
You: Fix security issue in task 1
Claude: Task 1 re-analyzed
→ Score: 92/100 ✅
→ Auto-moves to QA-Testing
```

### Day 2: QA → Completion

```
Morning
Claude: /resume
→ Shows 1 task in QA-Testing, 5 pending

Claude: Continues from task 1 in QA
QA-Tester analyzes
→ Score: 88/100 ✅
→ Auto-moves to Completed

Claude: Continues with remaining tasks
→ Task 2, 3, 4... processed similarly

Afternoon
You: All tasks completed

You: /mark-done
→ Project marked complete
→ 8 tasks → Completed

You: Plan next feature
```

### Day 3: Resume & Continue

```
Morning
Claude Code opens

Auto-triggered: /resume
→ Check for pending work
→ Show: "All tasks completed!"
→ Ready for next feature

You: "Build API endpoints"

Claude: /sync-plan
→ New project created
→ Tasks for API endpoints added
```

---

## ⚙️ Configuration

### Enable Auto-Sync

Edit `plugin.json`:
```json
{
  "settings": {
    "autoSyncPlan": true,      // Auto-sync after plan approval
    "autoResumeOnStartup": true, // Auto-check pending on startup
    "autoCreateIssueTasks": true // Auto-create issue tasks
  }
}
```

### Review Thresholds

Edit `plugin.json` or `.env`:
```json
{
  "agents": {
    "codeReviewer": { "threshold": 70 },
    "securityReviewer": { "threshold": 80 },
    "qaTester": { "threshold": 75 }
  }
}
```

---

## 🔌 How It's Wired

### StatusHandler Integration
When agents complete review:
```javascript
// src/core/status-handler.js
if (agentResult.score < threshold) {
  // Create issue tasks
  await planSync.syncAgentIssues(projectId, agentResult, agentName);
}
```

### Automatic Issue Creation
```javascript
// src/integration/plan-sync.js
async syncAgentIssues(projectId, agentResult, agentName) {
  for (const finding of agentResult.findings) {
    // Create task for each finding
    await taskManager.create(projectId, {
      name: `[${agentName}] ${finding.type}`,
      priority: findingSeverityToPriority(finding.severity)
    });
  }
}
```

### Resume on Startup
```javascript
// Automatically called when Claude Code starts
const pending = await planSync.getPendingTasks(projectId);
if (pending.length > 0) {
  // Suggest resuming with pending tasks
  console.log('You have pending tasks to address');
}
```

---

## 📈 Workflow States

```
PLANNING
  └─→ Plan approved
      └─→ /sync-plan
          └─→ IMPLEMENTATION
              ├─ CODE REVIEW
              │  ├─ Score ≥ 70: Next stage
              │  └─ Score < 70: Create issue tasks
              │
              ├─ SECURITY REVIEW
              │  ├─ Score ≥ 80: Next stage
              │  └─ Score < 80: Create issue tasks
              │
              └─ QA TESTING
                 ├─ Score ≥ 75: Completed
                 └─ Score < 75: Create issue tasks
                    └─→ Fix issues
                        └─→ Re-review
                            └─→ Completed
```

---

## 🎯 Benefits

✅ **Zero Manual Tracking** — Issues automatically become tasks
✅ **Continuous Integration** — Review results drive task creation
✅ **Easy Resumption** — Always know what to work on next
✅ **Complete Audit Trail** — Every issue logged as task
✅ **Automated Workflow** — Plan → Implementation → Completion

---

## 🚀 Getting Started

### Step 1: Enable Auto-Sync
Edit `plugin.json`:
```json
{
  "settings": {
    "autoSyncPlan": true,
    "autoResumeOnStartup": true,
    "autoCreateIssueTasks": true
  }
}
```

### Step 2: Use Plan + Sync Workflow

```
You: "Plan a new feature"
Claude: Creates plan + /sync-plan
You: Approve
Tasks created automatically
```

### Step 3: Let It Run

```
Implementation starts
Agents review automatically
Issues become tasks automatically
You fix issues
Resume next session with pending tasks
Mark done when complete
```

---

## 📚 Documentation

- **[CLAUDE_CODE_PLUGIN.md](CLAUDE_CODE_PLUGIN.md)** — Plugin guide
- **[USER_GUIDE.md](USER_GUIDE.md)** — Feature reference
- **[API_REFERENCE.md](API_REFERENCE.md)** — API endpoints
- **[src/integration/plan-sync.js](src/integration/plan-sync.js)** — Implementation

---

**Status:** ✅ Production-ready workflow automation
**Version:** 1.0.0
**License:** MIT

---

**Summary:** From plan to completion, everything is tracked automatically. Never lose track of work again! 🚀
