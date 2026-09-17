'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Calendar, Clock, Flag, User, AlertCircle, CheckCircle } from 'lucide-react';
import Button from './Button';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  projectId?: string;
  assignedTo?: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (task: Partial<Task>) => void;
  onAddTask?: (task: any) => void;
  task?: Task;
  mode?: 'create' | 'edit' | 'view';
}

export default function TaskModal({ isOpen, onClose, onSave, onAddTask, task, mode = 'create' }: TaskModalProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
    projectId: '',
    assignedTo: ''
  });

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: '',
        projectId: '',
        assignedTo: ''
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    } else if (onAddTask) {
      onAddTask(formData);
    }
    onClose();
  };

  const handleChange = (field: keyof Task, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/10 text-red-400';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10 text-yellow-400';
      case 'low': return 'border-green-500 bg-green-500/10 text-green-400';
      default: return 'border-gray-500 bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-500 bg-green-500/10 text-green-400';
      case 'in_progress': return 'border-blue-500 bg-blue-500/10 text-blue-400';
      case 'overdue': return 'border-red-500 bg-red-500/10 text-red-400';
      default: return 'border-gray-500 bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    return <Flag className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1a1a1a] border border-white/10 rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white">
              {mode === 'create' ? 'Create Task' : mode === 'edit' ? 'Edit Task' : 'Task Details'}
            </h2>
            {task && (
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(formData.status || 'pending')}`}>
                  {getStatusIcon(formData.status || 'pending')}
                  {(formData.status || 'pending').replace('_', ' ')}
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(formData.priority || 'medium')}`}>
                  {getPriorityIcon(formData.priority || 'medium')}
                  {formData.priority || 'medium'} priority
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Task Title *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
                placeholder="What needs to be done?"
                required
                readOnly={isReadOnly}
              />
            </div>

            {/* Task Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-gray-500"
                rows={4}
                placeholder="Add more details about this task..."
                readOnly={isReadOnly}
              />
            </div>

            {/* Status and Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={formData.status || 'pending'}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    disabled={isReadOnly}
                  >
                    <option value="pending">📋 Pending</option>
                    <option value="in_progress">⚡ In Progress</option>
                    <option value="completed">✅ Completed</option>
                    <option value="overdue">⚠️ Overdue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Priority
                </label>
                <div className="relative">
                  <select
                    value={formData.priority || 'medium'}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    disabled={isReadOnly}
                  >
                    <option value="low">🟢 Low Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="high">🔴 High Priority</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <Calendar className="inline w-4 h-4 mr-2" />
                Due Date
              </label>
              <input
                type="datetime-local"
                value={formData.dueDate || ''}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly={isReadOnly}
              />
            </div>

            {/* Actions */}
            {!isReadOnly && (
              <div className="flex justify-end space-x-3 pt-6 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{mode === 'create' ? 'Create Task' : 'Save Changes'}</span>
                </Button>
              </div>
            )}

            {isReadOnly && (
              <div className="flex justify-end pt-6 border-t border-white/10">
                <Button
                  type="button"
                  onClick={onClose}
                >
                  Close
                </Button>
              </div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
} 