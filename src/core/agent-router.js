/**
 * AgentRouter - Manages agent routing and approval logic for workflow stages
 *
 * Responsible for:
 * - Determining if a stage requires approval
 * - Retrieving the agent assigned to a stage
 * - Determining if a task should auto-approve based on priority
 * - Generating complete approval state for task transitions
 */
class AgentRouter {
  /**
   * Check if a stage requires approval before transitioning to it
   *
   * @param {Object} project - Project object containing stages array
   * @param {string} stageName - Name of the stage to check
   * @returns {boolean} - True if stage requires approval, false otherwise
   */
  stageRequiresApproval(project, stageName) {
    if (!project || !project.stages || !Array.isArray(project.stages)) {
      return false;
    }

    const stage = project.stages.find(s => s.name === stageName);
    if (!stage) {
      return false;
    }

    return stage.requires_approval === true;
  }

  /**
   * Get the agent assigned to a stage
   *
   * @param {Object} project - Project object containing stages array
   * @param {string} stageName - Name of the stage
   * @returns {string|null} - Agent name if assigned, null if none or stage not found
   */
  getAgentForStage(project, stageName) {
    if (!project || !project.stages || !Array.isArray(project.stages)) {
      return null;
    }

    const stage = project.stages.find(s => s.name === stageName);
    if (!stage) {
      return null;
    }

    return stage.agent || null;
  }

  /**
   * Determine if a task should automatically approve based on its priority
   *
   * CRITICAL priority tasks bypass approval requirements
   *
   * @param {Object} task - Task object with priority field
   * @returns {boolean} - True if task should auto-approve, false otherwise
   */
  shouldAutoApprove(task) {
    if (!task) {
      return false;
    }

    return task.priority === 'CRITICAL';
  }

  /**
   * Generate complete approval state for a task transitioning to a new stage
   *
   * Returns an object containing:
   * - requires_approval: Whether stage requires approval
   * - should_auto_approve: Whether task auto-approves based on priority
   * - agent_to_invoke: Agent name to invoke, or null
   * - status: Approval status ('pending_approval', 'auto_approved', 'no_approval_needed')
   *
   * @param {Object} project - Project object containing stages array
   * @param {string} toStage - Target stage name
   * @param {Object} task - Task object
   * @returns {Object} - Approval state object with complete information
   */
  getApprovalState(project, toStage, task) {
    const requiresApproval = this.stageRequiresApproval(project, toStage);
    const agent = this.getAgentForStage(project, toStage);
    const shouldAutoApprove = this.shouldAutoApprove(task);

    let status;
    if (!requiresApproval) {
      status = 'no_approval_needed';
    } else if (shouldAutoApprove) {
      status = 'auto_approved';
    } else {
      status = 'pending_approval';
    }

    return {
      requires_approval: requiresApproval,
      should_auto_approve: shouldAutoApprove,
      agent_to_invoke: agent,
      status: status
    };
  }
}

module.exports = AgentRouter;
