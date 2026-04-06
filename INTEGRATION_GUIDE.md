# Integration Guide — Using Workflow-Tracker in Your Project

How to integrate Workflow-Tracker into your existing application to manage tasks and automate reviews.

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/workflow-tracker.git
cd workflow-tracker

npm install
```

### 2. Choose Storage Backend

#### Option A: File-Based Storage (Development/Testing)

Default configuration. No setup needed.

```javascript
const FileBackend = require('./src/storage/file-backend');
const storage = new FileBackend('./data');
await storage.initialize();
```

Data stored in `./data/` directory.

#### Option B: MySQL Backend (Production)

Create `.env` file:

```env
DATABASE_HOST=localhost
DATABASE_USER=workflow_user
DATABASE_PASSWORD=secure_password
DATABASE_NAME=workflow_tracker
DATABASE_PORT=3306
```

```javascript
const MySQLBackend = require('./src/storage/mysql-backend');
const storage = new MySQLBackend({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});
await storage.initialize();
```

---

## Starting the Server

### Standalone Mode

```javascript
// server.js
const FileBackend = require('./src/storage/file-backend');
const TaskManager = require('./src/core/task-manager');
const ProjectManager = require('./src/core/project-manager');
const DashboardServer = require('./src/dashboard/server');

(async () => {
  // Initialize storage
  const storage = new FileBackend('./data');
  await storage.initialize();

  // Create managers
  const taskManager = new TaskManager(storage);
  const projectManager = new ProjectManager(storage);

  // Start server
  const server = new DashboardServer(storage, taskManager, projectManager);
  await server.start(3000);

  console.log('✓ Dashboard: http://localhost:3000');
  console.log('✓ API: http://localhost:3000/api');
  console.log('✓ WebSocket: ws://localhost:3000');
})();
```

Run: `node server.js`

### Embedded in Existing Express App

```javascript
// app.js (your existing Express app)
const express = require('express');
const DashboardServer = require('./workflow-tracker/src/dashboard/server');
const FileBackend = require('./workflow-tracker/src/storage/file-backend');
const TaskManager = require('./workflow-tracker/src/core/task-manager');
const ProjectManager = require('./workflow-tracker/src/core/project-manager');

const app = express();

// Your existing routes
app.get('/api/users', (req, res) => { /* ... */ });

// Initialize workflow-tracker
(async () => {
  const storage = new FileBackend('./workflow-data');
  await storage.initialize();
  
  const taskManager = new TaskManager(storage);
  const projectManager = new ProjectManager(storage);
  const server = new DashboardServer(storage, taskManager, projectManager);
  
  // Mount workflow-tracker routes on your Express app
  const dashboardRoutes = require('./workflow-tracker/src/dashboard/routes/api');
  app.use('/api/workflow', dashboardRoutes(
    taskManager, 
    projectManager, 
    null, // agentRouter (optional)
    (msg) => {} // broadcast (optional)
  ));
  
  // Start server
  app.listen(3000, () => {
    console.log('App with Workflow-Tracker running on :3000');
  });
})();
```

---

## API Integration

### RESTful API Endpoints

All endpoints prefixed with `/api/`

#### Projects

```bash
# List all projects
GET /projects

# Get project details
GET /projects/:projectId

# Create project
POST /projects
Body: { "name": "Q2 Features", "description": "..." }

# Update project
PUT /projects/:projectId
Body: { "name": "Updated name" }

# Delete project
DELETE /projects/:projectId
```

#### Tasks

```bash
# List tasks in project
GET /projects/:projectId/tasks
Query: ?priority=HIGH&stage=InProgress&assigned_to=user1

# Get task details
GET /projects/:projectId/tasks/:taskId

# Create task
POST /projects/:projectId/tasks
Body: {
  "name": "Implement auth",
  "description": "...",
  "priority": "HIGH",
  "assigned_to": "user1",
  "due_date": "2026-04-30"
}

# Update task
PUT /projects/:projectId/tasks/:taskId
Body: { "name": "Updated title", "priority": "CRITICAL" }

# Delete task
DELETE /projects/:projectId/tasks/:taskId

# Move task to stage
POST /projects/:projectId/tasks/:taskId/move
Body: { "to_stage": "InProgress" }

# Approve task
POST /projects/:projectId/tasks/:taskId/approve

