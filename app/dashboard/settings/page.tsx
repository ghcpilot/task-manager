'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Shield,
  Save,
  Eye,
  EyeOff,
  FileSpreadsheet,
  CheckCircle,
  Trash2,
  Edit3,
  Mail,
  Key,
  Download,
  Upload
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/app/contexts/AuthContext';

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || 'User',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || 'User',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  const handlePasswordUpdate = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Password updated successfully!');
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] light:bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white light:text-gray-900 mb-2 flex items-center">
                <Settings className="h-8 w-8 mr-3" />
                Settings
              </h1>
              <p className="text-gray-400 light:text-gray-600">
                Manage your account and preferences
              </p>
            </div>
            <Button onClick={handleSave} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4" />
              <span>Save All Changes</span>
            </Button>
          </div>
        </motion.div>

        {/* Main Content - Horizontal Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Profile Information Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[#1a1a1a] light:bg-white border border-white/10 light:border-gray-200 rounded-xl p-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white light:text-gray-900">
                    {formData.name || 'User'}
                  </h3>
                  <p className="text-blue-400 light:text-blue-600 text-sm">
                    {formData.email}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 light:text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 bg-[#0a0a0a] light:bg-gray-50 border border-white/10 light:border-gray-300 rounded-lg text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-10"
                      placeholder="Enter your full name"
                    />
                    <Edit3 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 light:text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3 bg-[#0a0a0a] light:bg-gray-100 border border-white/5 light:border-gray-200 rounded-lg text-gray-400 light:text-gray-600 cursor-not-allowed pr-10"
                      placeholder="Your registered email"
                    />
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  </div>
                  <p className="text-xs text-gray-500 light:text-gray-500 mt-1">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Account Status Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#1a1a1a] light:bg-white border border-white/10 light:border-gray-200 rounded-xl p-6"
            >
              <h4 className="text-lg font-medium text-white light:text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Account Status
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-white light:text-gray-900 font-medium text-sm">Email Verified</div>
                    <div className="text-green-400 text-xs">Active</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-white light:text-gray-900 font-medium text-sm">Account Active</div>
                    <div className="text-blue-400 text-xs">Verified</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Security Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-[#1a1a1a] light:bg-white border border-white/10 light:border-gray-200 rounded-xl p-6"
            >
              <h4 className="text-lg font-medium text-white light:text-gray-900 mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-yellow-400" />
                Security Settings
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 light:text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      className="w-full px-4 py-3 bg-[#0a0a0a] light:bg-gray-50 border border-white/10 light:border-gray-300 rounded-lg text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 light:text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      className="w-full px-4 py-3 bg-[#0a0a0a] light:bg-gray-50 border border-white/10 light:border-gray-300 rounded-lg text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="New password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 light:text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full px-4 py-3 bg-[#0a0a0a] light:bg-gray-50 border border-white/10 light:border-gray-300 rounded-lg text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handlePasswordUpdate}
                  variant="outline" 
                  className="w-full border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </div>
            </motion.div>

            {/* Data & Actions Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-[#1a1a1a] light:bg-white border border-white/10 light:border-gray-200 rounded-xl p-6"
            >
              <h4 className="text-lg font-medium text-white light:text-gray-900 mb-4 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-purple-400" />
                Data & Privacy
              </h4>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Button 
                  variant="outline" 
                  className="w-full border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                  onClick={() => toast.success('Data export initiated. You will receive an email shortly.')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-green-500/20 text-green-400 hover:bg-green-500/10"
                  onClick={() => toast.success('Account backup created successfully.')}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Backup Account
                </Button>
              </div>
              
              <div className="border-t border-white/10 light:border-gray-200 pt-4">
                <Button 
                  variant="outline" 
                  className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      toast.error('Account deletion requested. Please check your email to confirm.');
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
                <p className="text-xs text-gray-500 light:text-gray-500 mt-2 text-center">
                  This action is permanent and cannot be undone
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 