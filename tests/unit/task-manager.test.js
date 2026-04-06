const TaskManager = require('../../src/core/task-manager');
const FileBackend = require('../../src/storage/file-backend');
const fs = require('fs-extra');
const path = require('path');

describe('Task Manager', () => {
  let storage, taskManager, testDir;

  beforeEach(async () => {
    testDir = path.join(__dirname, '../../.test-data-tasks');
    storage = new FileBackend(testDir);
    await storage.initialize();
    taskManager = new TaskManager(storage);

    // Create test project
    await storage.createProject('test-proj', { name: 'Test Project' });
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  test('should create task with default priority MEDIUM', async () => {
    const task = await taskManager.create('test-proj', {
      name: 'Test Task',
      description: 'Test description'
    });

    expect(task.priority).toBe('MEDIUM');
    expect(task.stage).toBe('InQueue');
    expect(task.name).toBe('Test Task');
  });

  test('should move task to next stage', async () => {
    const task = await taskManager.create('test-proj', {
      name: 'Test Task'
    });

    const moved = await taskManager.moveTask('test-proj', task.id, 'InProgress');
    expect(moved.stage).toBe('InProgress');
  });

  test('should handle priority ordering (CRITICAL first)', async () => {
    // Create tasks with small delays to ensure different timestamps
    await taskManager.create('test-proj', { name: 'Low Priority', priority: 'LOW' });
    await new Promise(resolve => setTimeout(resolve, 1));
    await taskManager.create('test-proj', { name: 'Critical', priority: 'CRITICAL' });
    await new Promise(resolve => setTimeout(resolve, 1));
    await taskManager.create('test-proj', { name: 'Medium', priority: 'MEDIUM' });

    const tasks = await taskManager.list('test-proj');
    expect(tasks[0].priority).toBe('CRITICAL');
    expect(tasks[1].priority).toBe('MEDIUM');
    expect(tasks[2].priority).toBe('LOW');
  });

  test('should record activity log on task creation', async () => {
    const task = await taskManager.create('test-proj', {
      name: 'Test Task'
    });

    expect(task.activity_log).toBeDefined();
    expect(task.activity_log.length).toBeGreaterThan(0);
    expect(task.activity_log[0].action).toBe('created');
  });

  test('should record activity log on task move', async () => {
    const task = await taskManager.create('test-proj', {
      name: 'Test Task'
    });

    const moved = await taskManager.moveTask('test-proj', task.id, 'InProgress');
    expect(moved.activity_log.length).toBeGreaterThan(1);
    const moveLog = moved.activity_log.find(log => log.action === 'moved');
    expect(moveLog).toBeDefined();
    expect(moveLog.from_stage).toBe('InQueue');
    expect(moveLog.to_stage).toBe('InProgress');
  });

  test('should get single task', async () => {
    const created = await taskManager.create('test-proj', {
      name: 'Test Task'
    });

    const task = await taskManager.get('test-proj', created.id);
    expect(task).toBeDefined();
    expect(task.id).toBe(created.id);
  });

  test('should update task', async () => {
    const created = await taskManager.create('test-proj', {
      name: 'Original Name'
    });

    const updated = await taskManager.update('test-proj', created.id, {
      name: 'Updated Name',
      description: 'New description'
    });

    expect(updated.name).toBe('Updated Name');
    expect(updated.description).toBe('New description');
  });

  test('should record activity log on task update', async () => {
    const created = await taskManager.create('test-proj', {
      name: 'Test Task'
    });

    const updated = await taskManager.update('test-proj', created.id, {
      name: 'Updated Name'
    });

    const updateLog = updated.activity_log.find(log => log.action === 'updated');
    expect(updateLog).toBeDefined();
    expect(updateLog.changes).toContain('name');
  });

  test('should delete task', async () => {
    const created = await taskManager.create('test-proj', {
      name: 'Test Task'
    });

    await taskManager.delete('test-proj', created.id);
    const task = await taskManager.get('test-proj', created.id);
    expect(task).toBeNull();
  });

  test('should validate priority when setting', async () => {
    const created = await taskManager.create('test-proj', {
      name: 'Test Task'
    });

    await expect(
      taskManager.setPriority('test-proj', created.id, 'INVALID')
    ).rejects.toThrow('Invalid priority');
  });

  test('should set valid priority', async () => {
    const created = await taskManager.create('test-proj', {
      name: 'Test Task'
    });

    const updated = await taskManager.setPriority('test-proj', created.id, 'HIGH');
    expect(updated.priority).toBe('HIGH');
  });

  test('should throw error when task not found', async () => {
    await expect(
      taskManager.moveTask('test-proj', 'nonexistent', 'InProgress')
    ).rejects.toThrow('Task nonexistent not found');
  });

  test('should list tasks with filters', async () => {
    await taskManager.create('test-proj', {
      name: 'High Priority Task',
      priority: 'HIGH',
      stage: 'InQueue'
    });
    await taskManager.create('test-proj', {
      name: 'Low Priority Task',
      priority: 'LOW',
      stage: 'InProgress'
    });

    const highPriorityTasks = await taskManager.list('test-proj', { priority: 'HIGH' });
    expect(highPriorityTasks).toHaveLength(1);
    expect(highPriorityTasks[0].priority).toBe('HIGH');
  });
});
