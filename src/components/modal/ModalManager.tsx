import React from 'react';
import { useModal } from '../../context/ModalContext';
import ConfirmationModal from './ConfirmationModal';
import FormModal from './FormModal';
import CelebrationModal from './CelebrationModal';
import QuizModal, { type QuizModalProps } from './QuizModal';

const ModalManager: React.FC = () => {
  const { activeModal, modalOptions, closeModal } = useModal();

  if (!activeModal) return null;

  switch (activeModal) {
    case 'confirmation':
      return (
        <ConfirmationModal
          isOpen={true}
          onClose={closeModal}
          onConfirm={(modalOptions.props?.onConfirm as () => void) || (() => {})}
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
          onSubmit={(modalOptions.props?.onSubmit as (data: Record<string, unknown>) => void) || (() => {})}
          title={modalOptions.title || 'Data Entry'}
        >
          {modalOptions.props?.children as React.ReactNode}
        </FormModal>
      );

    case 'celebration':
      return (
        <CelebrationModal
          isOpen={true}
          onClose={closeModal}
          title={modalOptions.title || 'Congratulations!'}
          subtitle={modalOptions.description || 'You reached a new milestone.'}
          // Center this modal on mobile so the celebration card doesn't span full width
          {...modalOptions.props}
          // pass through a mobile-centering flag to the underlying Modal
          // CelebrationModal will forward props to Modal
          centerOnMobile={true}
        />
      );

    case 'quiz':
      {
        const props = modalOptions.props as Partial<QuizModalProps>;
        return (
          <QuizModal
            isOpen={true}
            onClose={closeModal}
            questions={props?.questions || []}
            onComplete={props?.onComplete || (() => {})}
          />
        );
      }

    default:
      return null;
  }
};

export default ModalManager;
