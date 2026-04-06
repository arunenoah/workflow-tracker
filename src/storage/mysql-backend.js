const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

/**
 * MySQL/SQLite storage backend for projects and tasks.
 * Supports both MySQL and SQLite (for testing).
 */
class MySQLBackend {
  /**
   * Initialize MySQL Backend storage.
   * @param {Object} config - Configuration object
   * @param {string} config.type - 'mysql' or 'sqlite'
   * @param {string} config.path - For SQLite: database file path or ':memory:'
   * @param {string} config.host - For MySQL: database host
   * @param {string} config.user - For MySQL: database user
   * @param {string} config.password - For MySQL: database password
   * @param {string} config.database - For MySQL: database name
   */
  constructor(config) {
    this.config = config;
    this.connection = null;
    this.db = null;
  }

  /**
   * Initialize database connection and create tables.
   */
  async initialize() {
    if (this.config.type === 'sqlite') {
      await this._initializeSQLite();
    } else {
      await this._initializeMySQL();
    }
  }

  /**
   * Initialize SQLite database and create tables.
   * @private
   */
  _initializeSQLite() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.config.path, async (err) => {
        if (err) {
          reject(err);
        } else {
          try {
            await this._createTablesSQLite();
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  /**
   * Initialize MySQL database and create tables.
   * @private
   */
  async _initializeMySQL() {
    this.connection = await mysql.createConnection({
      host: this.config.host,
      user: this.config.user,
      password: this.config.password,
      database: this.config.database
    });

    await this._createTablesMySQL();
  }

  /**
   * Create tables for SQLite.
   * @private
   */
  async _createTablesSQLite() {
    const createProjectsTable = `
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        template TEXT DEFAULT 'default',
        stages TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `;

    const createTasksTable = `
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        project TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        stage TEXT NOT NULL,
        priority TEXT DEFAULT 'MEDIUM',
        assigned_to TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        activity_log TEXT,
        FOREIGN KEY(project) REFERENCES projects(id)
      )
    `;

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(createProjectsTable, (err) => {
          if (err) {
            reject(err);
          } else {
            this.db.run(createTasksTable, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          }
        });
      });
    });
  }

