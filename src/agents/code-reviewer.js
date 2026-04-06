/**
 * CodeReviewerAgent - Analyzes code quality from task description
 *
 * Checks for: tests, error handling, naming, documentation, structure
 */
class CodeReviewerAgent {
  async analyze(task) {
    const text = `${task.name} ${task.description || ''}`.toLowerCase();
    const findings = [];
    let score = 100;

    // Check 1: Missing tests
    const hasTests =
      text.includes('test') ||
      text.includes('spec') ||
      text.includes('coverage');
    if (!hasTests) {
      findings.push({
        type: 'missing-tests',
        severity: 'HIGH',
        message: 'No test coverage mentioned for this task',
        fix: 'Add unit and integration tests before marking complete',
      });
      score -= 20;
    }

    // Check 2: Hardcoded values
    if (text.includes('hardcoded') || text.match(/\d{3,}/)) {
      findings.push({
        type: 'hardcoded-values',
        severity: 'HIGH',
        message: 'Task contains hardcoded values or magic numbers',
        fix: 'Use named constants or configuration instead',
      });
      score -= 20;
    }

    // Check 3: Generic error handling
    if (
      text.includes('try') &&
      !text.includes('specific') &&
      !text.includes('error')
    ) {
      findings.push({
        type: 'generic-errors',
        severity: 'MEDIUM',
        message: 'Generic error handling detected',
        fix: 'Handle specific error types with appropriate recovery',
      });
      score -= 10;
    }

    // Check 4: No description
    if (!task.description || task.description.trim().length < 20) {
      findings.push({
        type: 'no-description',
        severity: 'MEDIUM',
        message: 'Task description is missing or too brief',
        fix: 'Add a detailed description of what needs to be done',
      });
      score -= 10;
    }

    // Check 5: console.log in code
    if (text.includes('console.log')) {
      findings.push({
        type: 'console-logging',
        severity: 'LOW',
        message: 'console.log statements present (should use debug module)',
        fix: 'Replace with debug() or structured logging',
      });
      score -= 5;
    }

    // Check 6: Missing documentation
    if (!text.includes('doc') && !text.includes('comment')) {
      findings.push({
        type: 'missing-docs',
        severity: 'LOW',
        message: 'No documentation or comments mentioned',
        fix: 'Add JSDoc comments and inline documentation',
      });
      score -= 5;
    }

    score = Math.max(0, score);

    return {
      score,
      findings,
      summary:
        findings.length === 0
          ? 'Code quality looks good!'
          : `${findings.length} issues found. Address HIGH severity items first.`,
    };
  }
}

module.exports = CodeReviewerAgent;
