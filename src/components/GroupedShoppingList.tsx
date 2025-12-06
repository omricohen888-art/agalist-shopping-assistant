import { useState, useMemo } from "react";
import { ShoppingItem } from "@/types/shopping";
import { Language } from "@/context/LanguageContext";
import {
  groupByCategory,
  getCategoryInfo,
  CATEGORY_ORDER,
  CategoryKey,
} from "@/utils/categorySort";
import { ShoppingListItem } from "@/components/ShoppingListItem";
import { CategoryHeader } from "@/components/CategoryHeader";
import { Check } from "lucide-react";

interface GroupedShoppingListProps {
  items: ShoppingItem[];
  language: Language;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onUnitChange: (id: string, unit: string) => void;
}

export const GroupedShoppingList: React.FC<GroupedShoppingListProps> = ({
  items,
  language,
  onToggle,
  onDelete,
  onQuantityChange,
  onUnitChange,
}) => {
  // Track which categories are collapsed
  const [collapsedCategories, setCollapsedCategories] = useState<
    Set<CategoryKey>
  >(new Set());

  // Group items by category, maintaining order
  const groupedItems = useMemo(() => {
    const groups = groupByCategory(items);
    const result: Array<{
      categoryKey: CategoryKey;
      categoryInfo: ReturnType<typeof getCategoryInfo>;
      items: ShoppingItem[];
    }> = [];

    for (const key of CATEGORY_ORDER) {
      const categoryItems = groups.get(key);
      if (categoryItems && categoryItems.length > 0) {
        result.push({
          categoryKey: key,
          categoryInfo: getCategoryInfo(key),
          items: categoryItems,
        });
      }
    }

    return result;
  }, [items]);

  // Calculate totals
  const totalPending = items.filter((item) => !item.checked).length;
  const totalCompleted = items.filter((item) => item.checked).length;

  const toggleCollapsed = (categoryKey: CategoryKey) => {
    const newSet = new Set(collapsedCategories);
    if (newSet.has(categoryKey)) {
      newSet.delete(categoryKey);
    } else {
      newSet.add(categoryKey);
    }
    setCollapsedCategories(newSet);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Overall Progress Summary */}
      {totalCompleted > 0 && (
        <div className="flex items-center gap-4 py-3 px-4 glass rounded-2xl border border-border/30 bg-success/5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-success/40 to-transparent" />
          <span className="text-sm font-bold text-success flex items-center gap-2.5">
            <Check className="h-4 w-4" strokeWidth={3} />
            {language === "he"
              ? `נרכשו ${totalCompleted}`
              : `Completed ${totalCompleted}`}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-success/40 to-transparent" />
        </div>
      )}

      {/* Category Groups */}
      {groupedItems.map((group, groupIndex) => {
        const isCollapsed = collapsedCategories.has(group.categoryKey);
        const pendingItems = group.items.filter((item) => !item.checked);
        const completedItems = group.items.filter((item) => item.checked);

        return (
          <div
            key={group.categoryKey}
            className="animate-fade-in"
            style={{ animationDelay: `${groupIndex * 50}ms` }}
          >
            {/* Category Header */}
            <CategoryHeader
              category={group.categoryInfo}
              itemCount={group.items.length}
              completedCount={completedItems.length}
              isCollapsed={isCollapsed}
              onCollapsedChange={() => toggleCollapsed(group.categoryKey)}
              language={language}
            />

            {/* Category Items - Animated Collapse/Expand */}
            {!isCollapsed && (
              <div className="space-y-2 sm:space-y-3 mt-2 sm:mt-3 animate-fade-in">
                {/* Pending Items in this Category */}
                {pendingItems.length > 0 && (
                  <div className="space-y-2 sm:space-y-3">
                    {pendingItems.map((item, itemIndex) => (
                      <div
                        key={item.id}
                        className="animate-fade-in ml-2 sm:ml-4"
                        style={{ animationDelay: `${itemIndex * 30}ms` }}
                      >
                        <ShoppingListItem
                          item={item}
                          onToggle={onToggle}
                          onDelete={onDelete}
                          onQuantityChange={onQuantityChange}
                          onUnitChange={onUnitChange}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Completed Items in this Category */}
                {completedItems.length > 0 && (
                  <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-3 border-t border-success/20">
                    {completedItems.map((item) => (
                      <div
                        key={item.id}
                        className="ml-2 sm:ml-4"
                      >
                        <ShoppingListItem
                          item={item}
                          onToggle={onToggle}
                          onDelete={onDelete}
                          onQuantityChange={onQuantityChange}
                          onUnitChange={onUnitChange}
                          isCompleted={true}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
