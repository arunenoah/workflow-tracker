/**
 * API Client - REST API wrapper for dashboard operations
 */

const API = {
  baseURL: '/api',

  /**
   * Make a fetch request
   */
  async request(method, endpoint, body = null) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const res = await fetch(url, options);
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      return { status: res.status, data };
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  },

  // ===== PROJECTS =====

  getProjects() {
    return this.request('GET', '/projects').then(r => r.data);
  },

  getProject(projectId) {
    return this.request('GET', `/projects/${projectId}`).then(r => r.data);
  },

  // ===== TASKS =====

  getTasks(projectId, filter = {}) {
    const params = new URLSearchParams();
    if (filter.priority) params.append('priority', filter.priority);
    if (filter.stage) params.append('stage', filter.stage);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request('GET', `/projects/${projectId}/tasks${query}`).then(r => r.data);
  },

  getTask(projectId, taskId) {
    return this.request('GET', `/projects/${projectId}/tasks/${taskId}`).then(r => r.data);
  },

  createTask(projectId, data) {
    return this.request('POST', `/projects/${projectId}/tasks`, data).then(r => r.data);
  },

  updateTask(projectId, taskId, data) {
    return this.request('PUT', `/projects/${projectId}/tasks/${taskId}`, data).then(r => r.data);
  },

  deleteTask(projectId, taskId) {
    return this.request('DELETE', `/projects/${projectId}/tasks/${taskId}`);
  },

  // ===== TASK MOVEMENT & APPROVAL =====

  moveTask(projectId, taskId, toStage) {
    return this.request('POST', `/projects/${projectId}/tasks/${taskId}/move`, {
      to_stage: toStage,
    }).then(r => r.data);
  },

  approveTask(projectId, taskId) {
    return this.request('POST', `/projects/${projectId}/tasks/${taskId}/approve`).then(r => r.data);
  },

  rejectTask(projectId, taskId, reason = '') {
    return this.request('POST', `/projects/${projectId}/tasks/${taskId}/reject`, {
      reason,
    }).then(r => r.data);
  },

  // ===== STAGES =====

  addStage(projectId, data) {
    return this.request('POST', `/projects/${projectId}/stages`, data).then(r => r.data);
  },

  updateStage(projectId, stageId, data) {
    return this.request('PUT', `/projects/${projectId}/stages/${stageId}`, data).then(r => r.data);
  },

  deleteStage(projectId, stageName) {
    return this.request('DELETE', `/projects/${projectId}/stages/${stageName}`);
  },

  reorderStages(projectId, stages) {
    return this.request('PUT', `/projects/${projectId}/stages/reorder`, {
      stages,
    }).then(r => r.data);
  },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}
