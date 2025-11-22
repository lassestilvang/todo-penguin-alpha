'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { List } from '@/types';

interface ListFormProps {
  list?: List;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; emoji: string; color: string }) => void;
}

const EMOJI_OPTIONS = [
  '📋', '📝', '📌', '📍', '🏠', '💼', '🎯', '🚀', 
  '💡', '🔥', '⭐', '🌟', '✨', '🎨', '🎭', '🎪',
  '🏆', '🎯', '🎮', '🎵', '🎬', '📚', '🔬', '🔧',
  '💻', '📱', '📷', '🎨', '🖌️', '✏️', '📊', '📈',
  '🏢', '🏡', '🏪', '🏭', '🏗️', '🚗', '✈️', '🚢'
];

const COLOR_OPTIONS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
  '#6366f1', '#a855f7', '#0ea5e9', '#22c55e', '#eab308'
];

export function ListForm({ list, isOpen, onClose, onSubmit }: ListFormProps) {
  const [formData, setFormData] = useState({
    name: list?.name || '',
    emoji: list?.emoji || '📋',
    color: list?.color || '#3b82f6'
  });

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setFormData(prev => ({ ...prev, emoji }));
    setShowEmojiPicker(false);
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
            {list ? 'Edit List' : 'Create New List'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-white">List Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter list name..."
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              autoFocus
            />
          </div>

          {/* Emoji Selection */}
          <div>
            <Label className="text-white">Emoji</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                <Smile className="w-4 h-4 mr-2" />
                {formData.emoji}
              </Button>
              <span className="text-sm text-gray-400">Click to change emoji</span>
            </div>

            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 p-3 bg-gray-800 border border-gray-700 rounded-lg"
                >
                  <div className="grid grid-cols-8 gap-1">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <Button
                        key={emoji}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEmojiSelect(emoji)}
                        className={`p-2 text-lg hover:bg-gray-700 ${
                          formData.emoji === emoji ? 'bg-gray-700' : ''
                        }`}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Color Selection */}
          <div>
            <Label className="text-white">Color</Label>
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
              <span className="text-2xl">{formData.emoji}</span>
              <div>
                <div className="text-white font-medium">
                  {formData.name || 'Untitled List'}
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
              {list ? 'Update List' : 'Create List'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
