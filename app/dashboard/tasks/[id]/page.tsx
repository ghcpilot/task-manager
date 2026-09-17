'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Loader2, Trash2, Edit, Clock, 
  CalendarDays, Tag, PlayCircle, Plus, Paperclip 
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import ConfirmationDialog from '@/app/components/ui/ConfirmationDialog';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  project?: {
    id: string;
    name: string;
    color: string;
  };
}

interface Attachment {
  id: string;
  filename: string;
  fileType: string;
}

interface TimeLog {
  duration: number; // in minutes
}

export default function TaskDetailPage() {
  // Use the useParams hook to get the id parameter
  const params = useParams();
  const taskId = params.id as string;
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([
    { id: '1', filename: 'login-wireframe.png', fileType: 'image' },
    { id: '2', filename: 'flow.pdf', fileType: 'pdf' },
  ]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([
    { duration: 135 }, // 2h 15m
  ]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerDisplay, setTimerDisplay] = useState('04:15:43');
  const router = useRouter();
  
  // Fetch task details
  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tasks/${taskId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Task not found');
          }
          throw new Error('Failed to fetch task');
        }
        
        const data = await response.json();
        setTask(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching task:', err);
        setError(err instanceof Error ? err.message : 'Failed to load task');
        toast.error('Failed to load task');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTask();
  }, [taskId]);
  
  const deleteTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      toast.success('Task deleted');
      router.push(`/dashboard/projects/${task?.projectId}`);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const formatTimeLog = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  const getTotalTime = (): number => {
    return timeLogs.reduce((total, log) => total + log.duration, 0);
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
    toast.success(isTimerRunning ? 'Timer stopped' : 'Timer started');
  };

  const logTime = () => {
    // This would show a modal in a real implementation
    toast.success('Time logged successfully');
  };

  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-[#8540ff] animate-spin mb-4" />
          <p className="text-gray-400">Loading task...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="bg-red-500/20 p-4 rounded-full mb-4">
            <Trash2 className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button
            variant="default"
            onClick={() => router.push('/dashboard/tasks')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Entity Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#1c133b] rounded-xl shadow-lg overflow-hidden mb-6"
        >
          <div className="p-6">
            {/* Header with title and back button */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-white">Entity Sidebar</h2>
              <Link 
                href={`/dashboard/projects/${task?.projectId}`}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Project</span>
              </Link>
            </div>
            
            {/* Task Name and Status */}
            <div className="mb-10">
              <h1 className="text-2xl font-bold text-white mb-4">
                {task?.title || "BLANK NAME"}
              </h1>
              
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-1 text-[#7C3AED] text-sm">
                  <span>Status:</span>
                  <span className="font-medium">In Progress</span>
                </div>
                
                <div className="flex items-center gap-1 text-[#7C3AED] text-sm">
                  <span>Priority:</span>
                  <span className="font-medium">High</span>
                </div>
                
                <div className="flex items-center gap-1 text-[#7C3AED] text-sm">
                  <span>Due:</span>
                  <span className="font-medium">May 20, 2024</span>
                </div>
              </div>
            </div>
            
            {/* Task Timer Card */}
            <div className="bg-[#0c0428] rounded-lg p-5">
              <div className="flex flex-col items-center mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">{timerDisplay}</h3>
                <Button
                  variant={isTimerRunning ? "destructive" : "secondary"}
                  size="sm"
                  onClick={toggleTimer}
                  className="w-full"
                >
                  {isTimerRunning ? 'STOP TASK' : 'START TASK'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Task Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#0c0428] rounded-lg border border-[#7C3AED]/20 shadow-lg overflow-hidden mb-6"
        >
          {/* Description Section */}
          <div className="p-6 border-b border-[#7C3AED]/20">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              Description
            </h2>
            <p className="text-gray-300 whitespace-pre-line">
              {task?.description || "Mobile login page needs to support Google sign-in, password field toggle, and biometric auth placeholder UI..."}
            </p>
          </div>
          
          {/* Time Tracking Section */}
          <div className="p-6 border-b border-[#7C3AED]/20">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-white">
                Time Tracking
              </h2>
              <span className="text-gray-300 font-semibold">{formatTimeLog(getTotalTime())}</span>
            </div>
            
            <div className="mb-4">
              <div className="h-2 bg-[#0c0428]/80 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${isTimerRunning ? 'bg-[#ffffff] animate-pulse' : 'bg-[#7C3AED]'}`} 
                  style={{ width: `${Math.min(getTotalTime() / 480 * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={logTime}
              >
                <Plus className="h-4 w-4 mr-2" />
                Log Time
              </Button>
            </div>
          </div>
          
          {/* Attachments Section */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-3">
              Attachments
            </h2>
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors cursor-pointer p-2 rounded-md hover:bg-[#7C3AED]/10">
                  <Paperclip className="h-4 w-4" />
                  <span>{attachment.filename}</span>
                </div>
              ))}
              <div className="mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Attachment
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmingDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="destructive"
        onConfirm={deleteTask}
        onCancel={() => setIsConfirmingDelete(false)}
      />
    </main>
  );
} 