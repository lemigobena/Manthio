import React from 'react';
import Modal from './Modal';
import { AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={`p-3 rounded-full ${variant === 'danger' ? 'bg-red/10 text-red' : 'bg-cyan/10 text-cyan'}`}>
          <AlertCircle size={32} />
        </div>
        <div className="space-y-2">
          <p className="text-muted leading-relaxed">
            {message}
          </p>
        </div>
        <div className="flex w-full gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-line text-text hover:bg-muted/20 transition-all font-medium border border-line"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white transition-all font-semibold shadow-lg shadow-black/20 ${
              variant === 'danger' ? 'bg-red hover:bg-red/90' : 'bg-cyan hover:bg-cyan/90'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
