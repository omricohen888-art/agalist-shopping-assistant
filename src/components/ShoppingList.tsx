import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Share2, Trash2, Plus, CheckCircle2, History, Menu, BarChart3, Globe, Save, ClipboardList, Book, Square, CheckSquare, Printer, Mail, FileSpreadsheet, MessageCircle, Copy, Pencil } from "lucide-react";
import { toast } from "sonner";
import { ShoppingItem, ISRAELI_STORES, UNITS, Unit, SavedList } from "@/types/shopping";
import { saveShoppingHistory, saveList, getSavedLists, deleteSavedList, updateSavedList } from "@/utils/storage";
import { useLanguage, Language } from "@/hooks/use-language";

const QuantityInput = ({ value, onChange, unit }: { value: number, onChange: (val: number) => void, unit: Unit }) => {
  const [localValue, setLocalValue] = useState(value.toString());

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleBlur = () => {
    let parsed = parseFloat(localValue);
    if (!isNaN(parsed) && parsed >= 0) {
      if (unit === 'units') {
        parsed = Math.round(parsed);
        if (parsed === 0) parsed = 1;
      }
      onChange(parsed);
      setLocalValue(parsed.toString());
    } else {
      setLocalValue(value.toString());
    }
  };

  return (
    <Input
      type="number"
      step={unit === 'units' ? "1" : "any"}
      min="0"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur();
        }
      }}
      className="w-16 h-9 px-2 text-center text-sm rounded-lg"
    />
  );
};

const ENGLISH_STORES = [
  "Shufersal",
  "Rami Levy",
  "Victory",
  "Yenot Bitan",
  "Machsanei HaShuk",
  "Super-Pharm",
  "Shufersal Deal",
  "AM:PM",
  "Yohannoff",
  "Mega Ba'Ir",
  "Tiv Taam",
  "Cofix",
  "Hazi Hinam",
  "Other"
] as const;

// Template data for quick start
const templates = {
  he: [
    { id: "grocery", name: "השלמות למכולת", items: ["חלב", "לחם", "קוטג'", "ביצים", "עגבניות"] },
    { id: "hiking", name: "ציוד לטיול", items: ["פינג'אן", "קפה שחור", "אוהל", "שק שינה", "בקבוקי מים", "קרם הגנה", "פנס", "מפית לחות"] },
    { id: "tech", name: "אלקטרוניקה וגאדג'טים", items: ["כבל HDMI", "סוללות AA", "מטען USB-C", "עכבר", "מקלדת", "אוזניות"] },
    { id: "bbq", name: "על האש", items: ["פחמים", "סטייקים", "קבב", "חומוס", "פיתות", "סלטים", "מלקחיים", "מלח גס"] },
    { id: "cleaning", name: "ניקיון ופארם", items: ["אקונומיקה", "נוזל רצפות", "שמפו", "משחת שיניים", "אבקת כביסה", "סבון ידיים", "נייר טואלט"] },
    { id: "family", name: "קנייה משפחתית גדולה", items: ["שניצל", "פסטה", "אורז", "מלפפונים", "פלפלים", "מילקי", "גבינה צהובה", "במבה", "ביסלי", "פיצה קפואה", "חזה עוף", "שמן", "קורנפלקס", "נייר טואלט", "יוגורט", "לחם", "חלב"] }
  ],
  en: [
    { id: "grocery", name: "Small Run", items: ["Milk", "Bread", "Cottage Cheese", "Eggs", "Tomatoes"] },
    { id: "hiking", name: "Hiking/Camping", items: ["Finjan", "Black Coffee", "Tent", "Sleeping Bag", "Water bottles", "Sunscreen", "Flashlight", "Wet wipes"] },
    { id: "tech", name: "Tech & Gadgets", items: ["HDMI Cable", "AA Batteries", "USB-C Charger", "Mouse", "Keyboard", "Headphones"] },
    { id: "bbq", name: "BBQ", items: ["Charcoal", "Steaks", "Kebabs", "Hummus", "Pita bread", "Salads", "Tongs", "Coarse salt"] },
    { id: "cleaning", name: "Cleaning & Pharmacy", items: ["Bleach", "Floor cleaner", "Shampoo", "Toothpaste", "Laundry detergent", "Hand soap", "Toilet paper"] },
    { id: "family", name: "Big Family Shop", items: ["Schnitzel", "Pasta", "Rice", "Cucumbers", "Peppers", "Milky", "Yellow Cheese", "Bamba", "Bisli", "Frozen Pizza", "Chicken breast", "Oil", "Cereal", "Toilet paper", "Yogurt", "Bread", "Milk"] }
  ]
};

