import { describe, test, expect, beforeEach } from 'bun:test';
import { TaskService } from '../src/lib/tasks';
import { ListService } from '../src/lib/lists';
import { LabelService } from '../src/lib/labels';
import { db } from '../src/lib/db';

describe('Task Management', () => {
  beforeEach(() => {
    // Clean up database before each test
    db.exec('DELETE FROM tasks');
    db.exec('DELETE FROM lists WHERE id != 1'); // Keep Inbox list
    db.exec('DELETE FROM labels');
  });

  test('should create a basic task', () => {
    const task = TaskService.createTask({
      name: 'Test Task',
      description: 'A test task description',
      priority: 'high'
    });

    expect(task.id).toBeDefined();
    expect(task.name).toBe('Test Task');
    expect(task.description).toBe('A test task description');
    expect(task.priority).toBe('high');
    expect(task.status).toBe('pending');
    expect(task.list_id).toBe(1); // Default to Inbox
  });

  test('should update task status', () => {
    const task = TaskService.createTask({
      name: 'Test Task'
    });

    const updated = TaskService.updateTask(task.id, {
      status: 'completed'
    });

    expect(updated?.status).toBe('completed');
    expect(updated?.completed_at).toBeDefined();
  });

  test('should create task with labels', () => {
    const label = LabelService.createLabel('urgent', '#ff0000', '🔥');
    
    const task = TaskService.createTask({
      name: 'Urgent Task',
      label_ids: [label.id]
    });

    expect(task.labels).toHaveLength(1);
    expect(task.labels![0].name).toBe('urgent');
  });

  test('should create subtasks', () => {
    const parent = TaskService.createTask({
      name: 'Parent Task'
    });

    const subtask = TaskService.createTask({
      name: 'Subtask 1',
      parent_task_id: parent.id
    });

    expect(subtask.parent_task_id).toBe(parent.id);

    const loadedParent = TaskService.getTaskById(parent.id);
    expect(loadedParent?.subtasks).toHaveLength(1);
    expect(loadedParent?.subtasks![0].name).toBe('Subtask 1');
  });

  test('should get tasks by view', () => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    TaskService.createTask({
      name: 'Today Task',
      date: today
    });

    TaskService.createTask({
      name: 'Tomorrow Task',
      date: tomorrow
    });

    const todayTasks = TaskService.getTasksByView('today');
    expect(todayTasks).toHaveLength(1);
    expect(todayTasks[0].name).toBe('Today Task');

    const upcomingTasks = TaskService.getTasksByView('upcoming');
    expect(upcomingTasks).toHaveLength(2);
  });

  test('should search tasks', () => {
    TaskService.createTask({
      name: 'Important Meeting',
      description: 'Discuss project timeline'
    });

    TaskService.createTask({
      name: 'Buy groceries'
    });

    const results = TaskService.searchTasks('meeting');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Important Meeting');
  });

  test('should identify overdue tasks', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    TaskService.createTask({
      name: 'Overdue Task',
      date: yesterday
    });

    const overdue = TaskService.getOverdueTasks();
    expect(overdue).toHaveLength(1);
    expect(overdue[0].name).toBe('Overdue Task');
  });

  test('should log activity changes', () => {
    const task = TaskService.createTask({
      name: 'Original Name'
    });

    TaskService.updateTask(task.id, {
      name: 'Updated Name',
      priority: 'high'
    });

    const updated = TaskService.getTaskById(task.id);
    const logs = updated?.activity_logs || [];

    expect(logs.length).toBeGreaterThan(0);
    
    const nameChange = logs.find(log => log.action === 'name');
    expect(nameChange).toBeDefined();
    expect(nameChange?.old_value).toBe('Original Name');
    expect(nameChange?.new_value).toBe('Updated Name');
  });
});

describe('List Management', () => {
  beforeEach(() => {
    db.exec('DELETE FROM lists WHERE id != 1');
  });

  test('should create custom list', () => {
    const list = ListService.createList('Work', '#3b82f6', '💼');

    expect(list.id).toBeDefined();
    expect(list.name).toBe('Work');
    expect(list.color).toBe('#3b82f6');
    expect(list.emoji).toBe('💼');
  });

  test('should update list properties', () => {
    const list = ListService.createList('Personal');
    
    const updated = ListService.updateList(list.id, {
      name: 'Home',
      color: '#10b981',
      emoji: '🏠'
    });

    expect(updated?.name).toBe('Home');
    expect(updated?.color).toBe('#10b981');
    expect(updated?.emoji).toBe('🏠');
  });

  test('should not delete Inbox list', () => {
    const result = ListService.deleteList(1);
    expect(result).toBe(false);
  });

  test('should move tasks to Inbox when list deleted', () => {
    const list = ListService.createList('Temp');
    const task = TaskService.createTask({
      name: 'Test Task',
      list_id: list.id
    });

    ListService.deleteList(list.id);

    const updatedTask = TaskService.getTaskById(task.id);
    expect(updatedTask?.list_id).toBe(1); // Moved to Inbox
  });
});

describe('Label Management', () => {
  beforeEach(() => {
    db.exec('DELETE FROM labels');
  });

  test('should create label', () => {
    const label = LabelService.createLabel('bug', '#ef4444', '🐛');

    expect(label.id).toBeDefined();
    expect(label.name).toBe('bug');
    expect(label.color).toBe('#ef4444');
    expect(label.icon).toBe('🐛');
  });

  test('should get task count for label', () => {
    const label = LabelService.createLabel('feature');
    
    TaskService.createTask({
      name: 'Task 1',
      label_ids: [label.id]
    });

    TaskService.createTask({
      name: 'Task 2',
      label_ids: [label.id]
    });

    const count = LabelService.getTaskCount(label.id);
    expect(count).toBe(2);
  });
});
