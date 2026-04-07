/**
 * Senior Engineer Agent - Implements code for tasks
 * 
 * Reads task requirements and generates implementation code
 */

class SeniorEngineerAgent {
  constructor() {
    this.name = 'senior-engineer';
    this.threshold = 0; // Always completes (implementation is the task itself)
  }

  /**
   * Implement code for a task
   * @param {Object} task - Task to implement { name, description, priority }
   * @returns {Promise<Object>} Implementation result { code, summary, score }
   */
  async implement(task) {
    try {
      // Analyze task requirements
      const requirements = this._parseRequirements(task);

      // Generate implementation
      const implementation = this._generateImplementation(requirements, task);

      // Create summary
      const summary = this._createSummary(requirements, implementation);

      return {
        score: 100, // Always succeeds in implementation
        implementation: implementation,
        requirements: requirements,
        summary: summary,
        language: this._detectLanguage(task),
        estimatedTime: this._estimateTime(task),
        dependencies: this._extractDependencies(task),
        nextAction: 'move-to-code-review'
      };
    } catch (error) {
      console.error('[SeniorEngineer] Implementation error:', error);
      return {
        score: 0,
        error: error.message,
        summary: 'Failed to generate implementation'
      };
    }
  }

  /**
   * Parse requirements from task description
   * @private
   */
  _parseRequirements(task) {
    const description = task.description || '';
    
    // Extract patterns from description
    const patterns = {
      hasAuth: /auth|authentication|login|password/.test(description),
      hasAPI: /api|endpoint|rest|http/.test(description),
      hasDatabase: /database|db|sql|query|model/.test(description),
      hasTests: /test|testing|coverage|spec/.test(description),
      hasValidation: /validation|validate|check|verify/.test(description),
      hasErrorHandling: /error|exception|handling|catch|try/.test(description),
      hasLogging: /log|logging|debug|trace/.test(description),
      hasUI: /ui|interface|component|view|button|form/.test(description),
      hasSecurity: /security|secure|encrypt|hash|salt/.test(description),
      hasPerformance: /performance|optimize|cache|speed|slow/.test(description)
    };

    return {
      title: task.name,
      description: description,
      priority: task.priority,
      ...patterns
    };
  }

  /**
   * Generate implementation code template
   * @private
   */
  _generateImplementation(requirements, task) {
    const language = this._detectLanguage(task);
    const structures = [];

    // Build implementation structure
    if (requirements.hasAPI) {
      structures.push(this._generateAPIEndpoint(requirements, language));
    }

    if (requirements.hasDatabase) {
      structures.push(this._generateDatabaseModel(requirements, language));
    }

    if (requirements.hasAuth) {
      structures.push(this._generateAuthModule(requirements, language));
    }

    if (requirements.hasUI) {
      structures.push(this._generateUIComponent(requirements, language));
    }

    if (requirements.hasValidation) {
      structures.push(this._generateValidation(requirements, language));
    }

    if (requirements.hasErrorHandling) {
      structures.push(this._generateErrorHandling(requirements, language));
    }

    if (requirements.hasTests) {
      structures.push(this._generateTests(requirements, language));
    }

    return {
      language: language,
      components: structures,
      structure: this._createProjectStructure(structures, language),
      bestPractices: this._suggestBestPractices(requirements, language)
    };
  }

  /**
   * Generate API endpoint code
   * @private
   */
  _generateAPIEndpoint(requirements, language) {
    if (language === 'javascript' || language === 'typescript') {
      return {
        type: 'api-endpoint',
        file: 'routes/api.js',
        code: `
// Express API Endpoint
const express = require('express');
const router = express.Router();

/**
 * ${requirements.title}
 * 
 * ${requirements.description}
 */
router.post('/api/${this._slugify(requirements.title)}', async (req, res) => {
  try {
    // Validate input
    const { /* fields from description */ } = req.body;
    
    // Business logic here
    
    // Return success response
    res.json({ 
      success: true, 
      data: { /* response */ },
      message: '${requirements.title} completed successfully'
    });
  } catch (error) {
    // Error handling
    console.error('Error in ${requirements.title}:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
`
      };
    } else if (language === 'python') {
      return {
        type: 'api-endpoint',
        file: 'api/routes.py',
        code: `
from flask import Blueprint, request, jsonify
import logging

# Blueprint for API routes
api_bp = Blueprint('api', __name__, url_prefix='/api')

logger = logging.getLogger(__name__)

@api_bp.route('/${this._slugify(requirements.title)}', methods=['POST'])
def ${this._toCamelCase(requirements.title)}():
    """
    ${requirements.title}
    
    ${requirements.description}
    """
    try:
        # Get request data
        data = request.get_json()
        
        # Validate input
        # Business logic here
        
        # Return response
        return jsonify({
            'success': True,
            'data': {},
            'message': '${requirements.title} completed successfully'
        }), 200
        
    except Exception as e:
        logger.error(f'Error in ${requirements.title}: {str(e)}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
`
      };
    }
  }

