# Development Guidelines - Workflow Tracker Plugin

Project-specific standards and conventions for contributing to the Workflow Tracker plugin.

## 🧑‍💻 Development Philosophy

This plugin follows enterprise-level standards:
- **TDD First**: Write tests before implementation
- **Modular Design**: Each file has one clear responsibility
- **DRY & SOLID**: Don't repeat yourself, follow SOLID principles
- **Professional Code**: Well-documented, well-tested, maintainable

## 📋 Code Standards

### File Organization

**Keep files focused and small:**
- Classes: Max 300 lines
- Methods: Max 30 lines
- Each file one primary export

**Follow structure:**
```
src/
├── cli/           # CLI commands (user-facing)
├── core/          # Business logic (models, managers)
├── storage/       # Data persistence (abstraction)
├── dashboard/     # Web UI (view layer)
└── agent/         # Agent integration (routing)
```

### Naming Conventions

**Files:**
- `camelCase.js` for modules
- `PascalCase.js` for classes only
- `kebab-case` for package names

**Variables & Functions:**
- `camelCase` for variables, functions, methods
- `UPPER_SNAKE_CASE` for constants
- `_private` prefix for private methods
- Descriptive names (no single letters except `i` in loops)

**Classes:**
- `PascalCase` class names
- Suffix with specific role: `FileBackend`, `TaskManager`, `AgentRouter`

### Code Quality

**Error Handling:**
```javascript
// Good: Specific, descriptive error
if (!task) throw new Error(`Task ${taskId} not found in project ${projectId}`);

// Avoid: Generic error
if (!task) throw new Error('Not found');
```

**Validation:**
```javascript
// Good: Validate at boundaries
if (!projectId || typeof projectId !== 'string') {
  throw new Error('projectId must be a non-empty string');
}

// Avoid: Trust internal code
if (!projectId) return; // This silently fails
```

**Comments:**
- Only comment WHY, not WHAT
- Code should be self-explanatory
- Use JSDoc for public APIs

```javascript
// Good - explains the why
// Filter by priority order to surface critical tasks first
const sorted = tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

// Avoid - explains the obvious
// Set x to 5
const x = 5;
```

## 🧪 Testing Standards

### TDD Workflow

1. **Write failing test** - Red
2. **Implement minimal code** - Green
3. **Refactor** - Clean
4. **Commit** - Done

### Test Structure

```javascript
describe('ClassName', () => {
  let instance;

  beforeEach(async () => {
    // Setup
  });

  afterEach(async () => {
    // Cleanup
  });

  describe('method name', () => {
    test('should do X when given Y', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Test Naming

```javascript
// Good - clear behavior
test('should sort tasks by priority CRITICAL first', () => { });
test('should throw error when task not found', () => { });
test('should move task to next stage and log activity', () => { });

// Avoid - vague
test('works correctly', () => { });
test('test task manager', () => { });
```

### Coverage Targets

- **Unit tests**: 80%+ coverage
- **Critical paths**: 100% coverage (agent routing, task state)
- **Storage operations**: 95%+ coverage
- **CLI commands**: Integration tests (not unit tested)

## 📝 Commit Standards

### Commit Message Format

```
type: short description (50 chars max)

Longer explanation (wrap at 72 chars)
- Bullet 1
- Bullet 2

Fixes #123
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `test:` - Test additions/fixes
- `docs:` - Documentation
- `chore:` - Build, deps, config

### Examples

```
feat: implement task manager with priority sorting
- Add TaskManager class with CRUD operations
- Implement priority ordering (CRITICAL first)
- Add activity logging for all task changes
- 12 tests covering all scenarios

fix: correct priority ordering in list method
- Changed || operator to proper comparison
- Fixes CRITICAL (priority 0) being sorted incorrectly
- Add test case for zero-priority edge case

docs: add deployment guide
- Document MySQL setup
- Add configuration examples
- Include troubleshooting section
```

## 🏗️ Architecture Principles

### Separation of Concerns

**Storage Layer** → **Managers** → **CLI/Dashboard** → **User**

```javascript
// Storage knows: persistence (JSON/MySQL)
// ❌ Don't: Business logic in storage
// ✅ Do: Delegate to managers

// Managers know: business rules, validation
// ❌ Don't: HTTP details
// ✅ Do: Pure functions that CLI/Dashboard call

// CLI/Dashboard know: user interaction
// ❌ Don't: Database details
// ✅ Do: Call managers
```

### Dependency Injection

Pass dependencies in, don't create inside:

