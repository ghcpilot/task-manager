'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Star, MessageSquare, Bug, Lightbulb } from 'lucide-react';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';

interface FeedbackData {
  name: string;
  email: string;
  type: 'general' | 'bug' | 'feature' | 'improvement';
  rating: number;
  message: string;
}

const feedbackTypes = [
  { id: 'general', label: 'General Feedback', icon: MessageSquare, color: 'from-blue-500 to-cyan-500' },
  { id: 'bug', label: 'Bug Report', icon: Bug, color: 'from-red-500 to-pink-500' },
  { id: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'from-yellow-500 to-orange-500' },
  { id: 'improvement', label: 'Improvement', icon: Star, color: 'from-green-500 to-emerald-500' },
];

export default function FeedbackForm() {
  const [formData, setFormData] = useState<FeedbackData>({
    name: '',
    email: '',
    type: 'general',
    rating: 5,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof FeedbackData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast.success('Thank you for your feedback! We\'ll review it soon.');
        setFormData({
          name: '',
          email: '',
          type: 'general',
          rating: 5,
          message: ''
        });
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name and Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="your@email.com"
            required
          />
        </div>
      </div>

      {/* Feedback Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Feedback Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {feedbackTypes.map((type) => (
            <motion.button
              key={type.id}
              type="button"
              onClick={() => handleInputChange('type', type.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                formData.type === type.id
                  ? 'bg-white/10 border-blue-500/50 shadow-lg'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center mx-auto mb-2`}>
                <type.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-gray-300 font-medium">{type.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Overall Rating
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <motion.button
              key={rating}
              type="button"
              onClick={() => handleInputChange('rating', rating)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1"
            >
              <Star 
                className={`w-6 h-6 transition-colors ${
                  rating <= formData.rating 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-500'
                }`} 
              />
            </motion.button>
          ))}
          <span className="ml-3 text-gray-400 text-sm">
            {formData.rating}/5 stars
          </span>
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Message *
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
          rows={5}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
          placeholder="Share your thoughts, suggestions, or report any issues you've encountered..."
          required
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Feedback
            </>
          )}
        </Button>
      </div>
    </form>
  );
} 