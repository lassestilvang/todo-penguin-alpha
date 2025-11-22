'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Calendar, Clock, Flag, Tag, Repeat, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Task, List, Label as LabelType, CreateTaskData } from '@/types';
import { ClientListService, ClientLabelService, ClientTaskService } from '@/lib/client-services';
import { parseNaturalLanguage } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TaskFormProps {
  task?: Task;
  lists?: List[];
  labels?: LabelType[];
  onSubmit: (task: CreateTaskData) => void;
  onCancel: () => void;
  className?: string;
}

export function TaskForm({ task, lists, labels, onSubmit, onCancel, className }: TaskFormProps) {
  const [formData, setFormData] = useState<CreateTaskData>({
    name: task?.name || '',
    description: task?.description || '',
    list_id: task?.list_id || 1,
    date: task?.date || '',
    deadline: task?.deadline || '',
    estimate_minutes: task?.estimate_minutes || undefined,
    priority: task?.priority || 'none',
    label_ids: task?.labels?.map(l => l.id) || [],
    parent_task_id: task?.parent_task_id || undefined,
    recurring_type: task?.recurring_type || undefined,
    recurring_config: task?.recurring_config || undefined,
  });

  const [taskLists, setTaskLists] = useState<List[]>(lists || []);
  const [taskLabels, setTaskLabels] = useState<LabelType[]>(labels || []);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load lists and labels if not provided
  useEffect(() => {
    if (!lists || lists.length === 0) {
      ClientListService.getLists().then(setTaskLists);
    }
    if (!labels || labels.length === 0) {
      ClientLabelService.getLabels().then(setTaskLabels);
    }
  }, [lists, labels]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalData = { ...formData };

    // Parse natural language if it's a new task
    if (!task && formData.name) {
      const parsed = parseNaturalLanguage(formData.name);
      finalData.name = parsed.name;
      if (parsed.date && !formData.date) {
        finalData.date = parsed.date;
      }
      if (parsed.time && !formData.deadline) {
        finalData.deadline = `${formData.date || parsed.date}T${parsed.time}:00`;
      }
    }

    try {
      const result = task 
        ? await ClientTaskService.updateTask(task.id, finalData)
        : await ClientTaskService.createTask(finalData);

      onSubmit(result);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleLabelToggle = (labelId: number) => {
    setFormData(prev => ({
      ...prev,
      label_ids: prev.label_ids?.includes(labelId)
        ? prev.label_ids.filter(id => id !== labelId)
        : [...(prev.label_ids || []), labelId]
    }));
  };

  const handleEstimateChange = (value: string) => {
    // Parse "1h 30m" format
    const hours = value.match(/(\d+)\s*h/);
    const minutes = value.match(/(\d+)\s*m/);
    
    let totalMinutes = 0;
    if (hours) totalMinutes += parseInt(hours[1]) * 60;
    if (minutes) totalMinutes += parseInt(minutes[1]);
    
    setFormData(prev => ({
      ...prev,
      estimate_minutes: totalMinutes > 0 ? totalMinutes : undefined
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn("fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", className)}
      onClick={onCancel}
    >
      <motion.div
        className="bg-gray-900 rounded-lg border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        layout
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">
            {task ? 'Edit Task' : 'Create Task'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">Task Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={task ? '' : "e.g., 'Meeting with Sarah tomorrow at 2 PM'"}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add a description..."
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="list" className="text-white">List</Label>
                <Select
                  value={formData.list_id?.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, list_id: parseInt(value) }))}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {taskLists.map((list) => (
                      <SelectItem key={list.id} value={list.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{list.emoji}</span>
                          <span>{list.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority" className="text-white">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: Task['priority']) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-gray-400 hover:text-white"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Button>
          </div>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4"
              >
                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date" className="text-white">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="deadline" className="text-white">Deadline</Label>
                    <Input
                      id="deadline"
                      type="datetime-local"
                      value={formData.deadline?.slice(0, 16) || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value ? e.target.value + ':00' : '' }))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                {/* Time Estimates */}
                <div>
                  <Label htmlFor="estimate" className="text-white">Time Estimate</Label>
                  <Input
                    id="estimate"
                    placeholder="e.g., 1h 30m"
                    onChange={(e) => handleEstimateChange(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  />
                  {formData.estimate_minutes && (
                    <p className="text-sm text-gray-400 mt-1">
                      Total: {Math.floor(formData.estimate_minutes / 60)}h {formData.estimate_minutes % 60}m
                    </p>
                  )}
                </div>

                {/* Labels */}
                <div>
                  <Label className="text-white">Labels</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {taskLabels.map((label) => (
                      <Badge
                        key={label.id}
                        variant={formData.label_ids?.includes(label.id) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer",
                          formData.label_ids?.includes(label.id)
                            ? ""
                            : "border-gray-600 text-gray-400 hover:border-gray-500"
                        )}
                        style={{
                          backgroundColor: formData.label_ids?.includes(label.id) ? label.color : undefined,
                          borderColor: formData.label_ids?.includes(label.id) ? label.color : undefined,
                        }}
                        onClick={() => handleLabelToggle(label.id)}
                      >
                        {label.icon} {label.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Recurring */}
                <div>
                  <Label htmlFor="recurring" className="text-white">Recurring</Label>
                  <Select
                    value={formData.recurring_type || 'none'}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      recurring_type: value === 'none' ? undefined : value 
                    }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Not recurring" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="none">Not recurring</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="weekdays">Weekdays</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
