import chalk from 'chalk';
import boxen from 'boxen';
import { format } from 'date-fns';
import { Todo } from './types';

/**
 * Display a single todo item
 */
export function displayTodo(todo: Todo, index?: number): void {
  const status = todo.completed ? chalk.green('✓') : chalk.red('✗');
  const title = todo.completed ? chalk.gray.strikethrough(todo.title) : chalk.bold(todo.title);

  let priorityColor;
  switch (todo.priority) {
    case 'high':
      priorityColor = chalk.red.bold('HIGH');
      break;
    case 'medium':
      priorityColor = chalk.yellow('MEDIUM');
      break;
    case 'low':
      priorityColor = chalk.blue('LOW');
      break;
  }

  const indexStr = index !== undefined ? chalk.cyan(`[${index + 1}]`) : '';
  const tags = todo.tags.length > 0 ? chalk.magenta(`#${todo.tags.join(' #')}`) : '';
  const created = chalk.gray(`Created: ${format(new Date(todo.createdAt), 'PPp')}`);
  const completed = todo.completedAt ? chalk.gray(`Completed: ${format(new Date(todo.completedAt), 'PPp')}`) : '';

  console.log(`${indexStr} ${status} ${title} ${priorityColor}`);
  if (todo.description) {
    console.log(chalk.gray(`   ${todo.description}`));
  }
  if (tags) {
    console.log(`   ${tags}`);
  }
  console.log(`   ${created}`);
  if (completed) {
    console.log(`   ${completed}`);
  }
  console.log(chalk.gray(`   ID: ${todo.id}`));
  console.log('');
}

/**
 * Display a list of todos
 */
export function displayTodos(todos: Todo[]): void {
  if (todos.length === 0) {
    console.log(chalk.yellow('\nNo todos found!\n'));
    return;
  }

  console.log(chalk.bold.cyan(`\n📋 Todo List (${todos.length} items)\n`));
  todos.forEach((todo, index) => displayTodo(todo, index));
}

/**
 * Display statistics in a nice box
 */
export function displayStats(stats: { total: number; completed: number; pending: number; highPriority: number }): void {
  const content = `
${chalk.bold('Total Todos:')} ${chalk.cyan(stats.total)}
${chalk.bold('Completed:')} ${chalk.green(stats.completed)}
${chalk.bold('Pending:')} ${chalk.yellow(stats.pending)}
${chalk.bold('High Priority:')} ${chalk.red(stats.highPriority)}
  `.trim();

  console.log(boxen(content, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
    title: '📊 Statistics',
    titleAlignment: 'center',
  }));
}

/**
 * Display a success message
 */
export function displaySuccess(message: string): void {
  console.log(chalk.green(`\n✓ ${message}\n`));
}

/**
 * Display an error message
 */
export function displayError(message: string): void {
  console.log(chalk.red(`\n✗ ${message}\n`));
}

/**
 * Display an info message
 */
export function displayInfo(message: string): void {
  console.log(chalk.blue(`\nℹ ${message}\n`));
}

/**
 * Display a welcome banner
 */
export function displayWelcome(): void {
  const banner = chalk.bold.cyan(`
╔════════════════════════════════════╗
║     📝 TypeScript Todo App 📝      ║
║   Manage your tasks with style!    ║
╚════════════════════════════════════╝
  `);
  console.log(banner);
}
