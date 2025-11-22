import { db } from './db';
import { Label } from '@/types';

export class LabelService {
  static createLabel(name: string, color: string = '#10b981', icon: string = '🏷️'): Label {
    const stmt = db.prepare('INSERT INTO labels (name, color, icon) VALUES (?, ?, ?)');
    const result = stmt.run(name, color, icon);
    
    return this.getLabelById(result.lastInsertRowid as number)!;
  }

  static updateLabel(id: number, data: Partial<Pick<Label, 'name' | 'color' | 'icon'>>): Label | null {
    const existing = this.getLabelById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }

    if (data.color !== undefined) {
      updates.push('color = ?');
      values.push(data.color);
    }

    if (data.icon !== undefined) {
      updates.push('icon = ?');
      values.push(data.icon);
    }

    if (updates.length > 0) {
      const stmt = db.prepare(`UPDATE labels SET ${updates.join(', ')} WHERE id = ?`);
      values.push(id);
      stmt.run(...values);
    }

    return this.getLabelById(id);
  }

  static deleteLabel(id: number): boolean {
    const stmt = db.prepare('DELETE FROM labels WHERE id = ?');
    const result = stmt.run(id);
    
    return result.changes > 0;
  }

  static getLabelById(id: number): Label | null {
    const stmt = db.prepare('SELECT * FROM labels WHERE id = ?');
    return stmt.get(id) as Label | null;
  }

  static getAllLabels(): Label[] {
    const stmt = db.prepare('SELECT * FROM labels ORDER BY name ASC');
    return stmt.all() as Label[];
  }

  static getLabelByName(name: string): Label | null {
    const stmt = db.prepare('SELECT * FROM labels WHERE name = ?');
    return stmt.get(name) as Label | null;
  }

  static getTaskCount(labelId: number): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM task_labels WHERE label_id = ?');
    const result = stmt.get(labelId) as { count: number };
    return result.count;
  }
}
