#!/usr/bin/env node

/**
 * CLI Entry Point - Workflow Tracker
 *
 * Multi-project workflow tracking plugin for Claude Code
 * Provides task and project management through command-line interface
 *
 * Usage:
 *   node src/cli/index.js project create test-proj "Test Project"
 *   node src/cli/index.js project list
 *   node src/cli/index.js task create "Task Name" -p test-proj -pr HIGH
 *   node src/cli/index.js task list -p test-proj
 *   node src/cli/index.js task move task-id-123 Done -p test-proj
 */

const yargs = require('yargs');
const chalk = require('chalk');
const path = require('path');
const StorageFactory = require('../storage');
const TaskManager = require('../core/task-manager');
const ProjectManager = require('../core/project-manager');
const taskCommand = require('./commands/task');
const projectCommand = require('./commands/project');

/**
 * Initialize and run CLI
 */
async function main() {
  try {
    // Initialize storage based on environment configuration
    const storageConfig = {
      type: process.env.STORAGE_TYPE || 'file',
      path: process.env.STORAGE_PATH || path.join(process.env.HOME, '.claude/workflow-tracker/data'),
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    };

    // Create storage backend
    const storage = await StorageFactory.create(storageConfig);

    // Initialize managers with storage
    const managers = {
      taskManager: new TaskManager(storage),
      projectManager: new ProjectManager(storage)
    };

    // Configure yargs with commands and global handlers
    const yargsInstance = yargs(process.argv.slice(2))
      .scriptName('workflow-tracker')
      .usage('$0 <command> [options]')
      .command(projectCommand)
      .command(taskCommand)
      .middleware((argv) => {
        // Inject managers into all command handlers
        argv.managers = managers;
        argv.storage = storage;
      })
      .option('verbose', {
        alias: 'v',
        describe: 'Verbose output',
        type: 'boolean',
        default: false
      })
      .option('storage-type', {
        describe: 'Storage backend (file, mysql, sqlite)',
        type: 'string',
        hidden: true
      })
      .help()
      .alias('help', 'h')
      .version()
      .alias('version', 'v')
      .epilogue(
        chalk.gray(
          '\nFor more information, visit: https://github.com/anthropics/claude-code/plugins/workflow-tracker\n'
        )
      )
      .strict();

    // Parse and execute
    const result = await yargsInstance.parseAsync();

    // Graceful shutdown
    if (storage && typeof storage.close === 'function') {
      await storage.close();
    }
  } catch (error) {
    console.error(chalk.red(`\nFatal Error: ${error.message}\n`));
    if (process.env.VERBOSE || process.argv.includes('--verbose')) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch((error) => {
    console.error(chalk.red(`\nUnhandled Error: ${error.message}\n`));
    process.exit(1);
  });
}

module.exports = { main };
