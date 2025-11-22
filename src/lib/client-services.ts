import { Task, List, Label, CreateTaskData, UpdateTaskData } from '@/types';

// Client-side API service functions
export const ClientTaskService = {
  async getTasks(view: 'today' | 'next7days' | 'upcoming' | 'all' = 'all', showCompleted: boolean = true): Promise<Task[]> {
    const response = await fetch(`/api/tasks?view=${view}&showCompleted=${showCompleted}`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },

  async createTask(data: CreateTaskData): Promise<Task> {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  },

  async updateTask(id: number, data: UpdateTaskData): Promise<Task> {
    const response = await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  },

  async deleteTask(id: number): Promise<boolean> {
    const response = await fetch(`/api/tasks?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete task');
    return true;
  },
};

export const ClientListService = {
  async getLists(): Promise<List[]> {
    const response = await fetch('/api/lists');
    if (!response.ok) throw new Error('Failed to fetch lists');
    return response.json();
  },

  async createList(data: { name: string; color: string; emoji: string }): Promise<List> {
    const response = await fetch('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create list');
    return response.json();
  },

  async updateList(id: number, data: Partial<List>): Promise<List> {
    const response = await fetch('/api/lists', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    if (!response.ok) throw new Error('Failed to update list');
    return response.json();
  },

  async deleteList(id: number): Promise<boolean> {
    const response = await fetch(`/api/lists?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete list');
    return true;
  },
};

export const ClientLabelService = {
  async getLabels(): Promise<Label[]> {
    const response = await fetch('/api/labels');
    if (!response.ok) throw new Error('Failed to fetch labels');
    return response.json();
  },

  async createLabel(data: { name: string; color: string; icon: string }): Promise<Label> {
    const response = await fetch('/api/labels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create label');
    return response.json();
  },

  async updateLabel(id: number, data: Partial<Label>): Promise<Label> {
    const response = await fetch('/api/labels', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    if (!response.ok) throw new Error('Failed to update label');
    return response.json();
  },

  async deleteLabel(id: number): Promise<boolean> {
    const response = await fetch(`/api/labels?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete label');
    return true;
  },
};
