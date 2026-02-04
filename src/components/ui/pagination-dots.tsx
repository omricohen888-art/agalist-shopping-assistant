import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface PaginationDotsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  language: 'he' | 'en';
  className?: string;
}

export const PaginationDots: React.FC<PaginationDotsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  language,
  className
}) => {
  if (totalPages <= 1) return null;

  const isRTL = language === 'he';

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {/* Previous Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30"
      >
        {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      {/* Dots */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={cn(
              "transition-all duration-200 rounded-full",
              currentPage === i
                ? "w-6 h-2 bg-primary"
                : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`${language === 'he' ? 'עמוד' : 'Page'} ${i + 1}`}
          />
        ))}
      </div>

      {/* Next Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30"
      >
        {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {/* Page Counter */}
      <span className="text-xs text-muted-foreground mx-1">
        {currentPage + 1}/{totalPages}
      </span>
    </div>
  );
};
