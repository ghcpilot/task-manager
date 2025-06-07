'use client';

import ConfirmationDialog from './ConfirmationDialog';

interface TaskDeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
}

export default function TaskDeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  taskTitle
}: TaskDeleteConfirmationProps) {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Task"
      message={`Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`}
      confirmText="Delete Task"
      cancelText="Cancel"
      variant="danger"
    />
  );
} 