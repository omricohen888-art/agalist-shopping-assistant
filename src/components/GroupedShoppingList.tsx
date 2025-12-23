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
    <div className="space-y-2">
      {/* Overall Progress Summary - Compact */}
      {totalCompleted > 0 && (
        <div className="flex items-center gap-3 py-1.5 px-3 rounded-xl border border-success/20 bg-success/5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-success/30 to-transparent" />
          <span className="text-xs font-bold text-success flex items-center gap-1.5">
            <Check className="h-3 w-3" strokeWidth={3} />
            {language === "he"
              ? `נרכשו ${totalCompleted}`
              : `Completed ${totalCompleted}`}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-success/30 to-transparent" />
        </div>
      )}

      {/* Category Groups - Compact */}
      {groupedItems.map((group, groupIndex) => {
        const isCollapsed = collapsedCategories.has(group.categoryKey);
        const pendingItems = group.items.filter((item) => !item.checked);
        const completedItems = group.items.filter((item) => item.checked);

        return (
          <div
            key={group.categoryKey}
            className="animate-fade-in"
            style={{ animationDelay: `${groupIndex * 30}ms` }}
          >
            {/* Category Header - Compact */}
            <CategoryHeader
              category={group.categoryInfo}
              itemCount={group.items.length}
              completedCount={completedItems.length}
              isCollapsed={isCollapsed}
              onCollapsedChange={() => toggleCollapsed(group.categoryKey)}
              language={language}
            />

            {/* Category Items */}
            {!isCollapsed && (
              <div className="space-y-1 mt-1 animate-fade-in">
                {/* Pending Items */}
                {pendingItems.length > 0 && (
                  <div className="space-y-1">
                    {pendingItems.map((item, itemIndex) => (
                      <div
                        key={item.id}
                        className="animate-fade-in ml-1"
                        style={{ animationDelay: `${itemIndex * 20}ms` }}
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

                {/* Completed Items */}
                {completedItems.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-success/10">
                    {completedItems.map((item) => (
                      <div key={item.id} className="ml-1">
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
