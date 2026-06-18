import React, { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  preventCloseOnOverlayClick?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  preventCloseOnOverlayClick = false,
  size = 'md'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
        
        // Focus trap
        if (e.key === 'Tab') {
          if (!modalRef.current) return;
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      
      // Auto focus first element
      const focusable = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        (focusable[0] as HTMLElement).focus();
      }

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    full: 'max-w-full m-4 h-[calc(100%-2rem)]'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={() => !preventCloseOnOverlayClick && onClose()}
        aria-hidden="true"
      />
      
      {/* Modal Container */}
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${sizeClasses[size]} bg-panel border border-line rounded-2xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300 md:bottom-auto bottom-0 max-md:rounded-b-none max-md:fixed max-md:bottom-0`}
      >
        {/* Header */}
        {(title || !preventCloseOnOverlayClick) && (
          <div className="flex items-center justify-between p-4 border-b border-line bg-panel2/50 backdrop-blur-md">
            <h3 className="text-lg font-display font-semibold text-text">
              {title}
            </h3>
            {!preventCloseOnOverlayClick && (
              <button
                onClick={onClose}
                className="p-1 rounded-full text-muted hover:text-text hover:bg-line transition-all"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
