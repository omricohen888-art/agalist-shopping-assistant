import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, X, Save, ListPlus } from "lucide-react";
import { SavedList, ShoppingItem, Unit, UNITS } from "@/types/shopping";
import { updateSavedList } from "@/utils/storage";
import { toast } from "sonner";

interface EditListModalProps {
  list: SavedList | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedList: SavedList) => void;
  language: 'he' | 'en';
}

export const EditListModal: React.FC<EditListModalProps> = ({
  list,
  isOpen,
  onClose,
  onSave,
  language
}) => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [listName, setListName] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState<number>(1);
  const [newItemUnit, setNewItemUnit] = useState<Unit>('units');
  const [bulkText, setBulkText] = useState('');
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(new Set());
  const itemsListRef = useRef<HTMLDivElement>(null);

  const direction = language === 'he' ? 'rtl' : 'ltr';

  useEffect(() => {
    if (list && isOpen) {
      setItems([...list.items]);
      setListName(list.name);
      // Reset input fields when modal opens
      setNewItemText('');
      setNewItemQuantity(1);
      setNewItemUnit('units');
      setBulkText('');
      setActiveTab('single');
    }
  }, [list, isOpen]);

  const handleAddSingleItem = () => {
    if (!newItemText.trim()) return;

    const newItem: ShoppingItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: newItemText.trim(),
      checked: false,
      quantity: newItemQuantity,
      unit: newItemUnit
    };

    setItems([...items, newItem]);
    setNewItemText('');
    setNewItemQuantity(1);
    setNewItemUnit('units');
    
    // Show success toast
    toast.success(language === 'he' ? 'הפריט נוסף בהצלחה!' : 'Item added!');
    
    // Highlight and scroll to new item
    setNewlyAddedIds(new Set([newItem.id]));
    setTimeout(() => setNewlyAddedIds(new Set()), 1500);
    setTimeout(() => {
      itemsListRef.current?.scrollTo({
        top: itemsListRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }, 50);
  };

  const handleAddBulkItems = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n').filter(line => line.trim());
    const newItems: ShoppingItem[] = lines.map((line, index) => ({
      id: `item-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      text: line.trim(),
      checked: false,
      quantity: 1,
      unit: 'units' as Unit
    }));

    setItems([...items, ...newItems]);
    setBulkText('');
    
    // Show success toast
    toast.success(
      language === 'he' 
        ? `${newItems.length} פריטים נוספו בהצלחה!` 
        : `${newItems.length} items added!`
    );
    
    // Highlight and scroll to new items
    setNewlyAddedIds(new Set(newItems.map(item => item.id)));
    setTimeout(() => setNewlyAddedIds(new Set()), 1500);
    setTimeout(() => {
      itemsListRef.current?.scrollTo({
        top: itemsListRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }, 50);
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleToggleItem = (itemId: string) => {
    setItems(items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleUpdateItemQuantity = (itemId: string, quantity: number, unit: Unit) => {
    setItems(items.map(item =>
      item.id === itemId ? { ...item, quantity, unit } : item
    ));
  };

  const handleSave = () => {
    if (!list) return;

    const updatedList: SavedList = {
      ...list,
      name: listName,
      items
    };

    updateSavedList(updatedList);
    onSave(updatedList);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddSingleItem();
    }
  };

  if (!list) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col rounded-2xl border-border"
        dir={direction}
      >
        <DialogHeader className="pb-2 border-b border-border">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <ListPlus className="h-5 w-5 text-primary" />
            {language === 'he' ? 'עריכת רשימה' : 'Edit List'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* List Name */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
              {language === 'he' ? 'שם הרשימה' : 'List Name'}
            </label>
            <Input
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="h-10 rounded-xl"
              placeholder={language === 'he' ? 'שם הרשימה...' : 'List name...'}
            />
          </div>

          {/* Add Items Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'single' | 'bulk')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-xl h-10">
              <TabsTrigger value="single" className="rounded-lg text-sm">
                {language === 'he' ? 'פריט בודד' : 'Single Item'}
              </TabsTrigger>
              <TabsTrigger value="bulk" className="rounded-lg text-sm">
                {language === 'he' ? 'מספר פריטים' : 'Multiple Items'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="mt-3 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={language === 'he' ? 'שם הפריט...' : 'Item name...'}
                  className="flex-1 h-10 rounded-xl"
                />
                <Input
                  type="number"
                  min="1"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 h-10 rounded-xl text-center"
                />
                <Select value={newItemUnit} onValueChange={(v: Unit) => setNewItemUnit(v)}>
                  <SelectTrigger className="w-20 h-10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map(u => (
                      <SelectItem key={u.value} value={u.value}>
                        {language === 'he' ? u.labelHe : u.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAddSingleItem} 
                disabled={!newItemText.trim()}
                className="w-full h-10 rounded-xl"
              >
                <Plus className="h-4 w-4 me-2" />
                {language === 'he' ? 'הוסף פריט' : 'Add Item'}
              </Button>
            </TabsContent>

            <TabsContent value="bulk" className="mt-3 space-y-3">
              <Textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={language === 'he' 
                  ? 'הכנס מספר פריטים, כל פריט בשורה נפרדת:\n\nחלב\nלחם\nביצים\nגבינה'
                  : 'Enter multiple items, one per line:\n\nMilk\nBread\nEggs\nCheese'
                }
                className="min-h-[120px] rounded-xl resize-none"
              />
              <Button 
                onClick={handleAddBulkItems} 
                disabled={!bulkText.trim()}
                className="w-full h-10 rounded-xl"
              >
                <Plus className="h-4 w-4 me-2" />
                {language === 'he' ? 'הוסף פריטים' : 'Add Items'}
              </Button>
            </TabsContent>
          </Tabs>

          {/* Items List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">
                {language === 'he' ? `פריטים (${items.length})` : `Items (${items.length})`}
              </label>
            </div>
            <div 
              ref={itemsListRef}
              className="space-y-1.5 max-h-[200px] overflow-y-auto rounded-xl border border-border p-2 bg-muted/20"
            >
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {language === 'he' ? 'אין פריטים ברשימה' : 'No items in list'}
                </p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                      newlyAddedIds.has(item.id) 
                        ? 'bg-primary/20 ring-2 ring-primary/40' 
                        : item.checked 
                          ? 'bg-muted/50' 
                          : 'bg-card hover:bg-muted/30'
                    }`}
                  >
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={() => handleToggleItem(item.id)}
                      className="h-4 w-4 border-2 border-border data-[state=checked]:bg-success data-[state=checked]:border-success"
                    />
                    <span className={`flex-1 text-sm font-medium ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                      {item.text}
                    </span>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItemQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1), item.unit)}
                        className="w-12 h-7 text-xs text-center rounded-lg"
                      />
                      <Select 
                        value={item.unit} 
                        onValueChange={(v: Unit) => handleUpdateItemQuantity(item.id, item.quantity, v)}
                      >
                        <SelectTrigger className="w-16 h-7 text-xs rounded-lg px-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITS.map(u => (
                            <SelectItem key={u.value} value={u.value}>
                              {language === 'he' ? u.labelHe : u.labelEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteItem(item.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose} className="flex-1 h-11 rounded-xl">
            <X className="h-4 w-4 me-2" />
            {language === 'he' ? 'ביטול' : 'Cancel'}
          </Button>
          <Button onClick={handleSave} className="flex-1 h-11 rounded-xl">
            <Save className="h-4 w-4 me-2" />
            {language === 'he' ? 'שמור' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
