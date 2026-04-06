/**
 * AgentInvoker - Executes agents asynchronously on tasks
 *
 * Manages agent execution, status tracking, and result handling
 */
class AgentInvoker {
  /**
   * @param {TaskManager} taskManager - For updating task status
   * @param {ProjectManager} projectManager - For fetching project info
   * @param {Function} broadcast - Function to broadcast WS messages
   */
  constructor(taskManager, projectManager, broadcast = () => {}) {
    this.taskManager = taskManager;
    this.projectManager = projectManager;
    this.broadcast = broadcast;
    this.agents = {};
  }

  /**
   * Register an agent
   * @param {string} name - Agent name (e.g., 'code-reviewer')
   * @param {Object} agent - Agent instance with analyze(task) method
   */
  registerAgent(name, agent) {
    this.agents[name] = agent;
  }

  /**
   * Invoke an agent for a task (async, non-blocking)
   * @param {string} projectId - Project ID
   * @param {Object} task - Task object
   * @param {string} agentName - Name of agent to invoke
   * @returns {Promise} Resolves when agent completes (or fails)
   */
  async invoke(projectId, task, agentName) {
    // Validate agent exists
    const agent = this.agents[agentName];
    if (!agent) {
      console.warn(`[AgentInvoker] Unknown agent: ${agentName}`);
      return;
    }

    // Validate task
    if (!task || !task.id) {
      console.warn(`[AgentInvoker] Invalid task for agent ${agentName}`);
      return;
    }

    try {
      // Set status to running
      await this._setStatus(projectId, task.id, 'running', {
        agent_name: agentName,
      });

      // Invoke agent (analyze task)
      let result;
      try {
        result = await agent.analyze(task);
      } catch (agentError) {
        console.error(`[AgentInvoker] Agent ${agentName} failed:`, agentError);
        // Set failed status and return
        await this._setStatus(projectId, task.id, 'failed', {
          agent_name: agentName,
          agent_findings: [],
        });
        return;
      }

      // Set status to completed with findings
      await this._setStatus(projectId, task.id, 'completed', {
        agent_name: agentName,
        agent_score: result.score || 0,
        agent_findings: result.findings || [],
        agent_summary: result.summary || 'Completed',
      });
    } catch (error) {
      console.error(`[AgentInvoker] Invocation error for ${agentName}:`, error);
    }
  }

  /**
   * Update task status and broadcast
   * @private
   */
  async _setStatus(projectId, taskId, status, extra = {}) {
    try {
      const update = {
        agent_status: status,
        ...extra,
      };

      const updated = await this.taskManager.update(projectId, taskId, update);

      // Broadcast update
      this.broadcast({
        type: 'task-updated',
        payload: { projectId, task: updated },
      });

      return updated;
    } catch (error) {
      console.error(`[AgentInvoker] Status update failed:`, error);
      throw error;
    }
  }
}

module.exports = AgentInvoker;
