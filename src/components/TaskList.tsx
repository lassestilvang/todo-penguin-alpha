'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Calendar, CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { ClientTaskService, ClientListService, ClientLabelService } from '@/lib/client-services';
import { Task, TaskFilters, List, Label } from '@/types';

interface TaskListProps {
  filters: TaskFilters;
  className?: string;
}

export function TaskList({ filters, className }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'created'>('date');

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksData, listsData, labelsData] = await Promise.all([
        ClientTaskService.getTasks('all', true), // We'll need to add filtering support
        ClientListService.getLists(),
        ClientLabelService.getLabels(),
      ]);
      // Apply filters client-side for now (excluding showCompleted and searchQuery which are handled locally)
      const filteredTasks = tasksData.filter(task => {
        if (filters.listId && task.list_id !== filters.listId) return false;
        if (filters.priority && task.priority !== filters.priority) return false;
        if (filters.status && task.status !== filters.status) return false;
        return true;
      });
      setTasks(filteredTasks);
      setLists(listsData);
      setLabels(labelsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreate = async (taskData: any) => {
    try {
      if (editingTask) {
        // Update existing task
        await ClientTaskService.updateTask(editingTask.id, taskData);
        setEditingTask(null);
      } else {
        // Create new task
        await ClientTaskService.createTask(taskData);
      }
      setShowTaskForm(false);
      loadData();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleTaskUpdate = async (taskId: number, updates: any) => {
    try {
      await ClientTaskService.updateTask(taskId, updates);
      loadData();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleTaskDelete = async (taskId: number) => {
    try {
      await ClientTaskService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const filteredTasks = tasks.filter(task => {
    if (!showCompleted && task.status === 'completed') return false;
    if (searchQuery && !task.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1, none: 0 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'date':
        const dateA = a.date || a.deadline || a.created_at;
        const dateB = b.date || b.deadline || b.created_at;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      case 'created':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    overdue: tasks.filter(t => {
      if (t.status === 'completed') return false;
      const dueDate = t.date || t.deadline;
      return dueDate && new Date(dueDate) < new Date();
    }).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-gray-950 ${className}`}>
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              {filters.view === 'today' && 'Today'}
              {filters.view === 'next7days' && 'Next 7 Days'}
              {filters.view === 'upcoming' && 'Upcoming'}
              {filters.view === 'all' && 'All Tasks'}
              {filters.listId && lists.find(l => l.id === filters.listId)?.name}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {taskStats.total} total
              </Badge>
              {taskStats.pending > 0 && (
                <Badge variant="outline" className="text-xs border-blue-500 text-blue-400">
                  {taskStats.pending} pending
                </Badge>
              )}
              {taskStats.inProgress > 0 && (
                <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-400">
                  {taskStats.inProgress} in progress
                </Badge>
              )}
              {taskStats.overdue > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {taskStats.overdue} overdue
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setEditingTask(null);
                setShowTaskForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Task</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="created">Sort by Created</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
            />
            Show completed
          </label>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {searchQuery ? 'No tasks found matching your search' : 'No tasks yet'}
            </div>
            {!searchQuery && (
              <Button
                onClick={() => {
                  setEditingTask(null);
                  setShowTaskForm(true);
                }}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create your first task
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            <AnimatePresence>
              {sortedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={handleTaskUpdate}
                  onDelete={handleTaskDelete}
                  onEdit={handleTaskEdit}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      <AnimatePresence>
        {showTaskForm && (
          <TaskForm
            task={editingTask || undefined}
            lists={lists}
            labels={labels}
            onSubmit={handleTaskCreate}
            onCancel={() => {
              setShowTaskForm(false);
              setEditingTask(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
