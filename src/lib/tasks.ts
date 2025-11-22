import { db } from './db';
import { Task, CreateTaskData, UpdateTaskData, ActivityLog } from '@/types';
import { format, isToday, addDays, parseISO } from 'date-fns';

export class TaskService {
  private static logActivity(taskId: number, action: string, oldValue?: string, newValue?: string): void {
    const stmt = db.prepare(`
      INSERT INTO activity_logs (task_id, action, old_value, new_value, changed_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(taskId, action, oldValue || null, newValue || null, new Date().toISOString());
  }

  static createTask(data: CreateTaskData): Task {
    const stmt = db.prepare(`
      INSERT INTO tasks (
        name, description, list_id, date, deadline, estimate_minutes, 
        priority, parent_task_id, recurring_type, recurring_config
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.name,
      data.description || null,
      data.list_id || 1,
      data.date || null,
      data.deadline || null,
      data.estimate_minutes || null,
      data.priority || 'none',
      data.parent_task_id || null,
      data.recurring_type || null,
      data.recurring_config || null
    );

    const taskId = result.lastInsertRowid as number;

    // Add labels if provided
    if (data.label_ids && data.label_ids.length > 0) {
      const labelStmt = db.prepare('INSERT INTO task_labels (task_id, label_id) VALUES (?, ?)');
      for (const labelId of data.label_ids) {
        labelStmt.run(taskId, labelId);
      }
    }

    // Log creation
    this.logActivity(taskId, 'created', undefined, JSON.stringify(data));

    return this.getTaskById(taskId)!;
  }

  static updateTask(id: number, data: UpdateTaskData): Task | null {
    const existingTask = this.getTaskById(id);
    if (!existingTask) return null;

    const updates: string[] = [];
    const values: any[] = [];

    // Build dynamic update query
    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
      if (data.name !== existingTask.name) {
        this.logActivity(id, 'name', existingTask.name, data.name);
      }
    }

    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
      this.logActivity(id, 'description', existingTask.description || undefined, data.description || undefined);
    }

    if (data.list_id !== undefined) {
      updates.push('list_id = ?');
      values.push(data.list_id);
      this.logActivity(id, 'list_id', existingTask.list_id.toString(), data.list_id.toString());
    }

    if (data.date !== undefined) {
      updates.push('date = ?');
      values.push(data.date);
      this.logActivity(id, 'date', existingTask.date || undefined, data.date || undefined);
    }

    if (data.deadline !== undefined) {
      updates.push('deadline = ?');
      values.push(data.deadline);
      this.logActivity(id, 'deadline', existingTask.deadline || undefined, data.deadline || undefined);
    }

    if (data.estimate_minutes !== undefined) {
      updates.push('estimate_minutes = ?');
      values.push(data.estimate_minutes);
      this.logActivity(id, 'estimate_minutes', existingTask.estimate_minutes?.toString() || undefined, data.estimate_minutes?.toString() || undefined);
    }

    if (data.actual_minutes !== undefined) {
      updates.push('actual_minutes = ?');
      values.push(data.actual_minutes);
      this.logActivity(id, 'actual_minutes', existingTask.actual_minutes?.toString() || undefined, data.actual_minutes?.toString() || undefined);
    }

