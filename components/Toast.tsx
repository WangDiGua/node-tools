import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { cn } from '../utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, [removeToast]);

  const success = (msg: string) => showToast(msg, 'success');
  const error = (msg: string) => showToast(msg, 'error');
  const info = (msg: string) => showToast(msg, 'info');
  const warning = (msg: string) => showToast(msg, 'warning');

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      {/* Changed positioning to top-center */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-3 pointer-events-none items-center">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle size={20} className="text-green-500" />,
    error: <AlertCircle size={20} className="text-red-500" />,
    info: <Info size={20} className="text-blue-500" />,
    warning: <AlertTriangle size={20} className="text-yellow-500" />,
  };

  // Cleaner styles: Left border indicator instead of full colored border/background mix
  const styles = {
    success: 'border-l-green-500',
    error: 'border-l-red-500',
    info: 'border-l-blue-500',
    warning: 'border-l-yellow-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      layout
      className={cn(
        "pointer-events-auto min-w-[300px] max-w-md p-4 rounded-r-lg rounded-l-sm shadow-lg border-y border-r border-slate-100 bg-white flex items-center gap-3 relative border-l-[4px] dark:bg-slate-800 dark:border-slate-700",
        styles[toast.type]
      )}
    >
        <div className="flex-shrink-0">{icons[toast.type]}</div>
        <div className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200 break-words leading-tight">
            {toast.message}
        </div>
        <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors dark:hover:text-slate-300 ml-2"
        >
            <X size={16} />
        </button>
    </motion.div>
  );
};