# Reject task
POST /projects/:projectId/tasks/:taskId/reject
Body: { "reason": "Needs more tests" }
```

#### Stages

```bash
# Create custom stage
POST /projects/:projectId/stages
Body: {
  "name": "Deployment",
  "order": 7,
  "auto_invoke_agent": "qa-tester"
}

# Reorder stages
PUT /projects/:projectId/stages/reorder
Body: {
  "stages": [
    { "name": "InQueue", "order": 1 },
    { "name": "InProgress", "order": 2 },
    { "name": "Testing", "order": 3 }
  ]
}

# Update stage
PUT /projects/:projectId/stages/:stageName
Body: { "auto_invoke_agent": "code-reviewer" }

# Delete stage
DELETE /projects/:projectId/stages/:stageName
```

---

## WebSocket Real-Time Events

Subscribe to live updates:

```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000');

ws.on('message', (data) => {
  const { type, payload } = JSON.parse(data);
  
  switch(type) {
    case 'task-created':
      console.log('New task:', payload.task);
      // Update your UI
      break;
      
    case 'task-updated':
      console.log('Task updated:', payload.task);
      break;
      
    case 'task-moved':
      console.log('Task moved to:', payload.task.stage);
      break;
      
    case 'task-deleted':
      console.log('Task deleted:', payload.taskId);
      break;
  }
});

ws.on('error', (err) => {
  console.error('WebSocket error:', err);
});
```

---

## Using in Node.js/Backend Applications

### Creating Tasks Programmatically

```javascript
const TaskManager = require('./src/core/task-manager');
const storage = new FileBackend('./data');

const taskManager = new TaskManager(storage);

// Create task
const task = await taskManager.create('my-project', {
  name: 'Generate quarterly report',
  description: 'Create summary of Q1 achievements',
  priority: 'HIGH',
  assigned_to: 'john@example.com',
  due_date: '2026-04-15'
});

console.log('Created task:', task.id, task.name);
```

### Querying Tasks

```javascript
// Get all tasks in project
const tasks = await taskManager.list('my-project');

// Get task by ID
const task = await taskManager.get('my-project', 'task-123');

// Get tasks by stage
const inProgress = tasks.filter(t => t.stage === 'InProgress');

// Get high-priority tasks
const urgent = tasks.filter(t => t.priority === 'CRITICAL');
```

### Updating Tasks

```javascript
// Update task
await taskManager.update('my-project', 'task-123', {
  name: 'Updated name',
  priority: 'MEDIUM',
  stage: 'InProgress',
  assigned_to: 'jane@example.com'
});

// Move task
await taskManager.moveTask('my-project', 'task-123', 'Code-Review');

// Delete task
await taskManager.delete('my-project', 'task-123');
```

### Accessing Activity Logs

```javascript
const task = await taskManager.get('my-project', 'task-123');

// View all changes
task.activity_log.forEach(entry => {
  console.log(`${entry.timestamp}: ${entry.action}`);
  console.log(`  Changed: ${Object.keys(entry.changes).join(', ')}`);
});

// Output:
// 2026-04-06T10:00:00Z: task-created
//   Changed: name, priority
// 2026-04-06T10:15:00Z: task-moved
//   Changed: stage
// 2026-04-06T14:30:00Z: agent-analysis
//   Changed: agent_score, agent_findings
```

---

## Integrating with External Systems

### Triggering Workflow-Tracker from GitHub

```javascript
// Webhook endpoint
app.post('/webhooks/github', express.json(), async (req, res) => {
  const { action, issue, pull_request } = req.body;
  
  if (action === 'opened' && pull_request) {
    // Create task from PR
    await taskManager.create('my-project', {
      name: `Review PR: ${pull_request.title}`,
      description: pull_request.body,
      priority: 'HIGH',
      stage: 'Code-Review',
      external_id: pull_request.id
    });
  }
  
  res.json({ ok: true });
});
```

### Triggering Workflow-Tracker from Slack

```javascript
// Slack slash command
app.post('/commands/task', express.urlencoded({ extended: true }), async (req, res) => {
  const { text, user_id, team_id } = req.body;
  
  const task = await taskManager.create('slack-tasks', {
    name: text,
    priority: 'MEDIUM',
    assigned_to: user_id,
    source: 'slack'
  });
  
  res.json({
    response_type: 'in_channel',
    text: `✓ Task created: ${task.name}`
  });
});
```

### Sending Slack Notifications from Workflow-Tracker

```javascript
const { IncomingWebhook } = require('@slack/webhook');

