import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { ModalProps } from '../types';
import { cn } from '../utils';

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'w-[95vw] h-[90vh] max-w-none', // Full screen logic
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div 
        ref={modalRef}
        className={cn(
            "bg-white rounded-xl shadow-2xl transform transition-all scale-100 flex flex-col",
            sizeClasses[size]
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body - Flex grow for full screen mode to handle scrolling correctly */}
        <div className="px-6 py-6 flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex justify-end space-x-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};