const translations: Record<Language, {
  languageLabel: string;
  languageAria: string;
  appTitle: string;
  tagline: string;
  fabLabel: string;
  menuTitle: string;
  welcomeHeading: string;
  welcomeSubtitle: string;
  templatesHeading: string;
  addItemButton: string;
  addItemPlaceholder: string;
  navigation: {
    list: string;
    history: string;
    compare: string;
    notebook: string;
  };
  shareTitle: string;
  textareaPlaceholder: string;
  shareButton: string;
  clearAllButton: string;
  emptyState: string;
  clearCompletedButton: string;
  finishButton: string;
  finishDialogTitle: string;
  finishDialogDescription: string;
  amountLabel: string;
  storeLabel: string;
  selectPlaceholder: string;
  customStoreLabel: string;
  customStorePlaceholder: string;
  summaryLabel: string;
  cancel: string;
  save: string;
  progressText: (completed: number, total: number) => string;
  toasts: {
    itemsAdded: (count: number) => string;
    shareSuccess: string;
    copySuccess: string;
    clearedCompleted: string;
    clearedAll: string;
    noItems: string;
    invalidAmount: string;
    selectStore: string;
    saveSuccess: string;
    saveError: string;
    listSaved: string;
    listDeleted: string;
    listLoaded: string;
    finishWarning: string;
    listRenamed: string;
  };
  saveListButton: string;
  summarizeButton: string;
  myListsTitle: string;
  emptyLists: string;
  itemsCount: (count: number) => string;
  moreItems: (count: number) => string;
  saveDialog: {
    title: string;
    nameLabel: string;
    namePlaceholder: string;
    saveButton: string;
    shareTitle: string;
    shareWhatsapp: string;
    shareCopy: string;
    shareCsv: string;
    shareEmail: string;
    sharePrint: string;
  };
  renameDialog: {
    title: string;
    save: string;
    cancel: string;
  };
}> = {
  he: {
    languageLabel: "English",
    languageAria: "Switch to English",
    appTitle: "עגליסט",
    tagline: "רושמת, מארגנת וחוסכת!",
    fabLabel: "להוספת הרשימה לחץ כאן",
    menuTitle: "🛒 תפריט",
    welcomeHeading: "שלחו לכם רשימת קניות?",
    welcomeSubtitle: "הדביקו אותה כאן וקבלו חוויית קנייה מהנה, אינטראקטיבית וחסכונית.",
    templatesHeading: "אין לכם רשימה? נסו אחת לדוגמה:",
    addItemButton: "הוסף פריט",
    addItemPlaceholder: "שם הפריט...",
    navigation: {
      list: "רשימת קניות",
      history: "היסטוריה",
      compare: "השוואת קניות",
      notebook: "הפנקס שלי"
    },
    shareTitle: "רשימת קניות - עגליסט",
    textareaPlaceholder: "אין פריטים עדיין. הדביקו רשימה כאן או הוסיפו פריטים כדי להתחיל...",
    shareButton: "שתף",
    clearAllButton: "נקה הכל",
    emptyState: "אין פריטים עדיין. הדביקו רשימה או הוסיפו פריטים כדי להתחיל.",
    clearCompletedButton: "נקה פריטים שסומנו",
    finishButton: "סיום קנייה",
    finishDialogTitle: "סיכום קנייה לסטטיסטיקה",
    finishDialogDescription: "הזן את פרטי הקנייה כדי לשמור אותה בהיסטוריה",
    amountLabel: "סכום הקנייה (₪)",
    storeLabel: "רשת שיווק",
    selectPlaceholder: "בחר רשת שיווק",
    customStoreLabel: "שם הרשת",
    customStorePlaceholder: "הזן שם רשת",
    summaryLabel: "סיכום:",
    cancel: "ביטול",
    save: "שמור קנייה",
    progressText: (completed: number, total: number) => `${completed} מתוך ${total} פריטים הושלמו`,
    toasts: {
      itemsAdded: (count: number) => `נוספו ${count} פריטים`,
      shareSuccess: "הרשימה שותפה בהצלחה!",
      copySuccess: "הרשימה הועתקה ללוח!",
      clearedCompleted: "פריטים שסומנו נמחקו",
      clearedAll: "הרשימה נוקתה",
      noItems: "אין פריטים ברשימה",
      invalidAmount: "אנא הזן סכום תקין",
      selectStore: "אנא בחר רשת שיווק",
      saveSuccess: "הקנייה נשמרה בהצלחה!",
      saveError: "שגיאה בשמירת הקנייה",
      listSaved: "הרשימה נשמרה בפנקס!",
      listDeleted: "הרשימה נמחקה",
      listLoaded: "הרשימה נטענה בהצלחה",
      finishWarning: "שימו לב: כפתור זה נועד לתיעוד קנייה שהושלמה לצורך מעקב וסטטיסטיקה. אנא סמנו את הפריטים שנרכשו כדי להמשיך.",
      listRenamed: "שם הרשימה עודכן בהצלחה"
    },
    saveListButton: "שמור רשימה",
    summarizeButton: "סיום ותיעוד",
    myListsTitle: "הפנקס שלי",
    emptyLists: "אין רשימות שמורות עדיין",
    itemsCount: (count: number) => `${count} פריטים`,
    moreItems: (count: number) => `+${count} נוספים`,
    saveDialog: {
      title: "שמירה ושיתוף הרשימה",
      nameLabel: "שם הרשימה",
      namePlaceholder: "רשימה ליום...",
      saveButton: "שמור לפנקס",
      shareTitle: "או שתפו את הרשימה",
      shareWhatsapp: "וואטסאפ",
      shareCopy: "העתק",
      shareCsv: "ייצוא CSV",
      shareEmail: "אימייל",
      sharePrint: "הדפסה"
    },
    renameDialog: {
      title: "שנה שם רשימה",
      save: "שמור",
      cancel: "ביטול"
    }
  },
  en: {
    languageLabel: "עברית",
    languageAria: "Switch to Hebrew",
    appTitle: "ShoppingList",
    tagline: "Smart lists. Organized shopping.",
    fabLabel: "Tap here to add your list",
    menuTitle: "🛒 Menu",
    welcomeHeading: "Got a list?",
    welcomeSubtitle: "Paste it here. We'll handle the rest.",
    templatesHeading: "No list? Try a sample:",
    addItemButton: "Add Item",
    addItemPlaceholder: "Item name...",
    navigation: {
      list: "Shopping list",
      history: "History",
      compare: "Compare prices",
      notebook: "My Notebook"
    },
    shareTitle: "Shopping List - Agalist",
    textareaPlaceholder: "No items yet. Paste a list here or add items to get started...",
    shareButton: "Share",
    clearAllButton: "Clear all",
    emptyState: "No items yet. Paste a list or add items to get started.",
    clearCompletedButton: "Remove checked items",
    finishButton: "Finish shopping",
    finishDialogTitle: "Trip Summary",
    finishDialogDescription: "Enter the purchase details so we can save them to your history.",
    amountLabel: "Purchase amount (₪)",
    storeLabel: "Grocery chain",
    selectPlaceholder: "Choose a grocery chain",
    customStoreLabel: "Chain name",
    customStorePlaceholder: "Enter a chain name",
    summaryLabel: "Summary:",
    cancel: "Cancel",
    save: "Save purchase",
    progressText: (completed: number, total: number) => `${completed} of ${total} items completed`,
    toasts: {
      itemsAdded: (count: number) => `Added ${count} items`,
      shareSuccess: "List shared successfully!",
      copySuccess: "List copied to clipboard!",
      clearedCompleted: "Checked items removed",
      clearedAll: "List cleared",
      noItems: "No items in the list",
      invalidAmount: "Please enter a valid amount",
      selectStore: "Please choose a store",
      saveSuccess: "Purchase saved successfully!",
      saveError: "Failed to save purchase",
      listSaved: "List saved to notebook!",
      listDeleted: "List deleted",
      listLoaded: "List loaded successfully",
      finishWarning: "Attention: This button is for documenting a completed purchase for tracking statistics. Please mark purchased items to proceed.",
      listRenamed: "List renamed successfully"
    },
    saveListButton: "Save List",
    summarizeButton: "Summarize & Track",
    myListsTitle: "My Notebooks",
    emptyLists: "No saved lists yet",
    itemsCount: (count: number) => `${count} items`,
    moreItems: (count: number) => `+${count} more`,
    saveDialog: {
      title: "Save & Share List",
      nameLabel: "List Name",
      namePlaceholder: "List for...",
      saveButton: "Save to Notebook",
      shareTitle: "Or share the list",
      shareWhatsapp: "WhatsApp",
      shareCopy: "Copy",
      shareCsv: "Export CSV",
      shareEmail: "Email",
      sharePrint: "Print"
    },
    renameDialog: {
      title: "Rename List",
      save: "Save",
      cancel: "Cancel"
    }
  }
};

