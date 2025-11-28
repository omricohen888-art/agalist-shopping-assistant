import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Share2, Trash2, Plus, CheckCircle2, History, Menu, BarChart3, Globe, Save, ClipboardList, Book, Square, CheckSquare, Printer, Mail, FileSpreadsheet, Copy, Pencil, X, ClipboardPaste, Info, ShoppingCart, Check, Volume2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { SmartAutocompleteInput, SmartAutocompleteInputRef } from "@/components/SmartAutocompleteInput";
import { SavedListCard } from "@/components/SavedListCard";
import { toast } from "sonner";
import { ShoppingItem, ISRAELI_STORES, UNITS, Unit, SavedList } from "@/types/shopping";
import { saveShoppingHistory, saveList, getSavedLists, deleteSavedList, updateSavedList } from "@/utils/storage";
import { useLanguage, Language } from "@/hooks/use-language";
import { translations } from "@/utils/translations";

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
      className="w-14 h-9 px-1 text-center text-sm rounded-lg"
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
  const location = useLocation();
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
  const [customTemplates, setCustomTemplates] = useState<Array<{ id: string, name: string, items: string[] }>>([]);
  const [isCreateTemplateDialogOpen, setIsCreateTemplateDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateItems, setNewTemplateItems] = useState("");
  const autocompleteInputRef = useRef<SmartAutocompleteInputRef>(null);
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];
  const storeOptions = language === "he" ? ISRAELI_STORES : ENGLISH_STORES;
  const otherLabel = language === "he" ? "אחר" : "Other";
  const direction = language === "he" ? "rtl" : "ltr";
  const currentTemplates = templates[language];

  const [singleItemInput, setSingleItemInput] = useState("");
  const [singleItemQuantity, setSingleItemQuantity] = useState("1");
  const [singleItemUnit, setSingleItemUnit] = useState<Unit>('units');
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [showBulkInput, setShowBulkInput] = useState(false); // NEW STATE
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAddAnimation, setShowAddAnimation] = useState(false);
  const [showListSuccess, setShowListSuccess] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const hasContent = inputText.trim().length > 0 || items.length > 0;
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSavedLists(getSavedLists());
  }, []);

  // Load custom templates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('customTemplates');
    if (saved) {
      try {
        setCustomTemplates(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading custom templates:', error);
      }
    }
  }, []);

  // Save custom templates to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('customTemplates', JSON.stringify(customTemplates));
  }, [customTemplates]);

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

  useEffect(() => {
    if (location.state?.loadList) {
      handleLoadList(location.state.loadList);
      // Clear state to avoid reloading on refresh - optional, but good practice
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handlePaste = (text: string) => {
    const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
    const newItems: ShoppingItem[] = lines.map((line, index) => ({
      id: `${Date.now()}-${index}`,
      text: line,
      checked: false,
      quantity: 1,
      unit: 'units'
    }));

    if (activeListId) {
      // Edit Mode: Prepend items, clear input, NO success animation
      setItems(prev => [...newItems, ...prev]);
      setInputText("");
      // Optional: Scroll to top to see new items
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Show success toast
      toast.success(language === 'he' ? "נוסף בהצלחה לרשימה!" : "Added successfully!");
    } else {
      // Home Page Mode: Create new list, show success animation
      setItems([...items, ...newItems]);
      setInputText("");

      // Show success animation
      setShowListSuccess(true);
      setTimeout(() => setShowListSuccess(false), 1000);

      // Transition to Edit Mode
      const newListId = Date.now().toString();
      const currentDate = new Date().toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const defaultListName = language === 'he'
        ? `רשימה חדשה - ${currentDate}`
        : `New List - ${currentDate}`;

      setActiveListId(newListId);
      setListName(defaultListName);

      // Auto-focus the title input after a short delay to allow state update
      setTimeout(() => {
        titleInputRef.current?.focus?.();
      }, 100);
    }
  };

  const handleTemplateClick = (templateItems: string[]) => {
    const templateText = templateItems.join("\n");
    setInputText(templateText);
  };

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim() || !newTemplateItems.trim()) {
      toast.error(language === 'he' ? 'אנא מלא את כל השדות' : 'Please fill all fields');
      return;
    }

    const items = newTemplateItems.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (items.length === 0) {
      toast.error(language === 'he' ? 'אנא הוסף לפחות פריט אחד' : 'Please add at least one item');
      return;
    }

    const newTemplate = {
      id: `custom-${Date.now()}`,
      name: newTemplateName.trim(),
      items: items
    };

    setCustomTemplates(prev => [...prev, newTemplate]);
    setNewTemplateName("");
    setNewTemplateItems("");
    setIsCreateTemplateDialogOpen(false);
    toast.success(language === 'he' ? 'התבנית נוצרה בהצלחה!' : 'Template created successfully!');
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

    setItems([newItem, ...items]); // Prepend item
    setSingleItemInput("");
    setSingleItemQuantity("1");
    setSingleItemUnit('units');

    // Show add animation
    setShowAddAnimation(true);
    setTimeout(() => setShowAddAnimation(false), 600);

    // Show success toast
    toast.success(language === 'he' ? "נוסף בהצלחה לרשימה!" : "Added successfully!");

    // Keep focus on input for rapid fire entry
    setTimeout(() => {
      autocompleteInputRef.current?.focus();
    }, 0);
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
    setActiveListId(null);
    toast.success(t.toasts.clearedAll);
  };

  const handleSaveList = () => {
    if (items.length === 0) {
      toast.error(t.toasts.noItems);
      return;
    }

    const isSavedList = activeListId && savedLists.some(list => list.id === activeListId);

    // If editing an existing saved list, update it directly
    if (isSavedList) {
      const existingList = savedLists.find(list => list.id === activeListId);
      if (existingList) {
        const updatedList = {
          ...existingList,
          name: listName || existingList.name,
          items: [...items]
        };
        if (updateSavedList(updatedList)) {
          setSavedLists(getSavedLists());
          toast.success(t.toasts.listUpdated);
        }
      }
      return;
    }

    // New draft - open modal to ask for name (listName should already be set from edit mode)
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
      setActiveListId(null); // Exit edit mode
      setListName(""); // Reset list name
      setIsSaveDialogOpen(false);
      toast.success(t.toasts.listSaved);

      // Show confirmation animation
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 1200);

      // Smooth scroll to My Notebook section
      setTimeout(() => {
        const notebookSection = document.getElementById('my-notebooks');
        if (notebookSection) {
          notebookSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
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
    setActiveListId(list.id);
    setListName(list.name);
    toast.success(t.toasts.listLoaded);
  };

  const exitEditMode = () => {
    // Stop TTS if active
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setActiveListId(null);
    setItems([]);
    setInputText("");
    setListName("");
  };

  const handleReadListAloud = () => {
    // If already speaking, stop
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Get unchecked items
    const uncheckedItems = items.filter(item => !item.checked);

    // Check if there are items to read
    if (uncheckedItems.length === 0) {
      toast.error(language === 'he' ? "אין פריטים להקראה" : "No items to read");
      return;
    }

    // Construct the text to read
    let textToRead = listName ? `${listName}. ` : '';
    
    uncheckedItems.forEach((item) => {
      const unitText = item.unit === 'units' 
        ? (language === 'he' ? 'יחידות' : 'units')
        : item.unit;
      
      if (item.quantity > 1) {
        textToRead += `${item.quantity} ${unitText} ${item.text}. `;
      } else {
        textToRead += `${item.text}. `;
      }
    });

    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = language === 'he' ? 'he-IL' : 'en-US';
    
    // Set speaking state
    setIsSpeaking(true);

    // Reset state when finished
    utterance.onend = () => {
      setIsSpeaking(false);
    };

    // Handle errors
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error(language === 'he' ? "שגיאה בהפעלת הקראה" : "Error reading list");
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
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

  const handleToggleSavedItem = (listId: string, itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const list = savedLists.find(l => l.id === listId);
    if (!list) return;

    const updatedItems = list.items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );

    const updatedList = { ...list, items: updatedItems };
    if (updateSavedList(updatedList)) {
      setSavedLists(getSavedLists());
    }
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

  return (
    <div className="min-h-screen pb-32 animate-fade-in" dir={direction} lang={language}>
      {/* List Creation Confirmation Animation */}
      {showConfirmation && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-[fade-in_0.2s_ease-out,scale-in_0.3s_ease-out]">
          <div className="bg-[#22c55e] text-white rounded-full p-4 shadow-[0_0_20px_rgba(34,197,94,0.5)] animate-pulse">
            <CheckCircle2 className="h-12 w-12" strokeWidth={3} />
          </div>
        </div>
      )}

      {/* Add Item Animation */}
      {showAddAnimation && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div
            className="text-6xl font-black animate-[fade-in_0.15s_ease-out,fade-out_0.3s_ease-out_0.3s]"
            style={{
              background: 'linear-gradient(135deg, #FACC15 0%, #22c55e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 2px 8px rgba(250, 204, 21, 0.4))',
              animation: 'float-up 0.6s ease-out',
            }}
          >
            +
          </div>
        </div>
      )}
      {/* List Created Success Animation */}
      {showListSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200" />

          {/* Success Card */}
          <div className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-4 animate-in zoom-in-90 slide-in-from-bottom-10 duration-300 ease-out">
            {/* Icon Wrapper */}
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/30 rounded-full animate-ping" />
              <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full p-4 shadow-lg shadow-green-500/30 relative z-10">
                <CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 animate-in zoom-in spin-in-12 duration-300" strokeWidth={3} />
              </div>
            </div>

            {/* Text Content */}
            <div className="text-center space-y-1 animate-in slide-in-from-bottom-4 fade-in duration-400 delay-100 fill-mode-both">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                {language === 'he' ? '!הרשימה מוכנה' : 'List Ready!'}
              </h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {language === 'he' ? 'עוברים לעריכה...' : 'Moving to edit...'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-stone-200 dark:bg-zinc-900 text-black dark:text-white shadow-sm sticky top-0 z-10 border-b-2 border-black/10 dark:border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center w-full mb-3 px-4">
            {/* Title Section - Never truncate */}
            <div className="flex flex-col gap-0.5 flex-shrink-0">
              <div className={`flex items-center gap-0.5 text-xl sm:text-2xl md:text-3xl font-black drop-shadow-sm leading-tight whitespace-nowrap ${direction === "rtl" ? "flex-row-reverse" : "flex-row"}`}>
                <span className="flex-shrink-0">{t.appTitle}</span>
                <div className={`flex items-center flex-shrink-0 ${direction === "rtl" ? "mr-1" : "ml-1"}`}>
                  <span className="text-black dark:text-white text-xl sm:text-2xl md:text-3xl font-black leading-none">✓</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-black dark:text-white flex-shrink-0"
                  >
                    <circle cx="8" cy="21" r="1" />
                    <circle cx="19" cy="21" r="1" />
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    <path d="M16.5 7.5H5.9" />
                    <path d="M16.5 10.5H6.7" />
                    <path d="M16.5 13.5H7.5" />
                  </svg>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-black/80 dark:text-white/80 font-bold mt-0.5 whitespace-nowrap">{t.tagline}</p>
            </div>

            {/* Actions Section - Never shrink */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Button variant="ghost" size="icon" onClick={toggleLanguage} aria-label={t.languageAria} className="h-10 w-10 p-2 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 rounded-full">
                <Globe className="h-6 w-6" />
              </Button>
              {/* Hamburger Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 p-2 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 rounded-full">
                    <Menu className="h-7 w-7" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[340px] bg-white border-l-2 border-black text-black p-6">
                  <div className="flex flex-row items-center gap-2 mb-6 mt-2">
                    <h2 className="text-3xl font-black text-black tracking-tight">
                      {t.menuTitle}
                    </h2>
                    <div className="relative flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-black" />
                      <Check className="absolute -top-1 -right-1 h-3 w-3 text-black font-bold" />
                    </div>
                  </div>
                  <nav className="flex flex-col mt-4">
                    <Button
                      onClick={() => {
                        navigate("/");
                        exitEditMode();
                      }}
                      className="w-full py-4 h-auto bg-white text-black font-black text-2xl uppercase border-2 border-black hover:bg-yellow-400 hover:scale-[1.02] transition-transform mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <Plus className="mr-2 h-8 w-8 stroke-[3]" />
                      {t.navigation.list}
                    </Button>

                    {/* Menu Items (Sticker Buttons) */}
                    <Button
                      onClick={() => navigate("/notebook")}
                      variant="ghost"
                      className="w-full justify-start p-4 mb-3 h-auto rounded-lg border-2 border-transparent transition-all duration-200 text-xl font-black tracking-tight text-black hover:bg-white hover:text-black hover:border-black hover:-translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <Book className="mr-3 h-6 w-6" />
                      {t.navigation.notebook}
                    </Button>

                    <Button
                      onClick={() => navigate("/history")}
                      variant="ghost"
                      className="w-full justify-start p-4 mb-3 h-auto rounded-lg border-2 border-transparent transition-all duration-200 text-xl font-black tracking-tight text-black hover:bg-white hover:text-black hover:border-black hover:-translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <History className="mr-3 h-6 w-6" />
                      {t.navigation.history}
                    </Button>

                    <Button
                      onClick={() => navigate("/compare")}
                      variant="ghost"
                      className="w-full justify-start p-4 mb-3 h-auto rounded-lg border-2 border-transparent transition-all duration-200 text-xl font-black tracking-tight text-black hover:bg-white hover:text-black hover:border-black hover:-translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <BarChart3 className="mr-3 h-6 w-6" />
                      {t.navigation.compare}
                    </Button>

                    <Button
                      onClick={() => navigate("/about")}
                      variant="ghost"
                      className="w-full justify-start p-4 mb-3 h-auto rounded-lg border-2 border-transparent transition-all duration-200 text-xl font-black tracking-tight text-black hover:bg-white hover:text-black hover:border-black hover:-translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <Info className="mr-3 h-6 w-6" />
                      {t.navigation.about}
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div >

      {
        items.length > 0 && <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2.5 bg-primary-foreground/20" />
          <p className="text-sm text-primary-foreground/90 text-center font-medium">
            {t.progressText(completedCount, items.length)}
          </p>
        </div>
      }

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-2 md:px-8 py-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-1">
            {activeListId
              ? "מעולה! הרשימה מוכנה לעבודה 📝"
              : t.welcomeHeading
            }
          </h2>
          <p className="text-base font-medium text-muted-foreground">
            {activeListId
              ? "תנו לרשימה שם, עדכנו כמויות ושמרו אותה לפנקס."
              : t.welcomeSubtitle
            }
          </p>
        </div>

        {
          activeListId && (
            <div className="flex justify-between items-center w-full mb-4">
              <input
                ref={titleInputRef}
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="flex-1 bg-transparent text-xl md:text-3xl font-extrabold border-none outline-none px-1 py-1 select-text focus:cursor-text hover:cursor-text transition border-b-2 border-transparent focus:border-gray-400 hover:border-gray-300 focus:outline-none focus:ring-0 truncate"
                placeholder={language === 'he' ? 'שם הרשימה...' : 'List name...'}
                style={{ minWidth: 0 }}
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleReadListAloud}
                  title={isSpeaking ? (language === 'he' ? 'עצור הקראה' : 'Stop reading') : (language === 'he' ? 'הקרא רשימה' : 'Read list aloud')}
                  className="w-8 h-8 md:w-9 md:h-9 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full p-1.5 md:p-2 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
                  type="button"
                  aria-label={isSpeaking ? (language === 'he' ? 'עצור הקראה' : 'Stop reading') : (language === 'he' ? 'הקרא רשימה' : 'Read list aloud')}
                >
                  {isSpeaking ? (
                    <Square className="h-4 w-4 md:h-5 md:w-5 text-gray-900 dark:text-white" />
                  ) : (
                    <Volume2 className="h-4 w-4 md:h-5 md:w-5 text-gray-900 dark:text-white" />
                  )}
                </button>
                <button
                  onClick={exitEditMode}
                  title={t.exitEditMode}
                  className="w-8 h-8 md:w-9 md:h-9 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full p-1.5 md:p-2 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                  type="button"
                  aria-label={t.exitEditMode}
                >
                  <X className="h-4 w-4 md:h-5 md:w-5 text-gray-900 dark:text-white" />
                </button>
              </div>
            </div>
          )
        }

        {/* Edit Mode Logic */}
        {
          activeListId ? (
            <>
              {/* Trigger Button */}
              <div className="flex items-baseline gap-2 mb-4">
                <button
                  type="button"
                  className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 text-base md:text-lg font-bold focus:outline-none hover:underline px-1 py-0.5 rounded transition"
                  onClick={() => setShowBulkInput(v => !v)}
                  aria-expanded={showBulkInput}
                  tabIndex={0}
                >
                  <ClipboardPaste className="h-5 w-5 md:h-6 md:w-6" />
                  <span>
                    {language === "he"
                      ? "רוצה להדביק רשימה ארוכה?"
                      : "Want to paste a long list?"}
                  </span>
                </button>
              </div>

              {/* Bulk Input Card (Notebook Style) - Now ABOVE Single Item Row */}
              {showBulkInput && (
                <div className="relative bg-[#FEFCE8] border-2 border-black rounded-xl p-6 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)'
                  }}
                >
                  {/* Spiral Binding Effect */}
                  <div className={`absolute top-0 bottom-4 ${language === 'he' ? '-right-3' : '-left-3'} w-8 flex flex-col justify-evenly py-2 z-20 pointer-events-none`}>
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="relative h-4 w-full">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#1a1a1a] rounded-full shadow-inner" />
                        <div className={`absolute top-1/2 ${language === 'he' ? 'left-1/2' : 'right-1/2'} w-6 h-1.5 bg-zinc-400 rounded-full transform ${language === 'he' ? '-translate-x-1/2 rotate-12' : 'translate-x-1/2 -rotate-12'} shadow-sm`} />
                      </div>
                    ))}
                  </div>

                  <Textarea
                    placeholder={t.textareaPlaceholder}
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    className="min-h-[140px] resize-none bg-transparent border-none focus:ring-0 text-base !text-black !dark:text-black touch-manipulation rounded-lg leading-[31px] -mt-1 shadow-none focus-visible:ring-0 !placeholder:text-gray-500 !dark:placeholder:text-gray-500"
                    style={{
                      lineHeight: '31px',
                      background: 'transparent'
                    }}
                  />
                  <div className="flex flex-col sm:flex-row gap-2 mt-4 w-full transition-all duration-300 ease-in-out relative z-10">
                    <div className={`flex gap-2 overflow-hidden p-1 transition-all duration-300 ease-in-out ${hasContent ? 'w-full sm:w-1/3 opacity-100' : 'w-0 opacity-0'}`}>
                      <Button onClick={clearAll} variant="ghost" className="flex-1 text-gray-900 hover:bg-gray-200 hover:text-red-700 h-11 text-base font-medium rounded-full">
                        <Trash2 className="mr-2 h-5 w-5" />
                        {t.clearAllButton}
                      </Button>
                      <Button onClick={shareList} variant="ghost" className="flex-1 text-gray-900 hover:bg-gray-200 hover:text-black h-11 text-base font-medium rounded-full">
                        <Share2 className="mr-2 h-5 w-5" />
                        {t.shareButton}
                      </Button>
                    </div>
                    <Button
                      onClick={() => handlePaste(inputText)}
                      disabled={!inputText.trim()}
                      className={`h-11 text-base font-bold bg-black text-yellow-400 hover:bg-gray-900 px-8 rounded-lg shadow-md transition-all duration-300 ease-in-out border-2 border-transparent hover:border-yellow-400 ${hasContent ? 'w-full sm:w-2/3' : 'w-full'}`}
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      {language === "he" ? "הוסף פריטים" : "Add Items"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Single Item Row */}
              <div className="bg-[#FEFCE8] rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black p-3 md:p-4 mb-6 w-full relative z-50 overflow-visible">
                {/* Decorative "Tape" */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-white/30 dark:bg-white/10 rotate-[-2deg] border-l border-r border-white/40 dark:border-white/20 backdrop-blur-[1px]" />

                <div className="flex w-full items-center gap-2 flex-nowrap relative z-10">
                  <SmartAutocompleteInput
                    ref={autocompleteInputRef}
                    placeholder={t.addItemPlaceholder}
                    value={singleItemInput}
                    onChange={setSingleItemInput}
                    onKeyDown={e => e.key === "Enter" && handleAddSingleItem()}
                    className="flex-1 min-w-0 text-sm relative border-2 border-black rounded-lg shadow-sm focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-white !text-black !dark:text-black"
                  />
                  <Input
                    type="number"
                    min="0"
                    step={singleItemUnit === 'units' ? "1" : "0.1"}
                    value={singleItemQuantity}
                    onChange={(e) => setSingleItemQuantity(e.target.value)}
                    className="w-[3.5rem] text-center text-xs rounded-lg shrink-0 px-0 border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-white !text-black !dark:text-black"
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
                    <SelectTrigger className="w-[4.5rem] text-xs rounded-lg shrink-0 px-1 border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-white text-center justify-center [&>span]:w-full [&>span]:text-center [&>svg]:hidden !text-black !dark:text-black">
                      <span className="truncate w-full text-center">
                        {(() => {
                          const u = UNITS.find(u => u.value === (singleItemUnit || 'units'));
                          return u ? (language === 'he' ? u.labelHe : u.labelEn) : '';
                        })()}
                      </span>
                    </SelectTrigger>
                    <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      {UNITS.map(u => (
                        <SelectItem key={u.value} value={u.value}>
                          {language === 'he' ? u.labelHe : u.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div title={t.addItemButton}>
                    <Button
                      onClick={handleAddSingleItem}
                      disabled={!singleItemInput.trim()}
                      className="w-10 h-10 p-0 shrink-0 grid place-items-center bg-yellow-500 text-white rounded-lg border-2 border-transparent hover:bg-yellow-600 hover:scale-105 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:bg-stone-300 disabled:text-stone-500"
                    >
                      <Plus className="h-6 w-6" strokeWidth={3} />
                    </Button>
                  </div>
                </div>
              </div>


            </>
          ) : (
            // Notebook Style Input
            <div className="relative bg-[#FEFCE8] border-2 border-black rounded-xl p-6 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              style={{
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)'
              }}
            >
              {/* Spiral Binding Effect */}
              <div className={`absolute top-0 bottom-4 ${language === 'he' ? '-right-3' : '-left-3'} w-8 flex flex-col justify-evenly py-2 z-20 pointer-events-none`}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="relative h-4 w-full">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#1a1a1a] rounded-full shadow-inner" />
                    <div className={`absolute top-1/2 ${language === 'he' ? 'left-1/2' : 'right-1/2'} w-6 h-1.5 bg-zinc-400 rounded-full transform ${language === 'he' ? '-translate-x-1/2 rotate-12' : 'translate-x-1/2 -rotate-12'} shadow-sm`} />
                  </div>
                ))}
              </div>

              <Textarea
                placeholder={t.textareaPlaceholder}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="min-h-[140px] resize-none bg-transparent border-none focus:ring-0 text-base !text-black !dark:text-black touch-manipulation rounded-lg leading-[31px] -mt-1 shadow-none focus-visible:ring-0 !placeholder:text-gray-500 !dark:placeholder:text-gray-500"
                style={{
                  lineHeight: '31px',
                  background: 'transparent'
                }}
              />
              <div className="flex flex-col sm:flex-row gap-2 mt-4 w-full transition-all duration-300 ease-in-out relative z-10">
                {/* Secondary buttons */}
                <div className={`flex gap-2 overflow-hidden p-1 transition-all duration-300 ease-in-out ${hasContent ? 'w-full sm:w-1/3 opacity-100' : 'w-0 opacity-0'}`}>
                  <Button onClick={clearAll} variant="ghost" className="flex-1 text-gray-900 hover:bg-gray-200 hover:text-red-700 h-11 text-base font-medium rounded-full">
                    <Trash2 className="mr-2 h-5 w-5" />
                    {t.clearAllButton}
                  </Button>
                  <Button onClick={shareList} variant="ghost" className="flex-1 text-gray-900 hover:bg-gray-200 hover:text-black h-11 text-base font-medium rounded-full">
                    <Share2 className="mr-2 h-5 w-5" />
                    {t.shareButton}
                  </Button>
                </div>
                {/* Add button */}
                <Button
                  onClick={() => handlePaste(inputText)}
                  disabled={!inputText.trim()}
                  className={`h-11 text-base font-bold bg-black text-yellow-400 hover:bg-gray-900 px-8 rounded-lg shadow-md transition-all duration-300 ease-in-out border-2 border-transparent hover:border-yellow-400 ${hasContent ? 'w-full sm:w-2/3' : 'w-full'}`}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  {language === "he" ? "הוסף רשימה" : "Add List"}
                </Button>
              </div>
            </div>
          )
        }

        {/* Quick Start Templates */}
        {
          items.length === 0 && (
            <div className="mb-7">
              <p className="text-sm font-medium text-muted-foreground mb-4 text-center">
                {t.templatesHeading}
              </p>
              <div className="flex flex-wrap justify-center gap-2.5">
                {customTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateClick(template.items)}
                    className="px-4 py-2.5 rounded-lg bg-white text-black text-sm font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all touch-manipulation"
                  >
                    {template.name}
                  </button>
                ))}

                {currentTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateClick(template.items)}
                    className="px-4 py-2.5 rounded-lg bg-white text-black text-sm font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all touch-manipulation"
                  >
                    {template.name}
                  </button>
                ))}

                <button
                  onClick={() => setIsCreateTemplateDialogOpen(true)}
                  className="px-4 py-2.5 rounded-lg bg-yellow-400 text-black text-sm font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all touch-manipulation flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {language === 'he' ? 'צור תבנית' : 'Create Template'}
                </button>
              </div>
            </div>
          )
        }

        {/* Recent Lists Preview */}
        {
          items.length === 0 && savedLists.length > 0 && (
            <div className="mb-12 border-t-2 border-black/5 pt-8 max-w-5xl mx-auto px-4">
              <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <History className="h-5 w-5 text-yellow-500" />
                  {t.recentListsHeading}
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/notebook")}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                >
                  {t.viewAllListsButton}
                  {language === 'he' ? <div className="mr-1 rotate-180">➜</div> : <div className="ml-1">➜</div>}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedLists
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 6)
                  .map((list, index) => (
                    <div key={list.id} className="h-[280px]">
                      <SavedListCard
                        list={list}
                        index={index}
                        language={language}
                        t={t}
                        onLoad={handleLoadList}
                        onDelete={(id) => {
                          if (deleteSavedList(id)) {
                            setSavedLists(getSavedLists());
                            toast.success(t.toasts.listDeleted);
                          }
                        }}
                        onToggleItem={(listId, itemId) => {
                          const list = savedLists.find(l => l.id === listId);
                          if (!list) return;
                          const updatedItems = list.items.map(item =>
                            item.id === itemId ? { ...item, checked: !item.checked } : item
                          );
                          const updatedList = { ...list, items: updatedItems };
                          if (updateSavedList(updatedList)) {
                            setSavedLists(getSavedLists());
                          }
                        }}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )
        }

        {/* Items List */}
        {
          items.length > 0 && (
            <div className="space-y-2.5">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black p-3 flex flex-row items-center justify-between flex-nowrap w-full gap-3 group hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all touch-manipulation animate-in slide-in-from-top-4 fade-in duration-300">
                  <Checkbox checked={item.checked} onCheckedChange={() => toggleItem(item.id)} className="h-6 w-6 border-2 border-black flex-shrink-0 data-[state=checked]:bg-black data-[state=checked]:text-yellow-400 transition-all rounded-md" />
                  <span className={`flex-grow text-lg leading-relaxed transition-all text-right truncate min-w-0 font-bold ${item.checked ? "line-through text-gray-400 decoration-2" : "text-black"}`}>
                    {item.text}
                  </span>

                  <div className="flex items-center gap-2 flex-shrink-0 border-l-2 border-black/10 pl-2" onClick={(e) => e.stopPropagation()}>
                    <QuantityInput
                      value={item.quantity || 1}
                      onChange={(val) => updateItemQuantity(item.id, val)}
                      unit={item.unit}
                    />
                    <Select
                      value={item.unit || 'units'}
                      onValueChange={(val: Unit) => updateItemUnit(item.id, val)}
                    >
                      <SelectTrigger className="w-16 h-9 px-1 text-xs rounded-lg border-2 border-black/20 hover:border-black focus:border-black transition-colors text-center justify-center [&>span]:w-full [&>span]:text-center [&>svg]:hidden">
                        <span className="truncate w-full text-center">
                          {(() => {
                            const u = UNITS.find(u => u.value === (item.unit || 'units'));
                            return u ? (language === 'he' ? u.labelHe : u.labelEn) : '';
                          })()}
                        </span>
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        {UNITS.map(u => (
                          <SelectItem key={u.value} value={u.value}>
                            {language === 'he' ? u.labelHe : u.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)} className="h-9 w-9 flex-shrink-0 hover:bg-red-100 text-red-500 hover:text-red-600 touch-manipulation rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="pt-6 flex flex-col sm:flex-row gap-4">
                {(() => {
                  const isSavedList = activeListId && savedLists.some(list => list.id === activeListId);
                  return (
                    <Button variant="outline" onClick={handleSaveList} className="w-full sm:flex-1 h-12 font-bold text-base touch-manipulation rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-y-[0px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-green-500 text-white hover:bg-green-600 hover:text-white border-green-700">
                      <Save className="ml-2 h-5 w-5" />
                      {isSavedList ? t.saveChangesButton : t.saveListButton}
                    </Button>
                  );
                })()}
                <Button onClick={openFinishDialog} className="w-full sm:flex-1 h-12 font-bold bg-yellow-400 text-black hover:bg-yellow-500 text-base touch-manipulation rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-y-[0px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <ClipboardList className="ml-2 h-5 w-5" />
                  {t.summarizeButton}
                </Button>
              </div>
            </div>
          )
        }

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
                <Button variant="outline" onClick={handleShareWhatsApp} className="flex flex-col items-center justify-center h-20 gap-2 hover:bg-green-50 hover:border-green-200 transition-colors" title={t.saveDialog.shareWhatsapp}>
                  <FaWhatsapp className="h-6 w-6 text-green-500" />
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

        {/* Create Template Dialog */}
        <Dialog open={isCreateTemplateDialogOpen} onOpenChange={setIsCreateTemplateDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {language === 'he' ? 'יצירת תבנית חדשה' : 'Create New Template'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Template Name */}
              <div className="space-y-3">
                <Label htmlFor="templateName" className="text-base font-semibold">
                  {language === 'he' ? 'שם התבנית' : 'Template Name'}
                </Label>
                <Input
                  id="templateName"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder={language === 'he' ? 'למשל: הקנייה הקבועה שלי' : 'e.g., My Regular Shopping'}
                  className="h-11 text-lg"
                />
              </div>

              {/* Template Items */}
              <div className="space-y-3">
                <Label htmlFor="templateItems" className="text-base font-semibold">
                  {language === 'he' ? 'פריטי התבנית' : 'Template Items'}
                </Label>
                <Textarea
                  id="templateItems"
                  value={newTemplateItems}
                  onChange={(e) => setNewTemplateItems(e.target.value)}
                  placeholder={language === 'he' ? 'הדבק או הקלד את רשימת הקניות שלך, כל פריט בשורה נפרדת' : 'Paste or type your shopping list, one item per line'}
                  className="min-h-[120px] text-base resize-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsCreateTemplateDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button onClick={handleCreateTemplate} className="bg-primary hover:bg-primary/90 font-bold">
                <Save className="mr-2 h-4 w-4" />
                {language === 'he' ? 'שמור תבנית' : 'Save Template'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div >
    </div >
  );
};
