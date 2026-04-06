const AgentInvoker = require('../../src/core/agent-invoker');
const TaskManager = require('../../src/core/task-manager');
const ProjectManager = require('../../src/core/project-manager');
const FileBackend = require('../../src/storage/file-backend');
const path = require('path');
const fs = require('fs-extra');

describe('AgentInvoker', () => {
  let testDataDir;
  let storage;
  let taskManager;
  let projectManager;
  let invoker;
  let broadcasts;

  beforeEach(async () => {
    testDataDir = path.join(__dirname, `../../.test-data-invoker-${Date.now()}`);
    await fs.ensureDir(testDataDir);

    storage = new FileBackend(testDataDir);
    await storage.initialize();

    taskManager = new TaskManager(storage);
    projectManager = new ProjectManager(storage);

    // Mock broadcast function to collect calls
    broadcasts = [];
    const broadcast = (msg) => broadcasts.push(msg);

    invoker = new AgentInvoker(taskManager, projectManager, broadcast);

    // Create test project with agent-enabled stages
    await projectManager.create('test-proj', { name: 'Test' });
  });

  afterEach(async () => {
    if (testDataDir) {
      await fs.remove(testDataDir);
    }
  });

  describe('invoke', () => {
    test('should set agent_status to running before invoking', async () => {
      const task = await taskManager.create('test-proj', {
        name: 'Test Task',
        priority: 'MEDIUM',
      });

      // Mock agent for testing
      invoker.agents['test-agent'] = {
        async analyze(task) {
          return { score: 85, findings: [], summary: 'OK' };
        },
      };

      // Start invocation (don't await, it's async)
      invoker.invoke('test-proj', task, 'test-agent');

      // Allow time for async operation
      await new Promise(r => setTimeout(r, 50));

      // Verify broadcast was called
      expect(broadcasts.length).toBeGreaterThan(0);
      expect(broadcasts[0].type).toBe('task-updated');
    });

    test('should call agent.analyze with task', async () => {
      const task = await taskManager.create('test-proj', {
        name: 'Analyze me',
      });

      const mockAgent = {
        analyzeCalled: false,
        receivedTask: null,
        async analyze(t) {
          this.analyzeCalled = true;
          this.receivedTask = t;
          return { score: 75, findings: [], summary: 'Analyzed' };
        },
      };

      invoker.agents['mock-agent'] = mockAgent;

      await invoker.invoke('test-proj', task, 'mock-agent');

      expect(mockAgent.analyzeCalled).toBe(true);
      expect(mockAgent.receivedTask.id).toBe(task.id);
    });

    test('should update task fields based on agent result', async () => {
      const task = await taskManager.create('test-proj', {
        name: 'Test',
      });

      invoker.agents['scorer'] = {
        async analyze(task) {
          return {
            score: 72,
            findings: [
              { type: 'issue', severity: 'HIGH', message: 'Fix this' },
            ],
            summary: 'Some issues found',
          };
        },
      };

      await invoker.invoke('test-proj', task, 'scorer');

      // Fetch updated task
      const updated = await taskManager.get('test-proj', task.id);
      expect(updated.agent_status).toBe('completed');
      expect(updated.agent_name).toBe('scorer');
      expect(updated.agent_score).toBe(72);
      expect(updated.agent_findings).toBeDefined();
      expect(updated.agent_summary).toBe('Some issues found');
    });

    test('should broadcast task-updated on completion', async () => {
      const task = await taskManager.create('test-proj', {
        name: 'Test',
      });

      invoker.agents['agent'] = {
        async analyze(task) {
          return { score: 50, findings: [], summary: 'Rejected' };
        },
      };

      await invoker.invoke('test-proj', task, 'agent');

      // Check broadcasts
      const taskUpdatedBroadcasts = broadcasts.filter(
        b => b.type === 'task-updated'
      );
      expect(taskUpdatedBroadcasts.length).toBeGreaterThan(0);
    });

    test('should handle agent failure gracefully', async () => {
      const task = await taskManager.create('test-proj', {
        name: 'Test',
      });

      invoker.agents['failing'] = {
        async analyze(task) {
          throw new Error('Agent crashed');
        },
      };

      // Should not throw
      await invoker.invoke('test-proj', task, 'failing');

      // Task should have error status
      const updated = await taskManager.get('test-proj', task.id);
      expect(updated.agent_status).toBe('failed');
    });

    test('should no-op on unknown agent', async () => {
      const task = await taskManager.create('test-proj', {
        name: 'Test',
      });

      const initialBroadcasts = broadcasts.length;

      // Should not throw
      await invoker.invoke('test-proj', task, 'unknown-agent');

      // No broadcasts for unknown agent
      expect(broadcasts.length).toBe(initialBroadcasts);
    });

    test('should not throw on missing task', async () => {
      invoker.agents['agent'] = {
        async analyze(task) {
          return { score: 50, findings: [], summary: 'OK' };
        },
      };

      // Should not throw
      await invoker.invoke('test-proj', { id: 'nonexistent' }, 'agent');
    });
  });

  describe('agent registry', () => {
    test('should support registering custom agents', async () => {
      const customAgent = {
        async analyze(task) {
          return { score: 100, findings: [], summary: 'Perfect' };
        },
      };

      invoker.registerAgent('custom', customAgent);

      const registered = invoker.agents['custom'];
      expect(registered).toBe(customAgent);
    });
  });
});
