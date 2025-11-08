export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  completedAt?: Date;
  tags: string[];
}

export interface Database {
  todos: Todo[];
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface TodoFilter {
  completed?: boolean;
  priority?: Priority;
  tag?: string;
}
