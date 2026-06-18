import React from 'react';
import { useModal } from '../../context/ModalContext';
import ConfirmationModal from './ConfirmationModal';
import FormModal from './FormModal';
import CelebrationModal from './CelebrationModal';
import QuizModal from './QuizModal';

const ModalManager: React.FC = () => {
  const { activeModal, modalOptions, closeModal } = useModal();

  if (!activeModal) return null;

  switch (activeModal) {
    case 'confirmation':
      return (
        <ConfirmationModal
          isOpen={true}
          onClose={closeModal}
          onConfirm={modalOptions.props?.onConfirm || (() => {})}
          title={modalOptions.title || 'Confirm Action'}
          message={modalOptions.description || 'Are you sure you want to proceed?'}
          {...modalOptions.props}
        />
      );
    
    case 'form':
      return (
        <FormModal
          isOpen={true}
          onClose={closeModal}
          onSubmit={modalOptions.props?.onSubmit || (() => {})}
          title={modalOptions.title || 'Data Entry'}
        >
          {modalOptions.props?.children}
        </FormModal>
      );

    case 'celebration':
      return (
        <CelebrationModal
          isOpen={true}
          onClose={closeModal}
          title={modalOptions.title || 'Congratulations!'}
          subtitle={modalOptions.description || 'You reached a new milestone.'}
          {...modalOptions.props}
        />
      );

    case 'quiz':
      return (
        <QuizModal
          isOpen={true}
          onClose={closeModal}
          questions={modalOptions.props?.questions || []}
          onComplete={modalOptions.props?.onComplete || (() => {})}
        />
      );

    default:
      return null;
  }
};

export default ModalManager;
