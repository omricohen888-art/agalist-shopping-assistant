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
      className={`relative ${isEditMode ? 'animate-wiggle' : ''}`}
    >
      {isEditMode && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(template.id);
            }}
            className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full flex items-center justify-center shadow-lg transition-colors"
            aria-label={language === 'he' ? 'מחק תבנית' : 'Delete template'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
          
          <div
            {...listeners}
            {...attributes}
            className="absolute -top-2 -left-2 z-10 w-6 h-6 bg-muted-foreground text-background rounded-full flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
        </>
      )}
      
      <button
        onClick={() => !isEditMode && onClick(template.items)}
        disabled={isEditMode}
        className={`
          px-3 py-2 rounded-lg 
          bg-card text-foreground 
          text-xs font-medium 
          border border-foreground/30 dark:border-foreground/20
          transition-all duration-200 touch-manipulation 
          ${isEditMode
            ? 'cursor-default ring-2 ring-primary/50'
            : 'hover:bg-muted/50 hover:border-primary active:scale-95'
          }
        `}
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
const STORAGE_KEY_VERSION = 'templateVersion';

// Default system template IDs - 4 most useful for families
const DEFAULT_TEMPLATE_IDS = ['grocery', 'bbq', 'cleaning', 'family'];
const CURRENT_VERSION = 2; // bump to reset user templates to new defaults

export const SortableTemplates = ({
  systemTemplates,
  language,
  onTemplateClick,
  onCreateNew,
}: SortableTemplatesProps) => {
  // Store only template IDs for ordering
  const [activeTemplateIds, setActiveTemplateIds] = useState<string[]>(() => {
    try {
      const version = localStorage.getItem(STORAGE_KEY_VERSION);
      if (version && parseInt(version) >= CURRENT_VERSION) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.length > 0 ? parsed : DEFAULT_TEMPLATE_IDS;
        }
      }
      // Reset to new defaults
      localStorage.setItem(STORAGE_KEY_VERSION, String(CURRENT_VERSION));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATE_IDS));
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

  const ctaTitle = language === 'he' ? '⚡ או בחרו תבנית מוכנה:' : '⚡ Or pick a template:';
  const editLabel = language === 'he' ? 'עריכה' : 'Edit';
  const doneLabel = language === 'he' ? 'סיום' : 'Done';
  const createLabel = language === 'he' ? 'צור חדש' : 'Create New';

  return (
    <div className="mb-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-muted-foreground">
          {ctaTitle}
        </h3>

        {isExpanded && (
          <Button
            onClick={toggleEditMode}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] font-medium text-muted-foreground hover:text-foreground"
          >
            <Edit3 className="w-3 h-3 mr-1" />
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
            <div className="flex flex-wrap justify-center gap-1.5">
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
              {isEditMode && (
                <button
                  onClick={onCreateNew}
                  className="px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold border border-primary/20 transition-all duration-200 touch-manipulation flex items-center gap-1 hover:bg-primary/20 active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {createLabel}
                </button>
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};