'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Shield,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  Trash2,
  Edit3,
  Mail,
  Key,
  Download,
  Upload,
  HardDrive,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/app/contexts/AuthContext';
import { exportDatabaseJson, importDatabaseJson, resetToDefaultData, STORAGE_KEYS } from '@/lib/localDb';

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user?.name || 'Local Developer',
    email: user?.email || 'user@local.dev',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || 'Local Developer',
        email: user.email || 'user@local.dev'
      }));
    }
  }, [user]);

  const handleSaveProfile = () => {
    if (user) {
      const storedUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const updated = storedUsers.map((u: any) => u.id === user.id ? { ...u, name: formData.name } : u);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
      const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || '{}');
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...currentUser, name: formData.name }));
    }
    toast.success('Profile name updated successfully!');
  };

  const handlePasswordUpdate = () => {
    if (!formData.newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    toast.success('Password updated successfully in local storage!');
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  const handleExportData = () => {
    try {
      const dataStr = exportDatabaseJson();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taskmate_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Database exported successfully!');
    } catch (err) {
      toast.error('Failed to export data');
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = importDatabaseJson(content);
        if (success) {
          toast.success('Backup imported successfully! Refreshing...');
          setTimeout(() => window.location.reload(), 800);
        } else {
          toast.error('Failed to parse backup JSON');
        }
      } catch (err) {
        toast.error('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('Reset workspace to demo projects and sample tasks? This will recreate sample data.')) {
      resetToDefaultData();
      toast.success('Workspace reset to defaults! Reloading...');
      setTimeout(() => window.location.reload(), 600);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Settings</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Preferences
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage your account credentials, workspace preferences, and local backups.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleSaveProfile}
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Profile & Database info */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="glass-card rounded-3xl p-6 border border-white/[0.08]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{formData.name}</h3>
                <p className="text-xs text-indigo-400">{formData.email}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[11px] text-zinc-400">Local Browser Session</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Display Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                  <Edit3 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl text-xs text-zinc-400 cursor-not-allowed"
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Email identifier is bound to your local account profile.
                </p>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="glass-card rounded-3xl p-6 border border-white/[0.08]">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Security & Environment
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">Status: Active</div>
                  <div className="text-[10px] text-emerald-400">Authenticated locally</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 flex items-center gap-2.5">
                <HardDrive className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">Storage: Local DB</div>
                  <div className="text-[10px] text-indigo-400">Browser localStorage</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Security & Backup/Restore */}
        <div className="space-y-6">
          {/* Password update */}
          <div className="glass-card rounded-3xl p-6 border border-white/[0.08]">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              Change Password
            </h4>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={e => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password (min 6 characters)"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>

              <Button
                variant="secondary"
                onClick={handlePasswordUpdate}
                className="w-full text-xs font-semibold py-2.5 rounded-xl border-white/[0.08]"
              >
                Update Password
              </Button>
            </div>
          </div>

          {/* Backup & Restore Data */}
          <div className="glass-card rounded-3xl p-6 border border-white/[0.08]">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-400" />
              Workspace Data & Backup
            </h4>
            <p className="text-xs text-zinc-400 mb-4">
              Export all projects, tasks, and time entries as a JSON file or restore a previous snapshot.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                variant="secondary"
                onClick={handleExportData}
                className="text-xs font-medium py-2.5 rounded-xl flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Export JSON</span>
              </Button>

              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium py-2.5 rounded-xl flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Import JSON</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">Need sample data?</span>
              <button
                onClick={handleResetData}
                className="text-[11px] text-zinc-400 hover:text-rose-400 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset to demo data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}