  /**
   * Generate database model
   * @private
   */
  _generateDatabaseModel(requirements, language) {
    if (language === 'javascript') {
      return {
        type: 'database-model',
        file: 'models/Model.js',
        code: `
const mongoose = require('mongoose');

/**
 * ${requirements.title} Model
 */
const schema = new mongoose.Schema({
  // Define fields based on requirements:
  // ${requirements.description}
  
  // Standard fields
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'active' }
}, { timestamps: true });

// Add indexes for performance
schema.index({ status: 1 });

// Add methods
schema.methods.toJSON = function() {
  return {
    id: this._id,
    // Include relevant fields
  };
};

module.exports = mongoose.model('${this._titleCase(requirements.title)}', schema);
`
      };
    }
  }

  /**
   * Generate authentication module
   * @private
   */
  _generateAuthModule(requirements, language) {
    return {
      type: 'authentication',
      file: 'auth/authenticate.js',
      code: `
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Authentication Module
 * 
 * ${requirements.description}
 */

// Hash password
async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Verify password
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
function generateToken(user) {
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  return token;
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken
};
`
    };
  }

  /**
   * Generate validation logic
   * @private
   */
  _generateValidation(requirements, language) {
    return {
      type: 'validation',
      file: 'middleware/validation.js',
      code: `
/**
 * Validation Middleware
 * 
 * ${requirements.description}
 */

function validateInput(req, res, next) {
  try {
    const { /* fields */ } = req.body;
    
    // Validate required fields
    if (!fields) {
      return res.status(400).json({
        success: false,
        error: 'Required fields missing'
      });
    }
    
    // Validate field types and formats
    if (typeof field !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid field format'
      });
    }
    
    // Validate field values
    if (field.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Field too short'
      });
    }
    
    // Continue to next middleware
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = { validateInput };
`
    };
  }

  /**
   * Generate error handling
   * @private
   */
  _generateErrorHandling(requirements, language) {
    return {
      type: 'error-handling',
      file: 'middleware/errorHandler.js',
      code: `
/**
 * Error Handling Middleware
 */

class ApplicationError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApplicationError';
  }
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log error details
  console.error('Error:', {
    message: message,
    statusCode: statusCode,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    statusCode: statusCode
  });
}

module.exports = { ApplicationError, errorHandler };
`
    };
  }

  /**
   * Generate test cases
   * @private
   */
  _generateTests(requirements, language) {
    return {
      type: 'tests',
      file: 'tests/integration.test.js',
      code: `
const request = require('supertest');
const app = require('../app');

/**
 * Test Suite: ${requirements.title}
 * 
 * ${requirements.description}
 */

describe('${requirements.title}', () => {
  
  test('should successfully ${requirements.title.toLowerCase()}', async () => {
    const response = await request(app)
      .post('/api/${this._slugify(requirements.title)}')
      .send({
        // Test data
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
  
  test('should handle validation errors', async () => {
    const response = await request(app)
      .post('/api/${this._slugify(requirements.title)}')
      .send({
        // Invalid data
      });
    
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
  
  test('should handle server errors', async () => {
    // Mock error scenario
    const response = await request(app)
      .post('/api/${this._slugify(requirements.title)}')
      .send({
        // Data that triggers error
      });
    
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });
});
`
    };
  }

  /**
   * Generate UI component
   * @private
   */
  _generateUIComponent(requirements, language) {
    return {
      type: 'ui-component',
      file: 'components/Component.jsx',
      code: `
import React, { useState } from 'react';

/**
 * ${this._titleCase(requirements.title)} Component
 * 
 * ${requirements.description}
 */

export function ${this._titleCase(this._toCamelCase(requirements.title))}() {
  const [state, setState] = useState({
    loading: false,
    error: null,
    success: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setState({ ...state, loading: true });
    
    try {
      // API call
      const response = await fetch('/api/${this._slugify(requirements.title)}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Form data
        })
      });
      
      if (response.ok) {
        setState({ loading: false, error: null, success: true });
      } else {
        throw new Error('Request failed');
      }
    } catch (error) {
      setState({ loading: false, error: error.message, success: false });
    }
  };

  return (
    <div className="component">
      <h2>${requirements.title}</h2>
      
      {state.error && <div className="error">{state.error}</div>}
      {state.success && <div className="success">Success!</div>}
      
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <button type="submit" disabled={state.loading}>
          {state.loading ? 'Loading...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
`
    };
  }

