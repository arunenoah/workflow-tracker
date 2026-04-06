const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class FileBackend {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.projectsFile = path.join(baseDir, 'projects.json');
    this.tasksDir = path.join(baseDir, 'tasks');
    this.archiveDir = path.join(baseDir, 'archive');
  }

  async initialize() {
    await fs.ensureDir(this.tasksDir);
    await fs.ensureDir(this.archiveDir);

    if (!await fs.exists(this.projectsFile)) {
      await fs.writeJson(this.projectsFile, { projects: [] });
    }
  }

  async createProject(projectId, projectData) {
    const projects = await fs.readJson(this.projectsFile);
    const newProject = {
      id: projectId,
      ...projectData,
      created_at: new Date().toISOString(),
      stages: projectData.stages || this._defaultStages()
    };
    projects.projects.push(newProject);
    await fs.writeJson(this.projectsFile, projects);
    return newProject;
  }

  async getProject(projectId) {
    const projects = await fs.readJson(this.projectsFile);
    return projects.projects.find(p => p.id === projectId);
  }

  async listProjects() {
    const projects = await fs.readJson(this.projectsFile);
    return projects.projects;
  }

  async createTask(projectId, taskData) {
    const taskId = `task-${uuidv4().slice(0, 8)}`;
    const task = {
      id: taskId,
      project: projectId,
      ...taskData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const tasksFile = path.join(this.tasksDir, `${projectId}.json`);
    let tasks = { tasks: [] };
    if (await fs.exists(tasksFile)) {
      tasks = await fs.readJson(tasksFile);
    }
    tasks.tasks.push(task);
    await fs.writeJson(tasksFile, tasks);

    return task;
  }

  async getTask(projectId, taskId) {
    const tasksFile = path.join(this.tasksDir, `${projectId}.json`);
    if (!await fs.exists(tasksFile)) return null;

    const tasks = await fs.readJson(tasksFile);
    return tasks.tasks.find(t => t.id === taskId) || null;
  }

  async listTasks(projectId, filter = {}) {
    const tasksFile = path.join(this.tasksDir, `${projectId}.json`);
    if (!await fs.exists(tasksFile)) return [];

    let tasks = await fs.readJson(tasksFile);
    tasks = tasks.tasks;

    // Apply filters
    if (filter.status) {
      tasks = tasks.filter(t => t.stage === filter.status);
    }
    if (filter.priority) {
      tasks = tasks.filter(t => t.priority === filter.priority);
    }
    if (filter.assigned) {
      tasks = tasks.filter(t => t.assigned_to === filter.assigned);
    }

    // Sort by priority descending, then by created date
    const priorityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
    return tasks.sort((a, b) => {
      const aPriority = priorityOrder[a.priority] !== undefined ? priorityOrder[a.priority] : 3;
      const bPriority = priorityOrder[b.priority] !== undefined ? priorityOrder[b.priority] : 3;
      const priorityDiff = aPriority - bPriority;
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }

  async updateTask(projectId, taskId, updates) {
    const tasksFile = path.join(this.tasksDir, `${projectId}.json`);

    if (!await fs.exists(tasksFile)) {
      throw new Error(`Task ${taskId} not found`);
    }

    const tasks = await fs.readJson(tasksFile);
    const taskIndex = tasks.tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) throw new Error(`Task ${taskId} not found`);

    tasks.tasks[taskIndex] = {
      ...tasks.tasks[taskIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    await fs.writeJson(tasksFile, tasks);
    return tasks.tasks[taskIndex];
  }

  async deleteTask(projectId, taskId) {
    const tasksFile = path.join(this.tasksDir, `${projectId}.json`);
    const tasks = await fs.readJson(tasksFile);
    tasks.tasks = tasks.tasks.filter(t => t.id !== taskId);
    await fs.writeJson(tasksFile, tasks);
  }

  async updateProject(projectId, updates) {
    const projects = await fs.readJson(this.projectsFile);
    const projectIndex = projects.projects.findIndex(p => p.id === projectId);

    if (projectIndex === -1) throw new Error(`Project ${projectId} not found`);

    projects.projects[projectIndex] = {
      ...projects.projects[projectIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    await fs.writeJson(this.projectsFile, projects);
    return projects.projects[projectIndex];
  }

  _defaultStages() {
    return [
      { id: 'stage-1', name: 'InQueue', order: 1, auto_invoke_agent: false, agent: null, requires_approval: false },
      { id: 'stage-2', name: 'InProgress', order: 2, auto_invoke_agent: false, agent: null, requires_approval: false },
      { id: 'stage-3', name: 'Dev-code-review', order: 3, auto_invoke_agent: true, agent: 'code-reviewer', requires_approval: true },
      { id: 'stage-4', name: 'Security-review', order: 4, auto_invoke_agent: true, agent: 'security-reviewer', requires_approval: true },
      { id: 'stage-5', name: 'QA-engineer', order: 5, auto_invoke_agent: false, agent: 'qa-tester', requires_approval: true },
      { id: 'stage-6', name: 'Final-review', order: 6, auto_invoke_agent: false, agent: null, requires_approval: true },
      { id: 'stage-7', name: 'Completed', order: 7, auto_invoke_agent: false, agent: null, requires_approval: false }
    ];
  }
}

module.exports = FileBackend;
