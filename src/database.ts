import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { Database } from './types';

const DB_DIR = path.join(os.homedir(), '.todo-app');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const adapter = new FileSync<Database>(DB_FILE);
const db = low(adapter);

// Initialize database with default values
db.defaults({ todos: [] }).write();

export default db;
