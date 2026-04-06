const QATesterAgent = require('../../src/agents/qa-tester');

describe('QATesterAgent', () => {
  let agent;

  beforeEach(() => {
    agent = new QATesterAgent();
  });

  describe('analyze', () => {
    test('should detect missing tests', async () => {
      const task = {
        name: 'Add function',
        description: 'Add new feature to API endpoint',
      };

      const result = await agent.analyze(task);

      expect(result.findings.some(f => f.type === 'no-tests')).toBe(true);
    });

    test('should detect missing edge case testing', async () => {
      const task = {
        name: 'Function',
        description: 'Test basic functionality only',
      };

      const result = await agent.analyze(task);

      expect(
        result.findings.some(f => f.type === 'missing-edge-cases')
      ).toBe(true);
    });

    test('should detect missing error path tests', async () => {
      const task = {
        name: 'Handler',
        description: 'Tests for happy path',
      };

      const result = await agent.analyze(task);

      expect(
        result.findings.some(f => f.type === 'missing-error-tests')
      ).toBe(true);
    });

    test('should detect weak or missing assertions', async () => {
      const task = {
        name: 'Test file',
        description: 'Some tests written',
      };

      const result = await agent.analyze(task);

      expect(result.findings.some(f => f.type === 'weak-assertions')).toBe(true);
    });

    test('should detect low test coverage', async () => {
      const task = {
        name: 'Module',
        description: 'test coverage 45%',
      };

      const result = await agent.analyze(task);

      expect(result.findings.some(f => f.type === 'low-coverage')).toBe(true);
    });

    test('should give high score for comprehensive testing', async () => {
      const task = {
        name: 'Feature',
        description:
          'Comprehensive test coverage with edge case testing, error handling, assertions, and 85% coverage',
      };

      const result = await agent.analyze(task);

      expect(result.score).toBeGreaterThan(80);
      expect(result.findings.length).toBe(0);
    });

    test('should handle tests but without edge cases', async () => {
      const task = {
        name: 'Function with tests',
        description: 'Created test suite with assertions expect() calls',
      };

      const result = await agent.analyze(task);

      expect(result.findings.some(f => f.type === 'missing-edge-cases')).toBe(true);
      expect(result.score).toBeLessThan(90);
    });
  });
});
