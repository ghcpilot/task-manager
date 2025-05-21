import React, { useState } from 'react';
import { MoreVertical, Pencil, Trash2, FolderOpen } from 'lucide-react';
import Link from 'next/link';

interface ProjectMenuProps {
  projectId: string;
  onDelete: () => void;
}

const ProjectMenu: React.FC<ProjectMenuProps> = ({ projectId, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Project options"
      >
        <MoreVertical className="h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-48 bg-[#1a1a1a] border border-white/10 rounded-md shadow-lg overflow-hidden z-20">
            <div className="py-1">
              <Link
                href={`/dashboard/projects/${projectId}`}
                className="flex items-center px-4 py-2 text-sm text-white hover:bg-white/10"
              >
                <FolderOpen className="h-4 w-4 mr-2 text-gray-400" />
                View Project
              </Link>
              <Link
                href={`/dashboard/projects/${projectId}/edit`}
                className="flex items-center px-4 py-2 text-sm text-white hover:bg-white/10"
              >
                <Pencil className="h-4 w-4 mr-2 text-gray-400" />
                Edit Project
              </Link>
              <button
                onClick={() => {
                  onDelete();
                  setIsOpen(false);
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectMenu; 