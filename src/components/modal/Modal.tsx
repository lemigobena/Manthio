import React, { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  preventCloseOnOverlayClick?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
  centerOnMobile?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  preventCloseOnOverlayClick = false,
  size = 'md',
  centerOnMobile = false
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

  // Provide explicit mobile max-widths so the modal isn't full-screen on phones.
  const sizeClasses = {
    sm: 'max-w-[92vw] sm:max-w-md',
    md: 'max-w-[96vw] sm:max-w-lg',
    lg: 'max-w-[98vw] sm:max-w-2xl',
    full: 'max-w-[98vw] sm:max-w-full sm:m-4 sm:h-[calc(100%-2rem)]'
  };

  // Determine alignment: by default small devices show bottom-sheet (items-end).
  // If `centerOnMobile` is true, center on mobile as well and apply small padding.
  const outerAlignment = centerOnMobile ? 'items-center' : 'items-end sm:items-center';

  return (
    <div className={`fixed inset-0 z-[60] flex ${outerAlignment} justify-center p-4 sm:p-6 lg:p-8`}>
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={() => !preventCloseOnOverlayClick && onClose()}
        aria-hidden="true"
      />
      
      {/* Modal Container — bottom-sheet on mobile, centered card on desktop */}
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className={`relative w-full mx-auto ${sizeClasses[size]} bg-panel border border-line shadow-2xl shadow-black/50 overflow-hidden flex flex-col animate-in fade-in duration-300 rounded-t-2xl max-h-[90dvh] sm:rounded-2xl sm:max-h-[85vh] sm:zoom-in-95`}
      >
        {/* Header */}
        {(title || !preventCloseOnOverlayClick) && (
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-line bg-panel2/50 backdrop-blur-md shrink-0">
            <h3 className="text-base font-display font-semibold text-text truncate pr-4">
              {title}
            </h3>
            {!preventCloseOnOverlayClick && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-muted hover:text-text hover:bg-line transition-all shrink-0"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 scroll-smooth overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
