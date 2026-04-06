const MySQLBackend = require('../../src/storage/mysql-backend');

describe('MySQL Backend Storage', () => {
  let storage;

  beforeEach(async () => {
    // For testing, use in-memory SQLite instead
    storage = new MySQLBackend({
      type: 'sqlite',
      path: ':memory:'
    });
    await storage.initialize();
  });

  afterEach(async () => {
    if (storage && storage.close) {
      await storage.close();
    }
  });

  test('should initialize storage with in-memory SQLite', async () => {
    expect(storage).toBeDefined();
    expect(storage.db).toBeDefined();
  });

  test('should create and retrieve project', async () => {
    await storage.createProject('test-proj', { name: 'Test Project' });
    const project = await storage.getProject('test-proj');

    expect(project).toBeDefined();
    expect(project.id).toBe('test-proj');
    expect(project.name).toBe('Test Project');
    expect(project.stages).toBeDefined();
    expect(Array.isArray(project.stages)).toBe(true);
  });

  test('should list projects', async () => {
    await storage.createProject('proj-1', { name: 'Project 1' });
    await storage.createProject('proj-2', { name: 'Project 2' });

    const projects = await storage.listProjects();

    expect(projects).toHaveLength(2);
    expect(projects[0].id).toBe('proj-1');
    expect(projects[1].id).toBe('proj-2');
  });

  test('should create and retrieve task', async () => {
    await storage.createProject('test-proj', { name: 'Test' });
    const task = await storage.createTask('test-proj', {
      name: 'Test Task',
      priority: 'HIGH',
      stage: 'InQueue'
    });

    const retrieved = await storage.getTask('test-proj', task.id);
    expect(retrieved).toBeDefined();
    expect(retrieved.name).toBe('Test Task');
    expect(retrieved.priority).toBe('HIGH');
  });

  test('should list and filter tasks by priority', async () => {
    await storage.createProject('test-proj', { name: 'Test' });
    await storage.createTask('test-proj', { name: 'Task 1', priority: 'HIGH', stage: 'InQueue' });
    await storage.createTask('test-proj', { name: 'Task 2', priority: 'LOW', stage: 'InQueue' });

    const tasks = await storage.listTasks('test-proj', { priority: 'HIGH' });
    expect(tasks).toHaveLength(1);
    expect(tasks[0].name).toBe('Task 1');
  });

  test('should list and filter tasks by status', async () => {
    await storage.createProject('test-proj', { name: 'Test' });
    await storage.createTask('test-proj', { name: 'Task 1', priority: 'HIGH', stage: 'InQueue' });
    await storage.createTask('test-proj', { name: 'Task 2', priority: 'HIGH', stage: 'InProgress' });

    const tasks = await storage.listTasks('test-proj', { status: 'InQueue' });
    expect(tasks).toHaveLength(1);
    expect(tasks[0].stage).toBe('InQueue');
  });

  test('should sort tasks by priority', async () => {
    await storage.createProject('test-proj', { name: 'Test' });
    await storage.createTask('test-proj', { name: 'Low', priority: 'LOW', stage: 'InQueue' });
    await storage.createTask('test-proj', { name: 'High', priority: 'HIGH', stage: 'InQueue' });
    await storage.createTask('test-proj', { name: 'Critical', priority: 'CRITICAL', stage: 'InQueue' });

    const tasks = await storage.listTasks('test-proj');
    expect(tasks[0].priority).toBe('CRITICAL');
    expect(tasks[1].priority).toBe('HIGH');
    expect(tasks[2].priority).toBe('LOW');
  });

  test('should update task', async () => {
    await storage.createProject('test-proj', { name: 'Test' });
    const task = await storage.createTask('test-proj', {
      name: 'Original',
      priority: 'LOW',
      stage: 'InQueue'
    });

    const updated = await storage.updateTask('test-proj', task.id, {
      name: 'Updated',
      priority: 'HIGH'
    });

    expect(updated.name).toBe('Updated');
    expect(updated.priority).toBe('HIGH');
    expect(updated.updated_at).toBeDefined();
  });

  test('should delete task', async () => {
    await storage.createProject('test-proj', { name: 'Test' });
    const task = await storage.createTask('test-proj', {
      name: 'Task to delete',
      stage: 'InQueue'
    });

    await storage.deleteTask('test-proj', task.id);
    const tasks = await storage.listTasks('test-proj');

    expect(tasks).toHaveLength(0);
  });

  test('should update project', async () => {
    await storage.createProject('test-proj', { name: 'Original' });
    const updated = await storage.updateProject('test-proj', { name: 'Updated' });

    expect(updated.name).toBe('Updated');
    expect(updated.updated_at).toBeDefined();
  });

  test('should return null for non-existent task', async () => {
    await storage.createProject('test-proj', { name: 'Test' });
    const task = await storage.getTask('test-proj', 'non-existent');

    expect(task).toBeNull();
  });

  test('should throw error when updating non-existent task', async () => {
    await storage.createProject('test-proj', { name: 'Test' });

    await expect(
      storage.updateTask('test-proj', 'non-existent', { name: 'Updated' })
    ).rejects.toThrow('Task non-existent not found');
  });

  test('should throw error when updating non-existent project', async () => {
    await expect(
      storage.updateProject('non-existent', { name: 'Updated' })
    ).rejects.toThrow('Project non-existent not found');
  });

  test('should return empty list when no tasks exist', async () => {
    await storage.createProject('test-proj', { name: 'Test' });
    const tasks = await storage.listTasks('test-proj');

    expect(tasks).toHaveLength(0);
  });

  test('should preserve timestamps', async () => {
    await storage.createProject('test-proj', { name: 'Test' });
    const task = await storage.createTask('test-proj', {
      name: 'Task',
      stage: 'InQueue'
    });

    expect(task.created_at).toBeDefined();
    expect(task.updated_at).toBeDefined();
  });

  test('should handle activity_log as JSON', async () => {
    await storage.createProject('test-proj', { name: 'Test' });
    const activity = [{ action: 'created', timestamp: new Date().toISOString() }];
    const task = await storage.createTask('test-proj', {
      name: 'Task',
      stage: 'InQueue',
      activity_log: activity
    });

    const retrieved = await storage.getTask('test-proj', task.id);
    expect(Array.isArray(retrieved.activity_log)).toBe(true);
    expect(retrieved.activity_log[0].action).toBe('created');
  });

  test('should filter tasks by assigned_to', async () => {
    await storage.createProject('test-proj', { name: 'Test' });
    await storage.createTask('test-proj', {
      name: 'Task 1',
      assigned_to: 'user-1',
      priority: 'HIGH',
      stage: 'InQueue'
    });
    await storage.createTask('test-proj', {
      name: 'Task 2',
      assigned_to: 'user-2',
      priority: 'HIGH',
      stage: 'InQueue'
    });

    const tasks = await storage.listTasks('test-proj', { assigned: 'user-1' });

    expect(tasks).toHaveLength(1);
    expect(tasks[0].assigned_to).toBe('user-1');
  });

  test('should preserve default stages on project creation', async () => {
    const project = await storage.createProject('test-proj', { name: 'Test' });

    expect(project.stages).toHaveLength(7);
    expect(project.stages[0].name).toBe('InQueue');
    expect(project.stages[6].name).toBe('Completed');
  });

  test('should handle multiple projects with separate task lists', async () => {
    await storage.createProject('proj-1', { name: 'Project 1' });
    await storage.createProject('proj-2', { name: 'Project 2' });

    await storage.createTask('proj-1', { name: 'Task 1', stage: 'InQueue' });
    await storage.createTask('proj-2', { name: 'Task 2', stage: 'InQueue' });

    const tasks1 = await storage.listTasks('proj-1');
    const tasks2 = await storage.listTasks('proj-2');

    expect(tasks1).toHaveLength(1);
    expect(tasks2).toHaveLength(1);
    expect(tasks1[0].name).toBe('Task 1');
    expect(tasks2[0].name).toBe('Task 2');
  });

  test('should sort tasks by priority then created_at', async () => {
    await storage.createProject('test-proj', { name: 'Test' });

    // Add tasks with same priority but different creation times
    const task1 = await storage.createTask('test-proj', {
      name: 'Task 1',
      priority: 'HIGH',
      stage: 'InQueue'
    });

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const task2 = await storage.createTask('test-proj', {
      name: 'Task 2',
      priority: 'HIGH',
      stage: 'InQueue'
    });

    const tasks = await storage.listTasks('test-proj');

    // Same priority, so should sort by created_at (most recent first)
    expect(tasks[0].id).toBe(task2.id);
    expect(tasks[1].id).toBe(task1.id);
  });
});
