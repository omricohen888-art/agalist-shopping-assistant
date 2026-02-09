import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Store, Receipt, Calendar, Tag } from "lucide-react";
import { ShoppingHistory, SHOPPING_TYPES, STORES_BY_TYPE, ShoppingType } from "@/types/shopping";

interface EditHistoryModalProps {
  trip: ShoppingHistory | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTrip: ShoppingHistory) => void;
  language: 'he' | 'en';
}

export const EditHistoryModal: React.FC<EditHistoryModalProps> = ({
  trip,
  isOpen,
  onClose,
  onSave,
  language,
}) => {
  const [store, setStore] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [date, setDate] = useState('');
  const [shoppingType, setShoppingType] = useState<ShoppingType | ''>('');
  const [listName, setListName] = useState('');

  const direction = language === 'he' ? 'rtl' : 'ltr';

  useEffect(() => {
    if (trip) {
      setStore(trip.store || '');
      setTotalAmount(String(trip.totalAmount || 0));
      // Format date for input[type=date]
      const d = new Date(trip.date);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setDate(`${yyyy}-${mm}-${dd}`);
      setShoppingType(trip.shoppingType || '');
      setListName(trip.listName || '');
    }
  }, [trip]);

  if (!trip) return null;

  const storeOptions = shoppingType
    ? STORES_BY_TYPE[shoppingType] || []
    : Object.values(STORES_BY_TYPE).flat();

  const handleSave = () => {
    const updatedTrip: ShoppingHistory = {
      ...trip,
      store,
      totalAmount: parseFloat(totalAmount) || 0,
      date: new Date(date).toISOString(),
      shoppingType: shoppingType || undefined,
      listName: listName || undefined,
    };
    onSave(updatedTrip);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]" dir={direction}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            {language === 'he' ? 'עריכת קנייה' : 'Edit Purchase'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* List Name */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm">
              <Tag className="h-3.5 w-3.5" />
              {language === 'he' ? 'שם הרשימה' : 'List Name'}
            </Label>
            <Input
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder={language === 'he' ? 'שם הרשימה' : 'List name'}
            />
          </div>

          {/* Shopping Type */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm">
              <Tag className="h-3.5 w-3.5" />
              {language === 'he' ? 'סוג קנייה' : 'Shopping Type'}
            </Label>
            <Select value={shoppingType} onValueChange={(val) => setShoppingType(val as ShoppingType)}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'he' ? 'בחר סוג' : 'Select type'} />
              </SelectTrigger>
              <SelectContent>
                {SHOPPING_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.icon} {language === 'he' ? type.labelHe : type.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Store */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm">
              <Store className="h-3.5 w-3.5" />
              {language === 'he' ? 'חנות' : 'Store'}
            </Label>
            <Input
              value={store}
              onChange={(e) => setStore(e.target.value)}
              placeholder={language === 'he' ? 'שם החנות' : 'Store name'}
              list="store-suggestions"
            />
            <datalist id="store-suggestions">
              {storeOptions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          {/* Total Amount */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm">
              <Receipt className="h-3.5 w-3.5" />
              {language === 'he' ? 'סכום כולל' : 'Total Amount'}
            </Label>
            <Input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm">
              <Calendar className="h-3.5 w-3.5" />
              {language === 'he' ? 'תאריך' : 'Date'}
            </Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            {language === 'he' ? 'ביטול' : 'Cancel'}
          </Button>
          <Button onClick={handleSave}>
            {language === 'he' ? 'שמור שינויים' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
