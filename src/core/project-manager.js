/**
 * ProjectManager - Manages project operations and configuration
 *
 * Handles project CRUD operations, stage management, and workflow configuration.
 */
class ProjectManager {
  constructor(storage) {
    this.storage = storage;
  }

  /**
   * Create a new project
   * @param {string} projectId - Unique project identifier
   * @param {object} projectData - Project metadata (name, description, etc.)
   * @returns {Promise<object>} Created project with default stages
   */
  async create(projectId, projectData) {
    return await this.storage.createProject(projectId, projectData);
  }

  /**
   * Retrieve a project by ID
   * @param {string} projectId - Project identifier
   * @returns {Promise<object|null>} Project object or null if not found
   */
  async get(projectId) {
    return await this.storage.getProject(projectId);
  }

  /**
   * List all projects
   * @returns {Promise<array>} Array of all projects
   */
  async list() {
    return await this.storage.listProjects();
  }

  /**
   * Update project stages
   * @param {string} projectId - Project identifier
   * @param {array} stages - Array of stage objects with configuration
   * @returns {Promise<object>} Updated project
   * @throws {Error} If project not found
   */
  async updateStages(projectId, stages) {
    const project = await this.storage.getProject(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);

    return await this.storage.updateProject(projectId, { stages });
  }

  /**
   * Add a custom stage to a project
   * @param {string} projectId - Project identifier
   * @param {string} stageName - Name of the new stage
   * @param {number} order - Order/position of stage in workflow
   * @returns {Promise<object>} Updated project with new stage
   * @throws {Error} If project not found
   */
  async addStage(projectId, stageName, order) {
    const project = await this.storage.getProject(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);

    const newStage = {
      id: `stage-${Date.now()}`,
      name: stageName,
      order: order || (project.stages.length + 1),
      auto_invoke_agent: false,
      agent: null,
      requires_approval: false
    };

    const updatedStages = [...project.stages, newStage];
    return await this.storage.updateProject(projectId, { stages: updatedStages });
  }

  /**
   * Remove a stage from a project
   * @param {string} projectId - Project identifier
   * @param {string} stageName - Name of the stage to remove
   * @returns {Promise<object>} Updated project with stage removed
   * @throws {Error} If project not found
   */
  async removeStage(projectId, stageName) {
    const project = await this.storage.getProject(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);

    const updatedStages = project.stages.filter(s => s.name !== stageName);
    return await this.storage.updateProject(projectId, { stages: updatedStages });
  }
}

module.exports = ProjectManager;
