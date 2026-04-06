const chalk = require('chalk');

/**
 * Task CLI Command Handler
 * Handles: task create, task list, task move
 */

/**
 * Build task create command
 */
const createCommand = {
  command: 'create <name>',
  description: 'Create a new task',
  builder: (yargs) =>
    yargs
      .positional('name', {
        describe: 'Task name',
        type: 'string'
      })
      .option('project', {
        alias: 'p',
        describe: 'Project ID',
        type: 'string',
        required: true
      })
      .option('description', {
        alias: 'd',
        describe: 'Task description',
        type: 'string',
        default: ''
      })
      .option('priority', {
        describe: 'Priority level (CRITICAL, HIGH, MEDIUM, LOW)',
        type: 'string',
        default: 'MEDIUM',
        choices: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
      })
      .option('assigned', {
        alias: 'a',
        describe: 'Assigned to (username or email)',
        type: 'string'
      }),
  handler: async (argv) => {
    try {
      const { managers } = argv;
      const taskData = {
        name: argv.name,
        description: argv.description,
        priority: argv.priority,
        assigned_to: argv.assigned || null
      };

      const task = await managers.taskManager.create(argv.project, taskData);
      console.log(chalk.green('\n✓ Task created successfully'));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(chalk.cyan('Task ID:     ') + task.id);
      console.log(chalk.cyan('Name:        ') + task.name);
      console.log(chalk.cyan('Project:     ') + argv.project);
      console.log(chalk.cyan('Priority:    ') + task.priority);
      console.log(chalk.cyan('Status:      ') + task.stage);
      if (task.assigned_to) {
        console.log(chalk.cyan('Assigned to: ') + task.assigned_to);
      }
      console.log(chalk.gray('─'.repeat(60)) + '\n');
    } catch (error) {
      console.error(chalk.red(`\n✗ Error creating task: ${error.message}\n`));
      process.exit(1);
    }
  }
};

/**
 * Build task list command
 */
const listCommand = {
  command: 'list',
  description: 'List tasks for a project',
  builder: (yargs) =>
    yargs
      .option('project', {
        alias: 'p',
        describe: 'Project ID',
        type: 'string',
        required: true
      })
      .option('status', {
        alias: 's',
        describe: 'Filter by status/stage',
        type: 'string'
      })
      .option('priority', {
        describe: 'Filter by priority (CRITICAL, HIGH, MEDIUM, LOW)',
        type: 'string',
        choices: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
      }),
  handler: async (argv) => {
    try {
      const { managers } = argv;
      const filter = {};
      if (argv.status) filter.stage = argv.status;
      if (argv.priority) filter.priority = argv.priority;

      const tasks = await managers.taskManager.list(argv.project, filter);

      if (tasks.length === 0) {
        console.log(chalk.yellow('\nNo tasks found.\n'));
        return;
      }

      console.log(chalk.blue.bold('\n╔════════════════════════════════════════════════════════════════╗'));
      console.log(chalk.blue.bold('║ Tasks for Project: ' + argv.project.padEnd(39) + '║'));
      console.log(chalk.blue.bold('╚════════════════════════════════════════════════════════════════╝\n'));

      tasks.forEach((task, index) => {
        const priorityColor = {
          CRITICAL: chalk.red,
          HIGH: chalk.yellow,
          MEDIUM: chalk.cyan,
          LOW: chalk.gray
        }[task.priority] || chalk.gray;

        console.log(chalk.bold(`${index + 1}. ${task.name}`));
        console.log(`   ${chalk.dim('ID:')} ${task.id}`);
        console.log(`   ${chalk.dim('Priority:')} ${priorityColor(task.priority)}`);
        console.log(`   ${chalk.dim('Status:')} ${task.stage}`);
        if (task.assigned_to) {
          console.log(`   ${chalk.dim('Assigned to:')} ${task.assigned_to}`);
        }
        if (task.description) {
          console.log(`   ${chalk.dim('Description:')} ${task.description}`);
        }
        console.log();
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ Error listing tasks: ${error.message}\n`));
      process.exit(1);
    }
  }
};

/**
 * Build task move command
 */
const moveCommand = {
  command: 'move <task-id> <to-stage>',
  description: 'Move a task to a different stage',
  builder: (yargs) =>
    yargs
      .positional('task-id', {
        describe: 'Task ID to move',
        type: 'string'
      })
      .positional('to-stage', {
        describe: 'Target stage name',
        type: 'string'
      })
      .option('project', {
        alias: 'p',
        describe: 'Project ID',
        type: 'string',
        required: true
      }),
  handler: async (argv) => {
    try {
      const { managers } = argv;
      const task = await managers.taskManager.moveTask(argv.project, argv['task-id'], argv['to-stage']);

      console.log(chalk.green('\n✓ Task moved successfully'));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(chalk.cyan('Task:     ') + task.name);
      console.log(chalk.cyan('Task ID:  ') + task.id);
      console.log(chalk.cyan('New Stage:') + task.stage);
      console.log(chalk.gray('─'.repeat(60)) + '\n');
    } catch (error) {
      console.error(chalk.red(`\n✗ Error moving task: ${error.message}\n`));
      process.exit(1);
    }
  }
};

module.exports = {
  command: 'task <subcommand>',
  description: 'Manage tasks',
  builder: (yargs) =>
    yargs
      .command(createCommand)
      .command(listCommand)
      .command(moveCommand)
      .demandCommand(1, 'Please specify a task subcommand (create, list, or move)')
      .help(),
  handler: () => {}
};