```javascript
// Good - DI
class TaskManager {
  constructor(storage) {
    this.storage = storage;
  }
}

// Avoid - tight coupling
class TaskManager {
  constructor() {
    this.storage = new FileBackend(); // Can't test!
  }
}
```

### Factory Pattern

Use factories for object creation:

```javascript
// Good - abstraction
class StorageFactory {
  static async create(config) {
    if (config.type === 'mysql') {
      return new MySQLBackend(config);
    }
    return new FileBackend(config.path);
  }
}

// Avoid - hard-coded choices
const storage = new FileBackend(); // What if we want MySQL later?
```

## 🔄 Development Workflow

### Creating a New Feature

1. **Spec First**: Document in IMPLEMENTATION_PLAN.md
2. **Design**: Create architecture diagram if complex
3. **Test First**: Write test file with failing tests
4. **Implement**: Write minimal code to pass tests
5. **Refactor**: Clean up, extract helpers
6. **Document**: Add comments, update README if needed
7. **Commit**: Push with descriptive message

### Example: New Agent Router Feature

```bash
# 1. Plan: Add to IMPLEMENTATION_PLAN.md
# 2. Test: Write tests/unit/agent-router.test.js
npm test -- tests/unit/agent-router.test.js
# FAIL - expected behavior not found

# 3. Implement: Write src/core/agent-router.js
npm test -- tests/unit/agent-router.test.js
# PASS - all tests passing

# 4. Refactor: Extract _getStage() helper
npm test -- tests/unit/agent-router.test.js
# PASS - tests still passing

# 5. Commit
git add src/core/agent-router.js tests/unit/agent-router.test.js
git commit -m "feat: implement agent router with approval logic"
```

## 🐛 Debugging

### Enable Debug Logging

```bash
CLI_DEBUG=true node src/cli/index.js project list
```

### Jest Debugging

```bash
# Run single test
npm test -- tests/unit/file-backend.test.js

# Watch mode
npm test -- --watch

# Debug in Node
node --inspect-brk node_modules/.bin/jest tests/unit/file-backend.test.js
```

### Manual Testing

```bash
# Test storage backend
node -e "
const FileBackend = require('./src/storage/file-backend');
const storage = new FileBackend('/tmp/test');
storage.initialize().then(() => {
  console.log('✓ Storage initialized');
});
"

# Test task manager
node -e "
const TaskManager = require('./src/core/task-manager');
const tm = new TaskManager({});
const task = tm.create('proj', { name: 'Test' });
console.log(task);
"
```

## 📚 Documentation Standards

### README Section

Include for each feature:
- **What it does** (1-2 sentences)
- **How to use** (code example)
- **Why it matters** (business value)

### Code Comments

```javascript
// Good - explains business logic
// CRITICAL tasks auto-approve to prevent bottlenecks
const shouldApprove = task.priority === 'CRITICAL';

// Avoid - restates code
// Set shouldApprove to true if priority is CRITICAL
const shouldApprove = task.priority === 'CRITICAL';
```

### JSDoc

```javascript
/**
 * Move task to a different stage in the workflow
 * @param {string} projectId - Project ID
 * @param {string} taskId - Task ID to move
 * @param {string} toStage - Target stage name
 * @returns {Promise<Object>} Updated task object
 * @throws {Error} If task or stage not found
 */
async moveTask(projectId, taskId, toStage) {
  // ...
}
```

## 🎯 Definition of Done

A feature is complete when:

- ✅ Tests written (TDD)
- ✅ All tests passing (100% green)
- ✅ Code reviewed (manually or by peer)
- ✅ Follows SOLID principles
- ✅ No console.log in production code (use debug module)
- ✅ Error handling for all edge cases
- ✅ Comments explain WHY, not WHAT
- ✅ Commit message is descriptive
- ✅ README updated if user-facing

## 🚫 Anti-Patterns

**Don't:**
- Use `any` type (when using TypeScript)
- Write functions > 30 lines
- Add TODOs without issues
- Hardcode values (use constants)
- Catch all errors generically
- Skip error handling
- Use `var` (use `const`/`let`)
- Create God objects
- Couple components tightly

**Do:**
- Use explicit types
- Write small, focused functions
- Test edge cases
- Use meaningful variable names
- Handle specific errors
- Validate at boundaries
- Use const/let
- Follow single responsibility
- Use dependency injection

## 📞 Questions?

- Architecture questions → Check SPEC.md
- Implementation questions → Check IMPLEMENTATION_PLAN.md
- Code style questions → See existing similar code
- Testing questions → Review tests/unit/

---

**Last Updated:** 2026-04-06
**Maintainer:** Technical Architecture Team
