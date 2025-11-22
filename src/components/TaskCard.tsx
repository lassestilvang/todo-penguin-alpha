'use client';

import { motion } from 'framer-motion';
import { 
  Calendar,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  Circle,
  AlertCircle,
  CheckCircle2,
  Play,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task, UpdateTaskData } from '@/types';
import { format, isToday, isPast, isFuture } from 'date-fns';
import { formatMinutes } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: number, updates: UpdateTaskData) => void;
  onDelete: (taskId: number) => void;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onUpdate, onDelete, onEdit }: TaskCardProps) {

  const handleStatusChange = (newStatus: 'pending' | 'in_progress' | 'completed') => {
    onUpdate(task.id, { status: newStatus });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Play className="w-5 h-5 text-blue-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const isOverdue = () => {
    if (task.status === 'completed') return false;
    const dueDate = task.date || task.deadline;
    return dueDate && isPast(new Date(dueDate)) && !isToday(new Date(dueDate));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    if (isToday(date)) return 'Today';
    if (isFuture(date) && date.getTime() - now.getTime() < 86400000) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`bg-gray-900 border rounded-lg p-3 sm:p-4 transition-all hover:border-gray-600 ${
        task.status === 'completed' ? 'opacity-60' : ''
      } ${isOverdue() ? 'border-red-500/30 bg-red-950/20' : 'border-gray-800'}`}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <button
          onClick={() => {
            const nextStatus = task.status === 'pending' ? 'in_progress' : 
                            task.status === 'in_progress' ? 'completed' : 'pending';
            handleStatusChange(nextStatus);
          }}
          className="mt-1 flex-shrink-0 transition-colors hover:scale-110"
        >
          {getStatusIcon()}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className={`font-medium text-white truncate ${
              task.status === 'completed' ? 'line-through text-gray-400' : ''
            }`}>
              {task.name}
            </h3>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Priority Indicator */}
              {task.priority !== 'none' && (
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
              )}
              
              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-800">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                  <DropdownMenuItem 
                    onClick={() => handleStatusChange('in_progress')}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleStatusChange('completed')}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleStatusChange('pending')}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <Circle className="w-4 h-4 mr-2" />
                    Reset
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    onClick={() => onEdit(task)}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(task.id)}
                    className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
            {/* Date */}
            {(task.date || task.deadline) && (
              <div className="flex items-center gap-1 text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{formatDate(task.date || task.deadline!)}</span>
                {isOverdue() && <AlertCircle className="w-3 h-3 text-red-500" />}
              </div>
            )}

            {/* Time Estimate */}
            {task.estimate_minutes && (
              <div className="text-gray-400">
                {formatMinutes(task.estimate_minutes)}
              </div>
            )}

            {/* Labels */}
            {task.labels && task.labels.length > 0 && (
              <div className="flex gap-1">
                {task.labels.slice(0, 2).map((label) => (
                  <div
                    key={label.id}
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: label.color + '20',
                      color: label.color,
                      border: `1px solid ${label.color}40`
                    }}
                  >
                    {label.icon} {label.name}
                  </div>
                ))}
                {task.labels.length > 2 && (
                  <div className="px-2 py-0.5 rounded-full text-xs bg-gray-700 text-gray-300">
                    +{task.labels.length - 2}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Subtasks</span>
                <span>{task.subtasks.filter(st => st.status === 'completed').length}/{task.subtasks.length}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ 
                    width: `${(task.subtasks.filter(st => st.status === 'completed').length / task.subtasks.length) * 100}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
