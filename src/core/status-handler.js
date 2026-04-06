/**
 * StatusHandler - Processes agent results and updates task state
 *
 * Handles task transitions based on agent scores and thresholds
 */
class StatusHandler {
  /**
   * @param {TaskManager} taskManager - For updating task state
   * @param {ProjectManager} projectManager - For fetching project/stage info
   * @param {Function} broadcast - Function to broadcast WS messages
   */
  constructor(taskManager, projectManager, broadcast = () => {}) {
    this.taskManager = taskManager;
    this.projectManager = projectManager;
    this.broadcast = broadcast;

    // Agent-specific approval thresholds
    this.thresholds = {
      'code-reviewer': 70,
      'security-reviewer': 80,
      'qa-tester': 75,
    };
  }

  /**
   * Process agent result and update task
   * @param {string} projectId - Project ID
   * @param {Object} task - Task object
   * @param {Object} agentResult - Result from agent { score, findings, summary }
   * @param {string} agentName - Name of agent
   * @returns {Promise<Object>} Updated task
   */
  async process(projectId, task, agentResult, agentName) {
    try {
      const threshold = this.getThreshold(agentName);
      const isApproved = agentResult.score >= threshold;

      // Determine next action
      let approvalStatus;
      let nextStage = null;

      if (isApproved) {
        approvalStatus = 'approved';
        // Find next stage
        const project = await this.projectManager.get(projectId);
        nextStage = this._getNextStage(project, task.stage);
      } else {
        approvalStatus = 'rejected';
        // Task stays in current stage
      }

      // Update task
      const updates = {
        approval_status: approvalStatus,
        agent_findings: agentResult.findings || [],
        agent_score: agentResult.score || 0,
        agent_summary: agentResult.summary || '',
      };

      // Move to next stage if approved and next stage exists
      if (nextStage && isApproved) {
        updates.stage = nextStage;
      }

      const updated = await this.taskManager.update(projectId, task.id, updates);

      // Broadcast update
      if (nextStage && isApproved) {
        this.broadcast({
          type: 'task-moved',
          payload: { projectId, task: updated },
        });
      } else {
        this.broadcast({
          type: 'task-updated',
          payload: { projectId, task: updated },
        });
      }

      return updated;
    } catch (error) {
      console.error('[StatusHandler] Process error:', error);
      throw error;
    }
  }

  /**
   * Get approval threshold for an agent
   * @param {string} agentName - Agent name
   * @returns {number} Threshold score (0-100)
   */
  getThreshold(agentName) {
    return this.thresholds[agentName] || 75;
  }

  /**
   * Get the next stage after current stage
   * @private
   */
  _getNextStage(project, currentStageName) {
    if (!project || !project.stages || !Array.isArray(project.stages)) {
      return null;
    }

    // Find current stage
    const currentStage = project.stages.find(s => s.name === currentStageName);
    if (!currentStage) {
      return null;
    }

    // Find next stage by order
    const nextStage = project.stages.find(s => s.order === currentStage.order + 1);

    return nextStage ? nextStage.name : null;
  }
}

module.exports = StatusHandler;
