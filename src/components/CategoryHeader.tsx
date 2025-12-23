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
      className="sticky top-0 z-20 cursor-pointer select-none"
      onClick={() => onCollapsedChange(!isCollapsed)}
    >
      <div className="rounded-lg border border-border/20 overflow-hidden group bg-card/60 backdrop-blur-sm">
        <div className="bg-gradient-to-r from-primary/5 to-transparent px-2 py-1 flex items-center justify-between gap-1.5">
          {/* Left: Icon and Category Name */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="text-sm flex-shrink-0">{category.icon}</span>
            <h3 className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {categoryName}
            </h3>
          </div>

          {/* Middle: Item Counts */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {pendingCount > 0 && (
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
            {completedCount > 0 && (
              <span className="bg-success/10 text-success text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <span>✓</span>
                {completedCount}
              </span>
            )}
          </div>

          {/* Right: Collapse Toggle Icon */}
          <ChevronDown
            className={`h-3 w-3 text-muted-foreground group-hover:text-primary transition-all duration-150 ${
              isCollapsed ? "-rotate-90" : ""
            }`}
            strokeWidth={2}
          />
        </div>
      </div>
    </div>
  );
};
