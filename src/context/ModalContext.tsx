import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type ModalType = 'confirmation' | 'form' | 'celebration' | 'quiz' | null;

interface ModalOptions {
  title?: string;
  description?: string;
  props?: Record<string, unknown>; // Still using any here for props as they can be anything, but let's try to be more specific if possible. Actually, props for modals are highly dynamic.
}

interface ModalContextType {
  activeModal: ModalType;
  modalOptions: ModalOptions;
  openModal: (type: ModalType, options?: ModalOptions) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalOptions, setModalOptions] = useState<ModalOptions>({});

  const openModal = useCallback((type: ModalType, options: ModalOptions = {}) => {
    setActiveModal(type);
    setModalOptions(options);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalOptions({});
  }, []);

  return (
    <ModalContext.Provider value={{ activeModal, modalOptions, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
