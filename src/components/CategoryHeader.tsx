import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CategoryInfo } from "@/utils/categorySort";
import { Language } from "@/context/LanguageContext";

interface CategoryHeaderProps {
  category: CategoryInfo;
  itemCount: number;
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  language: Language;
  completedCount: number;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  category,
  itemCount,
  isCollapsed,
  onCollapsedChange,
  language,
  completedCount,
}) => {
  const categoryName = language === "he" ? category.nameHe : category.nameEn;
  const pendingCount = itemCount - completedCount;

  return (
    <div
      className="sticky top-0 z-20 mb-2 cursor-pointer select-none"
      onClick={() => onCollapsedChange(!isCollapsed)}
    >
      <div className="glass rounded-2xl border border-border/40 shadow-md hover:shadow-lg transition-all duration-200 hover:border-border/60 overflow-hidden group">
        {/* Header Background with gradient */}
        <div className="bg-gradient-to-r from-primary/8 to-primary/5 dark:from-primary/15 dark:to-primary/10 px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-3">
          {/* Left: Icon and Category Name */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-2xl sm:text-3xl flex-shrink-0">
              {category.icon}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors">
                {categoryName}
              </h3>
            </div>
          </div>

          {/* Middle: Item Counts */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {pendingCount > 0 && (
              <span className="bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary/90 text-xs sm:text-sm font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap">
                {pendingCount}
              </span>
            )}
            {completedCount > 0 && (
              <span className="bg-success/20 text-success dark:bg-success/30 dark:text-success/90 text-xs sm:text-sm font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap flex items-center gap-1">
                <span>✓</span>
                {completedCount}
              </span>
            )}
          </div>

          {/* Right: Collapse Toggle Icon */}
          <div className="flex-shrink-0 p-1">
            <ChevronDown
              className={`h-5 w-5 sm:h-6 sm:w-6 text-foreground/60 group-hover:text-primary transition-all duration-300 ${
                isCollapsed ? "-rotate-90" : ""
              }`}
              strokeWidth={2.5}
            />
          </div>
        </div>

        {/* Optional: Subtle divider at bottom */}
        <div className="h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
      </div>
    </div>
  );
};
