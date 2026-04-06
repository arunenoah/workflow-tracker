# API Reference — Complete Endpoint Documentation

All REST API endpoints for the Workflow-Tracker system.

**Base URL:** `http://localhost:3000/api`

---

## Table of Contents

1. [Projects](#projects)
2. [Tasks](#tasks)
3. [Task Actions](#task-actions)
4. [Stages](#stages)
5. [Response Format](#response-format)
6. [Error Handling](#error-handling)
7. [Examples](#examples)

---

## Projects

### List All Projects

**GET** `/projects`

Returns all projects.

**Response:**
```json
[
  {
    "id": "my-project",
    "name": "My First Project",
    "description": "Testing Workflow-Tracker",
    "created_at": "2026-04-06T10:00:00Z",
    "updated_at": "2026-04-06T10:00:00Z",
    "task_count": 3,
    "stages": [
      { "name": "InQueue", "order": 1, "auto_invoke_agent": null },
      { "name": "InProgress", "order": 2, "auto_invoke_agent": null },
      { "name": "Code-Review", "order": 3, "auto_invoke_agent": "code-reviewer" }
    ]
  }
]
```

**Status Code:** `200 OK`

---

### Get Project Details

**GET** `/projects/:projectId`

Get a specific project including all stages.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| projectId | string | yes | Project ID |

**Response:**
```json
{
  "id": "my-project",
  "name": "My First Project",
  "description": "Testing Workflow-Tracker",
  "stages": [
    {
      "name": "InQueue",
      "order": 1,
      "auto_invoke_agent": null,
      "requires_approval": false
    },
    {
      "name": "Code-Review",
      "order": 3,
      "auto_invoke_agent": "code-reviewer",
      "requires_approval": true
    }
  ],
  "created_at": "2026-04-06T10:00:00Z",
  "task_count": 5
}
```

**Status Code:** `200 OK`

**Error:** `404 Not Found` if project doesn't exist

---

### Create Project

**POST** `/projects`

Create a new project.

**Request Body:**
```json
{
  "name": "Q2 Development",
  "description": "All features for Q2 2026"
}
```

**Response:**
```json
{
  "id": "q2-development",
  "name": "Q2 Development",
  "description": "All features for Q2 2026",
  "stages": [
    { "name": "InQueue", "order": 1, "auto_invoke_agent": null },
    { "name": "InProgress", "order": 2, "auto_invoke_agent": null },
    { "name": "Code-Review", "order": 3, "auto_invoke_agent": "code-reviewer" },
    { "name": "Security-Review", "order": 4, "auto_invoke_agent": "security-reviewer" },
    { "name": "QA-Testing", "order": 5, "auto_invoke_agent": "qa-tester" },
    { "name": "Completed", "order": 6, "auto_invoke_agent": null }
  ],
  "created_at": "2026-04-06T11:00:00Z"
}
```

**Status Code:** `201 Created`

**Validation Errors:**
- `400 Bad Request` — Missing or invalid fields
- `409 Conflict` — Project ID already exists

---

### Update Project

**PUT** `/projects/:projectId`

Update project details.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| projectId | string | yes | Project ID to update |

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

**Response:** Updated project object

**Status Code:** `200 OK`

---

### Delete Project

**DELETE** `/projects/:projectId`

Delete a project and all its tasks.

**Warning:** This operation cannot be undone.

**Status Code:** `204 No Content`

---

## Tasks

### List Project Tasks

**GET** `/projects/:projectId/tasks`

Get all tasks in a project with optional filtering.

**Parameters:**
| Name | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| projectId | string | yes | Project ID | my-project |
| stage | string | no | Filter by stage | InProgress |
| priority | string | no | Filter by priority | HIGH, CRITICAL |
| assigned_to | string | no | Filter by assignee | user@example.com |

**Examples:**
```bash
# Get all tasks
GET /projects/my-project/tasks

# Get only in-progress tasks
GET /projects/my-project/tasks?stage=InProgress

# Get high-priority tasks
GET /projects/my-project/tasks?priority=HIGH

# Get tasks assigned to specific user
GET /projects/my-project/tasks?assigned_to=john@example.com

# Multiple filters
GET /projects/my-project/tasks?stage=Code-Review&priority=CRITICAL
```

**Response:**
```json
[
  {
    "id": "task-123",
    "project_id": "my-project",
    "name": "Implement user login",
    "description": "Add JWT authentication...",
    "priority": "HIGH",
    "stage": "Code-Review",
    "assigned_to": "john@example.com",
    "due_date": "2026-04-30",
    "created_at": "2026-04-06T10:00:00Z",
    "updated_at": "2026-04-06T14:30:00Z",
    "approval_status": "pending",
    "agent_score": 82,
    "agent_findings": [],
    "agent_summary": "Well-structured implementation"
  }
]
```

**Status Code:** `200 OK`

---

### Get Task Details

**GET** `/projects/:projectId/tasks/:taskId`

Get complete task information including activity log.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| projectId | string | yes | Project ID |
| taskId | string | yes | Task ID |

**Response:**
```json
{
  "id": "task-123",
  "project_id": "my-project",
  "name": "Implement user login",
  "description": "Add JWT authentication with refresh tokens\n- Use bcrypt for password hashing\n- Generate 7-day JWT tokens",
  "priority": "HIGH",
  "stage": "Code-Review",
  "assigned_to": "john@example.com",
  "due_date": "2026-04-30",
  "created_at": "2026-04-06T10:00:00Z",
  "updated_at": "2026-04-06T14:30:00Z",
  "approval_status": "pending",
  "agent_score": 82,
  "agent_findings": [],
  "agent_summary": "Well-structured with good requirements",
  "activity_log": [
    {
      "timestamp": "2026-04-06T10:00:00Z",
      "action": "task-created",
      "changes": {
        "name": "Implement user login",
        "priority": "HIGH"
      }
    },
    {
      "timestamp": "2026-04-06T12:00:00Z",
      "action": "task-moved",
      "changes": {
        "stage": ["InQueue", "Code-Review"]
      }
    },
    {
      "timestamp": "2026-04-06T12:05:00Z",
      "action": "agent-analysis",
      "changes": {
        "agent_score": 82,
        "approval_status": "pending"
      }
    }
  ]
}
```

**Status Code:** `200 OK`

**Error:** `404 Not Found` if task doesn't exist

---

### Create Task

**POST** `/projects/:projectId/tasks`

Create a new task in a project.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| projectId | string | yes | Project ID |

**Request Body:**
```json
{
  "name": "Implement user login",
  "description": "Add JWT authentication with refresh tokens\n- Use bcrypt for password hashing\n- Generate 7-day JWT tokens",
  "priority": "HIGH",
  "assigned_to": "john@example.com",
  "due_date": "2026-04-30",
  "stage": "InQueue"
}
```

**Field Details:**
| Field | Type | Required | Values |
|-------|------|----------|--------|
| name | string | yes | Task title |
| description | string | yes | Task details and requirements |
| priority | string | no | CRITICAL, HIGH, MEDIUM, LOW (default: MEDIUM) |
| assigned_to | string | no | Email or username |
| due_date | string | no | ISO date format (YYYY-MM-DD) |
| stage | string | no | Any valid stage (default: InQueue) |

**Response:**
```json
{
  "id": "task-new-123",
  "project_id": "my-project",
  "name": "Implement user login",
  "description": "...",
  "priority": "HIGH",
  "stage": "InQueue",
  "assigned_to": "john@example.com",
  "due_date": "2026-04-30",
  "created_at": "2026-04-06T10:00:00Z",
  "updated_at": "2026-04-06T10:00:00Z"
}
```

**Status Code:** `201 Created`

**Validation Errors:**
- `400 Bad Request` — Missing required fields
- `404 Not Found` — Invalid project or stage

---

### Update Task

**PUT** `/projects/:projectId/tasks/:taskId`

Update task details.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| projectId | string | yes | Project ID |
| taskId | string | yes | Task ID |

**Request Body:**
```json
{
  "name": "Updated task title",
  "description": "Updated description",
  "priority": "CRITICAL",
  "assigned_to": "jane@example.com",
  "due_date": "2026-05-15"
}
```

**Response:** Updated task object

**Status Code:** `200 OK`

---

### Delete Task

**DELETE** `/projects/:projectId/tasks/:taskId`

Delete a task.

**Status Code:** `204 No Content`

---

## Task Actions

### Move Task to Stage

**POST** `/projects/:projectId/tasks/:taskId/move`

Move a task to a different stage. If the stage auto-invokes an agent, analysis will begin.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| projectId | string | yes | Project ID |
| taskId | string | yes | Task ID |

**Request Body:**
```json
{
  "to_stage": "Code-Review"
}
```

**Response:**
```json
{
  "id": "task-123",
  "stage": "Code-Review",
  "approval_status": "pending",
  "updated_at": "2026-04-06T14:00:00Z"
}
```

**Status Code:** `200 OK`

**Real-Time Event:** WebSocket broadcasts `task-moved` event

---

### Approve Task

**POST** `/projects/:projectId/tasks/:taskId/approve`

Approve a task under review and move to next stage.

**Request Body (optional):**
```json
{
  "reason": "Approved despite findings - legacy system compatibility required"
}
```

**Response:**
```json
{
  "id": "task-123",
  "approval_status": "approved",
  "stage": "Security-Review",
  "updated_at": "2026-04-06T14:00:00Z"
}
```

**Status Code:** `200 OK`

---

### Reject Task

**POST** `/projects/:projectId/tasks/:taskId/reject`

Reject a task and keep it in current stage.

**Request Body:**
```json
{
  "reason": "Needs more comprehensive error handling"
}
```

**Response:**
```json
{
  "id": "task-123",
  "approval_status": "rejected",
  "stage": "Code-Review",
  "agent_findings": [
    {
      "type": "missing-error-handling",
      "severity": "HIGH",
      "message": "No error handling for network failures"
    }
  ],
  "updated_at": "2026-04-06T14:00:00Z"
}
```

**Status Code:** `200 OK`

---

## Stages

### Get Stages for Project

**GET** `/projects/:projectId/stages`

Get all stages configured for a project.

**Response:**
```json
[
  {
    "name": "InQueue",
    "order": 1,
    "auto_invoke_agent": null,
    "requires_approval": false
  },
  {
    "name": "Code-Review",
    "order": 3,
    "auto_invoke_agent": "code-reviewer",
    "requires_approval": true,
    "approval_threshold": 70
  }
]
```

**Status Code:** `200 OK`

---

### Create Stage

**POST** `/projects/:projectId/stages`

Add a new stage to the workflow.

**Request Body:**
```json
{
  "name": "Design Review",
  "order": 2,
  "auto_invoke_agent": "security-reviewer",
  "requires_approval": true
}
```

**Response:** Created stage object

**Status Code:** `201 Created`

---

### Update Stage

**PUT** `/projects/:projectId/stages/:stageName`

Update stage configuration.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| projectId | string | yes | Project ID |
| stageName | string | yes | Stage name |

**Request Body:**
```json
{
  "auto_invoke_agent": "qa-tester",
  "requires_approval": true
}
```

**Status Code:** `200 OK`

---

### Reorder Stages

**PUT** `/projects/:projectId/stages/reorder`

Change the order of all stages.

**Request Body:**
```json
{
  "stages": [
    { "name": "Backlog", "order": 1 },
    { "name": "Ready", "order": 2 },
    { "name": "Development", "order": 3 },
    { "name": "Code-Review", "order": 4 },
    { "name": "Testing", "order": 5 },
    { "name": "Deployment", "order": 6 },
    { "name": "Done", "order": 7 }
  ]
}
```

**Status Code:** `200 OK`

---

### Delete Stage

**DELETE** `/projects/:projectId/stages/:stageName`

Remove a stage from the workflow.

**Warning:** All tasks in this stage will be moved to the previous stage.

**Status Code:** `204 No Content`

---

## Response Format

### Success Response

All successful responses follow this format:

```json
{
  "data": {
    /* Response payload */
  },
  "success": true,
  "timestamp": "2026-04-06T10:00:00Z"
}
```

Or for list endpoints:

```json
[
  { /* Item 1 */ },
  { /* Item 2 */ }
]
```

---

### Error Response

All error responses:

```json
{
  "error": {
    "message": "Task not found",
    "code": "TASK_NOT_FOUND",
    "status": 404
  },
  "success": false,
  "timestamp": "2026-04-06T10:00:00Z"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Request succeeded |
| 201 | Created | New resource created |
| 204 | No Content | Deletion successful |
| 400 | Bad Request | Invalid input data |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Unexpected error |

### Error Codes

| Code | Meaning |
|------|---------|
| VALIDATION_ERROR | Input validation failed |
| PROJECT_NOT_FOUND | Project doesn't exist |
| TASK_NOT_FOUND | Task doesn't exist |
| STAGE_NOT_FOUND | Stage doesn't exist |
| DUPLICATE_PROJECT | Project ID already exists |
| INVALID_STAGE | Stage name is invalid |

---

## Examples

### Complete Workflow Example

```bash
# 1. Create a project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My App v2.0",
    "description": "Complete rewrite"
  }'

# Response: { "id": "my-app-v2", ... }

# 2. Create a task
curl -X POST http://localhost:3000/api/projects/my-app-v2/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Implement authentication",
    "description": "JWT-based auth with refresh tokens\n- Use bcrypt\n- Rate limit: 5 attempts/min",
    "priority": "CRITICAL",
    "assigned_to": "john@example.com"
  }'

# Response: { "id": "task-abc123", "stage": "InQueue", ... }

# 3. Move task to Code-Review
curl -X POST http://localhost:3000/api/projects/my-app-v2/tasks/task-abc123/move \
  -H "Content-Type: application/json" \
  -d '{ "to_stage": "Code-Review" }'

# Response: { "id": "task-abc123", "stage": "Code-Review", "agent_score": 85, ... }

# 4. Get task details with findings
curl http://localhost:3000/api/projects/my-app-v2/tasks/task-abc123

# Response shows agent_score, agent_findings, activity_log

# 5. Approve task
curl -X POST http://localhost:3000/api/projects/my-app-v2/tasks/task-abc123/approve \
  -H "Content-Type: application/json" \
  -d '{ "reason": "Approved" }'

# Response: { "id": "task-abc123", "stage": "Security-Review", ... }
```

### JavaScript Fetch Example

```javascript
// Create task
const response = await fetch('/api/projects/my-project/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'New Feature',
    description: 'Implement XYZ',
    priority: 'HIGH'
  })
});

const task = await response.json();
console.log('Created task:', task.id);

// Move task
await fetch(`/api/projects/my-project/tasks/${task.id}/move`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ to_stage: 'Code-Review' })
});
```

---

## Rate Limiting

No rate limiting currently implemented. For production, consider adding:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Authentication

Currently no authentication implemented. For production, add JWT or OAuth:

```javascript
const jwt = require('jsonwebtoken');

app.use('/api/', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
```

---

See [USER_GUIDE.md](USER_GUIDE.md) for dashboard usage or [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for integration examples.

