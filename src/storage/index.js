const FileBackend = require('./file-backend');

class StorageFactory {
  static async create(config) {
    const backend = new FileBackend(config.path || `${process.env.HOME}/.claude/workflow-tracker/data`);
    await backend.initialize();
    return backend;
  }
}

module.exports = StorageFactory;
