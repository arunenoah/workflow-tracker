const CodeReviewerAgent = require('../../src/agents/code-reviewer');

describe('CodeReviewerAgent', () => {
  let agent;

  beforeEach(() => {
    agent = new CodeReviewerAgent();
  });

  describe('analyze', () => {
    test('should give perfect score for task with all best practices', async () => {
      const task = {
        name: 'Implement feature with tests and documentation',
        description:
          'Add new endpoint with comprehensive test coverage, proper error handling, clear comments, and JSDoc',
      };

      const result = await agent.analyze(task);

      expect(result.score).toBeGreaterThan(80);
      expect(result.findings.length).toBeLessThan(3);
      expect(result.summary).toBeDefined();
    });

    test('should detect missing tests', async () => {
      const task = {
        name: 'Add new feature',
        description: 'Just add the feature - focus on implementation only',
      };

      const result = await agent.analyze(task);

      expect(result.findings.some(f => f.type === 'missing-tests')).toBe(true);
      expect(result.score).toBeLessThan(90);
    });

    test('should detect hardcoded values', async () => {
      const task = {
        name: 'Configuration',
        description: 'Hardcoded port 8080 and magic number 12345',
      };

      const result = await agent.analyze(task);

      expect(
        result.findings.some(f => f.type === 'hardcoded-values')
      ).toBe(true);
    });

    test('should detect missing description', async () => {
      const task = {
        name: 'Task',
        description: '',
      };

      const result = await agent.analyze(task);

      expect(
        result.findings.some(f => f.type === 'no-description')
      ).toBe(true);
    });

    test('should detect console.log', async () => {
      const task = {
        name: 'Debug feature',
        description: 'Added console.log for debugging',
      };

      const result = await agent.analyze(task);

      expect(
        result.findings.some(f => f.type === 'console-logging')
      ).toBe(true);
    });

    test('should accumulate score penalties', async () => {
      const task = {
        name: 'Feature',
        description: 'Hardcoded values 12345 and no tests mentioned',
      };

      const result = await agent.analyze(task);

      expect(result.score).toBeLessThan(85);
      expect(result.findings.length).toBeGreaterThan(0);
    });

    test('should have minimum score of 0', async () => {
      const task = {
        name: 'Bad',
        description: '',
      };

      const result = await agent.analyze(task);

      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });
});
