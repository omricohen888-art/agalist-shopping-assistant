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
    <div className="space-y-1">
      {/* Overall Progress Summary - Ultra Compact */}
      {totalCompleted > 0 && (
        <div className="flex items-center gap-2 py-1 px-2 rounded-lg border border-success/15 bg-success/5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-success/20 to-transparent" />
          <span className="text-[10px] font-bold text-success flex items-center gap-1">
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
            {language === "he"
              ? `נרכשו ${totalCompleted}`
              : `Done ${totalCompleted}`}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-success/20 to-transparent" />
        </div>
      )}

      {/* Category Groups - Ultra Compact */}
      {groupedItems.map((group, groupIndex) => {
        const isCollapsed = collapsedCategories.has(group.categoryKey);
        const pendingItems = group.items.filter((item) => !item.checked);
        const completedItems = group.items.filter((item) => item.checked);

        return (
          <div
            key={group.categoryKey}
            className="animate-fade-in"
            style={{ animationDelay: `${groupIndex * 20}ms` }}
          >
            <CategoryHeader
              category={group.categoryInfo}
              itemCount={group.items.length}
              completedCount={completedItems.length}
              isCollapsed={isCollapsed}
              onCollapsedChange={() => toggleCollapsed(group.categoryKey)}
              language={language}
            />

            {!isCollapsed && (
              <div className="space-y-0.5 mt-0.5 animate-fade-in">
                {pendingItems.length > 0 && (
                  <div className="space-y-0.5">
                    {pendingItems.map((item, itemIndex) => (
                      <div
                        key={item.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${itemIndex * 15}ms` }}
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

                {completedItems.length > 0 && (
                  <div className="space-y-0.5 pt-0.5 border-t border-success/10">
                    {completedItems.map((item) => (
                      <div key={item.id}>
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