    if (data.priority !== undefined) {
      updates.push('priority = ?');
      values.push(data.priority);
      this.logActivity(id, 'priority', existingTask.priority, data.priority);
    }

    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
      if (data.status === 'completed' && existingTask.status !== 'completed') {
        updates.push('completed_at = CURRENT_TIMESTAMP');
      } else if (data.status !== 'completed' && existingTask.status === 'completed') {
        updates.push('completed_at = NULL');
      }
      this.logActivity(id, 'status', existingTask.status, data.status);
    }

    if (data.parent_task_id !== undefined) {
      updates.push('parent_task_id = ?');
      values.push(data.parent_task_id);
      this.logActivity(id, 'parent_task_id', existingTask.parent_task_id?.toString() || undefined, data.parent_task_id?.toString() || undefined);
    }

    if (data.recurring_type !== undefined) {
      updates.push('recurring_type = ?');
      values.push(data.recurring_type);
      this.logActivity(id, 'recurring_type', existingTask.recurring_type || undefined, data.recurring_type || undefined);
    }

    if (data.recurring_config !== undefined) {
      updates.push('recurring_config = ?');
      values.push(data.recurring_config);
      this.logActivity(id, 'recurring_config', existingTask.recurring_config || undefined, data.recurring_config || undefined);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const stmt = db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }

    // Update labels if provided
    if (data.label_ids !== undefined) {
      // Remove existing labels
      db.prepare('DELETE FROM task_labels WHERE task_id = ?').run(id);
      
      // Add new labels
      if (data.label_ids.length > 0) {
        const labelStmt = db.prepare('INSERT INTO task_labels (task_id, label_id) VALUES (?, ?)');
        for (const labelId of data.label_ids) {
          labelStmt.run(id, labelId);
        }
      }
    }

    return this.getTaskById(id);
  }

  static deleteTask(id: number): boolean {
    const task = this.getTaskById(id);
    if (!task) return false;

    this.logActivity(id, 'deleted', JSON.stringify(task), undefined);
    
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);
    
    return result.changes > 0;
  }

  static getTaskById(id: number): Task | null {
    const task = db.prepare(`
      SELECT * FROM tasks WHERE id = ?
    `).get(id) as Task | undefined;

    if (!task) return null;

    // Load related data
    task.list = db.prepare('SELECT * FROM lists WHERE id = ?').get(task.list_id) as any;
    task.labels = db.prepare(`
      SELECT l.* FROM labels l
      JOIN task_labels tl ON l.id = tl.label_id
      WHERE tl.task_id = ?
    `).all(task.id) as any[];
    
    task.subtasks = db.prepare(`
      SELECT * FROM tasks WHERE parent_task_id = ?
      ORDER BY created_at ASC
    `).all(task.id) as any[];

    task.reminders = db.prepare(`
      SELECT * FROM reminders WHERE task_id = ?
      ORDER BY remind_at ASC
    `).all(task.id) as any[];

    task.attachments = db.prepare(`
      SELECT * FROM attachments WHERE task_id = ?
      ORDER BY created_at DESC
    `).all(task.id) as any[];

    task.activity_logs = db.prepare(`
      SELECT * FROM activity_logs WHERE task_id = ?
      ORDER BY changed_at DESC
    `).all(task.id) as any[];

    return task;
  }

  static getTasks(filters?: {
    listId?: number;
    labelIds?: number[];
    priority?: Task['priority'];
    status?: Task['status'];
    date?: string;
    startDate?: string;
    endDate?: string;
    searchQuery?: string;
    parentId?: number;
    showCompleted?: boolean;
  }): Task[] {
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params: any[] = [];

    if (filters?.listId) {
      query += ' AND list_id = ?';
      params.push(filters.listId);
    }

    if (filters?.labelIds && filters.labelIds.length > 0) {
      query += ` AND id IN (
        SELECT task_id FROM task_labels WHERE label_id IN (${filters.labelIds.map(() => '?').join(',')})
      )`;
      params.push(...filters.labelIds);
    }

    if (filters?.priority) {
      query += ' AND priority = ?';
      params.push(filters.priority);
    }

    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters?.date) {
      query += ' AND date = ?';
      params.push(filters.date);
    }

    if (filters?.startDate) {
      query += ' AND date >= ?';
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      query += ' AND date <= ?';
      params.push(filters.endDate);
    }

    if (filters?.parentId !== undefined) {
      if (filters.parentId === null) {
        query += ' AND parent_task_id IS NULL';
      } else {
        query += ' AND parent_task_id = ?';
        params.push(filters.parentId);
      }
    }

    if (filters?.showCompleted === false) {
      query += ' AND status != ?';
      params.push('completed');
    }

    if (filters?.searchQuery) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${filters.searchQuery}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY CASE WHEN deadline IS NOT NULL THEN deadline ELSE date END ASC, created_at DESC';

    const tasks = db.prepare(query).all(...params) as Task[];

    // Load related data for each task
    return tasks.map(task => this.getTaskById(task.id)!);
  }

  static getTasksByView(view: 'today' | 'next7days' | 'upcoming' | 'all', showCompleted: boolean = true): Task[] {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    switch (view) {
      case 'today':
        return this.getTasks({
          date: today,
          showCompleted
        });
      
      case 'next7days':
        const endDate = format(addDays(new Date(), 7), 'yyyy-MM-dd');
        return this.getTasks({
          startDate: today,
          endDate,
          showCompleted
        });
      
      case 'upcoming':
        return this.getTasks({
          startDate: today,
          showCompleted
        });
      
      case 'all':
        return this.getTasks({ showCompleted });
      
      default:
        return [];
    }
  }

  static getOverdueTasks(): Task[] {
    const today = format(new Date(), 'yyyy-MM-dd');
    return this.getTasks({
      endDate: today,
      status: 'pending',
      showCompleted: false
    }).filter(task => {
      if (!task.deadline && !task.date) return false;
      const deadline = task.deadline || task.date;
      return deadline && deadline < today;
    });
  }

  static searchTasks(query: string): Task[] {
    return this.getTasks({ searchQuery: query });
  }
}