const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

// Listen to WebSocket events
ws.on('message', async (data) => {
  const { type, payload } = JSON.parse(data);
  
  if (type === 'task-moved' && payload.task.stage === 'Code-Review') {
    await webhook.send({
      text: `🔍 Task moved to Code Review`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${payload.task.name}*\n${payload.task.description.substring(0, 100)}...`
          }
        }
      ]
    });
  }
});
```

---

## Configuration

### Environment Variables

Create `.env` file in project root:

```env
# Server
PORT=3000
NODE_ENV=production

# Storage
STORAGE_TYPE=file                    # or 'mysql'
DATABASE_HOST=localhost
DATABASE_USER=workflow_user
DATABASE_PASSWORD=secret
DATABASE_NAME=workflow_tracker

# Agent Thresholds (0-100)
AGENT_CODE_REVIEWER_THRESHOLD=70
AGENT_SECURITY_REVIEWER_THRESHOLD=80
AGENT_QA_TESTER_THRESHOLD=75

# Auto-approval for critical tasks
AUTO_APPROVE_CRITICAL=true
```

### Custom Workflow Stages

Define custom stages by modifying project configuration:

```javascript
const project = await projectManager.create('my-project', {
  name: 'Custom Workflow',
  stages: [
    { name: 'Backlog', order: 1 },
    { name: 'Ready', order: 2 },
    { name: 'Development', order: 3, auto_invoke_agent: 'code-reviewer' },
    { name: 'Testing', order: 4, auto_invoke_agent: 'qa-tester' },
    { name: 'Staging', order: 5 },
    { name: 'Production', order: 6 },
    { name: 'Done', order: 7 }
  ]
});
```

---

## Error Handling

### Common Error Scenarios

```javascript
try {
  const task = await taskManager.get('my-project', 'invalid-id');
} catch (err) {
  if (err.message.includes('not found')) {
    console.error('Task does not exist');
  }
}

try {
  await taskManager.moveTask('my-project', 'task-123', 'NonExistentStage');
} catch (err) {
  if (err.message.includes('Stage not found')) {
    console.error('Target stage does not exist');
  }
}

try {
  const project = await projectManager.get('nonexistent');
} catch (err) {
  if (err.message.includes('Project not found')) {
    console.error('Project does not exist');
  }
}
```

---

## Testing Integration

```javascript
// test/integration.test.js
const TaskManager = require('../src/core/task-manager');
const FileBackend = require('../src/storage/file-backend');

describe('Workflow-Tracker Integration', () => {
  let taskManager, storage;

  beforeEach(async () => {
    storage = new FileBackend('./test-data');
    await storage.initialize();
    taskManager = new TaskManager(storage);
  });

  test('should create and retrieve task', async () => {
    const task = await taskManager.create('test-project', {
      name: 'Test task',
      priority: 'HIGH'
    });

    const retrieved = await taskManager.get('test-project', task.id);
    expect(retrieved.name).toBe('Test task');
  });

  test('should move task between stages', async () => {
    const task = await taskManager.create('test-project', {
      name: 'Test task'
    });

    await taskManager.moveTask('test-project', task.id, 'InProgress');
    const updated = await taskManager.get('test-project', task.id);
    
    expect(updated.stage).toBe('InProgress');
  });
});
```

Run tests: `npm test`

---

## Performance Considerations

### Indexing for MySQL Backend

Create these indexes for optimal query performance:

```sql
CREATE INDEX idx_project_id ON tasks(project_id);
CREATE INDEX idx_stage ON tasks(stage);
CREATE INDEX idx_priority ON tasks(priority);
CREATE INDEX idx_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_created_at ON tasks(created_at DESC);
```

### Caching Recommendations

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

// Cache project data
const getCachedProject = async (projectId) => {
  const cached = cache.get(`project:${projectId}`);
  if (cached) return cached;
  
  const project = await projectManager.get(projectId);
  cache.set(`project:${projectId}`, project);
  return project;
};
```

---

## Next Steps

1. Start the server: `npm start`
2. Open dashboard: http://localhost:3000
3. Create a project and add tasks
4. Integrate with your API
5. Set up WebSocket listeners for real-time updates
6. Configure custom workflow stages

See **USER_GUIDE.md** for dashboard usage instructions.

