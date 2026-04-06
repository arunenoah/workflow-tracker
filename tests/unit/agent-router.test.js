const AgentRouter = require('../../src/core/agent-router');

describe('Agent Router', () => {
  let router;

  beforeEach(() => {
    router = new AgentRouter();
  });

  describe('stageRequiresApproval', () => {
    test('should return true for Dev-code-review stage', () => {
      const project = {
        id: 'test-proj',
        stages: [
          { id: 'stage-1', name: 'InQueue', requires_approval: false },
          { id: 'stage-3', name: 'Dev-code-review', requires_approval: true }
        ]
      };

      const result = router.stageRequiresApproval(project, 'Dev-code-review');
      expect(result).toBe(true);
    });

    test('should return false for InQueue stage', () => {
      const project = {
        id: 'test-proj',
        stages: [
          { id: 'stage-1', name: 'InQueue', requires_approval: false },
          { id: 'stage-3', name: 'Dev-code-review', requires_approval: true }
        ]
      };

      const result = router.stageRequiresApproval(project, 'InQueue');
      expect(result).toBe(false);
    });

    test('should return false for non-existent stage', () => {
      const project = {
        id: 'test-proj',
        stages: [
          { id: 'stage-1', name: 'InQueue', requires_approval: false }
        ]
      };

      const result = router.stageRequiresApproval(project, 'NonExistent');
      expect(result).toBe(false);
    });

    test('should handle empty stages array', () => {
      const project = {
        id: 'test-proj',
        stages: []
      };

      const result = router.stageRequiresApproval(project, 'Dev-code-review');
      expect(result).toBe(false);
    });
  });

  describe('getAgentForStage', () => {
    test('should return agent name for Dev-code-review stage', () => {
      const project = {
        id: 'test-proj',
        stages: [
          { id: 'stage-1', name: 'InQueue', agent: null },
          { id: 'stage-3', name: 'Dev-code-review', agent: 'code-reviewer' },
          { id: 'stage-4', name: 'Security-review', agent: 'security-reviewer' }
        ]
      };

      const result = router.getAgentForStage(project, 'Dev-code-review');
      expect(result).toBe('code-reviewer');
    });

    test('should return null for stage without agent', () => {
      const project = {
        id: 'test-proj',
        stages: [
          { id: 'stage-1', name: 'InQueue', agent: null },
          { id: 'stage-2', name: 'InProgress', agent: null }
        ]
      };

      const result = router.getAgentForStage(project, 'InQueue');
      expect(result).toBeNull();
    });

    test('should return null for non-existent stage', () => {
      const project = {
        id: 'test-proj',
        stages: [
          { id: 'stage-1', name: 'InQueue', agent: null }
        ]
      };

      const result = router.getAgentForStage(project, 'NonExistent');
      expect(result).toBeNull();
    });

    test('should handle multiple agents in different stages', () => {
      const project = {
        id: 'test-proj',
        stages: [
          { id: 'stage-1', name: 'InQueue', agent: null },
          { id: 'stage-3', name: 'Dev-code-review', agent: 'code-reviewer' },
          { id: 'stage-4', name: 'Security-review', agent: 'security-reviewer' },
          { id: 'stage-5', name: 'QA-engineer', agent: 'qa-tester' }
        ]
      };

      expect(router.getAgentForStage(project, 'Dev-code-review')).toBe('code-reviewer');
      expect(router.getAgentForStage(project, 'Security-review')).toBe('security-reviewer');
      expect(router.getAgentForStage(project, 'QA-engineer')).toBe('qa-tester');
      expect(router.getAgentForStage(project, 'InQueue')).toBeNull();
    });
  });

  describe('shouldAutoApprove', () => {
    test('should return true for CRITICAL priority task', () => {
      const task = {
        id: 'task-001',
        priority: 'CRITICAL',
        stage: 'Dev-code-review'
      };

      const result = router.shouldAutoApprove(task);
      expect(result).toBe(true);
    });

    test('should return false for HIGH priority task', () => {
      const task = {
        id: 'task-001',
        priority: 'HIGH',
        stage: 'Dev-code-review'
      };

      const result = router.shouldAutoApprove(task);
      expect(result).toBe(false);
    });

    test('should return false for MEDIUM priority task', () => {
      const task = {
        id: 'task-001',
        priority: 'MEDIUM',
        stage: 'Dev-code-review'
      };

      const result = router.shouldAutoApprove(task);
      expect(result).toBe(false);
    });

    test('should return false for LOW priority task', () => {
      const task = {
        id: 'task-001',
        priority: 'LOW',
        stage: 'Dev-code-review'
      };

      const result = router.shouldAutoApprove(task);
      expect(result).toBe(false);
    });

    test('should handle undefined priority', () => {
      const task = {
        id: 'task-001',
        stage: 'Dev-code-review'
      };

      const result = router.shouldAutoApprove(task);
      expect(result).toBe(false);
    });
  });

  describe('getApprovalState', () => {
    test('should return complete approval state for Dev-code-review stage with HIGH priority', () => {
      const project = {
        id: 'test-proj',
        stages: [
          { id: 'stage-1', name: 'InQueue', requires_approval: false, agent: null, auto_invoke_agent: false },
          { id: 'stage-3', name: 'Dev-code-review', requires_approval: true, agent: 'code-reviewer', auto_invoke_agent: true }
        ]
      };

      const task = {
        id: 'task-001',
        title: 'Test Task',
        priority: 'HIGH',
        stage: 'InQueue'
      };

      const result = router.getApprovalState(project, 'Dev-code-review', task);

      expect(result).toBeDefined();
      expect(result.requires_approval).toBe(true);
      expect(result.should_auto_approve).toBe(false);
      expect(result.agent_to_invoke).toBe('code-reviewer');
      expect(result.status).toBe('pending_approval');
    });

    test('should return auto-approved state for CRITICAL priority task', () => {
      const project = {
        id: 'test-proj',
        stages: [
          { id: 'stage-1', name: 'InQueue', requires_approval: false, agent: null, auto_invoke_agent: false },
          { id: 'stage-3', name: 'Dev-code-review', requires_approval: true, agent: 'code-reviewer', auto_invoke_agent: true }
        ]
      };

      const task = {
        id: 'task-001',
        title: 'Critical Bug Fix',
        priority: 'CRITICAL',
        stage: 'InQueue'
      };

      const result = router.getApprovalState(project, 'Dev-code-review', task);

      expect(result).toBeDefined();
      expect(result.requires_approval).toBe(true);
      expect(result.should_auto_approve).toBe(true);
      expect(result.agent_to_invoke).toBe('code-reviewer');
      expect(result.status).toBe('auto_approved');
    });

    test('should return no-approval-needed state for stage without approval requirement', () => {
      const project = {
        id: 'test-proj',
        stages: [
          { id: 'stage-1', name: 'InQueue', requires_approval: false, agent: null, auto_invoke_agent: false },
          { id: 'stage-2', name: 'InProgress', requires_approval: false, agent: null, auto_invoke_agent: false }
        ]
      };

      const task = {
        id: 'task-001',
        title: 'Test Task',
        priority: 'HIGH',
        stage: 'InQueue'
      };

      const result = router.getApprovalState(project, 'InProgress', task);

      expect(result).toBeDefined();
      expect(result.requires_approval).toBe(false);
      expect(result.should_auto_approve).toBe(false);
      expect(result.agent_to_invoke).toBeNull();
      expect(result.status).toBe('no_approval_needed');
    });

    test('should return null agent when stage has no agent', () => {
      const project = {
        id: 'test-proj',
        stages: [
          { id: 'stage-1', name: 'InQueue', requires_approval: false, agent: null, auto_invoke_agent: false },
          { id: 'stage-6', name: 'Final-review', requires_approval: true, agent: null, auto_invoke_agent: false }
        ]
      };

      const task = {
        id: 'task-001',
        title: 'Test Task',
        priority: 'HIGH',
        stage: 'InQueue'
      };

      const result = router.getApprovalState(project, 'Final-review', task);

      expect(result).toBeDefined();
      expect(result.requires_approval).toBe(true);
      expect(result.should_auto_approve).toBe(false);
      expect(result.agent_to_invoke).toBeNull();
      expect(result.status).toBe('pending_approval');
    });

    test('should return approval state for non-existent stage with safe defaults', () => {
      const project = {
        id: 'test-proj',
        stages: [
          { id: 'stage-1', name: 'InQueue', requires_approval: false, agent: null, auto_invoke_agent: false }
        ]
      };

      const task = {
        id: 'task-001',
        title: 'Test Task',
        priority: 'HIGH',
        stage: 'InQueue'
      };

      const result = router.getApprovalState(project, 'NonExistent', task);

      expect(result).toBeDefined();
      expect(result.requires_approval).toBe(false);
      expect(result.should_auto_approve).toBe(false);
      expect(result.agent_to_invoke).toBeNull();
      expect(result.status).toBe('no_approval_needed');
    });

    test('should handle Security-review stage with CRITICAL priority auto-approval', () => {
      const project = {
        id: 'test-proj',
        stages: [
          { id: 'stage-3', name: 'Dev-code-review', requires_approval: true, agent: 'code-reviewer', auto_invoke_agent: true },
          { id: 'stage-4', name: 'Security-review', requires_approval: true, agent: 'security-reviewer', auto_invoke_agent: true }
        ]
      };

      const task = {
        id: 'task-001',
        title: 'Critical Security Fix',
        priority: 'CRITICAL',
        stage: 'Dev-code-review'
      };

      const result = router.getApprovalState(project, 'Security-review', task);

      expect(result.requires_approval).toBe(true);
      expect(result.should_auto_approve).toBe(true);
      expect(result.agent_to_invoke).toBe('security-reviewer');
      expect(result.status).toBe('auto_approved');
    });

    test('should handle QA-engineer stage with qa-tester agent', () => {
      const project = {
        id: 'test-proj',
        stages: [
          { id: 'stage-5', name: 'QA-engineer', requires_approval: true, agent: 'qa-tester', auto_invoke_agent: false }
        ]
      };

      const task = {
        id: 'task-001',
        title: 'Test Task',
        priority: 'MEDIUM',
        stage: 'Dev-code-review'
      };

      const result = router.getApprovalState(project, 'QA-engineer', task);

      expect(result.requires_approval).toBe(true);
      expect(result.should_auto_approve).toBe(false);
      expect(result.agent_to_invoke).toBe('qa-tester');
      expect(result.status).toBe('pending_approval');
    });
  });

  describe('Integration scenarios', () => {
    test('should handle full workflow progression from InQueue to Completed', () => {
      const project = {
        id: 'test-proj',
        stages: [
          { id: 'stage-1', name: 'InQueue', requires_approval: false, agent: null, auto_invoke_agent: false },
          { id: 'stage-2', name: 'InProgress', requires_approval: false, agent: null, auto_invoke_agent: false },
          { id: 'stage-3', name: 'Dev-code-review', requires_approval: true, agent: 'code-reviewer', auto_invoke_agent: true },
          { id: 'stage-7', name: 'Completed', requires_approval: false, agent: null, auto_invoke_agent: false }
        ]
      };

      const task = {
        id: 'task-001',
        title: 'Feature Implementation',
        priority: 'HIGH',
        stage: 'InQueue'
      };

      // Stage 1: InQueue - no approval needed
      let state = router.getApprovalState(project, 'InProgress', task);
      expect(state.status).toBe('no_approval_needed');

      // Stage 2: InProgress - no approval needed
      state = router.getApprovalState(project, 'Dev-code-review', task);
      expect(state.status).toBe('pending_approval');
      expect(state.agent_to_invoke).toBe('code-reviewer');

      // Stage 3: Completed - no approval needed
      state = router.getApprovalState(project, 'Completed', task);
      expect(state.status).toBe('no_approval_needed');
    });

    test('should handle CRITICAL task with expedited approval', () => {
      const project = {
        id: 'test-proj',
        stages: [
          { id: 'stage-1', name: 'InQueue', requires_approval: false, agent: null, auto_invoke_agent: false },
          { id: 'stage-3', name: 'Dev-code-review', requires_approval: true, agent: 'code-reviewer', auto_invoke_agent: true },
          { id: 'stage-4', name: 'Security-review', requires_approval: true, agent: 'security-reviewer', auto_invoke_agent: true },
          { id: 'stage-6', name: 'Final-review', requires_approval: true, agent: null, auto_invoke_agent: false },
          { id: 'stage-7', name: 'Completed', requires_approval: false, agent: null, auto_invoke_agent: false }
        ]
      };

      const criticalTask = {
        id: 'task-critical-001',
        title: 'Critical Security Vulnerability',
        priority: 'CRITICAL',
        stage: 'InQueue'
      };

      // Should auto-approve through all approval stages
      let state = router.getApprovalState(project, 'Dev-code-review', criticalTask);
      expect(state.status).toBe('auto_approved');

      state = router.getApprovalState(project, 'Security-review', criticalTask);
      expect(state.status).toBe('auto_approved');

      // Final-review also auto-approves for CRITICAL
      state = router.getApprovalState(project, 'Final-review', criticalTask);
      expect(state.status).toBe('auto_approved');
    });
  });
});
