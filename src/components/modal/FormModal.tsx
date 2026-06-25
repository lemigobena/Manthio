import React from 'react';
import Modal from './Modal';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  title: string;
  children: React.ReactNode;
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title} 
      size="md"
      preventCloseOnOverlayClick={true}
    >
      <div className="space-y-6">
        {children}
        
        <div className="flex justify-end gap-3 pt-6 border-t border-line">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-muted hover:text-text hover:bg-line transition-all border border-line"
          >
            Discard
          </button>
          <button
            onClick={() => {
              // Usually handled by the form inside children, but this button provides a standard CTA
              onSubmit({}); 
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-cyan text-panel font-bold hover:bg-cyan2 transition-all shadow-lg shadow-cyan/20"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FormModal;
