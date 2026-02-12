import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationProps } from '../types';
import { Button } from './Button';
import { cn } from '../utils';

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, className }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Logic to show limited page numbers
  const renderPageNumbers = () => {
    const visiblePages = pages.slice(
      Math.max(0, Math.min(currentPage - 2, totalPages - 3)), // Reduced range for compact spaces
      Math.min(totalPages, Math.max(3, currentPage + 1))
    );

    return visiblePages.map(page => (
      <button
        key={page}
        onClick={() => onPageChange(page)}
        className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
          currentPage === page
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        {page}
      </button>
    ));
  };

  return (
    <div className={cn("flex items-center justify-between px-2 py-4", className)}>
      <div className="text-xs text-slate-500">
        <span className="font-medium text-slate-900">{currentPage}</span> / <span className="font-medium text-slate-900">{totalPages}</span>
      </div>
      <div className="flex items-center space-x-1">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-1 h-8 w-8"
        >
          <ChevronLeft size={14} />
        </Button>
        
        <div className="flex items-center space-x-1">
          {renderPageNumbers()}
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-1 h-8 w-8"
        >
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
};