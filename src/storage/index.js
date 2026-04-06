const FileBackend = require('./file-backend');
const MySQLBackend = require('./mysql-backend');

class StorageFactory {
  /**
   * Create a storage backend instance based on configuration.
   * @param {Object} config - Configuration object
   * @param {string} config.type - Backend type: 'file', 'mysql', or 'sqlite'
   * @param {string} config.path - For file and sqlite backends: directory or file path
   * @returns {Promise<Object>} Initialized storage backend instance
   */
  static async create(config) {
    let backend;

    if (config.type === 'mysql') {
      backend = new MySQLBackend({
        type: 'mysql',
        host: config.host || 'localhost',
        user: config.user || 'root',
        password: config.password || '',
        database: config.database || 'workflow_tracker'
      });
    } else if (config.type === 'sqlite') {
      backend = new MySQLBackend({
        type: 'sqlite',
        path: config.path || ':memory:'
      });
    } else {
      // Default to file backend
      backend = new FileBackend(config.path || `${process.env.HOME}/.claude/workflow-tracker/data`);
    }

    await backend.initialize();
    return backend;
  }
}

module.exports = StorageFactory;
