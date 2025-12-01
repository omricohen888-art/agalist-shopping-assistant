import { useState, useEffect } from 'react';
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
}

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
          {/* Delete Button */}
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
          
          {/* Drag Handle */}
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
        className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-700 text-black dark:text-slate-200 text-sm font-bold border-2 border-black dark:border-slate-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all touch-manipulation ${
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

const STORAGE_KEY = 'activeTemplates';
const STORAGE_KEY_EXPANDED = 'templatesExpanded';

export const SortableTemplates = ({
  systemTemplates,
  language,
  onTemplateClick,
  onCreateNew,
}: SortableTemplatesProps) => {
  // Initialize with system templates if localStorage is empty
  const [activeTemplates, setActiveTemplates] = useState<Template[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : systemTemplates;
      }
      return systemTemplates;
    } catch {
      return systemTemplates;
    }
  });

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

  // Persist to localStorage whenever activeTemplates changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeTemplates));
  }, [activeTemplates]);

  // Persist expanded state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EXPANDED, JSON.stringify(isExpanded));
  }, [isExpanded]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setActiveTemplates((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDelete = (id: string) => {
    setActiveTemplates((prev) => prev.filter((t) => t.id !== id));
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
            items={activeTemplates.map((t) => t.id)}
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
                className={`px-4 py-2.5 rounded-lg bg-yellow-400 text-black text-sm font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all touch-manipulation flex items-center gap-2 ${
                  isEditMode
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <Plus className="h-4 w-4" />
                {createLabel}
              </button>
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
