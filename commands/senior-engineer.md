---
name: senior-engineer
description: Implement code for a task
icon: code
category: workflow
---

# /senior-engineer

Generate code implementation for a task based on its requirements.

## What it does:
1. Reads task description and requirements
2. Detects programming language
3. Generates implementation code:
   - API endpoints
   - Database models
   - Authentication logic
   - Validation
   - Error handling
   - Tests
   - UI components (if applicable)
4. Creates project structure
5. Suggests best practices
6. Auto-moves task to Code-Review

## Usage:

After planning, use:
```
/senior-engineer
```

This will:
- ✅ Generate complete implementation
- ✅ Create project structure
- ✅ Add code files
- ✅ Move task to Code-Review
- ✅ Ready for code review analysis

## What you get:

```
Implementation Generated ✅

Components: 6
Language: JavaScript
Structure: API, Database, Auth, Validation, Error-Handling, Tests

Generated Files:
├── routes/api.js              (Express endpoint)
├── models/Model.js            (Database model)
├── auth/authenticate.js       (Auth logic)
├── middleware/validation.js   (Input validation)
├── middleware/errorHandler.js (Error handling)
└── tests/integration.test.js  (Test cases)

Best Practices:
✅ Use environment variables
✅ Add error handling
✅ Implement validation
✅ Write tests
✅ Use consistent naming

Next Steps:
→ Code Review (auto-moved)
→ Security Review
→ QA Testing
→ Completion
```

## Automatic Flow:

```
/senior-engineer (implement task)
   ↓
Code generated
   ↓
Task auto-moves to Code-Review
   ↓
Code-Reviewer analyzes
   ↓
If issues found: Create issue tasks
   ↓
Fix & re-review
   ↓
Score ≥ 70? → Move to Security-Review
```

## Language Support:

- JavaScript/Node.js
- TypeScript
- Python/Flask
- React (JSX)
- Vue.js
- Java
- PHP
- Go
- Rust

Auto-detected from task description!

See [WORKFLOW_AUTOMATION.md](../WORKFLOW_AUTOMATION.md) for complete workflow.
