const path = require('path');
const fs = require('fs-extra');
const FileBackend = require('../../src/storage/file-backend');
const TaskManager = require('../../src/core/task-manager');
const ProjectManager = require('../../src/core/project-manager');
const AgentRouter = require('../../src/core/agent-router');
const DashboardServer = require('../../src/dashboard/server');
const WebSocket = require('ws');

describe('DashboardServer API', () => {
  let testDataDir;
  let storage;
  let taskManager;
  let projectManager;
  let agentRouter;
  let server;
  let baseUrl;
  let port;

  beforeEach(async () => {
    // Setup
    testDataDir = path.join(__dirname, `../../.test-data-dashboard-${Date.now()}`);
    await fs.ensureDir(testDataDir);

    storage = new FileBackend(testDataDir);
    await storage.initialize();

    taskManager = new TaskManager(storage);
    projectManager = new ProjectManager(storage);
    agentRouter = new AgentRouter();

    server = new DashboardServer(storage, taskManager, projectManager, agentRouter);
    ({ port } = await server.start(0)); // port 0 = random available
    baseUrl = `http://localhost:${port}`;
  });

  afterEach(async () => {
    // Cleanup
    if (server) {
      await server.stop();
    }
    if (testDataDir) {
      await fs.remove(testDataDir);
    }
  });

  describe('Projects API', () => {
    test('should return empty project list initially', async () => {
      const res = await fetch(`${baseUrl}/api/projects`);
      expect(res.status).toBe(200);
      const projects = await res.json();
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBe(0);
    });

    test('should get single project after creation', async () => {
      await projectManager.create('test-proj', { name: 'Test Project' });

      const res = await fetch(`${baseUrl}/api/projects/test-proj`);
      expect(res.status).toBe(200);
      const project = await res.json();
      expect(project.id).toBe('test-proj');
      expect(project.name).toBe('Test Project');
      expect(Array.isArray(project.stages)).toBe(true);
    });

    test('should return 404 for unknown project', async () => {
      const res = await fetch(`${baseUrl}/api/projects/unknown`);
      expect(res.status).toBe(404);
    });
  });

  describe('Tasks API', () => {
    test('should create task via POST', async () => {
      await projectManager.create('test-proj', { name: 'Test' });

      const res = await fetch(`${baseUrl}/api/projects/test-proj/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'My Task', priority: 'HIGH' }),
      });

      expect(res.status).toBe(201);
      const task = await res.json();
      expect(task.name).toBe('My Task');
      expect(task.priority).toBe('HIGH');
      expect(task.id).toBeDefined();
    });

    test('should list tasks for project', async () => {
      await projectManager.create('test-proj', { name: 'Test' });
      await taskManager.create('test-proj', { name: 'Task 1' });
      await taskManager.create('test-proj', { name: 'Task 2' });

      const res = await fetch(`${baseUrl}/api/projects/test-proj/tasks`);
      expect(res.status).toBe(200);
      const tasks = await res.json();
      expect(tasks.length).toBe(2);
    });

    test('should filter tasks by priority', async () => {
      await projectManager.create('test-proj', { name: 'Test' });
      await taskManager.create('test-proj', { name: 'Critical', priority: 'CRITICAL' });
      await taskManager.create('test-proj', { name: 'Low', priority: 'LOW' });

      const res = await fetch(`${baseUrl}/api/projects/test-proj/tasks?priority=CRITICAL`);
      const tasks = await res.json();
      expect(tasks.length).toBe(1);
      expect(tasks[0].priority).toBe('CRITICAL');
    });

    test('should get single task', async () => {
      await projectManager.create('test-proj', { name: 'Test' });
      const created = await taskManager.create('test-proj', { name: 'Task' });

      const res = await fetch(`${baseUrl}/api/projects/test-proj/tasks/${created.id}`);
      expect(res.status).toBe(200);
      const task = await res.json();
      expect(task.id).toBe(created.id);
      expect(task.name).toBe('Task');
    });

    test('should update task', async () => {
      await projectManager.create('test-proj', { name: 'Test' });
      const created = await taskManager.create('test-proj', { name: 'Original' });

      const res = await fetch(`${baseUrl}/api/projects/test-proj/tasks/${created.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated' }),
      });

      expect(res.status).toBe(200);
      const task = await res.json();
      expect(task.name).toBe('Updated');
    });

    test('should delete task', async () => {
      await projectManager.create('test-proj', { name: 'Test' });
      const created = await taskManager.create('test-proj', { name: 'Task' });

      const res = await fetch(`${baseUrl}/api/projects/test-proj/tasks/${created.id}`, {
        method: 'DELETE',
      });

      expect(res.status).toBe(204);

      // Verify deleted
      const getRes = await fetch(`${baseUrl}/api/projects/test-proj/tasks/${created.id}`);
      expect(getRes.status).toBe(404);
    });
  });

  describe('Task Movement API', () => {
    test('should move task to different stage', async () => {
      await projectManager.create('test-proj', { name: 'Test' });
      const task = await taskManager.create('test-proj', { name: 'Task' });

      const res = await fetch(
        `${baseUrl}/api/projects/test-proj/tasks/${task.id}/move`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to_stage: 'InProgress' }),
        }
      );

      expect(res.status).toBe(200);
      const updated = await res.json();
      expect(updated.stage).toBe('InProgress');
    });

    test('should return approval state when moving to approval-required stage', async () => {
      await projectManager.create('test-proj', { name: 'Test' });
      const task = await taskManager.create('test-proj', { name: 'Task', priority: 'HIGH' });

      const res = await fetch(
        `${baseUrl}/api/projects/test-proj/tasks/${task.id}/move`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to_stage: 'Dev-code-review' }),
        }
      );

      expect(res.status).toBe(200);
      const result = await res.json();
      expect(result.approval_state).toBeDefined();
      expect(result.approval_state.requires_approval).toBe(true);
    });

    test('should auto-approve CRITICAL tasks moving to approval stage', async () => {
      await projectManager.create('test-proj', { name: 'Test' });
      const task = await taskManager.create('test-proj', {
        name: 'Critical Task',
        priority: 'CRITICAL',
      });

      const res = await fetch(
        `${baseUrl}/api/projects/test-proj/tasks/${task.id}/move`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to_stage: 'Dev-code-review' }),
        }
      );

      const result = await res.json();
      expect(result.approval_state.should_auto_approve).toBe(true);
    });
  });

  describe('Stage Configuration API', () => {
    test('should add stage to project', async () => {
      await projectManager.create('test-proj', { name: 'Test' });

      const res = await fetch(`${baseUrl}/api/projects/test-proj/stages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Custom Stage', order: 10 }),
      });

      expect(res.status).toBe(201);
      const stage = await res.json();
      expect(stage.name).toBe('Custom Stage');
      expect(stage.order).toBe(10);
    });

    test('should remove stage from project', async () => {
      const project = await projectManager.create('test-proj', { name: 'Test' });
      const stageName = project.stages[0].name;

      const res = await fetch(`${baseUrl}/api/projects/test-proj/stages/${stageName}`, {
        method: 'DELETE',
      });

      expect(res.status).toBe(204);

      // Verify removed
      const updated = await projectManager.get('test-proj');
      expect(updated.stages.some(s => s.name === stageName)).toBe(false);
    });

    test('should reorder stages', async () => {
      await projectManager.create('test-proj', { name: 'Test' });
      const project = await projectManager.get('test-proj');
      const reordered = project.stages.slice().reverse();

      const res = await fetch(`${baseUrl}/api/projects/test-proj/stages/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stages: reordered }),
      });

      expect(res.status).toBe(200);
    });
  });

  describe('WebSocket Broadcasts', () => {
    test('should connect to WebSocket', async () => {
      const ws = new WebSocket(`ws://localhost:${port}`);

      await new Promise((resolve, reject) => {
        ws.addEventListener('open', resolve);
        ws.addEventListener('error', reject);
        setTimeout(() => reject(new Error('WebSocket timeout')), 5000);
      });

      expect(ws.readyState).toBe(WebSocket.OPEN);
      ws.close();
    });

    test('should broadcast task-created event', async () => {
      await projectManager.create('test-proj', { name: 'Test' });

      const messages = [];
      const ws = new WebSocket(`ws://localhost:${port}`);

      await new Promise((resolve) => {
        ws.addEventListener('message', (e) => {
          messages.push(JSON.parse(e.data));
          if (messages.length >= 1) {
            resolve();
          }
        });
      });

      // Create task via API
      await fetch(`${baseUrl}/api/projects/test-proj/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Task' }),
      });

      // Wait for broadcast
      await new Promise((resolve) => setTimeout(resolve, 100));
      ws.close();

      expect(messages.some(m => m.type === 'task-created')).toBe(true);
    });
  });
});
