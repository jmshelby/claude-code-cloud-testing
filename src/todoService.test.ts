import { TodoService } from './todoService';
import { Priority } from './types';
import db from './database';

// Mock the database module
jest.mock('./database', () => {
  const todos: any[] = [];
  return {
    __esModule: true,
    default: {
      get: jest.fn(() => ({
        push: jest.fn((todo: any) => {
          todos.push(todo);
          return {
            write: jest.fn(),
          };
        }),
        value: jest.fn(() => [...todos]),
        find: jest.fn((query: any) => {
          const found = todos.find((t) => t.id === query.id);
          return {
            value: jest.fn(() => found),
            assign: jest.fn((updates: any) => {
              if (found) {
                Object.assign(found, updates);
              }
              return {
                write: jest.fn(),
                value: jest.fn(() => found),
              };
            }),
          };
        }),
        remove: jest.fn((query: any) => {
          const index = todos.findIndex((t) => t.id === query.id || t.completed === query.completed);
          if (index !== -1) {
            todos.splice(index, 1);
          }
          return {
            write: jest.fn(),
          };
        }),
        size: jest.fn(() => ({
          value: jest.fn(() => todos.length),
        })),
      })),
    },
  };
});

describe('TodoService', () => {
  let todoService: TodoService;

  beforeEach(() => {
    // Create a new instance for each test
    todoService = new TodoService();
  });

  describe('createTodo', () => {
    it('should create a new todo with all properties', () => {
      const title = 'Test Todo';
      const description = 'Test Description';
      const priority = Priority.HIGH;
      const tags = ['test', 'unit'];

      const todo = todoService.createTodo(title, description, priority, tags);

      expect(todo).toBeDefined();
      expect(todo.id).toBeDefined();
      expect(todo.title).toBe(title);
      expect(todo.description).toBe(description);
      expect(todo.priority).toBe(priority);
      expect(todo.tags).toEqual(tags);
      expect(todo.completed).toBe(false);
      expect(todo.createdAt).toBeInstanceOf(Date);
    });

    it('should create a todo with default values when optional params are omitted', () => {
      const title = 'Simple Todo';

      const todo = todoService.createTodo(title);

      expect(todo).toBeDefined();
      expect(todo.title).toBe(title);
      expect(todo.description).toBeUndefined();
      expect(todo.priority).toBe(Priority.MEDIUM);
      expect(todo.tags).toEqual([]);
      expect(todo.completed).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      // Create some test todos
      const todo1 = todoService.createTodo('Todo 1', undefined, Priority.HIGH);
      const todo2 = todoService.createTodo('Todo 2', undefined, Priority.LOW);

      // Mock getTodos to return our test data
      jest.spyOn(todoService, 'getTodos').mockReturnValue([
        { ...todo1, completed: false },
        { ...todo2, completed: true },
      ]);

      const stats = todoService.getStats();

      expect(stats.total).toBe(2);
      expect(stats.completed).toBe(1);
      expect(stats.pending).toBe(1);
      expect(stats.highPriority).toBe(1);
    });
  });
});
