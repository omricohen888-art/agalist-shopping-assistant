import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Share2, Trash2, Plus, Minus, CheckCircle2, History, BarChart3, Globe, Save, ClipboardList, Book, Square, CheckSquare, Printer, Mail, FileSpreadsheet, Copy, Pencil, X, ClipboardPaste, Info, ShoppingCart, Check, Volume2, RotateCcw, Mic, Camera, PenLine, Search, User, ChevronDown } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { SmartAutocompleteInput, SmartAutocompleteInputRef } from "@/components/SmartAutocompleteInput";
import { SavedListCard } from "@/components/SavedListCard";
import { EditListModal } from "@/components/EditListModal";
import { CompletedTripCard } from "@/components/CompletedTripCard";
import { HistoryDetailModal } from "@/components/HistoryDetailModal";
import { StandardizedInput } from "@/components/ui/standardized-input";
import { StandardizedTextarea } from "@/components/ui/standardized-textarea";
import { HandwritingCanvas } from "@/components/HandwritingCanvas";
import { toast } from "sonner";
import { ShoppingItem, ShoppingHistory, ISRAELI_STORES, UNITS, Unit, SavedList } from "@/types/shopping";
import { ISRAELI_PRODUCTS } from "@/data/israeliProducts";
import { ShoppingListItem } from "@/components/ShoppingListItem";
import { GroupedShoppingList } from "@/components/GroupedShoppingList";
import { SortableTemplates } from "@/components/SortableTemplates";
import { SortModeToggle } from "@/components/SortModeToggle";
import { StartShoppingButton, SaveListButton } from "@/components/StartShoppingButton";
import { WelcomePrompt } from "@/components/WelcomePrompt";
import WelcomeNameModal from "@/components/WelcomeNameModal";
import { sortByCategory, detectCategory, getCategoryInfo, CategoryKey, CATEGORY_ORDER } from "@/utils/categorySort";
import { processInput, RateLimiter } from "@/utils/security";
import { createWorker } from 'tesseract.js';
interface NotepadItem {
  id: string;
  text: string;
  isChecked: boolean;
  quantity?: number;
  unit?: Unit;
}
import { saveShoppingHistory, getShoppingHistory, deleteShoppingHistory, saveList, getSavedLists, deleteSavedList, updateSavedList } from "@/utils/storage";
import { useGlobalLanguage, Language } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { translations } from "@/utils/translations";
import { parseItemWithUnit, formatItemDisplay } from "@/utils/itemParser";
import { useTheme } from "next-themes";
const ENGLISH_STORES = ["Shufersal", "Rami Levy", "Victory", "Yenot Bitan", "Machsanei HaShuk", "Super-Pharm", "Shufersal Deal", "AM:PM", "Yohannoff", "Mega Ba'Ir", "Tiv Taam", "Cofix", "Hazi Hinam", "Other"] as const;

