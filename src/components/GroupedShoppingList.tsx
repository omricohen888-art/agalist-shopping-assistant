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
    <div>
      {/* Categories - No extra spacing */}
      {groupedItems.map((group) => {
        const isCollapsed = collapsedCategories.has(group.categoryKey);
        const pendingItems = group.items.filter((item) => !item.checked);
        const completedItems = group.items.filter((item) => item.checked);

        return (
          <div key={group.categoryKey}>
            <CategoryHeader
              category={group.categoryInfo}
              itemCount={group.items.length}
              completedCount={completedItems.length}
              isCollapsed={isCollapsed}
              onCollapsedChange={() => toggleCollapsed(group.categoryKey)}
              language={language}
            />

            {!isCollapsed && (
              <>
                {pendingItems.map((item) => (
                  <ShoppingListItem
                    key={item.id}
                    item={item}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onQuantityChange={onQuantityChange}
                    onUnitChange={onUnitChange}
                  />
                ))}
                {completedItems.map((item) => (
                  <ShoppingListItem
                    key={item.id}
                    item={item}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onQuantityChange={onQuantityChange}
                    onUnitChange={onUnitChange}
                    isCompleted={true}
                  />
                ))}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
