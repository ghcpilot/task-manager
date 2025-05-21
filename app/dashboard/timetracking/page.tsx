'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Pause, Clock, Check, X, 
  Plus, Calendar, BarChart2, 
  ChevronDown, Edit, Trash2
} from 'lucide-react';
import Button from '@/app/components/ui/Button';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Task interface
interface Task {
  id: string;
  title: string;
  project: string;
  projectColor: string;
  dueDate?: string;
  timestamps: Timestamp[];
}

// Timestamp interface
interface Timestamp {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number; // in seconds
  note?: string;
}

// Sample tasks with timestamps
const SAMPLE_TASKS: Task[] = [
  {
    id: '1',
    title: 'Character development',
    project: 'Horror Story',
    projectColor: '#8540ff',
    dueDate: '2025-05-20',
    timestamps: [
      {
        id: 't1',
        startTime: '2023-05-15T10:00:00',
        endTime: '2023-05-15T11:45:30',
        duration: 6330,
        note: 'Worked on protagonist backstory'
      },
      {
        id: 't2',
        startTime: '2023-05-16T14:30:00',
        endTime: '2023-05-16T15:45:00',
        duration: 4500,
        note: 'Developed antagonist motivations'
      }
    ]
  },
  {
    id: '2',
    title: 'Scene planning',
    project: 'Horror Story',
    projectColor: '#8540ff',
    timestamps: [
      {
        id: 't3',
        startTime: '2023-05-15T15:00:00',
        endTime: '2023-05-15T15:30:15',
        duration: 1815,
        note: 'Outlined opening scene'
      }
    ]
  },
  {
    id: '3',
    title: 'Research',
    project: 'Novel',
    projectColor: '#35aa8f',
    timestamps: [
      {
        id: 't4',
        startTime: '2023-05-14T19:30:00',
        endTime: '2023-05-14T21:45:00',
        duration: 8100,
        note: 'Historical research for setting'
      }
    ]
  }
];

export default function TimeTrackingPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [newTimestampNote, setNewTimestampNote] = useState('');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  // Format time (HH:MM:SS)
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Format time of day
  const formatTimeOfDay = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get total duration for a task
  const getTotalDuration = (task: Task): number => {
    return task.timestamps.reduce((total, timestamp) => total + timestamp.duration, 0);
  };
  
  // Start tracking time for a task
  const startTracking = (taskId: string) => {
    setIsTracking(true);
    setActiveTaskId(taskId);
    setStartTime(new Date());
    setElapsedTime(0);
  };
  
  // Stop tracking time
  const stopTracking = () => {
    if (!startTime || !activeTaskId) return;
    
    const endTime = new Date();
    const durationInSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    
    // Create new timestamp
    const newTimestamp: Timestamp = {
      id: `t${Date.now()}`,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: durationInSeconds,
      note: newTimestampNote
    };
    
    // Update tasks with new timestamp
    setTasks(tasks.map(task => {
      if (task.id === activeTaskId) {
        return {
          ...task,
          timestamps: [...task.timestamps, newTimestamp]
        };
      }
      return task;
    }));
    
    // Reset state
    setIsTracking(false);
    setActiveTaskId(null);
    setStartTime(null);
    setElapsedTime(0);
    setNewTimestampNote('');
    
    toast.success('Time entry saved');
  };
  
  // Update elapsed time while tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTracking && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, startTime]);
  
  // View task details
  const viewTaskDetails = (task: Task) => {
    setSelectedTask(task);
  };
  
  // Delete timestamp
  const deleteTimestamp = (taskId: string, timestampId: string) => {
    if (confirm('Are you sure you want to delete this time entry?')) {
      setTasks(tasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            timestamps: task.timestamps.filter(ts => ts.id !== timestampId)
          };
        }
        return task;
      }));
      
      toast.success('Time entry deleted');
    }
  };
  
  useEffect(() => {
    // Redirect to dashboard
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin h-12 w-12 border-4 border-[#2e2e2e] rounded-full border-t-[#ffffff]"></div>
    </div>
  );
} 