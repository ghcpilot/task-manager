'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '@/lib/hooks/useApi';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  deadline: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function NewProjectPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const api = useApi();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      deadline: ''
    }
  });
  
  const onSubmit = async (data: ProjectFormData) => {
    try {
      setIsSubmitting(true);
      
      const projectData = {
        ...data,
        status: 'active' as const,
        color: '#8b5cf6', // Default purple color
        deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined
      };
      
      const project = await api.post('/api/projects', projectData);
      toast.success('Project created successfully');
      router.push(`/dashboard/projects`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard/projects"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
          
          <h1 className="text-3xl font-bold text-white mb-2">Create New Project</h1>
          <p className="text-gray-400">Start organizing your tasks with a new project.</p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-xl p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Project Name */}
            <div>
              <label 
                htmlFor="name"
                className="block text-sm font-medium text-white mb-2"
              >
                Project Name *
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className="bg-[#1e1e1e]/80 w-full rounded-md px-4 py-3 text-sm border border-white/20 focus:outline-none focus:ring-1 focus:ring-white/50 text-white"
                placeholder="Enter project name"
              />
              {errors.name && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <span className="text-red-400 text-xs">●</span> {errors.name.message}
                </p>
              )}
            </div>

            {/* Project Description */}
            <div>
              <label 
                htmlFor="description"
                className="block text-sm font-medium text-white mb-2"
              >
                Description (Optional)
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows={4}
                className="bg-[#1e1e1e]/80 w-full rounded-md px-4 py-3 text-sm border border-white/20 focus:outline-none focus:ring-1 focus:ring-white/50 text-white resize-none"
                placeholder="Describe your project goals and objectives"
              />
              {errors.description && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <span className="text-red-400 text-xs">●</span> {errors.description.message}
                </p>
              )}
            </div>

            {/* Deadline */}
            <div>
              <label 
                htmlFor="deadline"
                className="block text-sm font-medium text-white mb-2"
              >
                Deadline (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="deadline"
                  type="date"
                  {...register('deadline')}
                  className="bg-[#1e1e1e]/80 w-full rounded-md pl-10 pr-4 py-3 text-sm border border-white/20 focus:outline-none focus:ring-1 focus:ring-white/50 text-white"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              {errors.deadline && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <span className="text-red-400 text-xs">●</span> {errors.deadline.message}
                </p>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="flex items-center gap-4 pt-4">
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Project...
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
              
              <Link href="/dashboard/projects">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </main>
  );
} 