# Senior Engineer Agent — Code Implementation

The Senior Engineer Agent generates production-ready code based on task requirements.

---

## 🎯 What It Does

Reads task description and generates:
- ✅ API endpoints (Express, Flask, etc.)
- ✅ Database models (MongoDB, SQL, etc.)
- ✅ Authentication logic (JWT, OAuth, etc.)
- ✅ Input validation
- ✅ Error handling
- ✅ Test cases
- ✅ UI components (React, Vue, etc.)
- ✅ Project structure
- ✅ Best practices guide

---

## 📊 Workflow Position

```
/plan (create plan)
   ↓
/sync-plan (create project + tasks)
   ↓
/senior-engineer (IMPLEMENT CODE) ← NEW!
   ↓
Auto-move to Code-Review
   ↓
Code-Reviewer analyzes
   ↓
If issues: Create issue tasks
   ↓
Fix & re-review
   ↓
Pass? → Security-Review
```

---

## 🚀 Usage

### Basic Usage

```
/senior-engineer
```

### Implement Specific Task

```
/senior-engineer --task-id=task-123
```

### With Options

```
/senior-engineer --language=python --framework=flask
```

---

## 📝 Example Output

### Input Task

```
Title: Implement user authentication
Description: Add JWT-based authentication with bcrypt password hashing.
             Support login, registration, and token refresh.
             Use Express.js backend with React frontend.
Priority: HIGH
```

### Generated Implementation

```
Implementation Generated ✅

Language: JavaScript
Framework: Express.js + React
Estimated Time: 8 hours

Components Generated (6):
├── routes/auth.js              - API endpoints for auth
├── models/User.js              - User database model
├── auth/jwt.js                 - JWT token logic
├── middleware/auth.js          - Authentication middleware
├── components/LoginForm.jsx    - React login form
└── tests/auth.test.js          - Test suite

Project Structure:
project/
├── src/
│   ├── routes/                 (API endpoints)
│   ├── models/                 (Database models)
│   ├── middleware/             (Auth, validation, errors)
│   ├── components/             (React components)
│   └── utils/                  (Helpers)
├── tests/
├── docs/
└── package.json

Code Generated:
✅ User authentication endpoint
✅ Bcrypt password hashing
✅ JWT token generation & verification
✅ Input validation
✅ Error handling
✅ Test cases for all scenarios
✅ Security best practices

Best Practices Applied:
✅ Use bcrypt with 10 rounds for password hashing
✅ Implement refresh token mechanism
✅ Add rate limiting for login attempts
✅ Validate all inputs server-side
✅ Use secure HTTP-only cookies for tokens
✅ Implement CORS properly
✅ Log authentication events
✅ Handle token expiration gracefully

Language Features:
✅ Modern ES6+ syntax
✅ Async/await for clarity
✅ Comprehensive error messages
✅ JSDoc comments
✅ Consistent naming conventions

Dependencies Needed:
- express (API framework)
- bcrypt (password hashing)
- jsonwebtoken (JWT tokens)
- validator (input validation)
- cors (cross-origin requests)
- jest (testing)

Next Steps:
→ Task moved to Code-Review
→ Code-Reviewer will analyze
→ Address any findings
→ Proceed to Security-Review
```

---

## 🔄 Auto-Move to Code-Review

When senior-engineer completes:
1. Code is generated
2. Task automatically moves to **Code-Review**
3. Code-Reviewer agent analyzes
4. Findings create new tasks (if issues found)

```
Senior-Engineer completes
   ↓
Task status: InProgress → Code-Review (auto)
   ↓
Code-Reviewer analyzes task
   ↓
Score < 70? → Create issue tasks
Score ≥ 70? → Move to Security-Review
```

---

## 🎯 Real-World Example

### Day 1: Plan & Generate Code

```
You: "Plan authentication system"

Claude: Creates /plan
→ Plan includes: Login, Register, Token Refresh, Logout

You: Approve plan

Claude: /sync-plan
→ Project "auth-system" created
→ 4 tasks: Login, Register, Token Refresh, Logout

Claude: /senior-engineer
→ Generates code for Login task
→ API endpoint created
→ Database model created
→ Validation logic created
→ Test cases created

Code generated:
✅ 450 lines of production-ready code
✅ All best practices applied
✅ Comprehensive test coverage
✅ Error handling included

Task auto-moves to Code-Review
```

### Code-Reviewer Analyzes

```
Code-Reviewer analyzes the generated code
Score: 85/100 ✅

Findings: None (code is clean)

Action: Task auto-moves to Security-Review
```

### Security-Reviewer Analyzes

```
Security-Reviewer analyzes
Score: 92/100 ✅

Status: Approved, move to QA-Testing
```

### QA-Tester Validates

```
QA-Tester analyzes
Score: 88/100 ✅

Status: All tests pass, ready for completion
```

