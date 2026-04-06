const StorageBackend = require('../../src/storage/file-backend');
const fs = require('fs-extra');
const path = require('path');

describe('File Backend Storage', () => {
  const testDir = path.join(__dirname, '../../.test-data');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  test('should initialize storage with default structure', async () => {
    const storage = new StorageBackend(testDir);
    await storage.initialize();

    expect(await fs.exists(path.join(testDir, 'projects.json'))).toBe(true);
    expect(await fs.exists(path.join(testDir, 'tasks'))).toBe(true);
  });

  test('should create project', async () => {
    const storage = new StorageBackend(testDir);
    await storage.initialize();

    await storage.createProject('test-proj', { name: 'Test Project' });
    const projects = await storage.listProjects();

    expect(projects).toHaveLength(1);
    expect(projects[0].id).toBe('test-proj');
  });

  test('should retrieve project by id', async () => {
    const storage = new StorageBackend(testDir);
    await storage.initialize();

    await storage.createProject('test-proj', { name: 'Test Project' });
    const project = await storage.getProject('test-proj');

    expect(project).toBeDefined();
    expect(project.name).toBe('Test Project');
    expect(project.stages).toBeDefined();
    expect(project.stages.length).toBeGreaterThan(0);
  });

  test('should create task in project', async () => {
    const storage = new StorageBackend(testDir);
    await storage.initialize();

    await storage.createProject('test-proj', { name: 'Test Project' });
    const task = await storage.createTask('test-proj', {
      title: 'Test Task',
      description: 'Test Description',
      priority: 'HIGH',
      stage: 'InQueue'
    });

    expect(task).toBeDefined();
    expect(task.id).toBeDefined();
    expect(task.title).toBe('Test Task');
    expect(task.project).toBe('test-proj');
  });

  test('should retrieve task by id', async () => {
    const storage = new StorageBackend(testDir);
    await storage.initialize();

    await storage.createProject('test-proj', { name: 'Test Project' });
    const createdTask = await storage.createTask('test-proj', {
      title: 'Test Task',
      description: 'Test Description',
      priority: 'HIGH',
      stage: 'InQueue'
    });

    const task = await storage.getTask('test-proj', createdTask.id);

    expect(task).toBeDefined();
    expect(task.title).toBe('Test Task');
  });

  test('should list tasks for project', async () => {
    const storage = new StorageBackend(testDir);
    await storage.initialize();

    await storage.createProject('test-proj', { name: 'Test Project' });
    await storage.createTask('test-proj', {
      title: 'Task 1',
      priority: 'HIGH',
      stage: 'InQueue'
    });
    await storage.createTask('test-proj', {
      title: 'Task 2',
      priority: 'LOW',
      stage: 'InProgress'
    });

    const tasks = await storage.listTasks('test-proj');

    expect(tasks).toHaveLength(2);
  });

  test('should filter tasks by status', async () => {
    const storage = new StorageBackend(testDir);
    await storage.initialize();

    await storage.createProject('test-proj', { name: 'Test Project' });
    await storage.createTask('test-proj', {
      title: 'Task 1',
      priority: 'HIGH',
      stage: 'InQueue'
    });
    await storage.createTask('test-proj', {
      title: 'Task 2',
      priority: 'LOW',
      stage: 'InProgress'
    });

    const tasks = await storage.listTasks('test-proj', { status: 'InQueue' });

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Task 1');
  });

  test('should sort tasks by priority', async () => {
    const storage = new StorageBackend(testDir);
    await storage.initialize();

    await storage.createProject('test-proj', { name: 'Test Project' });
    await storage.createTask('test-proj', {
      title: 'Low Priority Task',
      priority: 'LOW',
      stage: 'InQueue'
    });
    await storage.createTask('test-proj', {
      title: 'High Priority Task',
      priority: 'HIGH',
      stage: 'InQueue'
    });

    const tasks = await storage.listTasks('test-proj');

    expect(tasks[0].priority).toBe('HIGH');
    expect(tasks[1].priority).toBe('LOW');
  });

  test('should update task', async () => {
    const storage = new StorageBackend(testDir);
    await storage.initialize();

    await storage.createProject('test-proj', { name: 'Test Project' });
    const createdTask = await storage.createTask('test-proj', {
      title: 'Original Title',
      priority: 'LOW',
      stage: 'InQueue'
    });

    const updatedTask = await storage.updateTask('test-proj', createdTask.id, {
      title: 'Updated Title',
      priority: 'HIGH'
    });

    expect(updatedTask.title).toBe('Updated Title');
    expect(updatedTask.priority).toBe('HIGH');
    expect(updatedTask.updated_at).toBeDefined();
  });

  test('should delete task', async () => {
    const storage = new StorageBackend(testDir);
    await storage.initialize();

    await storage.createProject('test-proj', { name: 'Test Project' });
    const createdTask = await storage.createTask('test-proj', {
      title: 'Task to Delete',
      priority: 'LOW',
      stage: 'InQueue'
    });

    await storage.deleteTask('test-proj', createdTask.id);
    const tasks = await storage.listTasks('test-proj');

    expect(tasks).toHaveLength(0);
  });

  test('should update project', async () => {
    const storage = new StorageBackend(testDir);
    await storage.initialize();

    await storage.createProject('test-proj', { name: 'Original Name' });
    const updatedProject = await storage.updateProject('test-proj', { name: 'Updated Name' });

    expect(updatedProject.name).toBe('Updated Name');
    expect(updatedProject.updated_at).toBeDefined();
  });

  test('should throw error when getting non-existent task', async () => {
    const storage = new StorageBackend(testDir);
    await storage.initialize();

    await storage.createProject('test-proj', { name: 'Test Project' });
    const task = await storage.getTask('test-proj', 'non-existent');

    expect(task).toBeNull();
  });

  test('should throw error when updating non-existent task', async () => {
    const storage = new StorageBackend(testDir);
    await storage.initialize();

    await storage.createProject('test-proj', { name: 'Test Project' });

    await expect(
      storage.updateTask('test-proj', 'non-existent', { title: 'Updated' })
    ).rejects.toThrow('Task non-existent not found');
  });

  test('should throw error when updating non-existent project', async () => {
    const storage = new StorageBackend(testDir);
    await storage.initialize();

    await expect(
      storage.updateProject('non-existent', { name: 'Updated' })
    ).rejects.toThrow('Project non-existent not found');
  });

  test('should return empty list when no tasks exist', async () => {
    const storage = new StorageBackend(testDir);
    await storage.initialize();

    await storage.createProject('test-proj', { name: 'Test Project' });
    const tasks = await storage.listTasks('test-proj');

    expect(tasks).toHaveLength(0);
  });

  test('should preserve multiple projects', async () => {
    const storage = new StorageBackend(testDir);
    await storage.initialize();

    await storage.createProject('proj-1', { name: 'Project 1' });
    await storage.createProject('proj-2', { name: 'Project 2' });

    const projects = await storage.listProjects();

    expect(projects).toHaveLength(2);
    expect(projects[0].id).toBe('proj-1');
    expect(projects[1].id).toBe('proj-2');
  });

  test('should filter tasks by priority', async () => {
    const storage = new StorageBackend(testDir);
    await storage.initialize();

    await storage.createProject('test-proj', { name: 'Test Project' });
    await storage.createTask('test-proj', {
      title: 'Task 1',
      priority: 'CRITICAL',
      stage: 'InQueue'
    });
    await storage.createTask('test-proj', {
      title: 'Task 2',
      priority: 'LOW',
      stage: 'InQueue'
    });

    const tasks = await storage.listTasks('test-proj', { priority: 'CRITICAL' });

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Task 1');
  });

  test('should filter tasks by assigned_to', async () => {
    const storage = new StorageBackend(testDir);
    await storage.initialize();

    await storage.createProject('test-proj', { name: 'Test Project' });
    await storage.createTask('test-proj', {
      title: 'Task 1',
      assigned_to: 'user-1',
      priority: 'HIGH',
      stage: 'InQueue'
    });
    await storage.createTask('test-proj', {
      title: 'Task 2',
      assigned_to: 'user-2',
      priority: 'HIGH',
      stage: 'InQueue'
    });

    const tasks = await storage.listTasks('test-proj', { assigned: 'user-1' });

    expect(tasks).toHaveLength(1);
    expect(tasks[0].assigned_to).toBe('user-1');
  });
});
