import inquirer from 'inquirer';
import ora from 'ora';
import todoService from './todoService';
import { Priority } from './types';
import {
  displayWelcome,
  displayTodos,
  displayStats,
  displaySuccess,
  displayError,
  displayInfo,
  displayTodo,
} from './display';

export class CLI {
  async start(): Promise<void> {
    displayWelcome();
    await this.mainMenu();
  }

  async mainMenu(): Promise<void> {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '📝 Add a new todo', value: 'add' },
          { name: '📋 List all todos', value: 'list' },
          { name: '✓ Complete a todo', value: 'complete' },
          { name: '↩️  Mark as incomplete', value: 'incomplete' },
          { name: '🗑️  Delete a todo', value: 'delete' },
          { name: '🗑️  Delete completed todos', value: 'deleteCompleted' },
          { name: '🔍 Filter todos', value: 'filter' },
          { name: '📊 View statistics', value: 'stats' },
          { name: '🚪 Exit', value: 'exit' },
        ],
      },
    ]);

    switch (action) {
      case 'add':
        await this.addTodo();
        break;
      case 'list':
        await this.listTodos();
        break;
      case 'complete':
        await this.completeTodo();
        break;
      case 'incomplete':
        await this.incompleteTodo();
        break;
      case 'delete':
        await this.deleteTodo();
        break;
      case 'deleteCompleted':
        await this.deleteCompleted();
        break;
      case 'filter':
        await this.filterTodos();
        break;
      case 'stats':
        await this.showStats();
        break;
      case 'exit':
        displayInfo('Thanks for using Todo App! Goodbye! 👋');
        return;
    }

    await this.mainMenu();
  }

  async addTodo(): Promise<void> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Todo title:',
        validate: (input) => (input.trim() ? true : 'Title cannot be empty'),
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description (optional):',
      },
      {
        type: 'list',
        name: 'priority',
        message: 'Priority:',
        choices: [
          { name: '🔴 High', value: Priority.HIGH },
          { name: '🟡 Medium', value: Priority.MEDIUM },
          { name: '🔵 Low', value: Priority.LOW },
        ],
        default: Priority.MEDIUM,
      },
      {
        type: 'input',
        name: 'tags',
        message: 'Tags (comma-separated):',
      },
    ]);

    const spinner = ora('Creating todo...').start();

    const tags = answers.tags
      ? answers.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
      : [];

    const todo = todoService.createTodo(
      answers.title,
      answers.description || undefined,
      answers.priority,
      tags
    );

    spinner.succeed('Todo created successfully!');
    displayTodo(todo);
  }

  async listTodos(): Promise<void> {
    const spinner = ora('Loading todos...').start();
    const todos = todoService.getTodos();
    spinner.stop();

    displayTodos(todos);
  }

  async completeTodo(): Promise<void> {
    const todos = todoService.getTodos({ completed: false });

    if (todos.length === 0) {
      displayError('No pending todos found!');
      return;
    }

    const { todoId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'todoId',
        message: 'Select a todo to complete:',
        choices: todos.map((todo) => ({
          name: `${todo.title} [${todo.priority}]`,
          value: todo.id,
        })),
      },
    ]);

    const result = todoService.completeTodo(todoId);
    if (result) {
      displaySuccess(`Completed: ${result.title}`);
    } else {
      displayError('Todo not found!');
    }
  }

  async incompleteTodo(): Promise<void> {
    const todos = todoService.getTodos({ completed: true });

    if (todos.length === 0) {
      displayError('No completed todos found!');
      return;
    }

    const { todoId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'todoId',
        message: 'Select a todo to mark as incomplete:',
        choices: todos.map((todo) => ({
          name: todo.title,
          value: todo.id,
        })),
      },
    ]);

    const result = todoService.incompleteTodo(todoId);
    if (result) {
      displaySuccess(`Marked as incomplete: ${result.title}`);
    } else {
      displayError('Todo not found!');
    }
  }

  async deleteTodo(): Promise<void> {
    const todos = todoService.getTodos();

    if (todos.length === 0) {
      displayError('No todos to delete!');
      return;
    }

    const { todoId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'todoId',
        message: 'Select a todo to delete:',
        choices: todos.map((todo) => ({
          name: `${todo.title} ${todo.completed ? '✓' : ''}`,
          value: todo.id,
        })),
      },
    ]);

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to delete this todo?',
        default: false,
      },
    ]);

    if (confirm) {
      const result = todoService.deleteTodo(todoId);
      if (result) {
        displaySuccess('Todo deleted successfully!');
      } else {
        displayError('Todo not found!');
      }
    } else {
      displayInfo('Deletion cancelled');
    }
  }

  async deleteCompleted(): Promise<void> {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to delete all completed todos?',
        default: false,
      },
    ]);

    if (confirm) {
      const count = todoService.deleteCompleted();
      displaySuccess(`Deleted ${count} completed todo(s)!`);
    } else {
      displayInfo('Deletion cancelled');
    }
  }

  async filterTodos(): Promise<void> {
    const { filterType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'filterType',
        message: 'Filter by:',
        choices: [
          { name: 'Status', value: 'status' },
          { name: 'Priority', value: 'priority' },
          { name: 'Tag', value: 'tag' },
        ],
      },
    ]);

    let filter = {};

    if (filterType === 'status') {
      const { status } = await inquirer.prompt([
        {
          type: 'list',
          name: 'status',
          message: 'Select status:',
          choices: [
            { name: 'Completed', value: true },
            { name: 'Pending', value: false },
          ],
        },
      ]);
      filter = { completed: status };
    } else if (filterType === 'priority') {
      const { priority } = await inquirer.prompt([
        {
          type: 'list',
          name: 'priority',
          message: 'Select priority:',
          choices: [
            { name: '🔴 High', value: Priority.HIGH },
            { name: '🟡 Medium', value: Priority.MEDIUM },
            { name: '🔵 Low', value: Priority.LOW },
          ],
        },
      ]);
      filter = { priority };
    } else if (filterType === 'tag') {
      const todos = todoService.getTodos();
      const allTags = Array.from(new Set(todos.flatMap((t) => t.tags)));

      if (allTags.length === 0) {
        displayError('No tags found!');
        return;
      }

      const { tag } = await inquirer.prompt([
        {
          type: 'list',
          name: 'tag',
          message: 'Select tag:',
          choices: allTags,
        },
      ]);
      filter = { tag };
    }

    const spinner = ora('Filtering todos...').start();
    const todos = todoService.getTodos(filter);
    spinner.stop();

    displayTodos(todos);
  }

  async showStats(): Promise<void> {
    const spinner = ora('Calculating statistics...').start();
    const stats = todoService.getStats();
    spinner.stop();

    displayStats(stats);
  }
}
