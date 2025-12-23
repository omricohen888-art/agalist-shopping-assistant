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
      className="flex items-center gap-1 py-0.5 px-1 cursor-pointer select-none"
      onClick={() => onCollapsedChange(!isCollapsed)}
    >
      <ChevronDown
        className={`h-2.5 w-2.5 text-muted-foreground/40 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
        strokeWidth={2}
      />
      <span className="text-[10px]">{category.icon}</span>
      <span className="text-[10px] font-medium text-muted-foreground">
        {categoryName}
      </span>
      {pendingCount > 0 && (
        <span className="text-[9px] text-primary/70 font-semibold">({pendingCount})</span>
      )}
      {completedCount > 0 && (
        <span className="text-[9px] text-success/70">✓{completedCount}</span>
      )}
    </div>
  );
};
