/**
 * SecurityReviewerAgent - Analyzes security vulnerabilities from task description
 *
 * Checks for: SQL injection, XSS, auth bypass, secrets, validation
 */
class SecurityReviewerAgent {
  async analyze(task) {
    const text = `${task.name} ${task.description || ''}`.toLowerCase();
    const findings = [];
    let score = 100;

    // Check 1: SQL injection risk
    if (
      (text.includes('query') || text.includes('sql')) &&
      !text.includes('parameterized') &&
      !text.includes('prepared')
    ) {
      findings.push({
        type: 'sql-injection',
        severity: 'CRITICAL',
        message: 'Potential SQL injection vulnerability (unescaped queries detected)',
        fix: 'Use parameterized queries or prepared statements',
      });
      score -= 30;
    }

    // Check 2: XSS risk
    if (
      (text.includes('html') || text.includes('render') || text.includes('display')) &&
      !text.includes('escape') &&
      !text.includes('sanitize')
    ) {
      findings.push({
        type: 'xss-risk',
        severity: 'HIGH',
        message: 'Potential XSS vulnerability (unescaped output detected)',
        fix: 'Escape all user-provided content before rendering',
      });
      score -= 20;
    }

    // Check 3: Missing authentication
    if (
      (text.includes('admin') ||
        text.includes('user data') ||
        text.includes('private')) &&
      !text.includes('auth') &&
      !text.includes('permission')
    ) {
      findings.push({
        type: 'missing-auth',
        severity: 'HIGH',
        message: 'Protected resource without authentication check',
        fix: 'Add authentication and authorization checks',
      });
      score -= 20;
    }

    // Check 4: Secrets in task description
    if (
      text.includes('password') ||
      text.includes('token') ||
      text.includes('api key') ||
      text.includes('secret')
    ) {
      findings.push({
        type: 'secrets-exposed',
        severity: 'CRITICAL',
        message: 'Potential secrets mentioned in task description',
        fix: 'Store secrets in environment variables or secrets manager',
      });
      score -= 30;
    }

    // Check 5: Missing input validation
    if (
      (text.includes('user input') ||
        text.includes('form') ||
        text.includes('request')) &&
      !text.includes('validate') &&
      !text.includes('sanitize')
    ) {
      findings.push({
        type: 'missing-validation',
        severity: 'HIGH',
        message: 'User input without validation or sanitization',
        fix: 'Validate and sanitize all user input at entry points',
      });
      score -= 20;
    }

    score = Math.max(0, score);

    return {
      score,
      findings,
      summary:
        findings.length === 0
          ? 'No security issues detected'
          : `${findings.length} security issue(s) found. CRITICAL items must be fixed.`,
    };
  }
}

module.exports = SecurityReviewerAgent;
