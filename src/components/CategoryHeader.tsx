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
      <div className="rounded border border-border/15 bg-primary/5 backdrop-blur-sm">
        <div className="px-2 py-0.5 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <span className="text-xs">{category.icon}</span>
            <h3 className="text-[11px] font-semibold text-foreground truncate">
              {categoryName}
            </h3>
          </div>

          <div className="flex items-center gap-0.5 flex-shrink-0">
            {pendingCount > 0 && (
              <span className="bg-primary/10 text-primary text-[9px] font-bold px-1 py-0 rounded-full">
                {pendingCount}
              </span>
            )}
            {completedCount > 0 && (
              <span className="bg-success/10 text-success text-[9px] font-bold px-1 py-0 rounded-full">
                ✓{completedCount}
              </span>
            )}
          </div>

          <ChevronDown
            className={`h-3 w-3 text-muted-foreground/50 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
            strokeWidth={2}
          />
        </div>
      </div>
    </div>
  );
};
