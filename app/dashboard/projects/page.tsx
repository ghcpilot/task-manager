'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, FolderKanban, Clock, CalendarDays, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import Button from '@/components/ui/Button';
import ProjectMenu from '@/components/ui/ProjectMenu';

interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
  tasksCount: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchProjects() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/projects');
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProjects();
  }, []);
  
  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      
      setProjects(projects.filter(project => project.id !== projectId));
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto"
      >
        {/* Header section */}
        <motion.div 
          variants={item}
          className="flex flex-col md:flex-row md:items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Projects</h1>
            <p className="text-gray-400 mt-1">Manage your projects and tasks</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button 
              onClick={() => router.push('/dashboard/projects/new')}
              variant="default"
              className="w-full md:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </motion.div>
        
        {/* Projects grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="loader mb-4"></div>
              <p className="text-gray-400">Loading projects...</p>
            </motion.div>
          </div>
        ) : projects.length === 0 ? (
          <motion.div 
            variants={item}
            className="bg-[#1a1a1a]/80 border border-white/10 rounded-xl p-8 text-center"
          >
            <FolderKanban className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Create your first project to start organizing your tasks and track your time.
            </p>
            <Button 
              onClick={() => router.push('/dashboard/projects/new')}
              variant="default"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <motion.div 
                key={project.id}
                variants={item}
                className="glass-card border border-white/10 rounded-xl overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <Link 
                      href={`/dashboard/projects/${project.id}`}
                      className="inline-block hover:opacity-80 transition-opacity"
                    >
                      <h3 className="text-lg font-semibold text-white line-clamp-1">
                        {project.name}
                      </h3>
                    </Link>
                    <ProjectMenu 
                      projectId={project.id} 
                      onDelete={() => handleDeleteProject(project.id)} 
                    />
                  </div>
                  
                  <p className="text-gray-400 text-sm line-clamp-2 min-h-[40px] mb-5">
                    {project.description || "No description provided"}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center text-gray-400">
                      <AlertCircle className="h-3.5 w-3.5 mr-1" />
                      <span>{project.tasksCount} tasks</span>
                    </div>
                    
                    <div className="flex items-center text-gray-400">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>0h tracked</span>
                    </div>
                    
                    <div className="flex items-center text-gray-400">
                      <CalendarDays className="h-3.5 w-3.5 mr-1" />
                      <span>
                        {new Date(project.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
} 