#!/usr/bin/env node

import { program } from 'commander';
import { CLI } from './cli';
import todoService from './todoService';
import { Priority } from './types';
import { displayTodos, displayStats, displaySuccess, displayError } from './display';

program
  .name('todo')
  .description('A feature-rich CLI todo application built with TypeScript')
  .version('1.0.0');

// Interactive mode (default)
program
  .command('interactive')
  .alias('i')
  .description('Start interactive mode')
  .action(async () => {
    const cli = new CLI();
    await cli.start();
  });

// Quick add command
program
  .command('add <title>')
  .alias('a')
  .description('Quickly add a new todo')
  .option('-d, --description <description>', 'Todo description')
  .option('-p, --priority <priority>', 'Priority (low, medium, high)', 'medium')
  .option('-t, --tags <tags>', 'Comma-separated tags')
  .action((title: string, options: any) => {
    const tags = options.tags ? options.tags.split(',').map((tag: string) => tag.trim()) : [];
    const priority = options.priority as Priority;

    const todo = todoService.createTodo(title, options.description, priority, tags);
    displaySuccess(`Added: ${todo.title}`);
  });

// List command
program
  .command('list')
  .alias('ls')
  .description('List all todos')
  .option('-c, --completed', 'Show only completed todos')
  .option('-p, --pending', 'Show only pending todos')
  .option('--priority <priority>', 'Filter by priority (low, medium, high)')
  .action((options: any) => {
    let filter: any = {};

    if (options.completed) {
      filter.completed = true;
    } else if (options.pending) {
      filter.completed = false;
    }

    if (options.priority) {
      filter.priority = options.priority as Priority;
    }

    const todos = todoService.getTodos(filter);
    displayTodos(todos);
  });

// Complete command
program
  .command('complete <id>')
  .alias('done')
  .description('Mark a todo as complete')
  .action((id: string) => {
    const result = todoService.completeTodo(id);
    if (result) {
      displaySuccess(`Completed: ${result.title}`);
    } else {
      displayError('Todo not found!');
    }
  });

// Delete command
program
  .command('delete <id>')
  .alias('rm')
  .description('Delete a todo')
  .action((id: string) => {
    const result = todoService.deleteTodo(id);
    if (result) {
      displaySuccess('Todo deleted!');
    } else {
      displayError('Todo not found!');
    }
  });

// Clear completed command
program
  .command('clear')
  .description('Delete all completed todos')
  .action(() => {
    const count = todoService.deleteCompleted();
    displaySuccess(`Deleted ${count} completed todo(s)!`);
  });

// Stats command
program
  .command('stats')
  .description('Show statistics')
  .action(() => {
    const stats = todoService.getStats();
    displayStats(stats);
  });

// If no command is provided, start interactive mode
if (!process.argv.slice(2).length) {
  const cli = new CLI();
  cli.start();
} else {
  program.parse(process.argv);
}