  /**
   * Create tables for MySQL.
   * @private
   */
  async _createTablesMySQL() {
    const createProjectsTable = `
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        template VARCHAR(50) DEFAULT 'default',
        stages JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    const createTasksTable = `
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(255) PRIMARY KEY,
        project VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description LONGTEXT,
        stage VARCHAR(100) NOT NULL,
        priority VARCHAR(20) DEFAULT 'MEDIUM',
        assigned_to VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        activity_log JSON,
        FOREIGN KEY(project) REFERENCES projects(id),
        INDEX idx_project_stage_priority (project, stage, priority)
      )
    `;

    await this.connection.execute(createProjectsTable);
    await this.connection.execute(createTasksTable);
  }

  /**
   * Create a new project.
   * @param {string} projectId - Unique project ID
   * @param {Object} projectData - Project data
   * @returns {Promise<Object>} Created project object
   */
  async createProject(projectId, projectData) {
    const id = projectId;
    const stages = JSON.stringify(projectData.stages || this._defaultStages());
    const now = new Date().toISOString();

    if (this.config.type === 'sqlite') {
      return new Promise((resolve, reject) => {
        this.db.run(
          'INSERT INTO projects (id, name, template, stages, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
          [id, projectData.name, projectData.template || 'default', stages, now, now],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({
                id,
                ...projectData,
                template: projectData.template || 'default',
                stages: JSON.parse(stages),
                created_at: now,
                updated_at: now
              });
            }
          }
        );
      });
    } else {
      await this.connection.execute(
        'INSERT INTO projects (id, name, template, stages, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [id, projectData.name, projectData.template || 'default', stages, now, now]
      );
      return {
        id,
        ...projectData,
        template: projectData.template || 'default',
        stages: JSON.parse(stages),
        created_at: now,
        updated_at: now
      };
    }
  }

  /**
   * Retrieve a project by ID.
   * @param {string} projectId - Project ID
   * @returns {Promise<Object|null>} Project object or null
   */
  async getProject(projectId) {
    if (this.config.type === 'sqlite') {
      return new Promise((resolve, reject) => {
        this.db.get('SELECT * FROM projects WHERE id = ?', [projectId], (err, row) => {
          if (err) {
            reject(err);
          } else if (!row) {
            resolve(null);
          } else {
            resolve({
              ...row,
              stages: JSON.parse(row.stages)
            });
          }
        });
      });
    } else {
      const [rows] = await this.connection.execute('SELECT * FROM projects WHERE id = ?', [projectId]);
      if (!rows.length) return null;
      return {
        ...rows[0],
        stages: JSON.parse(rows[0].stages)
      };
    }
  }

  /**
   * List all projects.
   * @returns {Promise<Array>} Array of projects
   */
  async listProjects() {
    if (this.config.type === 'sqlite') {
      return new Promise((resolve, reject) => {
        this.db.all('SELECT * FROM projects ORDER BY created_at DESC', [], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            const projects = (rows || []).map(row => ({
              ...row,
              stages: JSON.parse(row.stages)
            }));
            resolve(projects);
          }
        });
      });
    } else {
      const [rows] = await this.connection.execute('SELECT * FROM projects ORDER BY created_at DESC');
      return rows.map(row => ({
        ...row,
        stages: JSON.parse(row.stages)
      }));
    }
  }

  /**
   * Create a new task in a project.
   * @param {string} projectId - Project ID
   * @param {Object} taskData - Task data
   * @returns {Promise<Object>} Created task object
   */
  async createTask(projectId, taskData) {
    const taskId = `task-${uuidv4().slice(0, 8)}`;
    const activityLog = JSON.stringify(taskData.activity_log || []);
    const now = new Date().toISOString();

    if (this.config.type === 'sqlite') {
      return new Promise((resolve, reject) => {
        this.db.run(
          'INSERT INTO tasks (id, project, name, description, stage, priority, assigned_to, created_at, updated_at, activity_log) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            taskId,
            projectId,
            taskData.name,
            taskData.description || '',
            taskData.stage || 'InQueue',
            taskData.priority || 'MEDIUM',
            taskData.assigned_to || null,
            now,
            now,
            activityLog
          ],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({
                id: taskId,
                project: projectId,
                ...taskData,
                stage: taskData.stage || 'InQueue',
                priority: taskData.priority || 'MEDIUM',
                description: taskData.description || '',
                assigned_to: taskData.assigned_to || null,
                created_at: now,
                updated_at: now,
                activity_log: JSON.parse(activityLog)
              });
            }
          }
        );
      });
    } else {
      await this.connection.execute(
        'INSERT INTO tasks (id, project, name, description, stage, priority, assigned_to, created_at, updated_at, activity_log) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          taskId,
          projectId,
          taskData.name,
          taskData.description || '',
          taskData.stage || 'InQueue',
          taskData.priority || 'MEDIUM',
          taskData.assigned_to || null,
          now,
          now,
          activityLog
        ]
      );
      return {
        id: taskId,
        project: projectId,
        ...taskData,
        stage: taskData.stage || 'InQueue',
        priority: taskData.priority || 'MEDIUM',
        description: taskData.description || '',
        assigned_to: taskData.assigned_to || null,
        created_at: now,
        updated_at: now,
        activity_log: JSON.parse(activityLog)
      };
    }
  }

  /**
   * Retrieve a task by ID.
   * @param {string} projectId - Project ID
   * @param {string} taskId - Task ID
   * @returns {Promise<Object|null>} Task object or null
   */
  async getTask(projectId, taskId) {
    if (this.config.type === 'sqlite') {
      return new Promise((resolve, reject) => {
        this.db.get('SELECT * FROM tasks WHERE id = ? AND project = ?', [taskId, projectId], (err, row) => {
          if (err) {
            reject(err);
          } else if (!row) {
            resolve(null);
          } else {
            resolve({
              ...row,
              activity_log: row.activity_log ? JSON.parse(row.activity_log) : []
            });
          }
        });
      });
    } else {
      const [rows] = await this.connection.execute('SELECT * FROM tasks WHERE id = ? AND project = ?', [taskId, projectId]);
      if (!rows.length) return null;
      return {
        ...rows[0],
        activity_log: rows[0].activity_log ? JSON.parse(rows[0].activity_log) : []
      };
    }
  }

  /**
   * List tasks for a project with optional filtering.
   * @param {string} projectId - Project ID
   * @param {Object} filter - Filter options (status, priority, assigned)
   * @returns {Promise<Array>} Array of tasks
   */
  async listTasks(projectId, filter = {}) {
    let query = 'SELECT * FROM tasks WHERE project = ?';
    const params = [projectId];

    // Apply filters
    if (filter.status) {
      query += ' AND stage = ?';
      params.push(filter.status);
    }
    if (filter.priority) {
      query += ' AND priority = ?';
      params.push(filter.priority);
    }
    if (filter.assigned) {
      query += ' AND assigned_to = ?';
      params.push(filter.assigned);
    }

    // Order by priority and created_at
    query += ' ORDER BY CASE priority WHEN "CRITICAL" THEN 0 WHEN "HIGH" THEN 1 WHEN "MEDIUM" THEN 2 ELSE 3 END ASC, created_at DESC';

    if (this.config.type === 'sqlite') {
      return new Promise((resolve, reject) => {
        this.db.all(query, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            const tasks = (rows || []).map(row => ({
              ...row,
              activity_log: row.activity_log ? JSON.parse(row.activity_log) : []
            }));
            resolve(tasks);
          }
        });
      });
    } else {
      const [rows] = await this.connection.execute(query, params);
      return rows.map(row => ({
        ...row,
        activity_log: row.activity_log ? JSON.parse(row.activity_log) : []
      }));
    }
  }

  /**
   * Update a task.
   * @param {string} projectId - Project ID
   * @param {string} taskId - Task ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated task object
   */
  async updateTask(projectId, taskId, updates) {
    const now = new Date().toISOString();
    const task = await this.getTask(projectId, taskId);

    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    const updatedTask = {
      ...task,
      ...updates,
      updated_at: now
    };

    const activityLog = updates.activity_log
      ? JSON.stringify(updates.activity_log)
      : (task.activity_log ? JSON.stringify(task.activity_log) : JSON.stringify([]));

    if (this.config.type === 'sqlite') {
      return new Promise((resolve, reject) => {
        const fields = [];
        const values = [];

        Object.keys(updates).forEach(key => {
          if (key === 'activity_log') {
            fields.push('activity_log = ?');
            values.push(activityLog);
          } else {
            fields.push(`${key} = ?`);
            values.push(updates[key]);
          }
        });

        fields.push('updated_at = ?');
        values.push(now);
        values.push(taskId);
        values.push(projectId);

        const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND project = ?`;

