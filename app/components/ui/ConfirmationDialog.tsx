'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmLabel?: string;
  cancelText?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  confirmVariant?: string;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  confirmText,
  confirmLabel,
  cancelText,
  cancelLabel,
  variant,
  confirmVariant
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const closeDialog = onClose || onCancel || (() => {});
  const effectiveConfirmText = confirmLabel || confirmText || 'Confirm';
  const effectiveCancelText = cancelLabel || cancelText || 'Cancel';
  const effectiveVariant = variant || (confirmVariant === 'destructive' ? 'danger' : 'danger');

  const handleConfirm = () => {
    onConfirm();
    closeDialog();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconColor: 'text-red-400',
          confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'warning':
        return {
          iconColor: 'text-yellow-400',
          confirmButtonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
      case 'info':
        return {
          iconColor: 'text-blue-400',
          confirmButtonClass: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      default:
        return {
          iconColor: 'text-red-400',
          confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white'
        };
    }
  };

  const { iconColor, confirmButtonClass } = getVariantStyles();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full bg-white/10 ${iconColor}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          </div>
          <button
            onClick={closeDialog}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-300 leading-relaxed">{message}</p>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            variant="ghost"
            onClick={closeDialog}
          >
            {effectiveCancelText}
          </Button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${confirmButtonClass}`}
          >
            {effectiveConfirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
} 