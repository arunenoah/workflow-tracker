const express = require('express');

/**
 * Create API router with all dashboard endpoints
 * @param {TaskManager} taskManager
 * @param {ProjectManager} projectManager
 * @param {AgentRouter} agentRouter
 * @param {Function} broadcast - Function to broadcast messages to all WebSocket clients
 * @returns {Router} Express router
 */
function createApiRouter(taskManager, projectManager, agentRouter, broadcast) {
  const router = express.Router();

  // ===== PROJECTS =====

  // GET /api/projects
  router.get('/projects', async (req, res) => {
    try {
      const projects = await projectManager.list();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/projects/:projectId
  router.get('/projects/:projectId', async (req, res) => {
    try {
      const project = await projectManager.get(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== TASKS =====

  // GET /api/projects/:projectId/tasks
  router.get('/projects/:projectId/tasks', async (req, res) => {
    try {
      const { priority, stage } = req.query;
      const filter = {};
      if (priority) filter.priority = priority;
      if (stage) filter.stage = stage;

      const tasks = await taskManager.list(req.params.projectId, filter);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/projects/:projectId/tasks
  router.post('/projects/:projectId/tasks', async (req, res) => {
    try {
      const task = await taskManager.create(req.params.projectId, req.body);
      broadcast({
        type: 'task-created',
        payload: { projectId: req.params.projectId, task },
      });
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // GET /api/projects/:projectId/tasks/:taskId
  router.get('/projects/:projectId/tasks/:taskId', async (req, res) => {
    try {
      const task = await taskManager.get(req.params.projectId, req.params.taskId);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/projects/:projectId/tasks/:taskId
  router.put('/projects/:projectId/tasks/:taskId', async (req, res) => {
    try {
      const task = await taskManager.update(req.params.projectId, req.params.taskId, req.body);
      broadcast({
        type: 'task-updated',
        payload: { projectId: req.params.projectId, task },
      });
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // DELETE /api/projects/:projectId/tasks/:taskId
  router.delete('/projects/:projectId/tasks/:taskId', async (req, res) => {
    try {
      await taskManager.delete(req.params.projectId, req.params.taskId);
      broadcast({
        type: 'task-deleted',
        payload: { projectId: req.params.projectId, taskId: req.params.taskId },
      });
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // ===== TASK MOVEMENT & APPROVAL =====

  // POST /api/projects/:projectId/tasks/:taskId/move
  router.post('/projects/:projectId/tasks/:taskId/move', async (req, res) => {
    try {
      const { to_stage } = req.body;
      if (!to_stage) {
        return res.status(400).json({ error: 'to_stage is required' });
      }

      const task = await taskManager.get(req.params.projectId, req.params.taskId);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const project = await projectManager.get(req.params.projectId);
      const approvalState = agentRouter.getApprovalState(project, to_stage, task);

      // Move task
      const updated = await taskManager.moveTask(
        req.params.projectId,
        req.params.taskId,
        to_stage
      );

      broadcast({
        type: 'task-moved',
        payload: {
          projectId: req.params.projectId,
          task: updated,
          approval_state: approvalState,
        },
      });

      res.json({ ...updated, approval_state: approvalState });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // POST /api/projects/:projectId/tasks/:taskId/approve
  router.post('/projects/:projectId/tasks/:taskId/approve', async (req, res) => {
    try {
      const task = await taskManager.get(req.params.projectId, req.params.taskId);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Add approval to activity log
      const updated = await taskManager.update(req.params.projectId, req.params.taskId, {
        approval_status: 'approved',
      });

      broadcast({
        type: 'task-approved',
        payload: { projectId: req.params.projectId, task: updated },
      });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // POST /api/projects/:projectId/tasks/:taskId/reject
  router.post('/projects/:projectId/tasks/:taskId/reject', async (req, res) => {
    try {
      const { reason } = req.body;
      const task = await taskManager.get(req.params.projectId, req.params.taskId);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const updated = await taskManager.update(req.params.projectId, req.params.taskId, {
        approval_status: 'rejected',
        rejection_reason: reason,
      });

      broadcast({
        type: 'task-rejected',
        payload: { projectId: req.params.projectId, task: updated },
      });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // ===== STAGES =====

  // POST /api/projects/:projectId/stages
  router.post('/projects/:projectId/stages', async (req, res) => {
    try {
      const { name, order } = req.body;
      if (!name || order === undefined) {
        return res.status(400).json({ error: 'name and order are required' });
      }

      const updatedProject = await projectManager.addStage(req.params.projectId, name, order);
      // Get the newly added stage (last one in the array)
      const stage = updatedProject.stages[updatedProject.stages.length - 1];

      broadcast({
        type: 'stage-added',
        payload: { projectId: req.params.projectId, stage },
      });

      res.status(201).json(stage);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // PUT /api/projects/:projectId/stages/reorder (must be before /:stageId route)
  router.put('/projects/:projectId/stages/reorder', async (req, res) => {
    try {
      const { stages } = req.body;
      if (!Array.isArray(stages)) {
        return res.status(400).json({ error: 'stages array is required' });
      }

      await projectManager.updateStages(req.params.projectId, stages);

      broadcast({
        type: 'stages-reordered',
        payload: { projectId: req.params.projectId, stages },
      });

      res.json(stages);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // PUT /api/projects/:projectId/stages/:stageId
  router.put('/projects/:projectId/stages/:stageId', async (req, res) => {
    try {
      const project = await projectManager.get(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Find and update the stage
      const stageIndex = project.stages.findIndex(s => s.id === req.params.stageId);
      if (stageIndex === -1) {
        return res.status(404).json({ error: 'Stage not found' });
      }

      const updated = { ...project.stages[stageIndex], ...req.body };
      project.stages[stageIndex] = updated;
      await projectManager.updateStages(req.params.projectId, project.stages);

      broadcast({
        type: 'stage-updated',
        payload: { projectId: req.params.projectId, stage: updated },
      });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // DELETE /api/projects/:projectId/stages/:stageName
  router.delete('/projects/:projectId/stages/:stageName', async (req, res) => {
    try {
      await projectManager.removeStage(req.params.projectId, req.params.stageName);

      broadcast({
        type: 'stage-removed',
        payload: { projectId: req.params.projectId, stageName: req.params.stageName },
      });

      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}

module.exports = createApiRouter;
