import { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Edit3, Plus, GripVertical, X } from 'lucide-react';
import { Language } from '@/hooks/use-language';

interface Template {
  id: string;
  name: string;
  items: string[];
  isCustom?: boolean;
}

// System template translations - maps ID to both languages
const systemTemplateTranslations: Record<string, { he: { name: string; items: string[] }; en: { name: string; items: string[] } }> = {
  grocery: {
    he: { name: "השלמות למכולת", items: ["חלב", "לחם", "קוטג'", "ביצים", "עגבניות"] },
    en: { name: "Quick Grocery Run", items: ["Milk", "Bread", "Cottage Cheese", "Eggs", "Tomatoes"] }
  },
  hiking: {
    he: { name: "ציוד לטיול", items: ["פינג'אן", "קפה שחור", "אוהל", "שק שינה", "בקבוקי מים", "קרם הגנה", "פנס", "מפית לחות"] },
    en: { name: "Hiking & Camping", items: ["Finjan", "Black Coffee", "Tent", "Sleeping Bag", "Water Bottles", "Sunscreen", "Flashlight", "Wet Wipes"] }
  },
  tech: {
    he: { name: "אלקטרוניקה וגאדג'טים", items: ["כבל HDMI", "סוללות AA", "מטען USB-C", "עכבר", "מקלדת", "אוזניות"] },
    en: { name: "Tech & Gadgets", items: ["HDMI Cable", "AA Batteries", "USB-C Charger", "Mouse", "Keyboard", "Headphones"] }
  },
  bbq: {
    he: { name: "על האש", items: ["פחמים", "סטייקים", "קבב", "חומוס", "פיתות", "סלטים", "מלקחיים", "מלח גס"] },
    en: { name: "BBQ Party", items: ["Charcoal", "Steaks", "Kebabs", "Hummus", "Pita Bread", "Salads", "Tongs", "Coarse Salt"] }
  },
  cleaning: {
    he: { name: "ניקיון ופארם", items: ["אקונומיקה", "נוזל רצפות", "שמפו", "משחת שיניים", "אבקת כביסה", "סבון ידיים", "נייר טואלט"] },
    en: { name: "Cleaning & Pharmacy", items: ["Bleach", "Floor Cleaner", "Shampoo", "Toothpaste", "Laundry Detergent", "Hand Soap", "Toilet Paper"] }
  },
  family: {
    he: { name: "קנייה משפחתית גדולה", items: ["שניצל", "פסטה", "אורז", "מלפפונים", "פלפלים", "מילקי", "גבינה צהובה", "במבה", "ביסלי", "פיצה קפואה", "חזה עוף", "שמן", "קורנפלקס", "נייר טואלט", "יוגורט", "לחם", "חלב"] },
    en: { name: "Big Family Shop", items: ["Schnitzel", "Pasta", "Rice", "Cucumbers", "Peppers", "Milky", "Yellow Cheese", "Bamba", "Bisli", "Frozen Pizza", "Chicken Breast", "Oil", "Cereal", "Toilet Paper", "Yogurt", "Bread", "Milk"] }
  }
};

interface SortableTemplateItemProps {
  template: Template;
  isEditMode: boolean;
  onDelete: (id: string) => void;
  onClick: (items: string[]) => void;
  language: Language;
}

const SortableTemplateItem = ({
  template,
  isEditMode,
  onDelete,
  onClick,
  language,
}: SortableTemplateItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: template.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isEditMode ? 'animate-pulse' : ''}`}
    >
      {isEditMode && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(template.id);
            }}
            className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            aria-label={language === 'he' ? 'מחק תבנית' : 'Delete template'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
          
          <div
            {...listeners}
            {...attributes}
            className="absolute -top-2 -left-2 z-10 w-6 h-6 bg-gray-700 dark:bg-gray-600 text-white rounded-full flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
        </>
      )}
      
      <button
        onClick={() => !isEditMode && onClick(template.items)}
        disabled={isEditMode}
        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white dark:bg-slate-700 text-black dark:text-slate-200 text-xs sm:text-sm font-bold border-2 border-black dark:border-slate-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all touch-manipulation active:scale-95 ${
          isEditMode
            ? 'cursor-default border-yellow-500 dark:border-yellow-500'
            : 'hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:bg-slate-600'
        }`}
      >
        {template.name}
      </button>
    </div>
  );
};

