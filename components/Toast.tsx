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

  const bgs = {
    success: 'bg-white border-green-100',
    error: 'bg-white border-red-100',
    info: 'bg-white border-blue-100',
    warning: 'bg-white border-yellow-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      layout
      className={cn(
        "pointer-events-auto min-w-[300px] max-w-md p-4 rounded-lg shadow-xl border flex items-center gap-3 relative overflow-hidden backdrop-blur-sm bg-white/95",
        bgs[toast.type]
      )}
    >
        <div className="flex-shrink-0">{icons[toast.type]}</div>
        <div className="flex-1 text-sm font-medium text-slate-800 break-words">
            {toast.message}
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={16} />
        </button>
        {/* Progress bar simulation */}
        <motion.div 
            initial={{ width: '100%' }} 
            animate={{ width: '0%' }} 
            transition={{ duration: 3, ease: 'linear' }}
            className={cn(
                "absolute bottom-0 left-0 h-0.5",
                toast.type === 'success' ? 'bg-green-500' :
                toast.type === 'error' ? 'bg-red-500' :
                toast.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
            )}
        />
    </motion.div>
  );
};