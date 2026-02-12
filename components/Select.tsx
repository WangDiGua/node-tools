import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../utils';
import { ChevronDown, Check, ChevronsUpDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  value?: string | number;
  onChange?: (value: any) => void;
  options?: SelectOption[]; // Now mandatory for rendering options
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  wrapperClassName?: string;
  leftIcon?: React.ReactNode;
  children?: React.ReactNode; // Kept for type compatibility but deprecated
}

export const Select: React.FC<SelectProps> = ({ 
  value, 
  onChange, 
  options = [], 
  label, 
  placeholder = "请选择", 
  error, 
  disabled, 
  className,
  wrapperClassName,
  leftIcon,
  children 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Parse children if options are not provided (Backwards compatibility helper)
  // Note: ideally we strictly use options prop, but this helps if we missed migrating some static children
  const effectiveOptions = options.length > 0 ? options : React.Children.toArray(children).map((child: any) => ({
      value: child.props.value,
      label: child.props.children
  }));

  const selectedOption = effectiveOptions.find(opt => String(opt.value) === String(value));

  const handleSelect = (val: string | number) => {
    if (disabled) return;
    onChange?.(val);
    setIsOpen(false);
  };

  return (
    <div className={cn("w-full relative", wrapperClassName)} ref={containerRef}>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5 dark:text-slate-300">{label}</label>}
      
      {/* Trigger Button */}
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'relative flex items-center w-full rounded-lg border bg-white py-2.5 px-3 text-sm text-left shadow-sm cursor-pointer transition-all duration-200',
          // Border & Color
          isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-300 hover:border-slate-400',
          // Disabled
          disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'text-slate-700',
          // Dark Mode
          'dark:bg-slate-800 dark:border-slate-700 dark:text-white',
          // Error
          error && 'border-red-500 focus:ring-red-500',
          // Icon Padding
          leftIcon ? 'pl-10' : '',
          className
        )}
      >
        {leftIcon && (
          <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${error ? 'text-red-400' : 'text-slate-400'}`}>
            {leftIcon}
          </div>
        )}
        
        <span className={cn("block truncate flex-1", !selectedOption && "text-slate-400")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          {isOpen ? (
             <ChevronDown size={16} className="text-blue-500 transition-transform rotate-180" />
          ) : (
             <ChevronDown size={16} className="text-slate-400 transition-transform" />
          )}
        </span>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-xl border border-slate-100 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm dark:bg-slate-800 dark:border-slate-700 custom-scrollbar"
          >
            {effectiveOptions.length === 0 ? (
                <div className="py-3 px-4 text-slate-400 text-center text-xs">暂无选项</div>
            ) : (
                effectiveOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(value);
                  return (
                    <div
                        key={opt.value}
                        onClick={() => handleSelect(opt.value)}
                        className={cn(
                        "relative cursor-pointer select-none py-2.5 pl-3 pr-9 transition-colors flex items-center",
                        isSelected 
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium" 
                            : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/50"
                        )}
                    >
                        <span className="block truncate">{opt.label}</span>
                        {isSelected && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600 dark:text-blue-400">
                            <Check size={16} />
                        </span>
                        )}
                    </div>
                  )
                })
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
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