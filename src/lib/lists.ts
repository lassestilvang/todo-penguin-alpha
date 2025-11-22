import { db } from './db';
import { List } from '@/types';

export class ListService {
  static createList(name: string, color: string = '#3b82f6', emoji: string = '📋'): List {
    const stmt = db.query('INSERT INTO lists (name, color, emoji) VALUES (?, ?, ?)');
    const result = stmt.run(name, color, emoji);
    
    return this.getListById(result.lastInsertRowid as number)!;
  }

  static updateList(id: number, data: Partial<Pick<List, 'name' | 'color' | 'emoji'>>): List | null {
    const existing = this.getListById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }

    if (data.color !== undefined) {
      updates.push('color = ?');
      values.push(data.color);
    }

    if (data.emoji !== undefined) {
      updates.push('emoji = ?');
      values.push(data.emoji);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const stmt = db.query(`UPDATE lists SET ${updates.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }

    return this.getListById(id);
  }

  static deleteList(id: number): boolean {
    // Don't allow deleting the Inbox list (id 1)
    if (id === 1) return false;

    // Move all tasks to Inbox before deleting
    db.query('UPDATE tasks SET list_id = 1 WHERE list_id = ?').run(id);
    
    const stmt = db.query('DELETE FROM lists WHERE id = ?');
    const result = stmt.run(id);
    
    return result.changes > 0;
  }

  static getListById(id: number): List | null {
    const stmt = db.query('SELECT * FROM lists WHERE id = ?');
    return stmt.get(id) as List | null;
  }

  static getAllLists(): List[] {
    const stmt = db.query('SELECT * FROM lists ORDER BY created_at ASC');
    return stmt.all() as List[];
  }

  static getTaskCount(listId: number): number {
    const stmt = db.query('SELECT COUNT(*) as count FROM tasks WHERE list_id = ?');
    const result = stmt.get(listId) as { count: number };
    return result.count;
  }
}