// Template data for quick start
const templates = {
  he: [{
    id: "grocery",
    name: "השלמות למכולת",
    items: ["חלב", "לחם", "קוטג'", "ביצים", "עגבניות"]
  }, {
    id: "hiking",
    name: "ציוד לטיול",
    items: ["פינג'אן", "קפה שחור", "אוהל", "שק שינה", "בקבוקי מים", "קרם הגנה", "פנס", "מפית לחות"]
  }, {
    id: "tech",
    name: "אלקטרוניקה וגאדג'טים",
    items: ["כבל HDMI", "סוללות AA", "מטען USB-C", "עכבר", "מקלדת", "אוזניות"]
  }, {
    id: "bbq",
    name: "על האש",
    items: ["פחמים", "סטייקים", "קבב", "חומוס", "פיתות", "סלטים", "מלקחיים", "מלח גס"]
  }, {
    id: "cleaning",
    name: "ניקיון ופארם",
    items: ["אקונומיקה", "נוזל רצפות", "שמפו", "משחת שיניים", "אבקת כביסה", "סבון ידיים", "נייר טואלט"]
  }, {
    id: "family",
    name: "קנייה משפחתית גדולה",
    items: ["שניצל", "פסטה", "אורז", "מלפפונים", "פלפלים", "מילקי", "גבינה צהובה", "במבה", "ביסלי", "פיצה קפואה", "חזה עוף", "שמן", "קורנפלקס", "נייר טואלט", "יוגורט", "לחם", "חלב"]
  }],
  en: [{
    id: "grocery",
    name: "Small Run",
    items: ["Milk", "Bread", "Cottage Cheese", "Eggs", "Tomatoes"]
  }, {
    id: "hiking",
    name: "Hiking/Camping",
    items: ["Finjan", "Black Coffee", "Tent", "Sleeping Bag", "Water bottles", "Sunscreen", "Flashlight", "Wet wipes"]
  }, {
    id: "tech",
    name: "Tech & Gadgets",
    items: ["HDMI Cable", "AA Batteries", "USB-C Charger", "Mouse", "Keyboard", "Headphones"]
  }, {
    id: "bbq",
    name: "BBQ",
    items: ["Charcoal", "Steaks", "Kebabs", "Hummus", "Pita bread", "Salads", "Tongs", "Coarse salt"]
  }, {
    id: "cleaning",
    name: "Cleaning & Pharmacy",
    items: ["Bleach", "Floor cleaner", "Shampoo", "Toothpaste", "Laundry detergent", "Hand soap", "Toilet paper"]
  }, {
    id: "family",
    name: "Big Family Shop",
    items: ["Schnitzel", "Pasta", "Rice", "Cucumbers", "Peppers", "Milky", "Yellow Cheese", "Bamba", "Bisli", "Frozen Pizza", "Chicken breast", "Oil", "Cereal", "Toilet paper", "Yogurt", "Bread", "Milk"]
  }]
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
  const [customTemplates, setCustomTemplates] = useState<Array<{
    id: string;
    name: string;
    items: string[];
  }>>([]);
  const [isCreateTemplateDialogOpen, setIsCreateTemplateDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateItems, setNewTemplateItems] = useState("");
  const autocompleteInputRef = useRef<SmartAutocompleteInputRef>(null);
  const singleItemInputRef = useRef<HTMLInputElement>(null);
  const notepadInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const rateLimiter = useRef(new RateLimiter());
  const {
    language,
    setLanguage
  } = useGlobalLanguage();
  const {
    theme,
    setTheme
  } = useTheme();
  const { user } = useAuth();
  const t = translations[language];
  const storeOptions = language === "he" ? ISRAELI_STORES : ENGLISH_STORES;
  const otherLabel = language === "he" ? "אחר" : "Other";
  const direction = language === "he" ? "rtl" : "ltr";
  const currentTemplates = templates[language];
  const [singleItemInput, setSingleItemInput] = useState("");
  const [singleItemQuantity, setSingleItemQuantity] = useState("1");
  const [singleItemUnit, setSingleItemUnit] = useState<Unit>('units');
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'single' | 'bulk'>('single'); // Tab mode: Single vs Bulk
  const [bulkInputText, setBulkInputText] = useState(""); // Textarea content
  const bulkInputRef = useRef<HTMLTextAreaElement>(null); // Textarea ref
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAddAnimation, setShowAddAnimation] = useState(false);
  const [showListSuccess, setShowListSuccess] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showPasteFeedback, setShowPasteFeedback] = useState(false);
  const [notepadItems, setNotepadItems] = useState<NotepadItem[]>([]);
  const [isSmartSort, setIsSmartSort] = useState(false); // Default to original order
  const [collapsedNotepadCategories, setCollapsedNotepadCategories] = useState<Set<CategoryKey>>(new Set());
  const [bulkPreviewItems, setBulkPreviewItems] = useState<Array<{
    id: string;
    text: string;
    category: CategoryKey;
  }>>([]);
  const [showSortHint, setShowSortHint] = useState(false); // Feature discovery hint visibility
  const sortHintTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Hint auto-dismiss timeout

  // Shopping History States
  const [shoppingHistory, setShoppingHistory] = useState<ShoppingHistory[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<ShoppingHistory | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Edit List Modal States
  const [editingList, setEditingList] = useState<SavedList | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Smart Input States
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isHandwritingOpen, setIsHandwritingOpen] = useState(false);
  const [isWelcomeNameModalOpen, setIsWelcomeNameModalOpen] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Show welcome name modal after successful first-time login
  useEffect(() => {
    if (user) {
      const hasSeenWelcome = localStorage.getItem(`welcome_name_shown_${user.id}`);
      if (!hasSeenWelcome) {
        // Small delay to let the page load first
        const timer = setTimeout(() => {
          setIsWelcomeNameModalOpen(true);
          localStorage.setItem(`welcome_name_shown_${user.id}`, 'true');
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  // Update refs array when notepadItems changes
  useEffect(() => {
    notepadInputRefs.current = notepadInputRefs.current.slice(0, notepadItems.length);
  }, [notepadItems]);

  // Feature Discovery: Show Smart Sort hint once per user
  useEffect(() => {
    const hasSeenHint = localStorage.getItem('hasSeenSortHint');

    // Show hint if: items exist AND Smart Sort is ON AND user hasn't seen it before
    if (notepadItems.length > 0 && isSmartSort && !hasSeenHint) {
      setShowSortHint(true);

      // Mark as seen
      localStorage.setItem('hasSeenSortHint', 'true');

      // Auto-dismiss after 6 seconds
      if (sortHintTimeoutRef.current) {
        clearTimeout(sortHintTimeoutRef.current);
      }
      sortHintTimeoutRef.current = setTimeout(() => {
        setShowSortHint(false);
      }, 6000);
    }
    return () => {
      if (sortHintTimeoutRef.current) {
        clearTimeout(sortHintTimeoutRef.current);
      }
    };
  }, [notepadItems.length, isSmartSort]);
  const hasContent = inputText.trim().length > 0 || items.length > 0 || notepadItems.length > 0;
  const showPaste = notepadItems.length === 0 || notepadItems.length === 1 && notepadItems[0].text === '';
  const titleInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setSavedLists(getSavedLists());
    setShoppingHistory(getShoppingHistory());
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
  const handleAddBulkItems = () => {
    // Parse the textarea content
    const lines = bulkInputText.split('\n').map(line => {
      // Remove bullet point and trim
      return line.replace(/^•\s*/, '').trim();
    }).filter(line => line.length > 0);
    if (lines.length === 0) {
      toast.warning(language === 'he' ? 'אנא הדבק פריטים' : 'Please paste items');
      return;
    }

    // Create shopping items from lines
    let newItems: ShoppingItem[] = lines.map((line, index) => ({
      id: `${Date.now()}-${index}`,
      text: line,
      checked: false,
      quantity: 1,
      unit: 'units' as Unit
    }));

    // Apply smart sort if enabled
    if (isSmartSort) {
      newItems = sortByCategory(newItems);
    }
    if (activeListId) {
      // Edit Mode: Add items to existing list
      setItems(prev => [...newItems, ...prev]);
      setBulkInputText(""); // Clear textarea
      setBulkPreviewItems([]); // Clear preview
      setInputMode('single'); // Reset to single mode
      toast.success(language === 'he' ? `נוספו ${lines.length} פריטים לרשימה!` : `Added ${lines.length} items!`);
    } else {
      // Home Page Mode: Create new list
      setItems([...items, ...newItems]);
      setBulkInputText(""); // Clear textarea
      setBulkPreviewItems([]); // Clear preview

      // Create new list
      const newListId = Date.now().toString();
      const currentDate = new Date().toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const defaultListName = language === 'he' ? `רשימה חדשה - ${currentDate}` : `New List - ${currentDate}`;
      setActiveListId(newListId);
      setListName(defaultListName);

      // Auto-focus the title input
      setTimeout(() => {
        titleInputRef.current?.focus?.();
      }, 100);
    }
  };

  // Update preview items when bulk input or sort mode changes
  useEffect(() => {
    const lines = bulkInputText.split('\n').map(line => line.replace(/^•\s*/, '').trim()).filter(line => line.length > 0);
    if (lines.length === 0) {
      setBulkPreviewItems([]);
      return;
    }
    let previewItems = lines.map((line, index) => ({
      id: `preview-${index}`,
      text: line,
      category: detectCategory(line)
    }));
    if (isSmartSort) {
      previewItems = [...previewItems].sort((a, b) => {
        const indexA = CATEGORY_ORDER.indexOf(a.category);
        const indexB = CATEGORY_ORDER.indexOf(b.category);
        return indexA - indexB;
      });
    }
    setBulkPreviewItems(previewItems);
  }, [bulkInputText, isSmartSort]);
  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText.trim()) {
        toast.warning(language === 'he' ? 'לוח הזיכרון ריק' : 'Clipboard is empty');
        return;
      }

      // Parse clipboard content: split by newlines or commas
      let lines = clipboardText.split(/[\n,]/).map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length === 0) {
        toast.warning(language === 'he' ? 'לא נמצא טקסט לתוקף' : 'No valid text found');
        return;
      }

      // Format with bullets
      const bulletedLines = lines.map(line => {
        const cleanLine = line.replace(/^•\s*/, '');
        return `• ${cleanLine}`;
      });

      // If textarea is empty, add bullets. Otherwise append to existing content.
      let newText = '';
      if (bulkInputText.trim().length === 0) {
        newText = bulletedLines.join('\n');
      } else {
        newText = bulkInputText + '\n' + bulletedLines.join('\n');
      }
      setBulkInputText(newText);

      // Focus and position cursor at end
      setTimeout(() => {
        if (bulkInputRef.current) {
          bulkInputRef.current.focus();
          bulkInputRef.current.selectionStart = newText.length;
          bulkInputRef.current.selectionEnd = newText.length;
        }
      }, 0);
      toast.success(language === 'he' ? `הודבקו ${lines.length} פריטים` : `Pasted ${lines.length} items`);
    } catch (error) {
      console.error('Clipboard error:', error);
      toast.error(language === 'he' ? 'שגיאה בהדבקה מלוח הזיכרון' : 'Error reading clipboard');
    }
  };
  const handleStartShopping = () => {
    // Convert notepad items to shopping items
    let newItems: ShoppingItem[] = notepadItems
      .filter(item => item.text.trim() !== '')
      .map((notepadItem, index) => ({
        id: `${Date.now()}-${index}`,
        text: notepadItem.text,
        checked: notepadItem.isChecked,
        quantity: notepadItem.quantity || 1,
        unit: (notepadItem.unit || 'units') as Unit
      }));

    // Apply smart sort if enabled
    if (isSmartSort) {
      newItems = sortByCategory(newItems);
    }

    if (newItems.length === 0) {
      toast.error(language === 'he' ? 'אנא הוסף פריטים לרשימה' : 'Please add items to the list');
      return;
    }

    // Generate unique list ID
    const newListId = Date.now().toString();
    const currentDate = new Date().toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const defaultListName = listName || (language === 'he' ? `רשימת קניות - ${currentDate}` : `Shopping List - ${currentDate}`);

    // Save list data to localStorage for ShoppingMode to access
    const listData = {
      id: newListId,
      name: defaultListName,
      items: newItems,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(`activeList_${newListId}`, JSON.stringify(listData));

    // Navigate to shopping mode
    navigate(`/shopping/${newListId}`);
  };
  const toggleNotepadItem = (id: string) => {
    setNotepadItems(prev => prev.map(item => item.id === id ? {
      ...item,
      isChecked: !item.isChecked
    } : item));
  };
  // Smart split by spaces: only split if ALL words are known products
  const smartSplitBySpaces = (line: string): string[] => {
    const words = line.split(/\s+/).filter(w => w.length > 0);
    
    // If single word or empty, return as is
    if (words.length <= 1) return [line.trim()];
    
    // Check if ALL words are known products (case-insensitive)
    const allWordsAreKnown = words.every(word => 
      ISRAELI_PRODUCTS.some(product => 
        product.toLowerCase() === word.toLowerCase()
      )
    );
    
    // Only split if ALL words are known products
    if (allWordsAreKnown) {
      return words;
    }
    
    // Otherwise keep as single item (e.g., "חלב תנובה 1 ליטר")
    return [line.trim()];
  };

  const handleQuickPaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText.trim()) {
        // Split by newlines first
        const lines = clipboardText.split("\n").map(line => line.trim()).filter(line => line.length > 0);

        // For each line, split by commas if they exist, then apply smart space splitting
        const allItems: string[] = [];
        lines.forEach(line => {
          if (line.includes(',')) {
            // Split by comma and filter out empty items
            const commaItems = line.split(',').map(item => item.trim()).filter(item => item.length > 0);
            // Apply smart split to each comma-separated item
            commaItems.forEach(item => {
              allItems.push(...smartSplitBySpaces(item));
            });
          } else {
            // Apply smart split to the whole line
            allItems.push(...smartSplitBySpaces(line));
          }
        });

        // Process items with security checks
        const processedItems: string[] = [];
        let hasErrors = false;
        for (const item of allItems) {
          const result = processInput(item, notepadItems, rateLimiter.current);
          if (result.canAdd && result.isValid) {
            processedItems.push(result.processedText);
          } else if (result.error && !hasErrors) {
            // Only show the first error to avoid spam
            toast.error(result.error);
            hasErrors = true;
          }
        }
        if (processedItems.length === 0) {
          toast.error(language === 'he' ? "לא נמצאו פריטים תקינים" : "No valid items found");
          return;
        }

        // Create notepad items with unchecked status
        const newNotepadItems: NotepadItem[] = processedItems.map((item, index) => ({
          id: `notepad-${Date.now()}-${index}`,
          text: item,
          isChecked: false
        }));
        setNotepadItems(prev => [...prev, ...newNotepadItems]);

        // Record the add for rate limiting (only once per paste operation)
        rateLimiter.current.recordAdd();
        setShowPasteFeedback(true);
        setTimeout(() => setShowPasteFeedback(false), 1500);
        toast.success(language === 'he' ? "הודבק בהצלחה!" : "Pasted successfully!");
      }
    } catch (error) {
      toast.error(language === 'he' ? "שגיאה בהדבקה מהלוח" : "Error pasting from clipboard");
    }
  };
  const handleTemplateClick = (templateItems: string[]) => {
    let newNotepadItems: NotepadItem[] = templateItems.map((item, index) => ({
      id: `template-${Date.now()}-${index}`,
      text: item,
      isChecked: false
    }));

    // Apply smart sort if enabled
    if (isSmartSort) {
      newNotepadItems = [...newNotepadItems].sort((a, b) => {
        const categoryA = detectCategory(a.text);
        const categoryB = detectCategory(b.text);
        return CATEGORY_ORDER.indexOf(categoryA) - CATEGORY_ORDER.indexOf(categoryB);
      });
    }
    setNotepadItems(newNotepadItems);
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

    // Add to activeTemplates in localStorage (used by SortableTemplates)
    try {
      const saved = localStorage.getItem('activeTemplates');
      const activeTemplates = saved ? JSON.parse(saved) : currentTemplates;
      const updatedTemplates = [...activeTemplates, newTemplate];
      localStorage.setItem('activeTemplates', JSON.stringify(updatedTemplates));
    } catch (error) {
      console.error('Error saving template:', error);
    }

    // Also save to customTemplates for backward compatibility
    setCustomTemplates(prev => [...prev, newTemplate]);
    setNewTemplateName("");
    setNewTemplateItems("");
    setIsCreateTemplateDialogOpen(false);
    toast.success(language === 'he' ? 'התבנית נוצרה בהצלחה!' : 'Template created successfully!');
  };
  const handleAddSingleItem = () => {
    if (!singleItemInput.trim()) return;

    // Process input with security checks
    const result = processInput(singleItemInput, items, rateLimiter.current);
    if (!result.canAdd) {
      toast.error(result.error || 'Failed to add item');
      return;
    }
    if (!result.isValid) {
      toast.error(result.error || 'Invalid input');
      return;
    }
    let quantity = parseFloat(singleItemQuantity);
    if (isNaN(quantity) || quantity < 0) quantity = 1;
    if (singleItemUnit === 'units') {
      quantity = Math.round(quantity);
      if (quantity === 0) quantity = 1;
    }
    const newItem: ShoppingItem = {
      id: `${Date.now()}`,
      text: result.processedText,
      checked: false,
      quantity: quantity,
      unit: singleItemUnit
    };
    setItems([newItem, ...items]); // Prepend item
    setSingleItemInput("");
    setSingleItemQuantity("1");
    setSingleItemUnit('units');

    // Record the add for rate limiting
    rateLimiter.current.recordAdd();

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
    setItems(items.map(item => item.id === id ? {
      ...item,
      quantity: Math.max(0, quantity)
    } : item));
  };
  const updateItemUnit = (id: string, unit: Unit) => {
    setItems(items.map(item => {
      if (item.id === id) {
        let newQuantity = item.quantity;
        if (unit === 'units') {
          newQuantity = Math.max(1, Math.round(item.quantity));
        }
        return {
          ...item,
          unit,
          quantity: newQuantity
        };
      }
      return item;
    }));
  };
  const playSuccessSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // Helper to play a single note
      const playNote = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine'; // Soft wave
        osc.frequency.value = freq;

        // Smooth envelope (No clicking)
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.1, startTime + 0.01); // Attack
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Decay

        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      const now = ctx.currentTime;
      // Play a "Major Third" interval (Happy sound)
      // Note 1: High C (880 Hz)
      playNote(880, now, 0.3);
      // Note 2: E (1108 Hz) - slightly delayed creates a "Sparkle" effect
      playNote(1108, now + 0.05, 0.3);
    } catch (e) {
      console.error("Audio error", e);
    }
  };
  const toggleItem = (id: string) => {
    // Play success sound
    playSuccessSound();
    setItems(prevItems => {
      const updatedItems = prevItems.map(item => item.id === id ? {
        ...item,
        checked: !item.checked
      } : item);

      // Auto-sort: unchecked items first, then checked items
      return updatedItems.sort((a, b) => {
        if (a.checked === b.checked) return 0;
        return a.checked ? 1 : -1; // unchecked items come first
      });
    });
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
    console.log("=== SAVE LIST DEBUG ===");
    console.log("Save button clicked!");
    console.log("Notepad items:", notepadItems);
    console.log("Notepad items count:", notepadItems.length);
    console.log("Main items array:", items);
    console.log("Main items count:", items.length);

    // CRITICAL FIX: Check notepadItems first (since button is in notepad section)
    let itemsToSave = notepadItems;
    if (itemsToSave.length === 0) {
      console.warn("BLOCKED: No notepad items to save");
      toast.error(t.toasts.noItems);
      return;
    }

    // Convert notepadItems to ShoppingItem format for storage
    const convertedItems: ShoppingItem[] = itemsToSave.map(notepadItem => ({
      id: notepadItem.id,
      text: notepadItem.text,
      checked: notepadItem.isChecked,
      quantity: notepadItem.quantity || 1,
      unit: (notepadItem.unit || 'units') as Unit,
      store: undefined
    }));
    console.log("✓ Converted items for saving:", convertedItems);
    console.log("Items count to save:", convertedItems.length);
    const isSavedList = activeListId && savedLists.some(list => list.id === activeListId);
    console.log("Is this a saved list being edited?:", isSavedList);
    console.log("ActiveListId:", activeListId);
    console.log("SavedLists:", savedLists);

    // If editing an existing saved list, update it directly
    if (isSavedList) {
      console.log("Branch: Updating existing saved list");
      const existingList = savedLists.find(list => list.id === activeListId);
      if (existingList) {
        const updatedList = {
          ...existingList,
          name: listName || existingList.name,
          items: convertedItems
        };
        console.log("Updated list object:", updatedList);
        if (updateSavedList(updatedList)) {
          setSavedLists(getSavedLists());
          toast.success(t.toasts.listUpdated);
          console.log("List updated successfully!");
        }
      }
      return;
    }

    // New draft - save directly without opening dialog
    console.log("Branch: Creating new list - saving directly...");
    
    // Create list with auto-generated name (date)
    const autoName = listName || new Date().toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    
    const newList: SavedList = {
      id: Date.now().toString(),
      name: autoName,
      items: convertedItems,
      createdAt: new Date().toISOString()
    };
    
    console.log("New list object being saved:", newList);
    if (saveList(newList)) {
      console.log("✓ saveList returned true - save successful");
      setSavedLists(getSavedLists());
      setItems([]);
      setInputText("");
      setActiveListId(null);
      setListName("");
      toast.success(language === 'he' ? '✓ הרשימה נשמרה בפנקס שלי!' : '✓ List saved to My Notebook!');
      
      // Show confirmation animation
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 1200);
      
      // Smooth scroll to My Notebook section
      setTimeout(() => {
        const notebookSection = document.getElementById('my-notebooks');
        if (notebookSection) {
          notebookSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } else {
      console.error("✗ saveList returned false - save failed");
      toast.error(language === 'he' ? 'שגיאה בשמירת הרשימה' : 'Error saving list');
    }
  };
  const confirmSaveList = () => {
    console.log("=== CONFIRM SAVE LIST DEBUG ===");
    console.log("Current items to save:", items);
    console.log("Items count:", items.length);
    console.log("List name:", listName);
    const newList: SavedList = {
      id: Date.now().toString(),
      name: listName || new Date().toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }),
      items: [...items],
      createdAt: new Date().toISOString()
    };
    console.log("New list object being saved:", newList);
    console.log("Calling saveList function...");
    if (saveList(newList)) {
      console.log("✓ saveList returned true - save successful");
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
          notebookSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 500);
    } else {
      console.error("✗ saveList returned false - save failed");
    }
    console.log("=== END CONFIRM SAVE DEBUG ===");
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
    const csvContent = "data:text/csv;charset=utf-8," + "Item,Quantity,Unit,Checked\n" + items.map(e => `"${e.text}",${e.quantity},${e.unit},${e.checked}`).join("\n");
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
  const handleEditSavedList = (list: SavedList) => {
    setEditingList(list);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedList = (updatedList: SavedList) => {
    setSavedLists(getSavedLists());
    toast.success(t.toasts.listSaved);
  };

  const handleLoadList = (list: SavedList) => {
    setItems([...list.items]);
    setActiveListId(list.id);
    setListName(list.name);
    toast.success(t.toasts.listLoaded);
  };

  const handleCopyAllItems = async () => {
    // Use notepadItems for the main list view
    const itemsToCopy = notepadItems.filter(item => item.text.trim() !== '');
    if (itemsToCopy.length === 0) {
      toast.error(language === 'he' ? 'אין פריטים להעתקה' : 'No items to copy');
      return;
    }

    const getQuantityUnit = (item: NotepadItem) => {
      if (!item.quantity || (item.quantity <= 1 && item.unit === 'units')) return '';
      const unitLabel = UNITS.find(u => u.value === item.unit);
      const unitText = language === 'he' ? unitLabel?.labelHe : unitLabel?.labelEn;
      return `${item.quantity} ${unitText}`;
    };

    const checkedItems = itemsToCopy.filter(item => item.isChecked);
    const uncheckedItems = itemsToCopy.filter(item => !item.isChecked);

    const formatItem = (item: NotepadItem) => {
      const checkbox = item.isChecked ? '✓' : '☐';
      const quantityUnit = getQuantityUnit(item);
      const quantityText = quantityUnit ? ` (${quantityUnit})` : '';
      return `${checkbox} ${item.text}${quantityText}`;
    };

    let listText = '';
    
    if (uncheckedItems.length > 0) {
      listText += uncheckedItems.map(formatItem).join('\n');
    }
    
    if (checkedItems.length > 0) {
      if (uncheckedItems.length > 0) {
        listText += '\n\n' + (language === 'he' ? '── הושלמו ──' : '── Done ──') + '\n';
      }
      listText += checkedItems.map(formatItem).join('\n');
    }

    const header = `📋 ${listName || (language === 'he' ? 'רשימת קניות' : 'Shopping List')}`;
    const divider = '─'.repeat(20);
    const summary = language === 'he' 
      ? `\n\n📊 סה"כ: ${itemsToCopy.length} פריטים | ✓ ${checkedItems.length} הושלמו`
      : `\n\n📊 Total: ${itemsToCopy.length} items | ✓ ${checkedItems.length} done`;

    const fullText = `${header}\n${divider}\n${listText}${summary}`;

    try {
      await navigator.clipboard.writeText(fullText);
      toast.success(language === 'he' ? 'הרשימה הועתקה ללוח' : 'List copied to clipboard');
    } catch (err) {
      toast.error(language === 'he' ? 'לא ניתן להעתיק' : 'Could not copy');
    }
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
  const resetChecks = () => {
    if (items && items.length > 0) {
      setItems(items.map(item => ({
        ...item,
        checked: false
      })));
      toast.success(language === 'he' ? 'הרשימה אופסה מחדש' : 'List reset');
    }
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
    uncheckedItems.forEach(item => {
      const unitText = item.unit === 'units' ? language === 'he' ? 'יחידות' : 'units' : item.unit;
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

  // Voice Dictation Function
  const handleVoiceDictation = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error(language === 'he' ? 'הדפדפן שלך לא תומך בהקלטת קול' : 'Your browser does not support voice recording');
      return;
    }
    if (isVoiceRecording) {
      // Stop recording
      setIsVoiceRecording(false);
      return;
    }

    // Start recording
    setIsVoiceRecording(true);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'he' ? 'he-IL' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = event => {
      const transcript = event.results[0][0].transcript;
      const items = transcript.split(/\s*(?:and|,|\s)\s*/).filter(item => item.trim().length > 0);
      if (items.length > 0) {
        const newNotepadItems: NotepadItem[] = items.map((item, index) => ({
          id: `voice-${Date.now()}-${index}`,
          text: item.trim(),
          isChecked: false
        }));
        setNotepadItems(prev => [...prev, ...newNotepadItems]);
        toast.success(language === 'he' ? `התווספו ${items.length} פריטים מהקול` : `Added ${items.length} items from voice`);
      }
    };
    recognition.onerror = event => {
      console.error('Speech recognition error:', event.error);
      toast.error(language === 'he' ? 'שגיאה בהקלטת קול' : 'Voice recording error');
    };
    recognition.onend = () => {
      setIsVoiceRecording(false);
    };
    recognition.start();
  };

  // Camera OCR Function
  const handleCameraOCR = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsProcessingImage(true);
    toast.info(language === 'he' ? 'מפענח רשימה...' : 'Processing list...');
    try {
      const worker = await createWorker();
      await (worker as any).loadLanguage('heb+eng');
      await (worker as any).initialize('heb+eng');
      const {
        data: {
          text
        }
      } = await (worker as any).recognize(file);
      await (worker as any).terminate();

      // Split text by newlines and filter empty lines
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length > 0) {
        const newNotepadItems: NotepadItem[] = lines.map((line, index) => ({
          id: `ocr-${Date.now()}-${index}`,
          text: line,
          isChecked: false
        }));
        setNotepadItems(prev => [...prev, ...newNotepadItems]);
        toast.success(language === 'he' ? `התווספו ${lines.length} פריטים מהתמונה` : `Added ${lines.length} items from image`);
      } else {
        toast.warning(language === 'he' ? 'לא נמצא טקסט בתמונה' : 'No text found in image');
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error(language === 'he' ? 'שגיאה בעיבוד התמונה' : 'Error processing image');
    } finally {
      setIsProcessingImage(false);
      // Reset file input
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
    }
  };

  // Handwriting Recognition Function
  const handleHandwritingSubmit = async (imageData: string) => {
    setIsProcessingImage(true);
    toast.info(language === 'he' ? 'מזהה כתב יד...' : 'Recognizing handwriting...');
    try {
      const worker = await createWorker();
      await (worker as any).loadLanguage('heb+eng');
      await (worker as any).initialize('heb+eng');
      const {
        data: {
          text
        }
      } = await (worker as any).recognize(imageData);
      await (worker as any).terminate();

      // Split text by newlines and filter empty lines
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length > 0) {
        const newNotepadItems: NotepadItem[] = lines.map((line, index) => ({
          id: `handwriting-${Date.now()}-${index}`,
          text: line,
          isChecked: false
        }));
        setNotepadItems(prev => [...prev, ...newNotepadItems]);
        toast.success(language === 'he' ? `התווספו ${lines.length} פריטים מהכתב` : `Added ${lines.length} items from handwriting`);
      } else {
        toast.warning(language === 'he' ? 'לא נמצא טקסט' : 'No text found');
      }
    } catch (error) {
      console.error('Handwriting error:', error);
      toast.error(language === 'he' ? 'שגיאה בעיבוד כתב יד' : 'Error processing handwriting');
    } finally {
      setIsProcessingImage(false);
      setIsHandwritingOpen(false);
    }
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
    const updatedItems = list.items.map(item => item.id === itemId ? {
      ...item,
      checked: !item.checked
    } : item);
    const updatedList = {
      ...list,
      items: updatedItems
    };
    if (updateSavedList(updatedList)) {
      setSavedLists(getSavedLists());
    }
  };
  const confirmRenameList = () => {
    if (!renamingListId || !renamingListName.trim()) return;
    const listToUpdate = savedLists.find(l => l.id === renamingListId);
    if (!listToUpdate) return;
    const updatedList = {
      ...listToUpdate,
      name: renamingListName.trim()
    };
    if (updateSavedList(updatedList)) {
      setSavedLists(getSavedLists());
      setIsRenameDialogOpen(false);
      setRenamingListId(null);
      setRenamingListName("");
      toast.success(t.toasts.listRenamed);
    }
  };

  // Helper function to render grouped notepad items
  const renderGroupedNotepadItems = () => {
    const groups = new Map<CategoryKey, NotepadItem[]>();

    // Initialize all categories
    for (const key of CATEGORY_ORDER) {
      groups.set(key, []);
    }

    // Categorize items
    for (const item of notepadItems) {
      const category = detectCategory(item.text);
      const group = groups.get(category) || [];
      group.push(item);
      groups.set(category, group);
    }

    // Remove empty categories
    for (const key of CATEGORY_ORDER) {
      if (groups.get(key)?.length === 0) {
        groups.delete(key);
      }
    }
    return <div dir={language === 'he' ? 'rtl' : 'ltr'}>
        {Array.from(groups.entries()).map(([categoryKey, categoryItems]) => {
        const categoryInfo = getCategoryInfo(categoryKey);
        const isCollapsed = collapsedNotepadCategories.has(categoryKey);
        return <div key={categoryKey}>
              {/* Category Header - Medium size */}
              <div 
                className="flex items-center gap-1.5 py-1 px-1 cursor-pointer select-none hover:bg-muted/30 rounded-lg"
                onClick={() => {
                  const newSet = new Set(collapsedNotepadCategories);
                  if (newSet.has(categoryKey)) {
                    newSet.delete(categoryKey);
                  } else {
                    newSet.add(categoryKey);
                  }
                  setCollapsedNotepadCategories(newSet);
                }}
              >
                <ChevronDown className={`h-3 w-3 text-muted-foreground/50 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} strokeWidth={2} />
                <span className="text-sm">{categoryInfo.icon}</span>
                <span className="text-xs font-medium text-muted-foreground">
                  {language === 'he' ? categoryInfo.nameHe : categoryInfo.nameEn}
                </span>
                <span className="text-[10px] text-primary font-semibold">({categoryItems.length})</span>
              </div>

              {/* Items - Medium size */}
              {!isCollapsed && categoryItems.map((item) => {
                const actualIndex = notepadItems.findIndex(i => i.id === item.id);
                return <div key={item.id} className="flex items-center gap-2 py-1 px-1">
                  <Checkbox 
                    checked={item.isChecked} 
                    onCheckedChange={() => toggleNotepadItem(item.id)} 
                    className="h-5 w-5 flex-shrink-0" 
                  />
                  <input
                    ref={el => { notepadInputRefs.current[actualIndex] = el; }}
                    type="text"
                    value={item.text}
                    onChange={e => setNotepadItems(prev => prev.map(i => i.id === item.id ? { ...i, text: e.target.value } : i))}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const newItem: NotepadItem = { id: `notepad-${Date.now()}`, text: '', isChecked: false, quantity: 1, unit: 'units' };
                        setNotepadItems(prev => {
                          const newItems = [...prev];
                          newItems.splice(actualIndex + 1, 0, newItem);
                          return newItems;
                        });
                        setTimeout(() => { 
                          const inputEl = notepadInputRefs.current[actualIndex + 1];
                          if (inputEl) {
                            inputEl.focus();
                            inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
                          }
                        }, 50);
                      } else if (e.key === 'Backspace' && item.text === '' && actualIndex > 0) {
                        e.preventDefault();
                        setNotepadItems(prev => prev.filter(i => i.id !== item.id));
                        setTimeout(() => {
                          const input = notepadInputRefs.current[actualIndex - 1];
                          if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
                        }, 0);
                      }
                    }}
                    placeholder={language === 'he' ? 'פריט...' : 'Item...'}
                    className={`flex-1 text-sm bg-transparent border-0 p-0 focus:outline-none focus:ring-0 ${item.isChecked ? 'line-through text-muted-foreground/60' : 'text-foreground'}`}
                  />
                  {/* Quantity - Compact */}
                  <div className="flex items-center gap-0.5 text-xs text-muted-foreground/60 flex-shrink-0">
                    <button onClick={() => setNotepadItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: Math.max(1, (i.quantity || 1) - 1) } : i))} className="w-5 h-5 flex items-center justify-center hover:text-foreground">
                      <Minus className="h-2.5 w-2.5" />
                    </button>
                    <span className="min-w-[14px] text-center font-medium">{item.quantity || 1}</span>
                    <button onClick={() => setNotepadItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i))} className="w-5 h-5 flex items-center justify-center hover:text-foreground">
                      <Plus className="h-2.5 w-2.5" />
                    </button>
                  </div>
                  <span className="text-[10px] text-muted-foreground/50 min-w-[22px] flex-shrink-0">
                    {UNITS.find(u => u.value === (item.unit || 'units'))?.[language === 'he' ? 'labelHe' : 'labelEn'] || ''}
                  </span>
                  <button onClick={() => setNotepadItems(prev => prev.filter(i => i.id !== item.id))} className="w-5 h-5 flex items-center justify-center text-muted-foreground/30 hover:text-destructive flex-shrink-0">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>;
              })}
            </div>;
      })}
      </div>;
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
      // Close dialog first
      setIsFinishDialogOpen(false);

      // Update shopping history state
      setShoppingHistory(getShoppingHistory());

      // Show success celebration
      toast.success(language === 'he' ? '🎉 הקנייה הושלמה בהצלחה!' : '🎉 Shopping completed successfully!');

      // Reset ALL state to return to notepad home
      setItems([]);
      setNotepadItems([]);
      setInputText("");
      setTotalAmount("");
      setSelectedStore("");
      setCustomStore("");
      setActiveListId(null);
      setListName("");

      // Scroll to top smoothly
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      toast.error(t.toasts.saveError);
    }
  };
  const completedCount = items.filter(item => item.checked).length;
  const progressPercentage = items.length > 0 ? completedCount / items.length * 100 : 0;
  return <div className="min-h-screen bg-white dark:bg-slate-900 pb-32 transition-colors duration-150" dir={direction} lang={language}>
      {/* List Creation Confirmation Animation */}
      {showConfirmation && <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-[fade-in_0.2s_ease-out,scale-in_0.3s_ease-out]">
          <div className="bg-[#22c55e] text-white rounded-full p-4 shadow-[0_0_20px_rgba(34,197,94,0.5)] animate-pulse">
            <CheckCircle2 className="h-12 w-12" strokeWidth={3} />
          </div>
        </div>}

      {/* Add Item Animation */}
      {showAddAnimation && <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="text-6xl font-black animate-[fade-in_0.15s_ease-out,fade-out_0.3s_ease-out_0.3s]" style={{
        background: 'linear-gradient(135deg, #FACC15 0%, #22c55e 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        filter: 'drop-shadow(0 2px 8px rgba(250, 204, 21, 0.4))',
        animation: 'float-up 0.6s ease-out'
      }}>
            +
          </div>
        </div>}
      {/* List Created Success Animation */}
      {showListSuccess && <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200" />

          {/* Success Card */}
          <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-4 animate-in zoom-in-90 slide-in-from-bottom-10 duration-300 ease-out">
            {/* Icon Wrapper */}
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/30 rounded-full animate-ping" />
              <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full p-4 shadow-lg shadow-green-500/30 relative z-10">
                <CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 animate-in zoom-in spin-in-12 duration-300" strokeWidth={3} />
              </div>
            </div>

            {/* Text Content */}
            <div className="text-center space-y-1 animate-in slide-in-from-bottom-4 fade-in duration-400 delay-100 fill-mode-both">
              <h3 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
                {language === 'he' ? '!הרשימה מוכנה' : 'List Ready!'}
              </h3>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                {language === 'he' ? 'עוברים לעריכה...' : 'Moving to edit...'}
              </p>
            </div>
          </div>
        </div>}

      {/* Sticky Header Group */}
      <div className="sticky top-0 z-50 glass-strong border-b border-border/30 transition-all duration-300">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center w-full gap-3 sm:gap-4">
            {/* Logo Section - Clickable to go Home */}
            <button onClick={() => {
            if (activeListId && items.length > 0) {
              // If in edit mode with items, confirm before leaving
              const confirmExit = window.confirm(language === 'he' ? 'האם אתה בטוח שברצונך לצאת? שינויים שלא נשמרו יאבדו.' : 'Are you sure you want to exit? Unsaved changes will be lost.');
              if (!confirmExit) return;
            }
            // Reset all state
            setActiveListId(null);
            setItems([]);
            setListName('');
            setInputText('');
            setNotepadItems([]);
            setBulkInputText('');
            setInputMode('single');
          }} className="flex items-center gap-2 sm:gap-3 flex-shrink-0 hover:opacity-80 active:scale-95 transition-all duration-200 touch-manipulation">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 text-foreground">
                {/* Checkbox background */}
                <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" stroke="currentColor" strokeWidth="2" />
                {/* Checkmark - yellow */}
                <polyline points="6 12 10 16 18 8" fill="none" stroke="hsl(48, 96%, 53%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-2xl sm:text-3xl font-bold text-foreground">
                    {language === 'he' ? 'עגליסט' : 'ShopList'}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 sm:h-8 sm:w-8 text-foreground flex-shrink-0 -ml-0.5">
                    <circle cx="8" cy="21" r="1" />
                    <circle cx="19" cy="21" r="1" />
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    <path d="M16.5 7.5H5.9" />
                    <path d="M16.5 10.5H6.7" />
                    <path d="M16.5 13.5H7.5" />
                  </svg>
                </div>
                {/* User Greeting */}
                <span className="text-xs sm:text-sm text-muted-foreground font-medium -mt-0.5">
                  {language === 'he' 
                    ? `שלום, ${user ? (localStorage.getItem('user_display_name') || user.user_metadata?.full_name?.split(' ')[0] || 'משתמש') : 'אורח'}`
                    : `Hello, ${user ? (localStorage.getItem('user_display_name') || user.user_metadata?.full_name?.split(' ')[0] || 'User') : 'Guest'}`
                  }
                </span>
              </div>
            </button>

            {/* Spacer - Takes remaining space */}
            <div className="flex-grow" />

            {/* Actions Section - RIGHT (LTR) / LEFT (RTL) */}
            <div className={`flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ${language === 'he' ? 'flex-row-reverse' : ''}`}>
              {/* User Account Button */}
              <Button
                variant="ghost"
                onClick={() => navigate(user ? '/profile' : '/auth')}
                className="h-10 w-10 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 
                           touch-manipulation active:scale-95 transition-all p-0"
                title={language === 'he' ? 'החשבון שלי' : 'My Account'}
              >
                <User className="h-5 w-5" strokeWidth={1.5} />
              </Button>

              {/* Exit Button - Only shown in edit mode */}
              {activeListId && <Button variant="ghost" onClick={() => {
              if (items.length > 0) {
                const confirmExit = window.confirm(language === 'he' ? 'האם אתה בטוח שברצונך לצאת? שינויים שלא נשמרו יאבדו.' : 'Are you sure you want to exit? Unsaved changes will be lost.');
                if (!confirmExit) return;
              }
              exitEditMode();
            }} className="h-10 px-3 sm:px-4 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 font-semibold text-sm sm:text-base touch-manipulation active:scale-95 transition-all">
                  <X className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                  {language === 'he' ? 'יציאה' : 'Exit'}
                </Button>}

            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar - Part of sticky header */}
      {items.length > 0 && <div className="glass-strong px-4 sm:px-6 pb-4 sm:pb-5 sticky top-[60px] sm:top-[72px] z-40 border-b border-border/30 transition-all duration-200">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-2 sm:space-y-3">
              {/* Progress bar with gradient */}
              <div className="relative h-3 sm:h-4 bg-muted/50 rounded-full overflow-hidden shadow-inner">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-success via-success to-success/80 rounded-full transition-all duration-500 ease-out shadow-md shadow-success/30" style={{
              width: `${progressPercentage}%`
            }} />
                {/* Shine effect */}
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 rounded-full transition-all duration-500" style={{
              width: `${progressPercentage}%`
            }} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm sm:text-base text-muted-foreground font-medium">
                  {t.progressText(completedCount, items.length)}
                </p>
                {progressPercentage === 100 && <span className="text-success text-sm font-bold flex items-center gap-1 animate-bounce-in">
                    <Check className="h-4 w-4" />
                    {language === 'he' ? 'הושלם!' : 'Complete!'}
                  </span>}
              </div>
            </div>
          </div>
        </div>}

      {/* Main Content */}
      <div className="max-w-3xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 pb-28 sm:pb-32 md:pb-40 overflow-hidden w-full min-w-0">
        {/* Welcome Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10 mt-4 sm:mt-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 inline-block">
            {language === 'he' ? 'רשימת הקניות החכמה שלך' : 'Your Smart Shopping List'}
            <div className="h-1 w-3/4 mx-auto mt-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {language === 'he' 
              ? 'מארגנים, ממיינים, קונים - בקלות!' 
              : 'Organize, sort, and shop - effortlessly!'}
          </p>
        </div>



        {/* Modern Input Card - Mobile Optimized with Bold Black Borders */}
        <div className="relative bg-card dark:bg-slate-800/90 border-2 border-foreground/80 dark:border-foreground/60 rounded-2xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 shadow-lg hover:shadow-xl focus-within:shadow-xl transition-all duration-300 overflow-hidden backdrop-blur-sm">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none rounded-2xl" />

          {/* Instruction Card - Show when list is empty */}
          {notepadItems.length === 0 && (
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 rounded-xl p-3 sm:p-4 mb-4">
              <h4 className="text-sm font-bold text-primary flex items-center gap-2 mb-2.5">
                <span className="text-base">📝</span>
                {language === 'he' ? 'איך מתחילים?' : 'How to start?'}
              </h4>
              <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-success flex-shrink-0" />
                  {language === 'he' 
                    ? 'הקלידו פריטים, כל אחד בשורה נפרדת' 
                    : 'Type items, each on a new line'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-success flex-shrink-0" />
                  {language === 'he' 
                    ? 'או הדביקו רשימה קיימת מ-WhatsApp / Notes' 
                    : 'Or paste an existing list'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-success flex-shrink-0" />
                  {language === 'he' 
                    ? 'לחצו "יוצאים לקניות!" כשמוכנים' 
                    : 'Click "Let\'s Shop!" when ready'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-success flex-shrink-0" />
                  {language === 'he' 
                    ? 'או "שמור לאחר כך" לשמירה בפנקס' 
                    : 'Or "Save for Later" to save in notebook'}
                </li>
              </ul>
            </div>
          )}

          {/* List Name Input + Quick Actions - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            {/* List Name */}
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder={language === 'he' ? 'שם הרשימה...' : 'List name...'}
              className="flex-1 bg-transparent border-0 text-base sm:text-lg font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none py-1"
            />
            
            {/* Quick Paste & Copy Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button 
                onClick={handleQuickPaste} 
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer text-xs sm:text-sm font-medium border border-foreground/20" 
                title={language === 'he' ? 'הדבק מהלוח' : 'Paste from clipboard'}
              >
                <ClipboardPaste className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{language === 'he' ? 'הדבק' : 'Paste'}</span>
              </button>
              {notepadItems.filter(item => item.text.trim() !== '').length > 0 && (
                <button 
                  onClick={handleCopyAllItems} 
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer text-xs sm:text-sm font-medium border border-foreground/20" 
                  title={language === 'he' ? 'העתק רשימה' : 'Copy list'}
                >
                  <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{language === 'he' ? 'העתק' : 'Copy'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Paste Feedback Animation */}
          {showPasteFeedback && (
            <div className={`absolute top-4 ${language === 'he' ? 'left-28' : 'right-28'} bg-success text-success-foreground px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium animate-in fade-in slide-in-from-right-2 duration-300`}>
              {language === 'he' ? 'הודבק!' : 'Pasted!'}
            </div>
          )}

          {/* Hidden File Input for Camera (kept for future use) */}
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleCameraOCR} className="hidden" />

          {/* Items List - Mobile Optimized */}
          <div className="min-h-[120px] sm:min-h-[140px]" dir={language === 'he' ? 'rtl' : 'ltr'}>
            {notepadItems.length === 0 ? 
              // Empty state - Google Keep style input
              <div className="relative">
                {/* Notebook line effect */}
                <div className="absolute top-0 bottom-0 right-5 w-0.5 bg-primary/15 rounded-full pointer-events-none" />
                
                <textarea
                  autoFocus
                  rows={6}
                  placeholder={language === 'he' 
                    ? 'הוסיפו פריטים...\n\nחלב\nלחם\nביצים\nגבינה' 
                    : 'Add items...\n\nMilk\nBread\nEggs\nCheese'}
                  className="w-full bg-muted/20 dark:bg-slate-800/40 
                    border-2 border-muted-foreground/10 hover:border-primary/30 
                    focus:border-primary/40 focus:ring-2 focus:ring-primary/10
                    rounded-xl outline-none 
                    text-lg leading-relaxed font-medium text-foreground 
                    placeholder:text-muted-foreground/40 
                    py-4 px-5 pr-8
                    resize-none min-h-[200px]
                    transition-all duration-200
                    shadow-inner"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      const value = (e.target as HTMLTextAreaElement).value.trim();
                      if (value) {
                        // Split by newlines and create items
                        const lines = value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                        const newItems: NotepadItem[] = lines.map((text, i) => ({
                          id: `notepad-${Date.now()}-${i}`,
                          text: text.replace(/^[-•*]\s*/, ''),
                          isChecked: false,
                          quantity: 1,
                          unit: 'units' as Unit
                        }));
                        // Add empty item at end for continued input
                        newItems.push({
                          id: `notepad-${Date.now() + lines.length}`,
                          text: '',
                          isChecked: false,
                          quantity: 1,
                          unit: 'units' as Unit
                        });
                        setNotepadItems(newItems);
                        // Focus the last (empty) input
                        setTimeout(() => {
                          const lastIndex = newItems.length - 1;
                          if (notepadInputRefs.current[lastIndex]) {
                            notepadInputRefs.current[lastIndex]!.focus();
                          }
                        }, 50);
                      }
                    }
                  }}
                />
              </div>
                : isSmartSort ?
          // Grouped view
          renderGroupedNotepadItems() :
          // Flat list view
          <div dir={language === 'he' ? 'rtl' : 'ltr'}>
                    {notepadItems.map((item, index) => <div key={item.id} className="flex items-center gap-2 py-1.5 w-full">
                        {/* Checkbox + Text */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Checkbox checked={item.isChecked} onCheckedChange={() => toggleNotepadItem(item.id)} className="h-5 w-5 flex-shrink-0" />
                          <StandardizedInput variant="notepad" isChecked={item.isChecked} ref={el => {
                  notepadInputRefs.current[index] = el;
                }} type="text" value={item.text} onChange={e => {
                  const newText = e.target.value;
                  setNotepadItems(prev => prev.map(i => i.id === item.id ? { ...i, text: newText } : i));
                }} onKeyDown={e => {
                  const currentIndex = notepadItems.findIndex(i => i.id === item.id);
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const newItem: NotepadItem = { id: `notepad-${Date.now()}`, text: '', isChecked: false, quantity: 1, unit: 'units' };
                    setNotepadItems(prev => {
                      const newItems = [...prev];
                      newItems.splice(currentIndex + 1, 0, newItem);
                      return newItems;
                    });
                    setTimeout(() => { 
                      const inputEl = notepadInputRefs.current[currentIndex + 1];
                      if (inputEl) {
                        inputEl.focus();
                        inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
                      }
                    }, 50);
                  } else if (e.key === 'Backspace' && item.text === '' && currentIndex > 0) {
                    e.preventDefault();
                    setNotepadItems(prev => prev.filter(i => i.id !== item.id));
                    setTimeout(() => {
                      const input = notepadInputRefs.current[currentIndex - 1];
                      if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
                    }, 0);
                  }
                }} placeholder={index === 0 && notepadItems.length === 1 ? language === 'he' ? "הקלד פריט..." : "Type an item..." : ""} className="text-sm" />
                        </div>

                        {/* Quantity - Compact */}
                        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-muted/40 border border-border/30 flex-shrink-0">
                          <button onClick={() => setNotepadItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: Math.max(1, (i.quantity || 1) - 1) } : i))} className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground" type="button">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-semibold tabular-nums">{item.quantity || 1}</span>
                          <button onClick={() => setNotepadItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i))} className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground" type="button">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        {/* Unit - Compact */}
                        <select tabIndex={-1} value={item.unit || 'units'} onChange={e => setNotepadItems(prev => prev.map(i => i.id === item.id ? { ...i, unit: e.target.value as Unit } : i))} className="w-12 h-6 text-[10px] rounded-lg border border-border/30 bg-muted/30 text-foreground cursor-pointer flex-shrink-0">
                          {UNITS.map(u => <option key={u.value} value={u.value}>{language === 'he' ? u.labelHe : u.labelEn}</option>)}
                        </select>

                        {/* Delete */}
                        <button onClick={() => setNotepadItems(prev => prev.filter(i => i.id !== item.id))} className="w-6 h-6 flex items-center justify-center text-muted-foreground/40 hover:text-destructive rounded-lg flex-shrink-0">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>)}
                  </div>}
              </div>

              {/* Sort Mode Toggle - Only visible when items exist */}
              {notepadItems.length > 0 && <div className="mt-4 mb-2 px-2 animate-fade-in relative">
                  {/* Smart Sort Feature Discovery Hint */}
                  {showSortHint && <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-3 animate-fade-in-up">
                      {/* Hint Bubble */}
                      <div className="relative">
                        {/* Main bubble */}
                        <div className="bg-white dark:bg-slate-800 border-2 border-blue-500 dark:border-blue-400 rounded-xl px-4 py-3 shadow-lg whitespace-nowrap">
                          <p className="text-sm font-bold text-blue-700 dark:text-blue-300 text-center">
                            {language === 'he' ? 'מעדיפים את הסדר שלכם? לחצו כאן לביטול המיון האוטומטי.' : 'Prefer your own order? Click here to disable auto-sort.'}
                          </p>
                        </div>
                        
                        {/* Arrow pointing down to the button */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-blue-500 dark:border-t-blue-400"></div>
                      </div>
                    </div>}
                  
                  {/* Sort Toggle with pulse effect when hint is visible */}
                  <div className={showSortHint ? 'animate-pulse-glow' : ''}>
                    <SortModeToggle isSmartSort={isSmartSort} onToggle={enabled => {
              setIsSmartSort(enabled);
              // Dismiss hint on click
              setShowSortHint(false);
              // Re-sort notepad items
              if (enabled) {
                const sorted = sortByCategory(notepadItems);
                setNotepadItems(sorted);
                toast.success(language === 'he' ? 'הפריטים מסודרים לפי קטגוריה' : 'Items sorted by category');
              }
            }} language={language} />
                  </div>
                </div>}

              <div className="flex flex-col gap-2 sm:gap-3 mt-4 sm:mt-6 w-full justify-center items-center transition-all duration-300 ease-in-out relative z-10">
                {/* Two action buttons - Mobile Optimized */}
                <div className={`flex flex-col sm:flex-row gap-2 sm:gap-3 w-full justify-center items-center ${notepadItems.length > 0 ? '' : 'pt-2'}`}>
                  <StartShoppingButton onClick={handleStartShopping} language={language} disabled={notepadItems.length === 0} />
                  <SaveListButton onClick={handleSaveList} language={language} disabled={notepadItems.length === 0} />
                </div>
                {/* Clear button - Mobile Optimized */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${notepadItems.length > 0 ? 'opacity-100' : 'opacity-0 h-0'}`}>
                  <Button 
                    onClick={() => setNotepadItems([])} 
                    variant="ghost" 
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 sm:h-11 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-xl flex items-center justify-center transition-all"
                  >
                    <Trash2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {t.clearAllButton}
                  </Button>
                </div>
              </div>
            </div>

        {/* Quick Start Templates */}
        {items.length === 0 && <SortableTemplates systemTemplates={currentTemplates} language={language} onTemplateClick={handleTemplateClick} onCreateNew={() => setIsCreateTemplateDialogOpen(true)} />}

        {/* Dashboard - Saved Lists & Completed Trips */}
        {items.length === 0 && (savedLists.length > 0 || shoppingHistory.length > 0) && (() => {
          // Categorize lists
          const inProgressLists = savedLists.filter(list => {
            const completedCount = list.items.filter(item => item.checked).length;
            return !list.isShoppingComplete && completedCount > 0;
          });
          const readyLists = savedLists.filter(list => {
            const completedCount = list.items.filter(item => item.checked).length;
            return !list.isShoppingComplete && completedCount === 0;
          });
          const completedLists = savedLists.filter(list => list.isShoppingComplete);

          // Duplicate list handler
          const handleDuplicateList = (list: SavedList) => {
            const newList: SavedList = {
              ...list,
              id: Date.now().toString(),
              name: language === 'he' ? `${list.name} (עותק)` : `${list.name} (copy)`,
              createdAt: new Date().toISOString(),
              isShoppingComplete: false,
              shoppingCompletedAt: undefined,
              shoppingDuration: undefined,
              items: list.items.map(item => ({ ...item, checked: false }))
            };
            if (saveList(newList)) {
              setSavedLists(getSavedLists());
              toast.success(language === 'he' ? 'הרשימה שוכפלה!' : 'List duplicated!');
            }
          };

          // Common handlers
          const handleDelete = (id: string) => {
            if (deleteSavedList(id)) {
              setSavedLists(getSavedLists());
              toast.success(t.toasts.listDeleted);
            }
          };

          const handleToggle = (listId: string, itemId: string) => {
            const list = savedLists.find(l => l.id === listId);
            if (!list) return;
            const updatedItems = list.items.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item);
            const updatedList = { ...list, items: updatedItems };
            if (updateSavedList(updatedList)) {
              setSavedLists(getSavedLists());
            }
          };

          // Go shopping handler
          const handleGoShopping = (list: SavedList) => {
            // Save list data for shopping mode
            localStorage.setItem(`shoppingList_${list.id}`, JSON.stringify({
              id: list.id,
              name: list.name,
              items: list.items,
              createdAt: list.createdAt
            }));
            navigate(`/shopping/${list.id}`);
          };

          return (
            <div className="mb-12 border-t border-border/30 pt-8 max-w-5xl mx-auto space-y-10">
              
              {/* Ready to Shop Section - FIRST */}
              <div className="bg-primary/5 rounded-2xl p-4 sm:p-6 border border-primary/20">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    {language === 'he' ? 'מוכנות לקנייה' : 'Ready to Shop'}
                    {readyLists.length > 0 && (
                      <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">
                        {readyLists.length}
                      </span>
                    )}
                  </h3>
                  <Button variant="ghost" onClick={() => navigate("/notebook")} className="text-sm font-semibold text-primary hover:text-primary/80 hover:bg-primary/10">
                    {t.viewAllListsButton}
                    {language === 'he' ? <div className="mr-1 rotate-180">➜</div> : <div className="ml-1">➜</div>}
                  </Button>
                </div>

                {readyLists.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    {readyLists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4).map((list, index) => (
                      <SavedListCard 
                        key={list.id} 
                        list={list} 
                        index={index} 
                        language={language} 
                        t={t} 
                        variant="default"
                        onEdit={handleEditSavedList} 
                        onDelete={handleDelete}
                        onToggleItem={handleToggle}
                        onGoShopping={handleGoShopping}
                        onDuplicate={handleDuplicateList}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-card/50 border border-dashed border-muted-foreground/30 rounded-xl p-8 text-center">
                    <ClipboardList className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      {language === 'he' ? 'אין רשימות ממתינות' : 'No lists waiting'}
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      {language === 'he' ? 'צור רשימה חדשה ושמור אותה כדי לראות אותה כאן' : 'Create and save a list to see it here'}
                    </p>
                  </div>
                )}
              </div>

              {/* Visual Separator */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>

              {/* In Progress Section - SECOND */}
              <div className="bg-warning/5 rounded-2xl p-4 sm:p-6 border border-warning/20">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-warning" />
                    {language === 'he' ? 'ממשיכים מאיפה שעצרנו' : 'Continue Where You Left Off'}
                    {inProgressLists.length > 0 && (
                      <span className="text-xs bg-warning/10 text-warning px-2.5 py-1 rounded-full font-semibold">
                        {inProgressLists.length}
                      </span>
                    )}
                  </h3>
                </div>

                {inProgressLists.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    {inProgressLists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4).map((list, index) => (
                      <SavedListCard 
                        key={list.id} 
                        list={list} 
                        index={index} 
                        language={language} 
                        t={t} 
                        variant="in-progress"
                        onEdit={handleEditSavedList} 
                        onDelete={handleDelete}
                        onToggleItem={handleToggle}
                        onGoShopping={handleGoShopping}
                        onDuplicate={handleDuplicateList}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-card/50 border border-dashed border-muted-foreground/30 rounded-xl p-8 text-center">
                    <ShoppingCart className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      {language === 'he' ? 'אין כרגע קניות פעילות' : 'No active shopping trips'}
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      {language === 'he' ? 'כשתתחיל קנייה ותעצור באמצע, היא תופיע כאן' : 'Start shopping and pause midway to see it here'}
                    </p>
                  </div>
                )}
              </div>


              {/* Completed Lists Section */}
              {completedLists.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      {language === 'he' ? 'קניות שהושלמו' : 'Completed Shopping'}
                      <span className="text-xs bg-success/10 text-success px-2.5 py-1 rounded-full font-semibold">
                        {completedLists.length}
                      </span>
                    </h3>
                    <Button variant="ghost" onClick={() => navigate("/notebook")} className="text-sm font-semibold text-success hover:text-success/80 hover:bg-success/10">
                      {language === 'he' ? 'צפה בהכל' : 'View All'}
                      {language === 'he' ? <div className="mr-1 rotate-180">➜</div> : <div className="ml-1">➜</div>}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    {completedLists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4).map((list, index) => (
                      <SavedListCard 
                        key={list.id} 
                        list={list} 
                        index={index} 
                        language={language} 
                        t={t} 
                        variant="completed"
                        onEdit={handleEditSavedList} 
                        onDelete={handleDelete}
                        onToggleItem={handleToggle}
                        onDuplicate={handleDuplicateList}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Trips from History Section */}
              {shoppingHistory.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <History className="h-5 w-5 text-muted-foreground" />
                      {language === 'he' ? 'קניות שהושלמו' : 'Completed Shopping'}
                      <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full font-semibold">
                        {shoppingHistory.length}
                      </span>
                    </h3>
                    <Button variant="ghost" onClick={() => navigate("/history")} className="text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted">
                      {language === 'he' ? 'צפה בהכל' : 'View All'}
                      {language === 'he' ? <div className="mr-1 rotate-180">➜</div> : <div className="ml-1">➜</div>}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    {shoppingHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4).map((trip, index) => (
                      <CompletedTripCard 
                        key={trip.id} 
                        trip={trip} 
                        index={index} 
                        language={language} 
                        onViewDetails={trip => {
                          setSelectedTrip(trip);
                          setIsHistoryModalOpen(true);
                        }} 
                        onDelete={id => {
                          if (deleteShoppingHistory(id)) {
                            setShoppingHistory(getShoppingHistory());
                            toast.success(language === 'he' ? 'הקנייה נמחקה' : 'Trip deleted');
                          }
                        }} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Secondary Action Bar */}
        {items && items.length > 0 && <div className="flex flex-col gap-3 mb-4">
              {/* Sort Toggle */}
              <SortModeToggle isSmartSort={isSmartSort} onToggle={enabled => {
          setIsSmartSort(enabled);
          // Re-sort items when toggling
          if (enabled) {
            setItems(sortByCategory(items));
            toast.success(language === 'he' ? 'הפריטים מסודרים לפי קטגוריה' : 'Items sorted by category');
          }
        }} language={language} />
              
              {/* Reset checks button */}
              <div className="flex justify-start">
                <button onClick={() => {
            if (items && items.length > 0) {
              setItems(items.map(item => ({
                ...item,
                checked: false
              })));
              toast.success(language === 'he' ? 'כל הסימונים אופסו' : 'All checks reset');
            }
          }} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-muted transition-all">
                  <RotateCcw className="w-4 h-4" />
                  <span>{language === 'he' ? 'אפס סימונים' : 'Reset Checks'}</span>
                </button>
              </div>
            </div>}

        {/* Items List */}
        {items && items.length > 0 && (isSmartSort ?
      // Grouped List View with Category Headers
      <GroupedShoppingList items={items} language={language} onToggle={toggleItem} onDelete={deleteItem} onQuantityChange={updateItemQuantity} onUnitChange={updateItemUnit} /> :
      // Flat List View (Original)
      <div className="space-y-4 sm:space-y-5">
                {/* Pending Items */}
                <div className="space-y-3 sm:space-y-4">
                  {items.filter(item => !item.checked).map((item, index) => <div key={item.id} className="animate-fade-in" style={{
            animationDelay: `${index * 50}ms`
          }}>
                      <ShoppingListItem item={item} onToggle={toggleItem} onDelete={deleteItem} onQuantityChange={updateItemQuantity} onUnitChange={updateItemUnit} />
                    </div>)}
                </div>

                {/* Completed Items Separator */}
                {items.filter(item => item.checked).length > 0 && <div className="flex items-center gap-4 py-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-success/40 to-transparent" />
                    <span className="text-sm font-bold text-success flex items-center gap-2.5 px-4 py-2 bg-success/15 rounded-full shadow-sm shadow-success/20 border border-success/20">
                      <Check className="h-4 w-4" strokeWidth={3} />
                      {language === 'he' ? `נרכשו ${items.filter(item => item.checked).length}` : `Completed ${items.filter(item => item.checked).length}`}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-success/40 to-transparent" />
                  </div>}

                {/* Completed Items */}
                {items.filter(item => item.checked).length > 0 && <div className="space-y-3 sm:space-y-4">
                    {items.filter(item => item.checked).map(item => <ShoppingListItem key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} onQuantityChange={updateItemQuantity} onUnitChange={updateItemUnit} isCompleted={true} />)}
                  </div>}
              </div>)}
        {items && items.length > 0 && <div className="fixed bottom-0 left-0 right-0 z-[60] glass-strong border-t border-border/50 shadow-[0_-8px_30px_-5px_rgba(0,0,0,0.15)] p-4 sm:p-5 safe-area-inset-bottom">
              <div className="max-w-3xl mx-auto">
                <div className="flex flex-row gap-3 sm:gap-4">
                  {(() => {
              const isSavedList = activeListId && savedLists.some(list => list.id === activeListId);
              return <Button variant="outline" onClick={handleSaveList} className="flex-1 h-14 sm:h-16 font-bold text-base sm:text-lg touch-manipulation rounded-2xl glass border-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 active:scale-95 transition-all duration-200">
                        <Save className={`h-5 w-5 sm:h-6 sm:w-6 ${language === 'he' ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'}`} />
                        <span className="truncate">{isSavedList ? t.saveChangesButton : t.saveListButton}</span>
                      </Button>;
            })()}
                  <Button onClick={openFinishDialog} className="flex-1 h-14 sm:h-16 font-bold text-base sm:text-lg touch-manipulation rounded-2xl bg-gradient-to-br from-foreground to-foreground/90 text-background hover:opacity-90 shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-200">
                    <ClipboardList className={`h-5 w-5 sm:h-6 sm:w-6 ${language === 'he' ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'}`} />
                    <span className="truncate">{t.summarizeButton}</span>
                  </Button>
                </div>
              </div>
            </div>}

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
                  <Input id="listName" value={listName} onChange={e => setListName(e.target.value)} placeholder={t.saveDialog.namePlaceholder} className="h-11 text-lg" />
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
              <Input value={renamingListName} onChange={e => setRenamingListName(e.target.value)} className="h-11 text-lg" onKeyDown={e => e.key === "Enter" && confirmRenameList()} />
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
          <DialogContent 
            className="sm:max-w-[420px] p-0 gap-0 overflow-hidden"
            dir={language === 'he' ? 'rtl' : 'ltr'}
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-b from-primary/5 to-transparent px-6 pt-6 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {language === 'he' ? 'יצירת תבנית חדשה' : 'Create New Template'}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {language === 'he' 
                      ? 'שמור פריטים לשימוש חוזר' 
                      : 'Save items for reuse'}
                  </p>
                </div>
              </div>
            </div>

            {/* Form content */}
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="templateName" className="text-sm font-medium">
                  {language === 'he' ? 'שם התבנית' : 'Template Name'}
                </Label>
                <Input 
                  id="templateName" 
                  value={newTemplateName} 
                  onChange={e => setNewTemplateName(e.target.value)} 
                  placeholder={language === 'he' ? 'קניות שבועיות' : 'Weekly Shopping'} 
                  className="h-11 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary" 
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="templateItems" className="text-sm font-medium">
                  {language === 'he' ? 'פריטים' : 'Items'}
                </Label>
                <textarea 
                  id="templateItems" 
                  value={newTemplateItems} 
                  onChange={e => setNewTemplateItems(e.target.value)} 
                  placeholder={language === 'he' ? 'חלב\nלחם\nביצים' : 'Milk\nBread\nEggs'} 
                  className="w-full min-h-[120px] p-3 text-sm bg-muted/50 border-0 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60" 
                />
              </div>
            </div>

            {/* Footer buttons */}
            <div className="px-6 pb-6 pt-2 flex gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setIsCreateTemplateDialogOpen(false)}
                className="flex-1 h-11 text-muted-foreground hover:text-foreground"
              >
                {t.cancel}
              </Button>
              <Button 
                onClick={handleCreateTemplate} 
                className="flex-1 h-11 font-medium"
              >
                <Save className="me-2 h-4 w-4" />
                {language === 'he' ? 'שמור' : 'Save'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {isHandwritingOpen && <HandwritingCanvas onSubmit={handleHandwritingSubmit} onCancel={() => setIsHandwritingOpen(false)} language={language} />}

        {/* History Detail Modal */}
        <HistoryDetailModal trip={selectedTrip} isOpen={isHistoryModalOpen} onClose={() => {
        setIsHistoryModalOpen(false);
        setSelectedTrip(null);
      }} language={language} />

        {/* Edit List Modal */}
        <EditListModal
          list={editingList}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingList(null);
          }}
          onSave={handleSaveEditedList}
          language={language}
        />

        {/* Welcome Prompt for Guests */}
        <WelcomePrompt />

        {/* Welcome Name Modal for New Users */}
        <WelcomeNameModal 
          open={isWelcomeNameModalOpen} 
          onOpenChange={setIsWelcomeNameModalOpen} 
        />
      </div>
    </div>;
};