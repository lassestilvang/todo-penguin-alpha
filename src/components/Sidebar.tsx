'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Inbox, 
  Calendar, 
  Clock, 
  ListTodo, 
  CheckCircle2, 
  Plus,
  Search,
  Hash,
  Tag,
  ChevronDown,
  ChevronRight,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { List, Label, ViewType } from '@/types';
import { ClientListService, ClientLabelService, ClientTaskService } from '@/lib/client-services';
import { ListForm } from './ListForm';
import { LabelForm } from './LabelForm';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentView: ViewType;
  currentList?: number;
  onViewChange: (view: ViewType) => void;
  onListSelect: (listId: number) => void;
  className?: string;
}

const views = [
  { id: 'today' as ViewType, name: 'Today', icon: Calendar },
  { id: 'next7days' as ViewType, name: 'Next 7 Days', icon: Clock },
  { id: 'upcoming' as ViewType, name: 'Upcoming', icon: ListTodo },
  { id: 'all' as ViewType, name: 'All Tasks', icon: CheckCircle2 },
];

export function Sidebar({ 
  currentView, 
  currentList, 
  onViewChange, 
  onListSelect,
  className 
}: SidebarProps) {
  const [lists, setLists] = useState<List[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
  const [overdueCount, setOverdueCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [listTaskCounts, setListTaskCounts] = useState<Record<number, number>>({});
  const [expandedSections, setExpandedSections] = useState({
    lists: true,
    labels: true,
  });
  const [showListForm, setShowListForm] = useState(false);
  const [showLabelForm, setShowLabelForm] = useState(false);
  const [editingList, setEditingList] = useState<List | null>(null);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [listsData, labelsData, todayTasks] = await Promise.all([
        ClientListService.getLists(),
        ClientLabelService.getLabels(),
        ClientTaskService.getTasks('today', false)
      ]);
      setLists(listsData);
      setLabels(labelsData);
      setTodayTaskCount(todayTasks.length);
      
      // Load task counts for each list
      const counts: Record<number, number> = {};
      for (const list of listsData) {
        // Note: We'll need to add list-specific task count API
        counts[list.id] = 0;
      }
      setListTaskCounts(counts);
      
      // Note: We'll need to add overdue count API endpoint
      setOverdueCount(0);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleSection = (section: 'lists' | 'labels') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // This will be handled by the parent component
  };

  const handleCreateList = () => {
    setEditingList(null);
    setShowListForm(true);
  };

  const handleEditList = (list: List) => {
    setEditingList(list);
    setShowListForm(true);
  };

  const handleDeleteList = async (listId: number) => {
    if (confirm('Are you sure you want to delete this list? Tasks in this list will not be deleted.')) {
      try {
        await ClientListService.deleteList(listId);
        await loadData();
      } catch (error) {
        console.error('Failed to delete list:', error);
      }
    }
  };

  const handleListSubmit = async (data: { name: string; emoji: string; color: string }) => {
    try {
      if (editingList) {
        await ClientListService.updateList(editingList.id, data);
      } else {
        await ClientListService.createList(data);
      }
      await loadData();
    } catch (error) {
      console.error('Failed to save list:', error);
    }
  };

  const handleCreateLabel = () => {
    setEditingLabel(null);
    setShowLabelForm(true);
  };

  const handleEditLabel = (label: Label) => {
    setEditingLabel(label);
    setShowLabelForm(true);
  };

  const handleDeleteLabel = async (labelId: number) => {
    if (confirm('Are you sure you want to delete this label? It will be removed from all tasks.')) {
      try {
        await ClientLabelService.deleteLabel(labelId);
        await loadData();
      } catch (error) {
        console.error('Failed to delete label:', error);
      }
    }
  };

  const handleLabelSubmit = async (data: { name: string; icon: string; color: string }) => {
    try {
      if (editingLabel) {
        await ClientLabelService.updateLabel(editingLabel.id, data);
      } else {
        await ClientLabelService.createLabel(data);
      }
      await loadData();
    } catch (error) {
      console.error('Failed to save label:', error);
    }
  };

  const getTaskCount = async (type: 'today' | 'overdue' | 'list', id?: number) => {
    try {
      switch (type) {
        case 'today':
          const tasks = await ClientTaskService.getTasks('today', false);
          return tasks.length;
        case 'overdue':
          return overdueCount;
        case 'list':
          // Note: We'll need to add list task count API endpoint
          return id ? 0 : 0;
        default:
          return 0;
      }
    } catch (error) {
      console.error('Failed to get task count:', error);
      return 0;
    }
  };

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">TaskPenguin</h1>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* Views */}
        <div className="p-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Views
          </h2>
          <div className="space-y-1">
            {views.map((view) => {
              const Icon = view.icon;
              const isActive = currentView === view.id && !currentList;
              const count = view.id === 'today' ? todayCount : undefined;
              
              return (
                <motion.button
                  key={view.id}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onViewChange(view.id);
                    onListSelect(0); // Clear list selection
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                    isActive 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1">{view.name}</span>
                  {count !== undefined && count > 0 && (
                    <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                      {count}
                    </Badge>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Overdue Tasks */}
        {overdueCount > 0 && (
          <div className="px-4 pb-4">
            <motion.button
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span className="flex-1">Overdue</span>
              <Badge variant="destructive" className="bg-red-600">
                {overdueCount}
              </Badge>
            </motion.button>
          </div>
        )}

        {/* Lists */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Lists
            </h2>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCreateList}
                className="text-gray-400 hover:text-white p-1 h-auto"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('lists')}
                className="text-gray-400 hover:text-white p-1 h-auto"
              >
                {expandedSections.lists ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          
          <AnimatePresence>
            {expandedSections.lists && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-1"
              >
                {lists.map((list) => {
                  const isActive = currentList === list.id;
                  const count = listTaskCounts[list.id] || 0;
                  
                  return (
                    <div key={list.id} className="group relative">
                      <motion.button
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          onListSelect(list.id);
                          onViewChange('all'); // Switch to all view when selecting a list
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                          isActive 
                            ? "bg-blue-600 text-white" 
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        )}
                      >
                        <span className="text-lg">{list.emoji}</span>
                        <span className="flex-1">{list.name}</span>
                        {count > 0 && (
                          <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                            {count}
                          </Badge>
                        )}
                      </motion.button>
                      
                      {/* Edit/Delete buttons */}
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditList(list);
                          }}
                          className="text-gray-400 hover:text-white p-1 h-auto w-6 h-6"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteList(list.id);
                          }}
                          className="text-red-400 hover:text-red-300 p-1 h-auto w-6 h-6"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Labels */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Labels
            </h2>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCreateLabel}
                className="text-gray-400 hover:text-white p-1 h-auto"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('labels')}
                className="text-gray-400 hover:text-white p-1 h-auto"
              >
                {expandedSections.labels ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          
          <AnimatePresence>
            {expandedSections.labels && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-1"
              >
                {labels.map((label) => (
                  <div key={label.id} className="group relative">
                    <motion.button
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <span 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="flex-1">{label.name}</span>
                      <span className="text-lg">{label.icon}</span>
                    </motion.button>
                    
                    {/* Edit/Delete buttons */}
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditLabel(label);
                        }}
                        className="text-gray-400 hover:text-white p-1 h-auto w-6 h-6"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLabel(label.id);
                        }}
                        className="text-red-400 hover:text-red-300 p-1 h-auto w-6 h-6"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCompleted(!showCompleted)}
            className={cn(
              "text-xs px-2 py-1",
              showCompleted 
                ? "text-blue-400" 
                : "text-gray-400 hover:text-white"
            )}
          >
            {showCompleted ? 'Hide' : 'Show'} Completed
          </Button>
        </div>
      </div>

      {/* Forms */}
      <ListForm
        list={editingList || undefined}
        isOpen={showListForm}
        onClose={() => setShowListForm(false)}
        onSubmit={handleListSubmit}
      />
      
      <LabelForm
        label={editingLabel || undefined}
        isOpen={showLabelForm}
        onClose={() => setShowLabelForm(false)}
        onSubmit={handleLabelSubmit}
      />
    </motion.div>
  );
}
