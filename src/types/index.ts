export interface List {
  id: number;
  name: string;
  color: string;
  emoji: string;
  created_at: string;
  updated_at: string;
}

export interface Label {
  id: number;
  name: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface Task {
  id: number;
  name: string;
  description?: string;
  list_id: number;
  date?: string;
  deadline?: string;
  estimate_minutes?: number;
  actual_minutes?: number;
  priority: 'high' | 'medium' | 'low' | 'none';
  status: 'pending' | 'in_progress' | 'completed';
  parent_task_id?: number;
  recurring_type?: 'daily' | 'weekly' | 'weekdays' | 'monthly' | 'yearly' | 'custom';
  recurring_config?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  list?: List;
  labels?: Label[];
  subtasks?: Task[];
  reminders?: Reminder[];
  attachments?: Attachment[];
  activity_logs?: ActivityLog[];
}

export interface Reminder {
  id: number;
  task_id: number;
  remind_at: string;
  message?: string;
  sent: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  task_id: number;
  action: string;
  old_value?: string;
  new_value?: string;
  changed_at: string;
}

export interface Attachment {
  id: number;
  task_id: number;
  filename: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
}

export type ViewType = 'today' | 'next7days' | 'upcoming' | 'all';

export interface TaskFilters {
  view: ViewType;
  listId?: number;
  labelIds?: number[];
  priority?: Task['priority'];
  status?: Task['status'];
  showCompleted: boolean;
  searchQuery?: string;
}

export interface CreateTaskData {
  name: string;
  description?: string;
  list_id?: number;
  date?: string;
  deadline?: string;
  estimate_minutes?: number;
  priority?: Task['priority'];
  label_ids?: number[];
  parent_task_id?: number;
  recurring_type?: Task['recurring_type'];
  recurring_config?: string;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  status?: Task['status'];
  actual_minutes?: number;
}