interface SortableTemplatesProps {
  systemTemplates: Template[];
  language: Language;
  onTemplateClick: (items: string[]) => void;
  onCreateNew: () => void;
}

const STORAGE_KEY = 'activeTemplateIds';
const STORAGE_KEY_CUSTOM = 'customTemplatesData';
const STORAGE_KEY_EXPANDED = 'templatesExpanded';

// Default system template IDs
const DEFAULT_TEMPLATE_IDS = ['grocery', 'hiking', 'tech', 'bbq', 'cleaning', 'family'];

export const SortableTemplates = ({
  systemTemplates,
  language,
  onTemplateClick,
  onCreateNew,
}: SortableTemplatesProps) => {
  // Store only template IDs for ordering
  const [activeTemplateIds, setActiveTemplateIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : DEFAULT_TEMPLATE_IDS;
      }
      return DEFAULT_TEMPLATE_IDS;
    } catch {
      return DEFAULT_TEMPLATE_IDS;
    }
  });

  // Store custom templates separately with their content
  const [customTemplates, setCustomTemplates] = useState<Template[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Build the active templates list with proper translations
  const activeTemplates = useMemo(() => {
    return activeTemplateIds.map(id => {
      // Check if it's a system template
      const systemTranslation = systemTemplateTranslations[id];
      if (systemTranslation) {
        const translated = systemTranslation[language];
        return { id, name: translated.name, items: translated.items };
      }
      // Check if it's a custom template
      const custom = customTemplates.find(t => t.id === id);
      if (custom) {
        return { ...custom, isCustom: true };
      }
      return null;
    }).filter((t): t is Template => t !== null);
  }, [activeTemplateIds, customTemplates, language]);

  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXPANDED);
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [isEditMode, setIsEditMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Persist template IDs to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeTemplateIds));
  }, [activeTemplateIds]);

  // Persist custom templates
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(customTemplates));
  }, [customTemplates]);

  // Persist expanded state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EXPANDED, JSON.stringify(isExpanded));
  }, [isExpanded]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setActiveTemplateIds((ids) => {
        const oldIndex = ids.indexOf(active.id as string);
        const newIndex = ids.indexOf(over.id as string);
        return arrayMove(ids, oldIndex, newIndex);
      });
    }
  };

  const handleDelete = (id: string) => {
    setActiveTemplateIds((prev) => prev.filter((tid) => tid !== id));
    // Also remove from custom templates if it's custom
    setCustomTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev);
  };

  const title = language === 'he' ? 'תבניות מהירות' : 'Quick Templates';
  const editLabel = language === 'he' ? 'עריכה' : 'Edit';
  const doneLabel = language === 'he' ? 'סיום' : 'Done';
  const createLabel = language === 'he' ? 'צור תבנית' : 'Create Template';

  return (
    <div className="mb-2 md:mb-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-foreground">
            {title}
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-600 dark:text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-slate-400" />
            )}
          </button>
        </div>

        {isExpanded && (
          <Button
            onClick={toggleEditMode}
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs font-bold"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" />
            {isEditMode ? doneLabel : editLabel}
          </Button>
        )}
      </div>

      {/* Templates Grid */}
      {isExpanded && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={activeTemplateIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-wrap justify-center gap-2.5">
              {activeTemplates.map((template) => (
                <SortableTemplateItem
                  key={template.id}
                  template={template}
                  isEditMode={isEditMode}
                  onDelete={handleDelete}
                  onClick={onTemplateClick}
                  language={language}
                />
              ))}

              {/* Create New Template Button */}
              <button
                onClick={onCreateNew}
                disabled={isEditMode}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-yellow-400 text-black text-xs sm:text-sm font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all touch-manipulation flex items-center gap-1.5 sm:gap-2 active:scale-95 ${
                  isEditMode
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {createLabel}
              </button>
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
