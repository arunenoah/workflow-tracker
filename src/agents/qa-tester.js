/**
 * QATesterAgent - Analyzes test quality from task description
 *
 * Checks for: test coverage, test patterns, edge cases, assertions
 */
class QATesterAgent {
  async analyze(task) {
    const text = `${task.name} ${task.description || ''}`.toLowerCase();
    const findings = [];
    let score = 100;

    // Check 1: No test file mentioned
    const hasTestMention =
      text.includes('test') ||
      text.includes('spec') ||
      text.includes('coverage');
    if (!hasTestMention) {
      findings.push({
        type: 'no-tests',
        severity: 'HIGH',
        message: 'No test file or testing mentioned',
        fix: 'Create unit tests with > 80% coverage',
      });
      score -= 20;
    }

    // Check 2: No edge case testing
    if (
      !text.includes('edge') &&
      !text.includes('boundary') &&
      !text.includes('null') &&
      !text.includes('empty')
    ) {
      findings.push({
        type: 'missing-edge-cases',
        severity: 'MEDIUM',
        message: 'No edge case or boundary testing mentioned',
        fix: 'Add tests for: null, empty, boundary, concurrent access',
      });
      score -= 10;
    }

    // Check 3: No error path testing
    if (
      !text.includes('error') &&
      !text.includes('failure') &&
      !text.includes('invalid')
    ) {
      findings.push({
        type: 'missing-error-tests',
        severity: 'MEDIUM',
        message: 'No error or invalid input testing mentioned',
        fix: 'Add tests for error conditions and invalid inputs',
      });
      score -= 10;
    }

    // Check 4: No assertions mentioned
    if (
      !text.includes('assert') &&
      !text.includes('expect') &&
      !text.includes('should')
    ) {
      findings.push({
        type: 'weak-assertions',
        severity: 'HIGH',
        message: 'No test assertions mentioned',
        fix: 'Use clear assertions with meaningful messages',
      });
      score -= 20;
    }

    // Check 5: Low coverage explicitly mentioned
    const coverageMatch = text.match(/coverage[:\s]*(\d+)%/);
    if (coverageMatch && parseInt(coverageMatch[1]) < 75) {
      findings.push({
        type: 'low-coverage',
        severity: 'HIGH',
        message: `Test coverage too low (${coverageMatch[1]}% < 75%)`,
        fix: 'Increase test coverage to at least 75%',
      });
      score -= 20;
    }

    score = Math.max(0, score);

    return {
      score,
      findings,
      summary:
        findings.length === 0
          ? 'Test quality looks good!'
          : `${findings.length} QA issue(s) found. Ensure comprehensive test coverage.`,
    };
  }
}

module.exports = QATesterAgent;