        this.db.run(query, values, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(updatedTask);
          }
        });
      });
    } else {
      const fields = [];
      const values = [];

      Object.keys(updates).forEach(key => {
        if (key === 'activity_log') {
          fields.push('activity_log = ?');
          values.push(activityLog);
        } else {
          fields.push(`${key} = ?`);
          values.push(updates[key]);
        }
      });

      fields.push('updated_at = ?');
      values.push(now);
      values.push(taskId);
      values.push(projectId);

      const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND project = ?`;
      await this.connection.execute(query, values);

      return updatedTask;
    }
  }

  /**
   * Delete a task.
   * @param {string} projectId - Project ID
   * @param {string} taskId - Task ID
   * @returns {Promise<void>}
   */
  async deleteTask(projectId, taskId) {
    if (this.config.type === 'sqlite') {
      return new Promise((resolve, reject) => {
        this.db.run('DELETE FROM tasks WHERE id = ? AND project = ?', [taskId, projectId], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } else {
      await this.connection.execute('DELETE FROM tasks WHERE id = ? AND project = ?', [taskId, projectId]);
    }
  }

  /**
   * Update a project.
   * @param {string} projectId - Project ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated project object
   */
  async updateProject(projectId, updates) {
    const now = new Date().toISOString();
    const project = await this.getProject(projectId);

    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const updatedProject = {
      ...project,
      ...updates,
      updated_at: now
    };

    const stages = updates.stages
      ? JSON.stringify(updates.stages)
      : (project.stages ? JSON.stringify(project.stages) : JSON.stringify(this._defaultStages()));

    if (this.config.type === 'sqlite') {
      return new Promise((resolve, reject) => {
        const fields = [];
        const values = [];

        Object.keys(updates).forEach(key => {
          if (key === 'stages') {
            fields.push('stages = ?');
            values.push(stages);
          } else {
            fields.push(`${key} = ?`);
            values.push(updates[key]);
          }
        });

        fields.push('updated_at = ?');
        values.push(now);
        values.push(projectId);

        const query = `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`;

        this.db.run(query, values, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(updatedProject);
          }
        });
      });
    } else {
      const fields = [];
      const values = [];

      Object.keys(updates).forEach(key => {
        if (key === 'stages') {
          fields.push('stages = ?');
          values.push(stages);
        } else {
          fields.push(`${key} = ?`);
          values.push(updates[key]);
        }
      });

      fields.push('updated_at = ?');
      values.push(now);
      values.push(projectId);

      const query = `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`;
      await this.connection.execute(query, values);

      return updatedProject;
    }
  }

  /**
   * Close database connection.
   * @returns {Promise<void>}
   */
  async close() {
    if (this.config.type === 'sqlite' && this.db) {
      return new Promise((resolve, reject) => {
        this.db.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } else if (this.connection) {
      await this.connection.end();
    }
  }

  /**
   * Get default project stages.
   * @private
   * @returns {Array} Default stages array
   */
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

module.exports = MySQLBackend;
