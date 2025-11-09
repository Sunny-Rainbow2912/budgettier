import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button, type ButtonVariant } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
  requiresTyping?: boolean;
  confirmationWord?: string;
  details?: string[];
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  requiresTyping = false,
  confirmationWord = 'DELETE',
  details = [],
}) => {
  const [typedWord, setTypedWord] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTypedWord('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requiresTyping && typedWord !== confirmationWord) {
      setError(`You must type "${confirmationWord}" exactly to confirm.`);
      return;
    }
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    setTypedWord('');
    setError('');
    onClose();
  };

  const bgColor = variant === 'danger' ? 'bg-red-50' : 'bg-yellow-50';
  const borderColor = variant === 'danger' ? 'border-red-200' : 'border-yellow-200';
  const iconColor = variant === 'danger' ? 'text-red-600' : 'text-yellow-600';
  const buttonVariant: ButtonVariant = variant === 'danger' ? 'danger' : 'warning';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className={`px-6 py-4 border-b ${borderColor} ${bgColor} rounded-t-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className={iconColor} size={24} />
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-gray-700 mb-4">{message}</p>

          {details.length > 0 && (
            <div className={`${bgColor} border ${borderColor} rounded-lg p-4 mb-4`}>
              <p className="font-semibold text-gray-900 mb-2">This will permanently delete:</p>
              <ul className="space-y-1">
                {details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {requiresTyping && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-bold text-red-600">{confirmationWord}</span> to confirm:
              </label>
              <input
                type="text"
                value={typedWord}
                onChange={(e) => {
                  setTypedWord(e.target.value);
                  setError('');
                }}
                placeholder={`Type ${confirmationWord}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                autoFocus
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          )}

          <div className={`${bgColor} border ${borderColor} rounded-lg p-3`}>
            <p className="text-sm font-semibold text-gray-900">⚠️ This action cannot be undone!</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button
            variant={buttonVariant}
            onClick={handleConfirm}
            disabled={requiresTyping && typedWord !== confirmationWord}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
