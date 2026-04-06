/**
 * TaskManager - Manages task operations and activity logging
 *
 * Handles task CRUD operations, state transitions, priority management,
 * and automatic activity logging for audit trails.
 */
class TaskManager {
  constructor(storage) {
    this.storage = storage;
    this.validPriorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  }

  /**
   * Create a new task with default values
   * @param {string} projectId - Project identifier
   * @param {object} taskData - Task data (name, description, etc.)
   * @returns {Promise<object>} Created task with defaults applied
   */
  async create(projectId, taskData) {
    const defaults = {
      priority: 'MEDIUM',
      stage: 'InQueue',
      assigned_to: null,
      description: '',
      due_date: null,
      labels: [],
      activity_log: [{
        action: 'created',
        timestamp: new Date().toISOString()
      }]
    };

    const finalTask = { ...defaults, ...taskData };
    return await this.storage.createTask(projectId, finalTask);
  }

  /**
   * Move a task to a different stage with activity logging
   * @param {string} projectId - Project identifier
   * @param {string} taskId - Task identifier
   * @param {string} toStage - Target stage name
   * @returns {Promise<object>} Updated task with move logged
   */
  async moveTask(projectId, taskId, toStage) {
    const task = await this.storage.getTask(projectId, taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const fromStage = task.stage;
    const updatedTask = await this.storage.updateTask(projectId, taskId, {
      stage: toStage,
      activity_log: [
        ...(task.activity_log || []),
        {
          action: 'moved',
          from_stage: fromStage,
          to_stage: toStage,
          timestamp: new Date().toISOString()
        }
      ]
    });

    return updatedTask;
  }

  /**
   * List tasks for a project with optional filtering
   * @param {string} projectId - Project identifier
   * @param {object} filter - Optional filter criteria (priority, stage, assigned)
   * @returns {Promise<array>} Sorted tasks (priority DESC, then created_at DESC)
   */
  async list(projectId, filter = {}) {
    return await this.storage.listTasks(projectId, filter);
  }

  /**
   * Retrieve a single task by ID
   * @param {string} projectId - Project identifier
   * @param {string} taskId - Task identifier
   * @returns {Promise<object|null>} Task object or null if not found
   */
  async get(projectId, taskId) {
    return await this.storage.getTask(projectId, taskId);
  }

  /**
   * Update a task and log the changes
   * @param {string} projectId - Project identifier
   * @param {string} taskId - Task identifier
   * @param {object} updates - Fields to update
   * @returns {Promise<object>} Updated task with changes logged
   */
  async update(projectId, taskId, updates) {
    const task = await this.storage.getTask(projectId, taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const updatedTask = await this.storage.updateTask(projectId, taskId, {
      ...updates,
      activity_log: [
        ...(task.activity_log || []),
        {
          action: 'updated',
          changes: Object.keys(updates),
          timestamp: new Date().toISOString()
        }
      ]
    });

    return updatedTask;
  }

  /**
   * Delete a task
   * @param {string} projectId - Project identifier
   * @param {string} taskId - Task identifier
   * @returns {Promise<void>}
   */
  async delete(projectId, taskId) {
    await this.storage.deleteTask(projectId, taskId);
  }

  /**
   * Set task priority with validation
   * @param {string} projectId - Project identifier
   * @param {string} taskId - Task identifier
   * @param {string} priority - Priority level (CRITICAL, HIGH, MEDIUM, LOW)
   * @returns {Promise<object>} Updated task
   * @throws {Error} If priority is invalid
   */
  async setPriority(projectId, taskId, priority) {
    if (!this.validPriorities.includes(priority)) {
      throw new Error(`Invalid priority: ${priority}`);
    }
    return await this.update(projectId, taskId, { priority });
  }
}

module.exports = TaskManager;