  /**
   * Create project structure
   * @private
   */
  _createProjectStructure(components, language) {
    return {
      language: language,
      structure: `
project/
├── src/
│   ├── models/            # Database models
│   ├── routes/            # API endpoints
│   ├── middleware/        # Validation, auth, error handling
│   ├── services/          # Business logic
│   ├── utils/             # Helper functions
│   └── components/        # UI components (if applicable)
│
├── tests/
│   ├── unit/              # Unit tests
│   └── integration/       # Integration tests
│
├── docs/
│   ├── API.md            # API documentation
│   └── SETUP.md          # Setup instructions
│
├── .env                   # Environment variables
├── package.json           # Dependencies
├── README.md              # Project readme
└── .gitignore             # Git ignore
`
    };
  }

  /**
   * Suggest best practices
   * @private
   */
  _suggestBestPractices(requirements, language) {
    const practices = [
      '✅ Use environment variables for configuration',
      '✅ Add proper error handling for all operations',
      '✅ Implement input validation at boundaries',
      '✅ Write tests for critical paths',
      '✅ Use consistent naming conventions',
      '✅ Add JSDoc comments for functions',
      '✅ Implement logging for debugging',
      '✅ Use transactions for data consistency'
    ];

    if (requirements.hasSecurity) {
      practices.push('✅ Validate and sanitize all user inputs');
      practices.push('✅ Use parameterized queries to prevent SQL injection');
      practices.push('✅ Hash passwords with proper algorithms (bcrypt)');
      practices.push('✅ Use HTTPS for all communications');
    }

    if (requirements.hasPerformance) {
      practices.push('✅ Add database indexes for frequently queried fields');
      practices.push('✅ Implement caching where appropriate');
      practices.push('✅ Use pagination for large datasets');
      practices.push('✅ Monitor query performance');
    }

    return practices;
  }

  /**
   * Detect programming language from task
   * @private
   */
  _detectLanguage(task) {
    const desc = (task.description + task.name).toLowerCase();
    
    if (desc.includes('python')) return 'python';
    if (desc.includes('java')) return 'java';
    if (desc.includes('node') || desc.includes('express') || desc.includes('javascript')) return 'javascript';
    if (desc.includes('typescript')) return 'typescript';
    if (desc.includes('react')) return 'javascript';
    if (desc.includes('vue')) return 'javascript';
    if (desc.includes('php')) return 'php';
    if (desc.includes('go')) return 'go';
    if (desc.includes('rust')) return 'rust';
    
    return 'javascript'; // Default
  }

  /**
   * Estimate implementation time
   * @private
   */
  _estimateTime(task) {
    const complexity = task.priority === 'CRITICAL' ? 4 : 
                      task.priority === 'HIGH' ? 8 :
                      task.priority === 'MEDIUM' ? 4 : 2;
    
    return `${complexity} hours`;
  }

  /**
   * Extract dependencies from task
   * @private
   */
  _extractDependencies(task) {
    const deps = [];
    const desc = task.description.toLowerCase();
    
    if (desc.includes('database')) deps.push('mongoose', 'sqlite3');
    if (desc.includes('auth')) deps.push('bcrypt', 'jsonwebtoken');
    if (desc.includes('validation')) deps.push('joi', 'validator');
    if (desc.includes('http') || desc.includes('api')) deps.push('express', 'axios');
    if (desc.includes('test')) deps.push('jest', 'supertest');
    if (desc.includes('logging')) deps.push('winston', 'pino');
    if (desc.includes('cache')) deps.push('redis', 'memcached');
    
    return [...new Set(deps)]; // Remove duplicates
  }

  /**
   * Create implementation summary
   * @private
   */
  _createSummary(requirements, implementation) {
    const components = implementation.components.length;
    return `
✅ Implementation Generated

Components: ${components}
Language: ${implementation.language}
Structure: ${implementation.components.map(c => c.type).join(', ')}

Ready for Code Review:
${implementation.bestPractices.slice(0, 5).join('\n')}

Next Steps:
1. Review implementation in Code-Review stage
2. Address any code quality findings
3. Proceed to Security-Review
4. Complete QA-Testing
`;
  }

  // Utility functions
  _slugify(str) {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  _toCamelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => i === 0 ? w.toLowerCase() : w.toUpperCase())
      .replace(/\s+/g, '');
  }

  _titleCase(str) {
    return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
}

module.exports = SeniorEngineerAgent;
