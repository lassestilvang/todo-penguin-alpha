'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { TaskList } from '@/components/TaskList';
import { ViewType, TaskFilters } from '@/types';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('today');
  const [currentList, setCurrentList] = useState<number | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const filters: TaskFilters = {
    view: currentView,
    listId: currentList,
    showCompleted: true,
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    setCurrentList(undefined);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleListSelect = (listId: number) => {
    if (listId === 0) {
      setCurrentList(undefined);
    } else {
      setCurrentList(listId);
    }
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar
          currentView={currentView}
          currentList={currentList}
          onViewChange={handleViewChange}
          onListSelect={handleListSelect}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 overflow-hidden">
        <TaskList filters={filters} className="h-full" />
      </div>
    </div>
  );
}
