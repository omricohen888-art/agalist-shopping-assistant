import { Unit, UNITS } from "@/types/shopping";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { useGlobalLanguage } from "@/context/LanguageContext";
import QuantityControl from "@/components/QuantityControl";

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
    const { language } = useGlobalLanguage();

    return (
        <div className={`flex items-center gap-2 py-2 border-b border-gray-300 dark:border-slate-600 w-full ${language === 'he' ? 'flex-row-reverse' : ''}`}>
            <div className="flex items-center gap-2 flex-shrink-0">
                <Select value={item.unit} onValueChange={(value) => onUpdate(item.id, 'unit', value as Unit)}>
                    <SelectTrigger className="h-10 px-3 rounded-full border-0 focus:ring-0 shadow-none bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 group">
                        <SelectValue className="font-bold text-base" />
                    </SelectTrigger>
                    <SelectContent>
                        {UNITS.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value} className="font-medium">
                                {language === 'he' ? unit.labelHe : unit.labelEn}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* SPACER */}
                <div className="w-2" />

                <QuantityControl
                    value={item.quantity}
                    onChange={(val) => onUpdate(item.id, 'quantity', val)}
                    unit={item.unit as Unit}
                />
            </div>

            {/* CENTER: Empty spacer - grows to push item name to the right */}
            <div className="flex-grow" />

            {/* RIGHT SIDE: Delete Button + Item Name Input */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(item.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>

                <Input
                    type="text"
                    value={item.text}
                    onChange={(e) => onUpdate(item.id, 'text', e.target.value)}
                    placeholder={language === 'he' ? 'שם הפריט' : 'Item name'}
                    className="flex-shrink-0 h-8 text-sm"
                />
            </div>
        </div>
    );
};

export default ShoppingItemRow;