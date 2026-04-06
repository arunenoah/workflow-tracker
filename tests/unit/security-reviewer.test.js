const SecurityReviewerAgent = require('../../src/agents/security-reviewer');

describe('SecurityReviewerAgent', () => {
  let agent;

  beforeEach(() => {
    agent = new SecurityReviewerAgent();
  });

  describe('analyze', () => {
    test('should detect SQL injection risk', async () => {
      const task = {
        name: 'Add query',
        description: 'Build a SQL query from user input directly',
      };

      const result = await agent.analyze(task);

      expect(result.findings.some(f => f.type === 'sql-injection')).toBe(true);
      expect(result.findings[0].severity).toBe('CRITICAL');
    });

    test('should not flag parameterized queries', async () => {
      const task = {
        name: 'Database query',
        description: 'Execute SQL query using parameterized prepared statements',
      };

      const result = await agent.analyze(task);

      expect(result.findings.some(f => f.type === 'sql-injection')).toBe(false);
    });

    test('should detect XSS vulnerability', async () => {
      const task = {
        name: 'Render HTML',
        description: 'Display user content in HTML without escaping',
      };

      const result = await agent.analyze(task);

      expect(result.findings.some(f => f.type === 'xss-risk')).toBe(true);
    });

    test('should detect missing authentication', async () => {
      const task = {
        name: 'Add admin',
        description: 'Create admin feature to access private user data without checks',
      };

      const result = await agent.analyze(task);

      expect(result.findings.some(f => f.type === 'missing-auth')).toBe(true);
    });

    test('should detect exposed secrets', async () => {
      const task = {
        name: 'Config',
        description: 'Set password and API token in code',
      };

      const result = await agent.analyze(task);

      expect(result.findings.some(f => f.type === 'secrets-exposed')).toBe(true);
    });

    test('should detect missing input validation', async () => {
      const task = {
        name: 'Form submission',
        description: 'Accept user input from form without validation',
      };

      const result = await agent.analyze(task);

      expect(
        result.findings.some(f => f.type === 'missing-validation')
      ).toBe(true);
    });

    test('should give high score for secure code', async () => {
      const task = {
        name: 'Secure feature',
        description: 'Uses parameterized queries, escapes output, validates input, and checks auth',
      };

      const result = await agent.analyze(task);

      expect(result.score).toBeGreaterThan(80);
      expect(result.findings.length).toBe(0);
    });
  });
});
