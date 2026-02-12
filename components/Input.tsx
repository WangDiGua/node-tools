import React from 'react';
import { cn } from '../utils';
import { AnimatePresence, motion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ className, label, error, leftIcon, ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <div className="relative group">
        {leftIcon && (
          <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-500'}`}>
            {leftIcon}
          </div>
        )}
        <input
          className={cn(
            'block w-full rounded-lg border bg-white py-2.5 px-3 text-sm placeholder-slate-400 transition-all duration-200',
            // Default State
            'border-slate-300',
            // Focus State (Clean, no thick ring)
            'focus:border-blue-500 focus:outline-none focus:shadow-[0_0_0_1px_rgba(59,130,246,0.1)]', 
            // Disabled State
            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
            // Icon Padding
            leftIcon && 'pl-10',
            // Error State
            error && 'border-red-500 focus:border-red-500 focus:shadow-[0_0_0_1px_rgba(239,68,68,0.1)]',
            className
          )}
          {...props}
        />
      </div>
      {/* Error Message with Animation */}
      <AnimatePresence>
        {error && (
            <motion.p 
                initial={{ opacity: 0, y: -5, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -5, height: 0 }}
                className="mt-1.5 text-xs text-red-500 font-medium flex items-center"
            >
                {error}
            </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};