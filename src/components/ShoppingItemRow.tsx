import { Unit, UNITS } from "@/types/shopping";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface ShoppingItemRowItem {
    id: string;
    text: string;
    quantity: number;
    unit: string;
    isChecked: boolean;
}

interface ShoppingItemRowProps {
    item: ShoppingItemRowItem;
    onUpdate: (id: string, field: string, value: any) => void;
    onDelete: (id: string) => void;
}

export const ShoppingItemRow = ({ item, onUpdate, onDelete }: ShoppingItemRowProps) => {
    const { language } = useLanguage();

    return (
        <div className="flex items-center gap-2 py-2 border-b border-gray-300 dark:border-slate-600">
            {/* Delete Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(item.id)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
            >
                <Trash2 className="h-4 w-4" />
            </Button>

            {/* Quantity Input */}
            <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onUpdate(item.id, 'quantity', parseInt(e.target.value) || 1)}
                className="w-14 sm:w-16 h-8 text-center text-sm"
            />

            {/* Unit Select */}
            <Select value={item.unit} onValueChange={(value) => onUpdate(item.id, 'unit', value as Unit)}>
                <SelectTrigger className="w-16 sm:w-20 h-8 text-xs sm:text-sm">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                            {language === 'he' ? unit.labelHe : unit.labelEn}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Item Name Input */}
            <Input
                type="text"
                value={item.text}
                onChange={(e) => onUpdate(item.id, 'text', e.target.value)}
                placeholder={language === 'he' ? 'שם הפריט' : 'Item name'}
                className="flex-1 h-8 text-sm"
            />
        </div>
    );
};

export default ShoppingItemRow;