'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label as UILabel } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label as LabelType } from '@/types';

interface LabelFormProps {
  label?: LabelType;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; icon: string; color: string }) => void;
}

const ICON_OPTIONS = [
  '🏷️', '📌', '📍', '🔖', '🏷', '📎', '🔗', '⭐',
  '❤️', '🔥', '⚡', '✨', '🌟', '💎', '🎯', '🎨',
  '🚀', '💡', '🔔', '📢', '📣', '📯', '🎪', '🎭',
  '🏆', '🥇', '🎖️', '🏅', '🎗️', '🎫', '🎟️', '🎪',
  '🌈', '🌸', '🌺', '🌻', '🌷', '🌹', '🌴', '🌲',
  '🍎', '🍊', '🍋', '🍌', '🍇', '🍓', '🫐', '🍒',
  '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🏸',
  '🎮', '🕹️', '🎯', '🎪', '🎨', '🖌️', '✏️', '📝'
];

const COLOR_OPTIONS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#475569', '#334155'
];

export function LabelForm({ label, isOpen, onClose, onSubmit }: LabelFormProps) {
  const [formData, setFormData] = useState({
    name: label?.name || '',
    icon: label?.icon || '🏷️',
    color: label?.color || '#ef4444'
  });

  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleIconSelect = (icon: string) => {
    setFormData(prev => ({ ...prev, icon }));
    setShowIconPicker(false);
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
    setShowColorPicker(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {label ? 'Edit Label' : 'Create New Label'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <UILabel htmlFor="name" className="text-white">Label Name</UILabel>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter label name..."
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              autoFocus
            />
          </div>

          {/* Icon Selection */}
          <div>
            <UILabel className="text-white">Icon</UILabel>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                <Tag className="w-4 h-4 mr-2" />
                {formData.icon}
              </Button>
              <span className="text-sm text-gray-400">Click to change icon</span>
            </div>

            <AnimatePresence>
              {showIconPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 p-3 bg-gray-800 border border-gray-700 rounded-lg max-h-48 overflow-y-auto"
                >
                  <div className="grid grid-cols-8 gap-1">
                    {ICON_OPTIONS.map((icon) => (
                      <Button
                        key={icon}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleIconSelect(icon)}
                        className={`p-2 text-lg hover:bg-gray-700 ${
                          formData.icon === icon ? 'bg-gray-700' : ''
                        }`}
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Color Selection */}
          <div>
            <UILabel className="text-white">Color</UILabel>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 flex items-center gap-2"
              >
                <div 
                  className="w-4 h-4 rounded-full border border-gray-600"
                  style={{ backgroundColor: formData.color }}
                />
                <Palette className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-400">Click to change color</span>
            </div>

            <AnimatePresence>
              {showColorPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 p-3 bg-gray-800 border border-gray-700 rounded-lg"
                >
                  <div className="grid grid-cols-5 gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <Button
                        key={color}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleColorSelect(color)}
                        className={`p-2 hover:bg-gray-700 ${
                          formData.color === color ? 'ring-2 ring-white' : ''
                        }`}
                      >
                        <div 
                          className="w-6 h-6 rounded-full border border-gray-600"
                          style={{ backgroundColor: color }}
                        />
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Preview */}
          <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm border border-gray-600"
                style={{ backgroundColor: formData.color + '20', color: formData.color }}
              >
                {formData.icon}
              </div>
              <div>
                <div className="text-white font-medium">
                  {formData.name || 'Untitled Label'}
                </div>
                <div className="text-xs text-gray-400">Preview</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.name.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {label ? 'Update Label' : 'Create Label'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
