const StatusHandler = require('../../src/core/status-handler');
const TaskManager = require('../../src/core/task-manager');
const ProjectManager = require('../../src/core/project-manager');
const FileBackend = require('../../src/storage/file-backend');
const path = require('path');
const fs = require('fs-extra');

describe('StatusHandler', () => {
  let testDataDir;
  let storage;
  let taskManager;
  let projectManager;
  let handler;
  let broadcasts;

  beforeEach(async () => {
    testDataDir = path.join(__dirname, `../../.test-data-handler-${Date.now()}`);
    await fs.ensureDir(testDataDir);

    storage = new FileBackend(testDataDir);
    await storage.initialize();

    taskManager = new TaskManager(storage);
    projectManager = new ProjectManager(storage);

    broadcasts = [];
    const broadcast = (msg) => broadcasts.push(msg);

    handler = new StatusHandler(taskManager, projectManager, broadcast);

    // Create test project with stages
    await projectManager.create('test-proj', { name: 'Test' });
  });

  afterEach(async () => {
    if (testDataDir) {
      await fs.remove(testDataDir);
    }
  });

  describe('process', () => {
    test('should approve task when score >= 70', async () => {
      const task = await taskManager.create('test-proj', {
        name: 'Test Task',
        stage: 'Dev-code-review',
      });

      const agentResult = {
        score: 85,
        findings: [],
        summary: 'Approved',
      };

      await handler.process('test-proj', task, agentResult, 'code-reviewer');

      const updated = await taskManager.get('test-proj', task.id);
      expect(updated.approval_status).toBe('approved');
      expect(updated.agent_findings).toEqual([]);
    });

    test('should reject task when score < 70', async () => {
      const task = await taskManager.create('test-proj', {
        name: 'Test Task',
        stage: 'Dev-code-review',
      });

      const agentResult = {
        score: 45,
        findings: [{ type: 'issue', message: 'Fix this' }],
        summary: 'Rejected',
      };

      await handler.process('test-proj', task, agentResult, 'code-reviewer');

      const updated = await taskManager.get('test-proj', task.id);
      expect(updated.approval_status).toBe('rejected');
      expect(updated.agent_findings).toEqual(agentResult.findings);
    });

    test('should move task to next stage on approval', async () => {
      const project = await projectManager.get('test-proj');
      const task = await taskManager.create('test-proj', {
        name: 'Test Task',
        stage: 'InQueue',
      });

      const agentResult = {
        score: 75,
        findings: [],
        summary: 'OK',
      };

      await handler.process('test-proj', task, agentResult, 'code-reviewer');

      const updated = await taskManager.get('test-proj', task.id);
      const currentStageOrder = project.stages.find(
        s => s.name === 'InQueue'
      ).order;
      const nextStage = project.stages.find(
        s => s.order === currentStageOrder + 1
      );

      expect(updated.stage).toBe(nextStage.name);
    });

    test('should keep task in stage on rejection (not move back)', async () => {
      const task = await taskManager.create('test-proj', {
        name: 'Test Task',
        stage: 'Dev-code-review',
      });

      const agentResult = {
        score: 50,
        findings: [{ type: 'issue' }],
        summary: 'Rejected',
      };

      await handler.process('test-proj', task, agentResult, 'code-reviewer');

      const updated = await taskManager.get('test-proj', task.id);
      // Task stays in Dev-code-review, not moved back
      expect(updated.stage).toBe('Dev-code-review');
    });

    test('should save agent findings and score', async () => {
      const task = await taskManager.create('test-proj', {
        name: 'Test Task',
      });

      const findings = [
        { type: 'issue1', severity: 'HIGH', message: 'Fix this' },
        { type: 'issue2', severity: 'LOW', message: 'Also this' },
      ];

      const agentResult = {
        score: 65,
        findings,
        summary: 'Found issues',
      };

      await handler.process('test-proj', task, agentResult, 'test-agent');

      const updated = await taskManager.get('test-proj', task.id);
      expect(updated.agent_score).toBe(65);
      expect(updated.agent_findings).toEqual(findings);
      expect(updated.agent_summary).toBe('Found issues');
    });

    test('should broadcast task-moved when task moves to next stage', async () => {
      const task = await taskManager.create('test-proj', {
        name: 'Test Task',
        stage: 'InQueue',
      });

      const agentResult = {
        score: 80,
        findings: [],
        summary: 'OK',
      };

      await handler.process('test-proj', task, agentResult, 'agent');

      const movesBroadcast = broadcasts.filter(b => b.type === 'task-moved');
      expect(movesBroadcast.length).toBeGreaterThan(0);
    });

    test('should handle last stage (no next stage)', async () => {
      const task = await taskManager.create('test-proj', {
        name: 'Test Task',
        stage: 'Completed',
      });

      const agentResult = {
        score: 80,
        findings: [],
        summary: 'OK',
      };

      // Should not throw
      await handler.process('test-proj', task, agentResult, 'agent');

      const updated = await taskManager.get('test-proj', task.id);
      // Task stays at Completed (no next stage)
      expect(updated.stage).toBe('Completed');
    });

    test('should apply different thresholds for different agents', async () => {
      const task1 = await taskManager.create('test-proj', {
        name: 'Task 1',
        stage: 'Dev-code-review',
      });

      const task2 = await taskManager.create('test-proj', {
        name: 'Task 2',
        stage: 'Security-review',
      });

      // Code reviewer threshold: 70
      await handler.process('test-proj', task1, { score: 72, findings: [] }, 'code-reviewer');
      const updated1 = await taskManager.get('test-proj', task1.id);
      expect(updated1.approval_status).toBe('approved');

      // Security reviewer threshold: 80 (higher)
      await handler.process('test-proj', task2, { score: 72, findings: [] }, 'security-reviewer');
      const updated2 = await taskManager.get('test-proj', task2.id);
      expect(updated2.approval_status).toBe('rejected');
    });
  });

  describe('getThreshold', () => {
    test('should return 70 for code-reviewer', () => {
      expect(handler.getThreshold('code-reviewer')).toBe(70);
    });

    test('should return 80 for security-reviewer', () => {
      expect(handler.getThreshold('security-reviewer')).toBe(80);
    });

    test('should return 75 for qa-tester', () => {
      expect(handler.getThreshold('qa-tester')).toBe(75);
    });

    test('should return default 75 for unknown agent', () => {
      expect(handler.getThreshold('unknown-agent')).toBe(75);
    });
  });
});
