# Hooks Configuration - Workflow Tracker Plugin

Automation hooks for Workflow Tracker plugin integrated with Claude Code.

## Overview

Hooks are automated actions that trigger on specific events. They enable workflow automation without manual intervention.

## Available Hooks

### 1. Pre-Commit Hook

**File:** `.git/hooks/pre-commit` (auto-installed)
**Trigger:** Before git commit
**Action:** Run linter and tests

```bash
npm run lint
npm test
```

**Install:**
```bash
npm install husky --save-dev
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm test"
```

### 2. On Task Status Change

**Event:** Task moves to new stage
**Trigger Points:**
- Task moved to stage with `auto_invoke_agent: true`
- Task moved to `Final-review` stage
- Task moved to `Completed` stage

**Potential Automations:**
- Notify relevant agent
- Update external issue tracker
- Send Slack notification
- Archive completed tasks
- Generate report

### 3. On Agent Completion

**Event:** Agent completes review/test
**Actions:**
- Update task status
- Log results in activity log
- Move to next stage (if approved)
- Return to previous stage (if rejected)
- Notify stakeholders

## Future Hook Implementation (Phase 4)

The following hooks are planned for Phase 4 (Quality & Docs):

### Dashboard Auto-Open Hook

**When:** Task assigned to current user
**Action:** Auto-open browser dashboard
**Config:**
```json
{
  "hooks": {
    "onTaskAssigned": "src/hooks/auto-open-dashboard.js"
  }
}
```

### Slack Notification Hook

**When:** Task moves through stages
**Action:** Send Slack message with task status
**Config:**
```javascript
{
  stage: 'Dev-code-review',
  hook: {
    on: 'enter',
    action: 'notify',
    channel: '#code-reviews',
    message: 'Task {{taskName}} needs code review'
  }
}
```

### Auto-Archive Hook

**When:** Task in Completed for 30 days
**Action:** Archive old completed tasks
**Config:**
```javascript
{
  hook: {
    event: 'task_completed',
    after: '30 days',
    action: 'archive'
  }
}
```

### Report Generation Hook

**When:** End of week
**Action:** Generate activity report
**Config:**
```javascript
{
  hook: {
    cron: '0 17 * * FRI', // 5pm Friday
    action: 'generate_report',
    format: 'pdf',
    to: 'team@company.com'
  }
}
```

## Current Implementation Status

**Phase 1 (Complete):**
- ✅ Git hooks: pre-commit (linter + tests)
- ✅ Task routing to agents (via AgentRouter)
- ✅ Activity logging on task changes

**Phase 2 (In Progress):**
- 🔄 Dashboard real-time updates (WebSocket)
- 🔄 Agent status notifications

**Phase 3 (Planned):**
- ⏳ Agent completion triggers
- ⏳ External service integration

**Phase 4 (Planned):**
- ⏳ Advanced automation hooks
- ⏳ Notification system
- ⏳ Report generation

## Hook Execution Order

```
Task Status Change Event
    ↓
Check hook configuration
    ↓
├─ Pre-hook (before action)
│  ├─ Validate stage transition
│  ├─ Check permissions
│  └─ Prepare environment
│
├─ Main Action
│  ├─ Update task status
│  ├─ Log activity
│  └─ Invoke agent (if needed)
│
└─ Post-hook (after action)
   ├─ Notify stakeholders
   ├─ Update external systems
   └─ Archive if needed
```

## Implementing Custom Hooks

### Create Hook File

**File:** `src/hooks/my-hook.js`

```javascript
/**
 * Custom hook for task completion
 * @param {Object} task - Task object
 * @param {Object} project - Project context
 * @param {Object} event - Hook event details
 */
async function onTaskCompleted(task, project, event) {
  console.log(`Task ${task.id} completed`);
  
  // Your automation logic here
  // Example: Send notification, update external system, etc.
  
  return {
    success: true,
    message: 'Hook executed successfully'
  };
}

module.exports = { onTaskCompleted };
```

### Register Hook

**File:** `src/hooks/registry.js`

