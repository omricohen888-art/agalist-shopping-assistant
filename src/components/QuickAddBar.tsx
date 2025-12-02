import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Unit, UNITS } from '@/types/shopping';
import { useLanguage } from '@/hooks/use-language';

interface QuickAddBarProps {
  onAddItem: (name: string, quantity: number, unit: Unit) => void;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({ onAddItem }) => {
  const { language } = useLanguage();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<Unit>('units');

  const handleAdd = () => {
    if (name.trim()) {
      onAddItem(name.trim(), quantity, unit);
      setName('');
      setQuantity(1);
      setUnit('units');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="flex items-center gap-2 py-3 px-2 bg-gradient-to-r from-yellow-50 to-yellow-50/50 dark:from-slate-700/30 dark:to-slate-700/20 rounded-lg border border-yellow-200 dark:border-slate-600/50 mb-3">
      {/* Add Button */}
      <Button
        onClick={handleAdd}
        disabled={!name.trim()}
        size="sm"
        className="h-8 w-8 p-0 bg-yellow-400 text-black hover:bg-yellow-500 dark:hover:bg-yellow-500 flex-shrink-0 rounded-lg border border-yellow-500 shadow-sm"
      >
        <Plus size={18} />
      </Button>

      {/* Quantity Input */}
      <Input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
        onKeyDown={handleKeyDown}
        className="w-12 sm:w-14 h-8 text-center text-xs px-1 border-gray-200 dark:border-slate-600 rounded-lg"
        placeholder="1"
      />

      {/* Unit Selector */}
      <Select value={unit} onValueChange={(value) => setUnit(value as Unit)}>
        <SelectTrigger className="w-14 sm:w-16 h-8 text-xs px-1 border-gray-200 dark:border-slate-600 rounded-lg">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {UNITS.map((u) => (
            <SelectItem key={u.value} value={u.value}>
              {language === 'he' ? u.labelHe : u.labelEn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Name Input */}
      <Input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={language === 'he' ? 'שם הפריט' : 'Item name'}
        className="flex-1 h-8 text-xs px-2 border-gray-200 dark:border-slate-600 rounded-lg"
      />
    </div>
  );
};

export default QuickAddBar;
