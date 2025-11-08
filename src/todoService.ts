import { nanoid } from 'nanoid';
import db from './database';
import { Todo, Priority, TodoFilter } from './types';

export class TodoService {
  /**
   * Create a new todo item
   */
  createTodo(
    title: string,
    description?: string,
    priority: Priority = Priority.MEDIUM,
    tags: string[] = []
  ): Todo {
    const todo: Todo = {
      id: nanoid(),
      title,
      description,
      completed: false,
      priority,
      createdAt: new Date(),
      tags,
    };

    db.get('todos').push(todo).write();
    return todo;
  }

  /**
   * Get all todos with optional filtering
   */
  getTodos(filter?: TodoFilter): Todo[] {
    let todos = db.get('todos').value();

    if (filter) {
      if (filter.completed !== undefined) {
        todos = todos.filter((t: Todo) => t.completed === filter.completed);
      }
      if (filter.priority) {
        todos = todos.filter((t: Todo) => t.priority === filter.priority);
      }
      if (filter.tag) {
        todos = todos.filter((t: Todo) => t.tags.includes(filter.tag!));
      }
    }

    return todos;
  }

  /**
   * Get a single todo by ID
   */
  getTodoById(id: string): Todo | undefined {
    return db.get('todos').find({ id }).value();
  }

  /**
   * Update a todo
   */
  updateTodo(id: string, updates: Partial<Todo>): Todo | null {
    const todo = db.get('todos').find({ id });

    if (!todo.value()) {
      return null;
    }

    todo.assign(updates).write();
    return todo.value();
  }

  /**
   * Mark a todo as completed
   */
  completeTodo(id: string): Todo | null {
    const todo = db.get('todos').find({ id });

    if (!todo.value()) {
      return null;
    }

    todo.assign({
      completed: true,
      completedAt: new Date()
    }).write();

    return todo.value();
  }

  /**
   * Mark a todo as incomplete
   */
  incompleteTodo(id: string): Todo | null {
    const todo = db.get('todos').find({ id });

    if (!todo.value()) {
      return null;
    }

    todo.assign({
      completed: false,
      completedAt: undefined
    }).write();

    return todo.value();
  }

  /**
   * Delete a todo
   */
  deleteTodo(id: string): boolean {
    const initialLength = db.get('todos').size().value();
    db.get('todos').remove({ id }).write();
    const newLength = db.get('todos').size().value();

    return newLength < initialLength;
  }

  /**
   * Delete all completed todos
   */
  deleteCompleted(): number {
    const initialLength = db.get('todos').size().value();
    db.get('todos').remove({ completed: true }).write();
    const newLength = db.get('todos').size().value();

    return initialLength - newLength;
  }

  /**
   * Get statistics
   */
  getStats() {
    const todos = this.getTodos();
    const completed = todos.filter((t) => t.completed).length;
    const pending = todos.filter((t) => !t.completed).length;
    const highPriority = todos.filter((t) => t.priority === Priority.HIGH && !t.completed).length;

    return {
      total: todos.length,
      completed,
      pending,
      highPriority,
    };
  }
}

export default new TodoService();