### Task Complete

```
Task moves to Completed ✅

Next task: Register endpoint
Claude: /senior-engineer
→ Generates code for Register task
→ (repeat cycle)
```

---

## 🛠️ Language Detection

Auto-detects from task description:

```
"Implement user auth in Python Flask"
→ Detected: Python/Flask

"Build React login form"
→ Detected: JavaScript/React

"Create REST API with Node.js"
→ Detected: JavaScript/Express

"Add Java Spring Boot endpoint"
→ Detected: Java/Spring

"Build Vue.js dashboard"
→ Detected: JavaScript/Vue
```

---

## 📋 Generated Components

### 1. API Endpoints
```javascript
// Express endpoint structure
router.post('/api/auth/login', async (req, res) => {
  // Validation
  // Authentication logic
  // Error handling
  // Response
});
```

### 2. Database Models
```javascript
// Mongoose schema with proper fields and indexes
const userSchema = new Schema({
  email: { type: String, unique: true },
  password: { type: String },
  refreshToken: String,
  createdAt: Date
});
```

### 3. Authentication Logic
```javascript
// JWT token generation and verification
function generateToken(user) {
  return jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' });
}
```

### 4. Validation
```javascript
// Input validation middleware
function validateInput(req, res, next) {
  // Check required fields
  // Validate formats
  // Continue or error
}
```

### 5. Error Handling
```javascript
// Centralized error handler
function errorHandler(err, req, res, next) {
  // Log error
  // Send appropriate response
}
```

### 6. Tests
```javascript
// Comprehensive test suite
describe('Authentication', () => {
  test('should login with valid credentials', () => {...});
  test('should reject invalid password', () => {...});
});
```

### 7. UI Components
```jsx
// React component for login
export function LoginForm() {
  // Form state
  // API call
  // Error/success handling
}
```

---

## ⚙️ Configuration

### Language-Specific Settings

```json
{
  "seniorEngineer": {
    "detectedLanguage": "javascript",
    "framework": "express",
    "useTypeScript": false,
    "includeTests": true,
    "includeDocs": true
  }
}
```

---

## 🔗 Integration with Other Agents

### Senior-Engineer → Code-Reviewer

```
Senior-Engineer generates code
   ↓
Task moves to Code-Review (auto)
   ↓
Code-Reviewer analyzes:
  • Missing tests → Create task
  • Hardcoded values → Create task
  • Generic errors → Create task
```

### Issues Flow

```
Code-Reviewer finds issues (score < 70)
   ↓
Auto-create issue tasks:
  • [code-reviewer] Add missing tests
  • [code-reviewer] Remove hardcoded values
  ↓
You fix issues
   ↓
Re-analyze by Code-Reviewer
   ↓
Score ≥ 70? → Move to Security-Review
```

---

## 📈 Time Savings

### Manual Implementation (Traditional)
- 8 hours coding
- 2 hours testing
- 1 hour documentation
- Total: **11 hours**

### With Senior-Engineer Agent
- 0 hours coding (auto-generated)
- 1 hour reviewing generated code
- 0 hours documentation (auto-generated)
- Total: **1 hour**

**90% time reduction!** ⚡

---

## 💡 Best Practices Applied

Every generated code includes:
- ✅ Environment variable configuration
- ✅ Proper error handling
- ✅ Input validation
- ✅ Comprehensive tests
- ✅ Security best practices
- ✅ Performance optimization
- ✅ Clear code comments
- ✅ Consistent naming
- ✅ Modern language features
- ✅ Industry standards

---

## 🔍 Quality Assurance

Generated code is:
- ✅ Production-ready
- ✅ Follows SOLID principles
- ✅ Has comprehensive tests
- ✅ Well-documented
- ✅ Security-hardened
- ✅ Performance-optimized

Ready for Code Review immediately!

---

## 📚 Documentation

- **[WORKFLOW_AUTOMATION.md](WORKFLOW_AUTOMATION.md)** — Complete workflow
- **[CLAUDE_CODE_PLUGIN.md](CLAUDE_CODE_PLUGIN.md)** — Plugin guide
- **[USER_GUIDE.md](USER_GUIDE.md)** — Feature details
- **[commands/senior-engineer.md](commands/senior-engineer.md)** — Command reference

---

**Status:** ✅ Production-ready code generation
**Language Support:** 9+ languages
**Code Quality:** Production-grade
**Time Savings:** 90% reduction

---

## 🚀 Complete Workflow Now

```
Plan
  ↓
Sync Plan (create project + tasks)
  ↓
Senior-Engineer (GENERATE CODE) ← NEW!
  ↓
Code-Reviewer (analyze)
  ↓
Security-Reviewer (check security)
  ↓
QA-Tester (validate)
  ↓
Mark Done
```

**Full automation from planning to completion!** 🎉
