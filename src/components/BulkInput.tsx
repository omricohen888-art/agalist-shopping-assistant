import React from 'react';
import { Plus, ShoppingCart, Save } from 'lucide-react';
import ShoppingItemRow from './ShoppingItemRow';

interface ShoppingItem {
  id: string;
  text: string;
  quantity: number;
  unit: string;
  isChecked: boolean;
}

interface BulkInputProps {
  items: ShoppingItem[];
  onUpdateItem: (id: string, field: string, value: any) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: () => void;
  onSave: () => void;
  onStartShopping: () => void;
}

const BulkInput: React.FC<BulkInputProps> = ({
  items,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  onSave,
  onStartShopping
}) => {
  return (
    <div className="relative">
      {/* Yellow Legal Pad Container */}
      <div className="relative bg-[#fef9c3] rounded-xl shadow-xl p-6 pl-8">
        {/* Spiral Binding Visual Strip */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-[#e5e5e5] rounded-l-xl flex flex-col justify-around py-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-gray-800 rounded-full mx-auto shadow-inner"></div>
          ))}
        </div>

        {/* The List - Smart Rows */}
        <div className="min-h-[120px] space-y-0">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-lg">
              הקלד פריט...
            </div>
          ) : (
            items.map((item) => (
              <ShoppingItemRow
                key={item.id}
                item={item}
                onUpdate={onUpdateItem}
                onDelete={onDeleteItem}
              />
            ))
          )}
        </div>

        {/* Add Button - Large Dashed */}
        <button
          onClick={onAddItem}
          className="w-full mt-6 py-4 border-2 border-dashed border-gray-400 hover:border-gray-600 text-gray-600 hover:text-gray-800 rounded-lg transition-colors duration-200 flex items-center justify-center text-xl font-medium"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Footer Buttons - Outside the pad */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={onStartShopping}
          className="flex-1 bg-yellow-400 text-black px-6 py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 hover:bg-yellow-500 transition-colors"
        >
          <ShoppingCart size={20} />
          <span>צא לקניות! 🚀</span>
        </button>

        <button
          onClick={onSave}
          className="bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium text-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <Save size={20} />
          <span>שמור לאח״כ</span>
        </button>
      </div>
    </div>
  );
};

export default BulkInput;