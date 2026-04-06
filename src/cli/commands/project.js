const chalk = require('chalk');

/**
 * Project CLI Command Handler
 * Handles: project create, project list
 */

/**
 * Build project create command
 */
const createCommand = {
  command: 'create <id> <name>',
  description: 'Create a new project',
  builder: (yargs) =>
    yargs
      .positional('id', {
        describe: 'Unique project identifier',
        type: 'string'
      })
      .positional('name', {
        describe: 'Project name',
        type: 'string'
      })
      .option('template', {
        alias: 't',
        describe: 'Project template (default: standard)',
        type: 'string',
        default: 'default'
      })
      .option('description', {
        alias: 'd',
        describe: 'Project description',
        type: 'string',
        default: ''
      }),
  handler: async (argv) => {
    try {
      const { managers } = argv;
      const projectData = {
        name: argv.name,
        description: argv.description,
        template: argv.template,
        stages: getDefaultStages(argv.template),
        created_at: new Date().toISOString()
      };

      const project = await managers.projectManager.create(argv.id, projectData);

      console.log(chalk.green('\n✓ Project created successfully'));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(chalk.cyan('Project ID:   ') + project.id);
      console.log(chalk.cyan('Name:         ') + project.name);
      console.log(chalk.cyan('Template:     ') + project.template);
      if (project.description) {
        console.log(chalk.cyan('Description:  ') + project.description);
      }
      console.log(chalk.cyan('Stages:       ') + (project.stages || []).length);
      if (project.stages && project.stages.length > 0) {
        console.log(chalk.gray('  - ' + project.stages.map(s => s.name || s).join('\n  - ')));
      }
      console.log(chalk.gray('─'.repeat(60)) + '\n');
    } catch (error) {
      console.error(chalk.red(`\n✗ Error creating project: ${error.message}\n`));
      process.exit(1);
    }
  }
};

/**
 * Build project list command
 */
const listCommand = {
  command: 'list',
  description: 'List all projects',
  builder: (yargs) => yargs,
  handler: async (argv) => {
    try {
      const { managers } = argv;
      const projects = await managers.projectManager.list();

      if (projects.length === 0) {
        console.log(chalk.yellow('\nNo projects found.\n'));
        return;
      }

      console.log(chalk.blue.bold('\n╔════════════════════════════════════════════════════════════════╗'));
      console.log(chalk.blue.bold('║ All Projects' + ' '.repeat(51) + '║'));
      console.log(chalk.blue.bold('╚════════════════════════════════════════════════════════════════╝\n'));

      projects.forEach((project, index) => {
        console.log(chalk.bold(`${index + 1}. ${project.name}`));
        console.log(`   ${chalk.dim('Project ID:')} ${project.id}`);
        if (project.description) {
          console.log(`   ${chalk.dim('Description:')} ${project.description}`);
        }
        console.log(`   ${chalk.dim('Template:')} ${project.template || 'default'}`);
        console.log(`   ${chalk.dim('Stages:')} ${(project.stages || []).length}`);
        if (project.stages && project.stages.length > 0) {
          const stageNames = project.stages
            .map(s => (typeof s === 'string' ? s : s.name))
            .join(', ');
          console.log(`   ${chalk.dim('Stage list:')} ${stageNames}`);
        }
        if (project.created_at) {
          console.log(`   ${chalk.dim('Created:')} ${new Date(project.created_at).toLocaleDateString()}`);
        }
        console.log();
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ Error listing projects: ${error.message}\n`));
      process.exit(1);
    }
  }
};

/**
 * Get default stages based on template
 * @param {string} template - Template name
 * @returns {array} Array of stage objects
 */
function getDefaultStages(template = 'default') {
  const templates = {
    default: [
      { name: 'InQueue', order: 1, auto_invoke_agent: false, requires_approval: false },
      { name: 'InProgress', order: 2, auto_invoke_agent: false, requires_approval: false },
      { name: 'InReview', order: 3, auto_invoke_agent: false, requires_approval: true },
      { name: 'Done', order: 4, auto_invoke_agent: false, requires_approval: false }
    ],
    agile: [
      { name: 'Backlog', order: 1, auto_invoke_agent: false, requires_approval: false },
      { name: 'Sprint', order: 2, auto_invoke_agent: false, requires_approval: false },
      { name: 'InProgress', order: 3, auto_invoke_agent: false, requires_approval: false },
      { name: 'Review', order: 4, auto_invoke_agent: false, requires_approval: true },
      { name: 'Done', order: 5, auto_invoke_agent: false, requires_approval: false }
    ],
    kanban: [
      { name: 'ToDo', order: 1, auto_invoke_agent: false, requires_approval: false },
      { name: 'InProgress', order: 2, auto_invoke_agent: false, requires_approval: false },
      { name: 'InReview', order: 3, auto_invoke_agent: false, requires_approval: true },
      { name: 'Done', order: 4, auto_invoke_agent: false, requires_approval: false }
    ]
  };

  return templates[template] || templates.default;
}

module.exports = {
  command: 'project <subcommand>',
  description: 'Manage projects',
  builder: (yargs) =>
    yargs
      .command(createCommand)
      .command(listCommand)
      .demandCommand(1, 'Please specify a project subcommand (create or list)')
      .help(),
  handler: () => {}
};