const heToEnStoreMap = ISRAELI_STORES.reduce((acc, store, index) => {
  acc[store] = ENGLISH_STORES[index];
  return acc;
}, {} as Record<string, string>);

const enToHeStoreMap = ENGLISH_STORES.reduce((acc, store, index) => {
  acc[store] = ISRAELI_STORES[index];
  return acc;
}, {} as Record<string, string>);

export const ShoppingList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [inputText, setInputText] = useState("");
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState("");
  const [selectedStore, setSelectedStore] = useState("");
  const [customStore, setCustomStore] = useState("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [listName, setListName] = useState("");
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renamingListId, setRenamingListId] = useState<string | null>(null);
  const [renamingListName, setRenamingListName] = useState("");
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];
  const storeOptions = language === "he" ? ISRAELI_STORES : ENGLISH_STORES;
  const otherLabel = language === "he" ? "אחר" : "Other";
  const direction = language === "he" ? "rtl" : "ltr";
  const currentTemplates = templates[language];

  const [singleItemInput, setSingleItemInput] = useState("");
  const [singleItemQuantity, setSingleItemQuantity] = useState("1");
  const [singleItemUnit, setSingleItemUnit] = useState<Unit>('units');
  const hasContent = inputText.trim().length > 0 || items.length > 0;

  useEffect(() => {
    setSavedLists(getSavedLists());
  }, []);

  useEffect(() => {
    setSelectedStore(prev => {
      if (!prev) {
        return prev;
      }
      if (language === "en" && heToEnStoreMap[prev]) {
        return heToEnStoreMap[prev];
      }
      if (language === "he" && enToHeStoreMap[prev]) {
        return enToHeStoreMap[prev];
      }
      return prev;
    });
  }, [language]);

  const handlePaste = (text: string) => {
    const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
    const newItems: ShoppingItem[] = lines.map((line, index) => ({
      id: `${Date.now()}-${index}`,
      text: line,
      checked: false,
      quantity: 1,
      unit: 'units'
    }));
    setItems([...items, ...newItems]);
    setInputText("");
    toast.success(t.toasts.itemsAdded(newItems.length));
  };

  const handleTemplateClick = (templateItems: string[]) => {
    const templateText = templateItems.join("\n");
    setInputText(templateText);
  };

  const handleAddSingleItem = () => {
    if (!singleItemInput.trim()) return;

    let quantity = parseFloat(singleItemQuantity);
    if (isNaN(quantity) || quantity < 0) quantity = 1;

    if (singleItemUnit === 'units') {
      quantity = Math.round(quantity);
      if (quantity === 0) quantity = 1;
    }

    const newItem: ShoppingItem = {
      id: `${Date.now()}`,
      text: singleItemInput.trim(),
      checked: false,
      quantity: quantity,
      unit: singleItemUnit
    };
    setItems([...items, newItem]);
    setSingleItemInput("");
    setSingleItemQuantity("1");
    setSingleItemUnit('units');
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    setItems(items.map(item => item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item));
  };

  const updateItemUnit = (id: string, unit: Unit) => {
    setItems(items.map(item => {
      if (item.id === id) {
        let newQuantity = item.quantity;
        if (unit === 'units') {
          newQuantity = Math.max(1, Math.round(item.quantity));
        }
        return { ...item, unit, quantity: newQuantity };
      }
      return item;
    }));
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item => item.id === id ? {
      ...item,
      checked: !item.checked
    } : item));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const shareList = async () => {
    const listText = items.map(item => `${item.checked ? "✓" : "○"} ${item.text}`).join("\n");
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.shareTitle,
          text: listText
        });
        toast.success(t.toasts.shareSuccess);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          copyToClipboard(listText);
        }
      }
    } else {
      copyToClipboard(listText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t.toasts.copySuccess);
  };

  const clearCompleted = () => {
    setItems(items.filter(item => !item.checked));
    toast.success(t.toasts.clearedCompleted);
  };

  const clearAll = () => {
    setItems([]);
    setInputText("");
    toast.success(t.toasts.clearedAll);
  };

  const handleSaveList = () => {
    if (items.length === 0) {
      toast.error(t.toasts.noItems);
      return;
    }
    setListName(new Date().toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' }));
    setIsSaveDialogOpen(true);
  };

  const confirmSaveList = () => {
    const newList: SavedList = {
      id: Date.now().toString(),
      name: listName || new Date().toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' }),
      items: [...items],
      createdAt: new Date().toISOString()
    };
    if (saveList(newList)) {
      setSavedLists(getSavedLists());
      setItems([]);
      setInputText("");
      setIsSaveDialogOpen(false);
      toast.success(t.toasts.listSaved);
    }
  };

  const getListText = () => items.map(item => `${item.checked ? "✓" : "○"} ${item.text} ${item.quantity > 1 ? `(${item.quantity} ${item.unit})` : ''}`).join("\n");

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(getListText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(listName || t.shareTitle);
    const body = encodeURIComponent(getListText());
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Item,Quantity,Unit,Checked\n"
      + items.map(e => `"${e.text}",${e.quantity},${e.unit},${e.checked}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${listName || "shopping_list"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleLoadList = (list: SavedList) => {
    setItems([...list.items]);
    toast.success(t.toasts.listLoaded);
  };

  const handleDeleteList = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteSavedList(id)) {
      setSavedLists(getSavedLists());
      toast.success(t.toasts.listDeleted);
    }
  };

  const handleRenameList = (list: SavedList, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingListId(list.id);
    setRenamingListName(list.name);
    setIsRenameDialogOpen(true);
  };

  const confirmRenameList = () => {
    if (!renamingListId || !renamingListName.trim()) return;

    const listToUpdate = savedLists.find(l => l.id === renamingListId);
    if (!listToUpdate) return;

    const updatedList = { ...listToUpdate, name: renamingListName.trim() };

    if (updateSavedList(updatedList)) {
      setSavedLists(getSavedLists());
      setIsRenameDialogOpen(false);
      setRenamingListId(null);
      setRenamingListName("");
      toast.success(t.toasts.listRenamed);
    }
  };

  const openFinishDialog = () => {
    if (items.length === 0) {
      toast.error(t.toasts.noItems);
      return;
    }
    const checkedCount = items.filter(item => item.checked).length;
    if (checkedCount === 0) {
      toast.warning(t.toasts.finishWarning);
      return;
    }
    setIsFinishDialogOpen(true);
  };

  const handleFinishShopping = () => {
    const amount = parseFloat(totalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(t.toasts.invalidAmount);
      return;
    }
    const store = selectedStore === otherLabel ? customStore : selectedStore;
    if (!store) {
      toast.error(t.toasts.selectStore);
      return;
    }
    const completedItems = items.filter(item => item.checked).length;
    const history = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: [...items],
      totalAmount: amount,
      store,
      completedItems,
      totalItems: items.length
    };
    if (saveShoppingHistory(history)) {
      toast.success(t.toasts.saveSuccess);
      setItems([]);
      setInputText("");
      setTotalAmount("");
      setSelectedStore("");
      setCustomStore("");
      setIsFinishDialogOpen(false);
    } else {
      toast.error(t.toasts.saveError);
    }
  };

  const completedCount = items.filter(item => item.checked).length;
  const progressPercentage = items.length > 0 ? completedCount / items.length * 100 : 0;

  return <div className="min-h-screen pb-32 animate-fade-in" dir={direction} lang={language}>
    {/* Header */}
    <div className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <div className={`flex items-center gap-0.5 text-2xl sm:text-3xl font-bold drop-shadow-md leading-tight ${direction === "rtl" ? "flex-row-reverse" : "flex-row"}`}>
              <span>{t.appTitle}</span>
              <span className="text-3xl sm:text-4xl">🛒</span>
              <span className="text-green-500 text-3xl sm:text-4xl font-bold leading-none">✓</span>
            </div>
            <p className="text-sm sm:text-base text-primary-foreground/90 font-semibold">{t.tagline}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleLanguage} aria-label={t.languageAria} className="h-10 w-10 text-primary-foreground hover:bg-primary-foreground/10 rounded-lg">
              <Globe className="h-5 w-5" />
            </Button>
            {/* Hamburger Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-11 w-11 text-primary-foreground hover:bg-primary-foreground/10">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle className="text-2xl">{t.menuTitle}</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-3 mt-8">
                  <Button
                    onClick={() => {
                      navigate("/");
                      setTimeout(() => {
                        const element = document.getElementById("my-notebooks");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                        }
                      }, 300);
                    }}
                    className="h-14 justify-start text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 border-none shadow-md"
                  >
                    <Book className="ml-3 h-5 w-5" />
                    {t.navigation.notebook}
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/")} className="h-14 justify-start text-lg font-semibold">
                    <Plus className="ml-3 h-5 w-5" />
                    {t.navigation.list}
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/history")} className="h-14 justify-start text-lg font-semibold">
                    <History className="ml-3 h-5 w-5" />
                    {t.navigation.history}
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/compare")} className="h-14 justify-start text-lg font-semibold">
                    <BarChart3 className="ml-3 h-5 w-5" />
                    {t.navigation.compare}
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        {items.length > 0 && <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2.5 bg-primary-foreground/20" />
          <p className="text-sm text-primary-foreground/90 text-center font-medium">
            {t.progressText(completedCount, items.length)}
          </p>
        </div>}
      </div>
    </div>

    {/* Main Content */}
    <div className="max-w-3xl mx-auto px-5 py-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-1">
          {t.welcomeHeading}
        </h2>
        <p className="text-base font-medium text-muted-foreground">
          {t.welcomeSubtitle}
        </p>
      </div>
      {/* Input Area */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
        <Textarea
          placeholder={t.textareaPlaceholder}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          className="min-h-[140px] resize-none bg-background border border-input focus:border-primary text-base touch-manipulation rounded-lg"
        />
        <div className="flex flex-col sm:flex-row gap-2 mt-4 w-full transition-all duration-300 ease-in-out">
          {/* Secondary Buttons Container (33%) */}
          <div className={`flex gap-2 overflow-hidden transition-all duration-300 ease-in-out ${hasContent ? 'w-full sm:w-1/3 opacity-100' : 'w-0 opacity-0'}`}>
            <Button onClick={clearAll} variant="ghost" className="flex-1 text-muted-foreground hover:text-destructive h-11 text-base font-medium rounded-lg">
              <Trash2 className="mr-2 h-5 w-5" />
              {t.clearAllButton}
            </Button>
            <Button onClick={shareList} variant="ghost" className="flex-1 text-muted-foreground h-11 text-base font-medium rounded-lg">
              <Share2 className="mr-2 h-5 w-5" />
              {t.shareButton}
            </Button>
          </div>

          {/* Add Button (66% or 100%) */}
          <Button
            onClick={() => handlePaste(inputText)}
            disabled={!inputText.trim()}
            className={`h-11 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 px-8 rounded-lg shadow-md transition-all duration-300 ease-in-out ${hasContent ? 'w-full sm:w-2/3' : 'w-full'}`}
          >
            <Plus className="mr-2 h-5 w-5" />
            {language === "he" ? "הוסף לרשימה" : "Add to List"}
          </Button>
        </div>
      </div>

      {/* Quick Start Templates - only show when no items */}
      {items.length === 0 && (
        <div className="mb-7">
          <p className="text-sm font-medium text-muted-foreground mb-4 text-center">
            {t.templatesHeading}
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {currentTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateClick(template.items)}
                className="px-4 py-2.5 rounded-lg bg-secondary/40 hover:bg-secondary/60 text-secondary-foreground text-sm font-medium border border-border/40 touch-manipulation transition-colors shadow-sm"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lists Dashboard (My Notebooks) */}
      {savedLists.length > 0 && items.length === 0 && (
        <div className="mb-8" id="my-notebooks">
          <div className="flex items-center gap-2 mb-4">
            <Book className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">{t.myListsTitle}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedLists.map((list) => (
              <div
                key={list.id}
                onClick={() => handleLoadList(list)}
                className="bg-yellow-50 dark:bg-card border border-gray-200 dark:border-border rounded-lg p-4 shadow-md hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
              >
                {/* Notebook styling elements */}
                <div className="flex justify-between items-start mb-3 border-b border-gray-200/60 pb-2">
                  <div>
                    <h4 className="font-bold text-lg text-gray-800 dark:text-foreground font-handwriting">{list.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.itemsCount(list.items.length)}</p>
                  </div>
                  <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity -mr-2 -mt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleRenameList(list, e)}
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteList(list.id, e)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-x-4 gap-y-2 mb-2">
                  {list.items.slice(0, 9).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 min-w-0">
                      {item.checked ? (
                        <CheckSquare className="h-3 w-3 text-black flex-shrink-0" />
                      ) : (
                        <Square className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
                      )}
                      <span className={`truncate text-sm font-medium ${item.checked ? "text-muted-foreground" : "text-gray-700 dark:text-muted-foreground"}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                {list.items.length > 9 && (
                  <div className="text-xs font-handwriting text-primary/80 mt-2 text-end italic">
                    {t.moreItems(list.items.length - 9)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Item input - only show when list has items */}
      {items.length > 0 && (
        <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <Input
            placeholder={t.addItemPlaceholder}
            value={singleItemInput}
            onChange={e => setSingleItemInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAddSingleItem()}
            className="flex-1 h-11 text-base rounded-lg"
          />
          <div className="flex gap-2">
            <Input
              type="number"
              min="0"
              step={singleItemUnit === 'units' ? "1" : "0.1"}
              value={singleItemQuantity}
              onChange={(e) => setSingleItemQuantity(e.target.value)}
              className="w-20 h-11 text-center text-base rounded-lg"
              onBlur={() => {
                let val = parseFloat(singleItemQuantity);
                if (singleItemUnit === 'units' && !isNaN(val)) {
                  setSingleItemQuantity(Math.round(val).toString());
                }
              }}
            />
            <Select
              value={singleItemUnit}
              onValueChange={(val: Unit) => {
                setSingleItemUnit(val);
                if (val === 'units') {
                  const currentQty = parseFloat(singleItemQuantity);
                  if (!isNaN(currentQty)) {
                    setSingleItemQuantity(Math.round(currentQty).toString());
                  }
                }
              }}
            >
              <SelectTrigger className="w-24 h-11 text-sm rounded-lg">
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
            <Button onClick={handleAddSingleItem} disabled={!singleItemInput.trim()} className="h-11 px-5 font-medium rounded-lg shrink-0">
              <Plus className="h-5 w-5" />
              {t.addItemButton}
            </Button>
          </div>
        </div>
      )}

      {/* List Items */}
      {items.length > 0 && (
        <div className="space-y-2.5">
          {items.map((item) => (
            <div key={item.id} className="bg-card rounded-xl shadow-sm border border-border/60 p-4 flex items-center gap-4 group hover:shadow-md hover:border-border transition-all touch-manipulation">
              <Checkbox checked={item.checked} onCheckedChange={() => toggleItem(item.id)} className="h-5 w-5 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all rounded" />
              <span className={`flex-1 text-base leading-relaxed transition-all ${item.checked ? "completed-item" : "text-foreground font-medium"}`}>
                {item.text}
              </span>

              <div className="flex items-center gap-2 border-l border-border/40 pl-3" onClick={(e) => e.stopPropagation()}>
                <QuantityInput
                  value={item.quantity || 1}
                  onChange={(val) => updateItemQuantity(item.id, val)}
                  unit={item.unit}
                />
                <Select
                  value={item.unit || 'units'}
                  onValueChange={(val: Unit) => updateItemUnit(item.id, val)}
                >
                  <SelectTrigger className="w-20 h-9 px-2 text-xs rounded-lg">
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
                <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)} className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive touch-manipulation rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-4.5 w-4.5" />
                </Button>
              </div>
            </div>
          ))}
          <div className="pt-5 flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={handleSaveList} className="w-full sm:flex-1 h-11 font-medium text-base touch-manipulation rounded-lg border-primary/20 hover:bg-primary/5 hover:text-primary">
              <Save className="ml-2 h-5 w-5" />
              {t.saveListButton}
            </Button>
            <Button onClick={openFinishDialog} className="w-full sm:flex-1 h-11 font-semibold bg-primary hover:bg-primary/90 text-base touch-manipulation rounded-lg shadow-sm">
              <ClipboardList className="ml-2 h-5 w-5" />
              {t.summarizeButton}
            </Button>
          </div>
        </div>
      )}
    </div>

    <Dialog open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t.finishDialogTitle}</DialogTitle>
          <DialogDescription className="text-base">
            {t.finishDialogDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-base font-semibold">
              {t.amountLabel}
            </Label>
            <Input id="amount" type="number" placeholder="0.00" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} className="h-12 text-lg" min="0" step="0.01" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="store" className="text-base font-semibold">
              {t.storeLabel}
            </Label>
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="h-12 text-lg">
                <SelectValue placeholder={t.selectPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {storeOptions.map(store => <SelectItem key={store} value={store} className="text-lg">
                  {store}
                </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {selectedStore === otherLabel && <div className="space-y-2">
            <Label htmlFor="customStore" className="text-base font-semibold">
              {t.customStoreLabel}
            </Label>
            <Input id="customStore" type="text" placeholder={t.customStorePlaceholder} value={customStore} onChange={e => setCustomStore(e.target.value)} className="h-12 text-lg" />
          </div>}
          <div className="bg-muted/50 rounded-lg p-4 space-y-1">
            <p className="text-sm text-muted-foreground">{t.summaryLabel}</p>
            <p className="text-lg font-semibold">
              {t.progressText(items.filter(item => item.checked).length, items.length)}
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setIsFinishDialogOpen(false)} className="h-11 px-6">
            {t.cancel}
          </Button>
          <Button onClick={handleFinishShopping} className="h-11 px-6 bg-success hover:bg-success/90">
            <CheckCircle2 className="ml-2 h-4 w-4" />
            {t.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{t.saveDialog.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Save Section */}
          <div className="space-y-3">
            <Label htmlFor="listName" className="text-base font-semibold">
              {t.saveDialog.nameLabel}
            </Label>
            <div className="flex gap-2">
              <Input
                id="listName"
                value={listName}
                onChange={e => setListName(e.target.value)}
                placeholder={t.saveDialog.namePlaceholder}
                className="h-11 text-lg"
              />
              <Button onClick={confirmSaveList} className="h-11 px-6 bg-primary hover:bg-primary/90 font-bold shrink-0">
                <Save className="mr-2 h-4 w-4" />
                {t.saveDialog.saveButton}
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t.saveDialog.shareTitle}
              </span>
            </div>
          </div>

          {/* Share Grid */}
          <div className="grid grid-cols-5 gap-2">
            <Button variant="outline" onClick={handleShareWhatsApp} className="flex flex-col items-center justify-center h-20 gap-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors" title={t.saveDialog.shareWhatsapp}>
              <MessageCircle className="h-6 w-6" />
              <span className="text-xs font-medium hidden sm:inline">{t.saveDialog.shareWhatsapp}</span>
            </Button>
            <Button variant="outline" onClick={() => copyToClipboard(getListText())} className="flex flex-col items-center justify-center h-20 gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors" title={t.saveDialog.shareCopy}>
              <Copy className="h-6 w-6" />
              <span className="text-xs font-medium hidden sm:inline">{t.saveDialog.shareCopy}</span>
            </Button>
            <Button variant="outline" onClick={handleExportCSV} className="flex flex-col items-center justify-center h-20 gap-2 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors" title={t.saveDialog.shareCsv}>
              <FileSpreadsheet className="h-6 w-6" />
              <span className="text-xs font-medium hidden sm:inline">{t.saveDialog.shareCsv}</span>
            </Button>
            <Button variant="outline" onClick={handleShareEmail} className="flex flex-col items-center justify-center h-20 gap-2 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-colors" title={t.saveDialog.shareEmail}>
              <Mail className="h-6 w-6" />
              <span className="text-xs font-medium hidden sm:inline">{t.saveDialog.shareEmail}</span>
            </Button>
            <Button variant="outline" onClick={handlePrint} className="flex flex-col items-center justify-center h-20 gap-2 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300 transition-colors" title={t.saveDialog.sharePrint}>
              <Printer className="h-6 w-6" />
              <span className="text-xs font-medium hidden sm:inline">{t.saveDialog.sharePrint}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t.renameDialog.title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={renamingListName}
            onChange={(e) => setRenamingListName(e.target.value)}
            className="h-11 text-lg"
            onKeyDown={(e) => e.key === "Enter" && confirmRenameList()}
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
            {t.renameDialog.cancel}
          </Button>
          <Button onClick={confirmRenameList}>
            {t.renameDialog.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
};