```javascript
const hookRegistry = {
  'onTaskCompleted': require('./my-hook').onTaskCompleted,
  'onAgentInvoked': require('./agent-hook').onAgentInvoked,
  // Add custom hooks here
};

module.exports = hookRegistry;
```

### Trigger Hook

**File:** `src/core/task-manager.js`

```javascript
async moveTask(projectId, taskId, toStage) {
  const task = await this.storage.getTask(projectId, taskId);
  const updatedTask = await this.storage.updateTask(projectId, taskId, {
    stage: toStage
  });

  // Trigger hooks
  const hookRegistry = require('../hooks/registry');
  if (hookRegistry['onTaskCompleted'] && toStage === 'Completed') {
    await hookRegistry['onTaskCompleted'](updatedTask, project, {
      previousStage: task.stage,
      newStage: toStage
    });
  }

  return updatedTask;
}
```

## Environment Variables for Hooks

Configure in `.env`:

```bash
# Hook Configuration
HOOKS_ENABLED=true
HOOKS_LOG_LEVEL=info

# Slack Integration (future)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_CHANNEL=#workflow-notifications

# Email Integration (future)
SMTP_HOST=smtp.gmail.com
SMTP_USER=notifications@company.com
SMTP_PASSWORD=app_password
NOTIFICATION_EMAIL=team@company.com

# External System Integration (future)
JIRA_API_URL=https://jira.company.com
JIRA_API_TOKEN=your_token
```

## Testing Hooks

### Manual Hook Test

```bash
CLI_DEBUG=true node -e "
const hookRegistry = require('./src/hooks/registry');
const testTask = {
  id: 'test-001',
  name: 'Test Task',
  stage: 'Completed'
};
const testProject = { id: 'test-proj' };

hookRegistry['onTaskCompleted'](testTask, testProject, {
  previousStage: 'Final-review',
  newStage: 'Completed'
}).then(result => {
  console.log('Hook result:', result);
});
"
```

### Hook Unit Tests

```javascript
// tests/unit/hooks.test.js
describe('Hooks', () => {
  test('onTaskCompleted should log completion', async () => {
    const hookRegistry = require('../../src/hooks/registry');
    const result = await hookRegistry['onTaskCompleted'](mockTask, mockProject, mockEvent);
    
    expect(result.success).toBe(true);
  });
});
```

## Best Practices

### Hook Design

- **Keep hooks simple** - Complex logic belongs in managers
- **Make hooks async** - Don't block main workflow
- **Log hook execution** - For debugging and audit
- **Handle errors gracefully** - Don't crash on hook failure
- **Document hook behavior** - Explain what it does

### Performance

- **Run heavy hooks asynchronously** - Use job queue for slow operations
- **Cache frequently accessed data** - Don't fetch same data multiple times
- **Limit external API calls** - Batch requests when possible
- **Set timeouts** - Prevent infinite hook execution

### Security

- **Validate inputs** - Check event data
- **Secure credentials** - Use environment variables, not hardcoded
- **Log sensitively** - Don't log passwords or tokens
- **Limit hook access** - Only invoke from trusted sources

## Troubleshooting

### Hook Not Executing

1. Check if hooks are enabled:
```bash
echo $HOOKS_ENABLED
```

2. Verify hook is registered:
```bash
node -e "
const registry = require('./src/hooks/registry');
console.log(Object.keys(registry));
"
```

3. Check for errors:
```bash
CLI_DEBUG=true <command>
```

### Hook Execution Slow

1. Check for blocking operations:
   - Remove synchronous I/O
   - Use async/await
   - Run heavy operations in background

2. Add performance logging:
```javascript
const start = Date.now();
// ... hook code ...
console.log(`Hook took ${Date.now() - start}ms`);
```

## Related Documentation

- **README.md** - User guide and quick start
- **CLAUDE.md** - Development guidelines
- **AGENTS.md** - Agent workflow and routing
- **IMPLEMENTATION_PLAN.md** - Phase 4 includes advanced hooks

---

**Status:** Phase 1-2 Basic Hooks, Phase 4 Advanced Hooks
**Last Updated:** 2026-04-06
**Framework:** Ready for custom implementation
