/**
 * Plan Sync - Synchronize plan to Workflow-Tracker
 * 
 * Reads plan file and creates project + tasks in Workflow-Tracker
 */

const fs = require('fs-extra');
const path = require('path');

class PlanSync {
  constructor(taskManager, projectManager) {
    this.taskManager = taskManager;
    this.projectManager = projectManager;
  }

  /**
   * Sync plan to Workflow-Tracker
   * @param {string} planPath - Path to plan file (from .claude/plans/)
   * @returns {Promise<Object>} Sync result { projectId, taskCount, tasks }
   */
  async syncPlan(planPath) {
    try {
      // Read plan file
      const planContent = await fs.readFile(planPath, 'utf-8');
      
      // Parse plan
      const plan = this._parsePlan(planContent);
      
      if (!plan) {
        throw new Error('Could not parse plan file');
      }

      // Create project if it doesn't exist
      const projectId = this._slugify(plan.name);
      let project = await this._getOrCreateProject(projectId, plan);

      // Extract and create tasks from plan
      const tasks = this._extractTasks(planContent);
      
      // Add tasks to project
      const createdTasks = [];
      for (const task of tasks) {
        const created = await this.taskManager.create(projectId, {
          name: task.title,
          description: task.description || '',
          priority: task.priority || 'MEDIUM',
          stage: 'InQueue',
          due_date: task.dueDate || null
        });
        createdTasks.push(created);
      }

      return {
        success: true,
        projectId: projectId,
        projectName: plan.name,
        taskCount: createdTasks.length,
        tasks: createdTasks.map(t => ({
          id: t.id,
          name: t.name,
          priority: t.priority
        }))
      };
    } catch (error) {
      console.error('[PlanSync] Error syncing plan:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Parse plan frontmatter to extract project name
   * @private
   */
  _parsePlan(content) {
    // Look for title like "# Feature Name" or "# Implementation Plan: Feature Name"
    const titleMatch = content.match(/^#\s+([^\n]+)/m);
    if (!titleMatch) return null;

    const name = titleMatch[1]
      .replace(/implementation plan:\s*/i, '')
      .replace(/tasks?\s*\d+-\d+\s*/i, '')
      .trim();

    return { name };
  }

  /**
   * Extract tasks from plan content
   * @private
   */
  _extractTasks(content) {
    const tasks = [];
    
    // Look for task patterns
    // Pattern 1: "## Task X: Title"
    const taskHeaders = content.match(/^#{2,3}\s+(?:Task\s+\d+[\s:]*)?(.+?)$/gm);
    
    if (taskHeaders) {
      taskHeaders.forEach((header, index) => {
        const title = header.replace(/^#{2,3}\s+(?:Task\s+\d+[\s:]*)?/, '').trim();
        if (title && title.length > 0) {
          tasks.push({
            title: title,
            priority: index === 0 ? 'HIGH' : 'MEDIUM',
            dueDate: null
          });
        }
      });
    }

    // Pattern 2: Look for checklist items
    if (tasks.length === 0) {
      const checkboxMatches = content.match(/^[-*]\s+(\[[ x]\]\s+)?(.+?)$/gm);
      if (checkboxMatches) {
        checkboxMatches.forEach(item => {
          const title = item.replace(/^[-*]\s+(\[[ x]\]\s+)?/, '').trim();
          if (title && !title.toLowerCase().includes('verify') && !title.toLowerCase().includes('all tests')) {
            tasks.push({
              title: title,
              priority: 'MEDIUM',
              dueDate: null
            });
          }
        });
      }
    }

    // If still no tasks, create a generic one
    if (tasks.length === 0) {
      tasks.push({
        title: 'Complete implementation',
        priority: 'HIGH',
        dueDate: null
      });
    }

    return tasks;
  }

  /**
   * Get or create project
   * @private
   */
  async _getOrCreateProject(projectId, plan) {
    try {
      const existing = await this.projectManager.get(projectId);
      return existing;
    } catch (error) {
      // Project doesn't exist, create it
      const created = await this.projectManager.create(projectId, {
        name: plan.name,
        description: `Tasks from plan: ${plan.name}`
      });
      return created;
    }
  }

  /**
   * Convert string to slug format
   * @private
   */
  _slugify(str) {
    return str
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .slice(0, 50);
  }

  /**
   * Sync issues from agent review to tasks
   * @param {string} projectId - Project ID
   * @param {Object} agentResult - Result from agent review
   * @param {string} agentName - Name of agent (code-reviewer, security-reviewer, etc)
   * @returns {Promise<Object>} Created issues as tasks
   */
  async syncAgentIssues(projectId, agentResult, agentName) {
    try {
      if (!agentResult.findings || agentResult.findings.length === 0) {
        return { success: true, issueCount: 0 };
      }

      const createdIssues = [];

      for (const finding of agentResult.findings) {
        const issue = await this.taskManager.create(projectId, {
          name: `[${agentName}] ${finding.type}: ${finding.message}`,
          description: `Issue found by ${agentName}\nType: ${finding.type}\nSeverity: ${finding.severity || 'MEDIUM'}\nMessage: ${finding.message}`,
          priority: this._severityToPriority(finding.severity),
          stage: 'InQueue'
        });
        createdIssues.push(issue);
      }

      return {
        success: true,
        issueCount: createdIssues.length,
        issues: createdIssues
      };
    } catch (error) {
      console.error('[PlanSync] Error syncing issues:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Convert severity to priority
   * @private
   */
  _severityToPriority(severity) {
    const map = {
      'CRITICAL': 'CRITICAL',
      'HIGH': 'HIGH',
      'MEDIUM': 'MEDIUM',
      'LOW': 'LOW'
    };
    return map[severity] || 'MEDIUM';
  }

  /**
   * Mark project as complete
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Completion result
   */
  async markProjectComplete(projectId) {
    try {
      // Get all tasks in project
      const tasks = await this.taskManager.list(projectId);

      // Mark all as completed
      const completed = [];
      for (const task of tasks) {
        if (task.stage !== 'Completed') {
          const updated = await this.taskManager.update(projectId, task.id, {
            stage: 'Completed'
          });
          completed.push(updated);
        }
      }

      return {
        success: true,
        markedComplete: completed.length,
        message: `Project "${projectId}" marked complete with ${completed.length} tasks finished`
      };
    } catch (error) {
      console.error('[PlanSync] Error marking complete:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get pending tasks to resume from
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Pending tasks
   */
  async getPendingTasks(projectId) {
    try {
      const tasks = await this.taskManager.list(projectId);
      
      const pending = tasks.filter(t => t.stage !== 'Completed');
      const inProgress = tasks.filter(t => t.stage === 'InProgress');
      const inReview = tasks.filter(t => 
        t.stage === 'Code-Review' || 
        t.stage === 'Security-Review' || 
        t.stage === 'QA-Testing'
      );

      return {
        success: true,
        projectId: projectId,
        totalTasks: tasks.length,
        pendingCount: pending.length,
        inProgress: inProgress,
        inReview: inReview,
        pending: pending,
        nextSteps: this._suggestNextSteps(pending, inProgress, inReview)
      };
    } catch (error) {
      console.error('[PlanSync] Error getting pending tasks:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Suggest next steps based on pending tasks
   * @private
   */
  _suggestNextSteps(pending, inProgress, inReview) {
    const steps = [];

    if (inProgress.length > 0) {
      steps.push(`Continue with ${inProgress.length} in-progress tasks`);
    }

    if (inReview.length > 0) {
      steps.push(`Address ${inReview.length} tasks waiting for review`);
    }

    if (pending.length > 0 && inProgress.length === 0) {
      steps.push(`Start next task: ${pending[0].name}`);
    }

    if (pending.length === 0) {
      steps.push('All tasks completed!');
    }

    return steps;
  }
}

module.exports = PlanSync;
