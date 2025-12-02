import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Share2, Trash2, Plus, CheckCircle2, History, Menu, BarChart3, Globe, Save, ClipboardList, Book, Square, CheckSquare, Printer, Mail, FileSpreadsheet, Copy, Pencil, X, ClipboardPaste, Info, ShoppingCart, Check, Volume2, RotateCcw, Settings, Moon, Sun, Mic, Camera, PenLine } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { SmartAutocompleteInput, SmartAutocompleteInputRef } from "@/components/SmartAutocompleteInput";
import { SavedListCard } from "@/components/SavedListCard";
import { StandardizedInput } from "@/components/ui/standardized-input";
import { StandardizedTextarea } from "@/components/ui/standardized-textarea";
import { HandwritingCanvas } from "@/components/HandwritingCanvas";
import { toast } from "sonner";
import { ShoppingItem, ISRAELI_STORES, UNITS, Unit, SavedList } from "@/types/shopping";
import { ShoppingListItem } from "@/components/ShoppingListItem";
import { SettingsModal } from "@/components/SettingsModal";
import { SortableTemplates } from "@/components/SortableTemplates";
import { processInput, RateLimiter } from "@/utils/security";
import { createWorker } from 'tesseract.js';

interface NotepadItem {
  id: string;
  text: string;
  isChecked: boolean;
  quantity?: number;
  unit?: Unit;
}
import { saveShoppingHistory, saveList, getSavedLists, deleteSavedList, updateSavedList } from "@/utils/storage";
import { useLanguage, Language } from "@/hooks/use-language";
import { translations } from "@/utils/translations";
import { parseItemWithUnit, formatItemDisplay } from "@/utils/itemParser";
import { useTheme } from "next-themes";


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
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const autocompleteInputRef = useRef<SmartAutocompleteInputRef>(null);
  const singleItemInputRef = useRef<HTMLInputElement>(null);
  const notepadInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const rateLimiter = useRef(new RateLimiter());
  const { language, setLanguage, toggleLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
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
  const [showPasteFeedback, setShowPasteFeedback] = useState(false);
  const [notepadItems, setNotepadItems] = useState<NotepadItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Smart Input States
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isHandwritingOpen, setIsHandwritingOpen] = useState(false);
  const [lastAddTime, setLastAddTime] = useState(0);
  const [isLanguageTransitioning, setIsLanguageTransitioning] = useState(false);

  // Quick add state for bulk input
  const [quickAddText, setQuickAddText] = useState('');
  const [quickAddQuantity, setQuickAddQuantity] = useState(1);
  const [quickAddUnit, setQuickAddUnit] = useState<Unit>('units');
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Update refs array when notepadItems changes
  useEffect(() => {
    notepadInputRefs.current = notepadInputRefs.current.slice(0, notepadItems.length);
  }, [notepadItems]);
  const hasContent = inputText.trim().length > 0 || items.length > 0 || notepadItems.length > 0;
  const showPaste = notepadItems.length === 0 || (notepadItems.length === 1 && notepadItems[0].text === '');
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

  const handlePaste = () => {
    // Convert notepad items to main shopping items, preserving checked status
    const newItems: ShoppingItem[] = notepadItems.map((notepadItem, index) => ({
      id: `${Date.now()}-${index}`,
      text: notepadItem.text,
      checked: notepadItem.isChecked, // Preserve the checked status!
      quantity: 1,
      unit: 'units' as Unit
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

  const toggleNotepadItem = (id: string) => {
    setNotepadItems(prev => prev.map(item =>
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    ));
  };

  const handleQuickPaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText.trim()) {
        // Split by newlines first
        const lines = clipboardText.split("\n").map(line => line.trim()).filter(line => line.length > 0);

        // For each line, split by commas if they exist, otherwise keep as is
        const allItems: string[] = [];
        lines.forEach(line => {
          if (line.includes(',')) {
            // Split by comma and filter out empty items
            const commaItems = line.split(',').map(item => item.trim()).filter(item => item.length > 0);
            allItems.push(...commaItems);
          } else {
            allItems.push(line);
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
    const newNotepadItems: NotepadItem[] = templateItems.map((item, index) => ({
      id: `template-${Date.now()}-${index}`,
      text: item,
      isChecked: false
    }));
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

    // More permissive input processing for main input field
    let processedText = singleItemInput.trim();

    // Basic security checks only
    if (processedText.length > 100) {
      processedText = processedText.substring(0, 100); // Reasonable limit
    }

    // Remove only the most dangerous HTML/script content
    if (/<script|javascript:|on\w+=/i.test(processedText)) {
      toast.error(language === 'he' ? 'תוכן לא תקין זוהה' : 'Invalid content detected');
      return;
    }

    // Rate limiting check (reduced cooldown for better UX)
    const now = Date.now();
    const timeSinceLastAdd = now - lastAddTime;
    if (timeSinceLastAdd < 100) { // Reduced to 100ms for better responsiveness
      return; // Silently ignore rapid-fire adds
    }
    setLastAddTime(now);

    let quantity = parseFloat(singleItemQuantity);
    if (isNaN(quantity) || quantity < 0) quantity = 1;

    if (singleItemUnit === 'units') {
      quantity = Math.round(quantity);
      if (quantity === 0) quantity = 1;
    }

    const newItem: ShoppingItem = {
      id: `${Date.now()}`,
      text: processedText,
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
      const updatedItems = prevItems.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      );

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

  const resetChecks = () => {
    if (items && items.length > 0) {
      setItems(items.map(item => ({ ...item, checked: false })));
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

  // Voice Dictation Function
  // Voice recognition state management
  const recognitionRef = useRef<any>(null);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null);

  // Debounced notepad update to prevent excessive re-renders
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const debouncedUpdateNotepad = useCallback((itemId: string, newText: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setNotepadItems(prev => prev.map(i =>
        i.id === itemId ? { ...i, text: newText } : i
      ));
    }, 150); // 150ms debounce for smooth typing experience
  }, []);

  // Check microphone permissions on component mount
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setHasMicrophonePermission(result.state === 'granted');
        } else {
          // Fallback: try to access microphone
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          setHasMicrophonePermission(true);
        }
      } catch (error) {
        console.warn('Microphone permission check failed:', error);
        setHasMicrophonePermission(false);
      }
    };

    checkMicrophonePermission();
  }, []);

  // Cleanup debounced updates on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleVoiceDictation = async () => {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error(language === 'he' ? 'הדפדפן שלך לא תומך בהקלטת קול. נסה כרום או אדג׳' : 'Your browser does not support voice recording. Try Chrome or Edge');
      return;
    }

    // Check microphone permission
    if (hasMicrophonePermission === false) {
      toast.error(language === 'he' ? 'אין הרשאה למיקרופון. בדוק הגדרות הדפדפן' : 'No microphone permission. Check browser settings');
      return;
    }

    if (isVoiceRecording) {
      // Stop recording
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping recognition:', error);
        }
      }
      setIsVoiceRecording(false);
      return;
    }

    // Request microphone permission if not already granted
    if (hasMicrophonePermission === null) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setHasMicrophonePermission(true);
      } catch (error) {
        setHasMicrophonePermission(false);
        toast.error(language === 'he' ? 'אין גישה למיקרופון. בדוק הגדרות הדפדפן' : 'Cannot access microphone. Check browser settings');
        return;
      }
    }

    // Start recording
    setIsVoiceRecording(true);

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      // Configure recognition settings
      recognition.lang = language === 'he' ? 'he-IL' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true; // Enable interim results for better UX
      recognition.maxAlternatives = 1;

      // Store reference for cleanup
      recognitionRef.current = recognition;

      let finalTranscript = '';
      let interimTranscript = '';

      recognition.onstart = () => {
        toast.info(language === 'he' ? 'מקשיב... דבר בבקשה' : 'Listening... please speak');
      };

      recognition.onresult = (event) => {
        interimTranscript = '';
        finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Show interim results (optional - could show in UI)
        if (interimTranscript && interimTranscript.trim()) {
          console.log('Interim:', interimTranscript);
        }
      };

      recognition.onend = () => {
        setIsVoiceRecording(false);

        // Clean up timeouts and references
        if ((recognition as any)._startTimeout) {
          clearTimeout((recognition as any)._startTimeout);
        }
        recognitionRef.current = null;

        if (finalTranscript && finalTranscript.trim()) {
          // Process the transcript with better punctuation and item separation
          const processedItems = processVoiceTranscript(finalTranscript.trim());

          if (processedItems.length > 0) {
            const newNotepadItems: NotepadItem[] = processedItems.map((item, index) => ({
              id: `voice-${Date.now()}-${index}`,
              text: item.trim(),
              isChecked: false
            }));

            setNotepadItems(prev => [...prev, ...newNotepadItems]);

            toast.success(language === 'he'
              ? `התווספו ${processedItems.length} פריטים מהקול`
              : `Added ${processedItems.length} items from voice`
            );
          } else {
            toast.warning(language === 'he' ? 'לא זוהו פריטים ברורים. נסה שוב' : 'No clear items detected. Try again');
          }
        } else {
          toast.warning(language === 'he' ? 'לא נשמע שום דבר. נסה שוב' : 'Nothing heard. Try again');
        }
      };

      recognition.onerror = (event) => {
        setIsVoiceRecording(false);
        recognitionRef.current = null;

        let errorMessage = '';
        switch (event.error) {
          case 'no-speech':
            errorMessage = language === 'he' ? 'לא נשמע שום דבר' : 'No speech detected';
            break;
          case 'audio-capture':
            errorMessage = language === 'he' ? 'בעיה עם המיקרופון' : 'Microphone issue';
            break;
          case 'not-allowed':
            errorMessage = language === 'he' ? 'אין הרשאה למיקרופון' : 'Microphone permission denied';
            setHasMicrophonePermission(false);
            break;
          case 'network':
            errorMessage = language === 'he' ? 'בעיית רשת' : 'Network error';
            break;
          default:
            errorMessage = language === 'he' ? 'שגיאה בהקלטת קול' : 'Voice recording error';
        }

        console.error('Speech recognition error:', event.error);
        toast.error(errorMessage);
      };

      // Start recognition with error recovery
      try {
        recognition.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
        setIsVoiceRecording(false);
        recognitionRef.current = null;
        toast.error(language === 'he' ? 'שגיאה בהפעלת הקלטת קול' : 'Error starting voice recording');
        return;
      }

      // Set multiple timeouts for different failure scenarios
      const startTimeout = setTimeout(() => {
        if (recognitionRef.current && isVoiceRecording) {
          try {
            recognition.stop();
            toast.warning(language === 'he' ? 'הקלטה נעצרה אוטומטית' : 'Recording stopped automatically');
          } catch (error) {
            console.error('Error stopping recognition timeout:', error);
          }
        }
      }, 15000); // 15 second total timeout

      // Store timeout for cleanup
      (recognition as any)._startTimeout = startTimeout;

    } catch (error) {
      setIsVoiceRecording(false);
      recognitionRef.current = null;
      console.error('Error initializing speech recognition:', error);
      toast.error(language === 'he' ? 'שגיאה באתחול הקלטת קול' : 'Error initializing voice recording');
    }
  };

  // Handle quick add for bulk input
  const handleQuickAdd = () => {
    if (quickAddText.trim()) {
      // Add item with specified quantity and unit
      const newItem: NotepadItem = {
        id: `quick-${Date.now()}`,
        text: quickAddText.trim(),
        isChecked: false,
        quantity: quickAddQuantity,
        unit: quickAddUnit
      };
      setNotepadItems(prev => [...prev, newItem]);

      // Reset form
      setQuickAddText('');
      setQuickAddQuantity(1);
      setQuickAddUnit('units');

      toast.success(language === 'he' ? 'פריט נוסף לרשימה' : 'Item added to list');
    } else {
      // Add blank row (existing behavior)
      const newItem: NotepadItem = {
        id: `notepad-${Date.now()}`,
        text: '',
        isChecked: false
      };
      setNotepadItems(prev => [...prev, newItem]);
    }
  };

  // Helper function to process voice transcripts with better punctuation handling
  const processVoiceTranscript = (transcript: string): string[] => {
    // Clean up the transcript
    let cleaned = transcript
      .toLowerCase()
      .replace(/[^\w\s\u0590-\u05FF]/g, ' ') // Remove punctuation but keep Hebrew characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Split by common separators (English and Hebrew)
    const separators = [
      /\s+and\s+/gi,
      /\s*,\s*/g,
      /\s*;\s*/g,
      /\s*וגם\s+/g, // Hebrew "and"
      /\s*ו\s+/g, // Hebrew "and"
      /\s+or\s+/gi,
      /\s*plus\s+/gi,
      /\s*עוד\s+/g, // Hebrew "also/more"
      /\s*וגם\s+/g, // Hebrew "and also"
    ];

    let items: string[] = [cleaned];

    separators.forEach(separator => {
      items = items.flatMap(item => item.split(separator)).filter(item => item.trim().length > 0);
    });

    // Further split by numbers (like "2 apples, 3 bananas")
    items = items.flatMap(item => {
      const numberMatches = item.match(/(\d+)\s+(.+)/g);
      if (numberMatches) {
        return numberMatches.map(match => match.trim());
      }
      return [item];
    });

    // Clean up items and filter out very short ones
    return items
      .map(item => item.trim())
      .filter(item => item.length >= 2 && item.length <= 50) // Reasonable length limits
      .map(item => {
        // Capitalize first letter for better readability
        return item.charAt(0).toUpperCase() + item.slice(1);
      })
      .filter((item, index, arr) => arr.indexOf(item) === index); // Remove duplicates
  };

  // Camera OCR Function
  const handleCameraOCR = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      // Reset file input
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
      return;
    }

    setIsProcessingImage(true);
    toast.info(language === 'he' ? 'מפענח רשימה מהתמונה...' : 'Processing image...');

    try {
      // Create image preview for user feedback
      const imageUrl = URL.createObjectURL(file);

      // Initialize Tesseract worker
      const worker = await createWorker();

      // Load both Hebrew and English for better recognition
      await (worker as any).loadLanguage('heb+eng');
      await (worker as any).initialize('heb+eng');

      // Configure OCR settings for better text recognition
      await (worker as any).setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz\u0590-\u05FF ', // Include Hebrew characters
        tessedit_pageseg_mode: '6', // Uniform block of text
      });

      // Process the image
      const { data: { text, confidence } } = await (worker as any).recognize(file);

      // Clean up
      await (worker as any).terminate();
      URL.revokeObjectURL(imageUrl);

      console.log('OCR Result:', { text, confidence });

      // Process the recognized text
      const processedItems = processOCRText(text, confidence);

      if (processedItems.length > 0) {
        const newNotepadItems: NotepadItem[] = processedItems.map((item, index) => ({
          id: `ocr-${Date.now()}-${index}`,
          text: item,
          isChecked: false
        }));

        setNotepadItems(prev => [...prev, ...newNotepadItems]);

        toast.success(language === 'he'
          ? `התווספו ${processedItems.length} פריטים מהתמונה`
          : `Added ${processedItems.length} items from image`
        );
      } else {
        toast.warning(language === 'he'
          ? 'לא נמצא טקסט ברור בתמונה. נסה תמונה עם כתב ברור יותר'
          : 'No clear text found in image. Try an image with clearer text'
        );
      }

    } catch (error) {
      console.error('OCR Error:', error);

      let errorMessage = language === 'he' ? 'שגיאה בעיבוד התמונה' : 'Error processing image';

      if (error instanceof Error) {
        if (error.message.includes('network')) {
          errorMessage = language === 'he' ? 'בעיית רשת. בדוק חיבור אינטרנט' : 'Network error. Check internet connection';
        } else if (error.message.includes('memory')) {
          errorMessage = language === 'he' ? 'התמונה גדולה מדי' : 'Image too large';
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsProcessingImage(false);
      // Reset file input
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
    }
  };

  // Helper function to validate image files
  const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: language === 'he'
          ? 'פורמט קובץ לא נתמך. השתמש ב-JPG, PNG, או WebP'
          : 'Unsupported file format. Use JPG, PNG, or WebP'
      };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: language === 'he'
          ? 'הקובץ גדול מדי. מקסימום 10MB'
          : 'File too large. Maximum 10MB'
      };
    }

    // Check minimum file size (avoid empty files)
    if (file.size < 1000) { // 1KB minimum
      return {
        valid: false,
        error: language === 'he'
          ? 'הקובץ קטן מדי או פגום'
          : 'File too small or corrupted'
      };
    }

    return { valid: true };
  };

  // Helper function to process OCR text with better cleaning and item extraction
  const processOCRText = (text: string, confidence: number): string[] => {
    if (!text || text.trim().length === 0) return [];

    // Log confidence for debugging
    console.log('OCR Confidence:', confidence);

    // Clean up the OCR text
    let cleaned = text
      // Remove excessive whitespace and newlines
      .replace(/\n\s*\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

    // Split by lines first
    let lines = cleaned.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // If confidence is low, be more aggressive with filtering
    if (confidence < 70) {
      lines = lines.filter(line => {
        // Filter out very short lines or lines with too many non-alphanumeric chars
        const alphaNumChars = line.replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, '').length;
        const totalChars = line.length;
        return totalChars >= 3 && alphaNumChars / totalChars > 0.6;
      });
    }

    // Try to split lines that contain multiple items
    const items: string[] = [];

    lines.forEach(line => {
      // Look for common separators
      const separators = [/,/, /;/, /•/, /◦/, /·/, /-/];
      let splitItems = [line];

      separators.forEach(separator => {
        splitItems = splitItems.flatMap(item =>
          item.split(separator).map(subItem => subItem.trim())
        );
      });

      // Filter and clean split items
      splitItems.forEach(item => {
        const cleanedItem = item.trim();
        if (cleanedItem.length >= 2 && cleanedItem.length <= 100) {
          // Remove common OCR artifacts
          const finalItem = cleanedItem
            .replace(/^[-•◦·\s]+/, '') // Remove leading bullets/dashes
            .replace(/[-•◦·\s]+$/, '') // Remove trailing bullets/dashes
            .trim();

          if (finalItem.length >= 2) {
            items.push(finalItem);
          }
        }
      });
    });

    // Remove duplicates (case insensitive)
    const uniqueItems = items.filter((item, index, arr) =>
      arr.findIndex(other => other.toLowerCase() === item.toLowerCase()) === index
    );

    return uniqueItems.slice(0, 50); // Limit to 50 items max
  };

  // Handwriting Recognition Function
  const handleHandwritingSubmit = async (imageData: string) => {
    if (!imageData) {
      toast.error(language === 'he' ? 'לא התקבלה תמונה' : 'No image received');
      setIsHandwritingOpen(false);
      return;
    }

    setIsProcessingImage(true);
    setIsHandwritingOpen(false); // Close modal immediately for better UX

    toast.info(language === 'he' ? 'מזהה כתב יד...' : 'Recognizing handwriting...');

    try {
      // Validate image data
      if (!imageData.startsWith('data:image/')) {
        throw new Error('Invalid image data format');
      }

      // Initialize Tesseract worker with handwriting-specific settings
      const worker = await createWorker();

      // Load languages (Hebrew + English for mixed handwriting)
      await (worker as any).loadLanguage('heb+eng');
      await (worker as any).initialize('heb+eng');

      // Configure for handwriting recognition
      await (worker as any).setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz\u0590-\u05FF ',
        tessedit_pageseg_mode: '8', // Single word mode for handwriting
        tessedit_ocr_engine_mode: '2', // Tesseract + LSTM engine
        textord_min_linesize: '2.5', // Better for handwriting
      });

      // Process the handwriting image
      const { data: { text, confidence } } = await (worker as any).recognize(imageData);

      // Clean up worker
      await (worker as any).terminate();

      console.log('Handwriting OCR Result:', { text, confidence });

      // Process and validate results
      const processedItems = processHandwritingText(text, confidence);

      if (processedItems.length > 0) {
        const newNotepadItems: NotepadItem[] = processedItems.map((item, index) => ({
          id: `handwriting-${Date.now()}-${index}`,
          text: item,
          isChecked: false
        }));

        setNotepadItems(prev => [...prev, ...newNotepadItems]);

        toast.success(language === 'he'
          ? `התווספו ${processedItems.length} פריטים מהכתב`
          : `Added ${processedItems.length} items from handwriting`
        );
      } else {
        // Provide helpful fallback suggestions
        toast.warning(language === 'he'
          ? 'כתב היד לא ברור. נסה לכתוב ברור יותר או השתמש בקול/תמונה'
          : 'Handwriting not clear. Try writing more clearly or use voice/image input'
        );
      }

    } catch (error) {
      console.error('Handwriting recognition error:', error);

      let errorMessage = language === 'he' ? 'שגיאה בעיבוד כתב יד' : 'Error processing handwriting';

      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('timeout')) {
          errorMessage = language === 'he'
            ? 'בעיית רשת. בדוק חיבור אינטרנט'
            : 'Network error. Check internet connection';
        } else if (error.message.includes('memory') || error.message.includes('canvas')) {
          errorMessage = language === 'he'
            ? 'בעיה עם עיבוד התמונה'
            : 'Image processing issue';
        }
      }

      toast.error(errorMessage);

      // Fallback: offer alternative input methods
      setTimeout(() => {
        toast.info(language === 'he'
          ? 'נסה קול או העלאת תמונה במקום'
          : 'Try voice or image upload instead'
        );
      }, 2000);
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Helper function to process handwriting OCR results
  const processHandwritingText = (text: string, confidence: number): string[] => {
    if (!text || text.trim().length === 0) return [];

    console.log('Handwriting confidence:', confidence);

    // Clean and normalize the recognized text
    let cleaned = text
      .replace(/\n\s*\n/g, '\n') // Remove excessive line breaks
      .replace(/[ \t]+/g, ' ') // Normalize spaces
      .trim();

    // Split by lines and common handwriting separators
    let items = cleaned.split(/\n|,|;|\sand\s|\sor\s/)
      .map(item => item.trim())
      .filter(item => item.length > 0);

    // For handwriting, be more lenient with short items but filter out noise
    items = items.filter(item => {
      // Remove items that are mostly punctuation or numbers only
      const hasLetters = /[a-zA-Z\u0590-\u05FF]/.test(item);
      const totalChars = item.length;

      // Allow shorter items for handwriting (people might write single words)
      return totalChars >= 1 && totalChars <= 80 && (hasLetters || totalChars <= 3);
    });

    // Clean up individual items
    items = items.map(item => {
      return item
        .replace(/^[-•◦·\s]+/, '') // Remove leading symbols
        .replace(/[-•◦·\s]+$/, '') // Remove trailing symbols
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
    }).filter(item => item.length > 0);

    // If confidence is very low, try to salvage what we can
    if (confidence < 50 && items.length === 0) {
      // Try splitting by spaces as a last resort for very poor recognition
      const words = cleaned.split(/\s+/).filter(word => word.length >= 2 && word.length <= 20);
      if (words.length > 0) {
        items = words;
      }
    }

    // Remove duplicates and limit results
    const uniqueItems = [...new Set(items.map(item => item.toLowerCase()))]
      .map(lowerItem => items.find(item => item.toLowerCase() === lowerItem)!)
      .slice(0, 30); // Limit to 30 items for handwriting

    return uniqueItems;
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
    <div className={`min-h-screen bg-stone-50 dark:bg-slate-950 pb-32 animate-fade-in transition-all duration-500 ${isLanguageTransitioning ? 'opacity-95 scale-[0.995]' : 'opacity-100 scale-100'}`} dir={direction} lang={language}>
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
        </div>
      )}

      {/* Sticky Header Group */}
      <div className="bg-gray-50 dark:bg-slate-950 text-black dark:text-slate-100 shadow-sm sticky top-0 z-50 border-b border-gray-200/50 dark:border-slate-800/50">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 md:py-5">
          <div className="flex justify-between items-center w-full mb-2 sm:mb-3 px-2 sm:px-4">
            {/* Title Section - Never truncate */}
            <div className="flex flex-col gap-0.5 flex-shrink-0 min-w-0">
              <div className={`flex items-center gap-0.5 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black drop-shadow-sm leading-tight ${direction === "rtl" ? "flex-row-reverse" : "flex-row"}`}>
                <span className="flex-shrink-0 truncate">{t.appTitle}</span>
                <div className={`flex items-center flex-shrink-0 ${direction === "rtl" ? "mr-0.5 sm:mr-1" : "ml-0.5 sm:ml-1"}`}>
                  <span className="text-black dark:text-slate-100 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-none">✓</span>
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
                    className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-black dark:text-slate-100 flex-shrink-0"
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
              <p className="text-[10px] sm:text-xs md:text-sm text-black/80 dark:text-slate-400 font-bold mt-0.5 whitespace-nowrap">{t.tagline}</p>
            </div>

            {/* Actions Section - Never shrink */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Hamburger Menu */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="w-10 h-10 sm:w-11 sm:h-11 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-black dark:hover:text-slate-100 active:scale-95 transition-all duration-200 shadow touch-manipulation"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-slate-400" strokeWidth={2} />
              </button>

              {/* Mobile Sidebar Menu */}
              {isMenuOpen && (
                <>
                  {/* Backdrop with enhanced fade animation */}
                  <div
                    className="fixed inset-0 bg-black/50 z-[99] backdrop-fade-in"
                    onClick={() => setIsMenuOpen(false)}
                  />

                  {/* Sidebar Drawer */}
                  <div
                    className={`fixed top-0 right-0 h-full w-[75%] max-w-[280px] bg-white dark:bg-slate-900 z-[100] flex flex-col overflow-y-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black dark:border-slate-700 animate-slide-in-right`}
                  >
                    {/* Menu Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b-2 border-black dark:border-slate-700">
                      <h2 className="text-xl sm:text-2xl font-black text-foreground">{language === 'he' ? 'תפריט' : 'Menu'}</h2>
                      <button
                        onClick={() => setIsMenuOpen(false)}
                        className="h-10 w-10 sm:h-11 sm:w-11 bg-black dark:bg-slate-800 hover:bg-gray-800 dark:hover:bg-slate-700 text-white rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[0px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Menu Content */}
                    <div className="flex flex-col gap-3 p-4 sm:p-6 flex-1">
                      {/* Language Toggle with Smooth Transitions */}
                      <div className={`flex items-center gap-1 p-1 bg-[#FEFCE8] dark:bg-slate-800 rounded-xl border-2 border-black dark:border-slate-700 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 ${isLanguageTransitioning ? 'opacity-75 scale-[0.98]' : 'opacity-100 scale-100'}`}>
                        <button
                          onClick={async () => {
                            if (language === 'he') return; // Already active
                            setIsLanguageTransitioning(true);

                            // Add slight delay for visual feedback
                            await new Promise(resolve => setTimeout(resolve, 100));
                            setLanguage('he');

                            // Allow transition to complete
                            setTimeout(() => setIsLanguageTransitioning(false), 300);
                          }}
                          disabled={isLanguageTransitioning}
                          className={`flex-1 px-3 py-3 rounded-lg font-black text-sm sm:text-base transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                            language === 'he'
                              ? 'bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] language-button-active'
                              : 'text-gray-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 hover:scale-105'
                          }`}
                        >
                          עברית
                        </button>
                        <button
                          onClick={async () => {
                            if (language === 'en') return; // Already active
                            setIsLanguageTransitioning(true);

                            // Add slight delay for visual feedback
                            await new Promise(resolve => setTimeout(resolve, 100));
                            setLanguage('en');

                            // Allow transition to complete
                            setTimeout(() => setIsLanguageTransitioning(false), 300);
                          }}
                          disabled={isLanguageTransitioning}
                          className={`flex-1 px-3 py-3 rounded-lg font-black text-sm sm:text-base transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                            language === 'en'
                              ? 'bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] language-button-active'
                              : 'text-gray-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 hover:scale-105'
                          }`}
                        >
                          English
                        </button>
                      </div>

                      {/* New List Button - Primary Action */}
                      <Button
                        onClick={() => {
                          navigate("/");
                          exitEditMode();
                          setIsMenuOpen(false);
                        }}
                        className="w-full h-12 sm:h-14 bg-yellow-400 text-black font-black hover:bg-yellow-500 transition-all duration-300 text-base sm:text-lg rounded-xl active:scale-95 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:scale-105 border-2 border-black language-transition"
                      >
                        <Plus className={`h-5 w-5 sm:h-6 sm:w-6 transition-all duration-200 ${language === 'he' ? 'ml-2' : 'mr-2'}`} />
                        <span className="transition-all duration-300">{t.navigation.list}</span>
                      </Button>

                      {/* Navigation Buttons */}
                      <Button
                        onClick={() => {
                          navigate("/notebook");
                          setIsMenuOpen(false);
                        }}
                        variant="outline"
                        className="w-full h-12 sm:h-14 flex items-center justify-start gap-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-300 text-base sm:text-lg font-bold rounded-xl active:scale-95 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[0px] border-2 border-black dark:border-slate-700"
                      >
                        <Book className="h-5 w-5 sm:h-6 sm:w-6 transition-all duration-200" />
                        <span className="transition-all duration-300">{t.navigation.notebook}</span>
                      </Button>

                      <Button
                        onClick={() => {
                          navigate("/history");
                          setIsMenuOpen(false);
                        }}
                        variant="outline"
                        className="w-full h-12 sm:h-14 flex items-center justify-start gap-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-300 text-base sm:text-lg font-bold rounded-xl active:scale-95 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[0px] border-2 border-black dark:border-slate-700"
                      >
                        <History className="h-5 w-5 sm:h-6 sm:w-6 transition-all duration-200" />
                        <span className="transition-all duration-300">{t.navigation.history}</span>
                      </Button>

                      <Button
                        onClick={() => {
                          navigate("/compare");
                          setIsMenuOpen(false);
                        }}
                        variant="outline"
                        className="w-full h-12 sm:h-14 flex items-center justify-start gap-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-300 text-base sm:text-lg font-bold rounded-xl active:scale-95 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[0px] border-2 border-black dark:border-slate-700"
                      >
                        <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 transition-all duration-200" />
                        <span className="transition-all duration-300">{t.navigation.compare}</span>
                      </Button>

                      <Button
                        onClick={() => {
                          navigate("/about");
                          setIsMenuOpen(false);
                        }}
                        variant="outline"
                        className="w-full h-12 sm:h-14 flex items-center justify-start gap-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-300 text-base sm:text-lg font-bold rounded-xl active:scale-95 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[0px] border-2 border-black dark:border-slate-700"
                      >
                        <Info className="h-5 w-5 sm:h-6 sm:w-6 transition-all duration-200" />
                        <span className="transition-all duration-300">{t.navigation.about}</span>
                      </Button>

                      {/* Spacer */}
                      <div className="flex-1" />

                      {/* Settings at bottom */}
                      <Button
                        onClick={() => {
                          setIsSettingsModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        variant="ghost"
                        className="w-full h-12 sm:h-14 flex items-center justify-start gap-3 text-gray-500 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800 transition-all text-base sm:text-lg font-bold rounded-xl active:scale-95 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[0px] border border-gray-200 dark:border-slate-700 hover:border-black dark:hover:border-slate-600"
                      >
                        <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
                        {language === 'he' ? 'הגדרות' : 'Settings'}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar - Part of sticky header */}
        {
          items.length > 0 && <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Progress value={progressPercentage} className="h-2 sm:h-2.5 bg-primary-foreground/20" />
              <p className="text-xs sm:text-sm text-primary-foreground/90 dark:text-slate-300 text-center font-medium transition-all duration-300">
                {t.progressText(completedCount, items.length)}
              </p>
            </div>
          </div>
        }
      </div >

      {/* Main Content */}
      <div className="max-w-3xl mx-auto pt-8 sm:pt-10 md:pt-12 lg:pt-16 p-3 sm:p-4 md:p-6 lg:p-8 pb-28 sm:pb-32 md:pb-40 overflow-x-hidden transition-all duration-500 ease-out">
        <div className="text-center mb-3 sm:mb-4 md:mb-6 language-transition">
          <h2 className="text-sm sm:text-base md:text-lg font-bold text-foreground mb-0.5 sm:mb-1 transition-all duration-300">
            {activeListId
              ? "מעולה! הרשימה מוכנה לעבודה 📝"
              : t.welcomeHeading
            }
          </h2>
          <p className="text-sm sm:text-base md:text-lg font-medium text-muted-foreground transition-all duration-300 delay-75">
            {activeListId
              ? "תנו לרשימה שם, עדכנו כמויות ושמרו אותה לפנקס."
              : t.welcomeSubtitle
            }
          </p>
        </div>

        {
          activeListId && (
            <div className="flex justify-between items-center w-full mb-3 sm:mb-4 gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-1 min-w-0">
                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                <input
                  ref={titleInputRef}
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="flex-1 bg-transparent text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold border-none outline-none px-1 py-1 select-text focus:cursor-text hover:cursor-text transition border-b-2 border-transparent focus:border-gray-400 hover:border-gray-300 focus:outline-none focus:ring-0 truncate"
                  placeholder={language === 'he' ? 'שם הרשימה...' : 'List name...'}
                  style={{ minWidth: 0 }}
                />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <button
                  onClick={handleReadListAloud}
                  title={isSpeaking ? (language === 'he' ? 'עצור הקראה' : 'Stop reading') : (language === 'he' ? 'הקרא רשימה' : 'Read list aloud')}
                  className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full p-1.5 sm:p-2 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-200 active:scale-95 touch-manipulation"
                  type="button"
                  aria-label={isSpeaking ? (language === 'he' ? 'עצור הקראה' : 'Stop reading') : (language === 'he' ? 'הקרא רשימה' : 'Read list aloud')}
                >
                  {isSpeaking ? (
                    <Square className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900 dark:text-slate-100" />
                  ) : (
                    <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900 dark:text-slate-100" />
                  )}
                </button>
                <button
                  onClick={exitEditMode}
                  title={t.exitEditMode}
                  className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-white shadow-md rounded-full flex items-center justify-center flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 hover:bg-gray-50 transition-colors active:scale-95 touch-manipulation"
                  type="button"
                  aria-label={t.exitEditMode}
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900" />
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
              <div className="flex items-baseline gap-2 mb-3 sm:mb-4">
                <button
                  type="button"
                  className="flex items-center gap-1.5 sm:gap-2 text-yellow-600 hover:text-yellow-700 text-sm sm:text-base md:text-lg font-bold focus:outline-none hover:underline px-1 py-0.5 rounded transition active:scale-95 touch-manipulation"
                  onClick={() => setShowBulkInput(v => !v)}
                  aria-expanded={showBulkInput}
                  tabIndex={0}
                >
                  <ClipboardPaste className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  <span>
                    {language === "he"
                      ? "רוצה להדביק רשימה ארוכה?"
                      : "Want to paste a long list?"}
                  </span>
                </button>
              </div>

              {/* Bulk Input Card (Notebook Style) - Now ABOVE Single Item Row */}
              {showBulkInput && (
                <div className="relative bg-[#FEFCE8] dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] focus-within:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:focus-within:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:border-yellow-400 focus-within:border-yellow-400 transition-all duration-200 hover:-translate-y-0.5 sm:hover:-translate-y-1 focus-within:-translate-y-0.5 sm:focus-within:-translate-y-1"
                  style={theme !== 'dark' ? {
                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)'
                  } : {}}
                >
                  {/* Spiral Binding Effect */}
                  <div className={`absolute top-0 bottom-4 ${language === 'he' ? '-right-3' : '-left-3'} w-8 flex flex-col justify-evenly py-2 z-20 pointer-events-none ${theme === 'dark' ? 'hidden' : ''}`}>
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="relative h-4 w-full">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#1a1a1a] rounded-full shadow-inner" />
                        <div className={`absolute top-1/2 ${language === 'he' ? 'left-1/2' : 'right-1/2'} w-6 h-1.5 bg-zinc-400 rounded-full transform ${language === 'he' ? '-translate-x-1/2 rotate-12' : 'translate-x-1/2 -rotate-12'} shadow-sm`} />
                      </div>
                    ))}
                  </div>

                  {/* Quick Paste Button */}
                  {showPaste && (
                    <button
                      onClick={handleQuickPaste}
                      className={`absolute top-4 ${language === 'he' ? 'left-4' : 'right-4'} flex items-center gap-2 text-gray-600 hover:text-black dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer z-10`}
                      title={language === 'he' ? 'הדבק מהלוח' : 'Paste from clipboard'}
                    >
                      <ClipboardPaste className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        {language === 'he' ? 'הדבק' : 'Paste'}
                      </span>
                    </button>
                  )}

                  {/* Paste Feedback Animation */}
                  {showPasteFeedback && (
                    <div className={`absolute top-4 ${language === 'he' ? 'left-20' : 'right-20'} bg-green-500 text-white px-3 py-1 rounded-lg shadow-lg text-sm font-medium animate-in fade-in slide-in-from-right-2 duration-300`}>
                      {language === 'he' ? 'הודבק!' : 'Pasted!'}
                    </div>
                  )}

                  {/* Smart Input Toolbar */}
                  <div className="flex gap-4 text-gray-500 mb-2 px-2">
                    {/* Voice Dictation Button */}
                    <button
                      onClick={handleVoiceDictation}
                      className={`p-2 rounded-lg hover:text-black dark:hover:text-white transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 ${isVoiceRecording ? 'text-red-500 animate-pulse' : ''
                        }`}
                      title={language === 'he' ? 'הקלטת קול' : 'Voice Dictation'}
                      disabled={isProcessingImage}
                    >
                      <Mic className="h-5 w-5" />
                    </button>

                    {/* Camera OCR Button */}
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className={`p-2 rounded-lg hover:text-black dark:hover:text-white transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 ${isProcessingImage ? 'text-blue-500 animate-pulse' : ''
                        }`}
                      title={language === 'he' ? 'סריקת רשימה' : 'Scan List'}
                      disabled={isVoiceRecording}
                    >
                      <Camera className="h-5 w-5" />
                    </button>

                    {/* Handwriting Button */}
                    <button
                      onClick={() => setIsHandwritingOpen(true)}
                      className={`p-2 rounded-lg hover:text-black dark:hover:text-white transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 ${isProcessingImage ? 'text-blue-500 animate-pulse' : ''
                        }`}
                      title={language === 'he' ? 'כתב יד' : 'Handwriting'}
                      disabled={isVoiceRecording}
                    >
                      <PenLine className="h-5 w-5" />
                    </button>

                    {/* Hidden File Input for Camera */}
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleCameraOCR}
                      className="hidden"
                    />
                  </div>

                  {/* Notepad Items List */}
                  <div className="min-h-[140px] space-y-2">
                    {notepadItems.length === 0 ? (
                      <div
                        className="text-center py-8 text-gray-600 dark:text-slate-400 font-hand text-lg font-normal leading-relaxed whitespace-pre-line cursor-pointer"
                        onClick={() => {
                          const newItem: NotepadItem = {
                            id: `notepad-${Date.now()}`,
                            text: '',
                            isChecked: false
                          };
                          setNotepadItems([newItem]);
                          // Focus the first input
                          setTimeout(() => {
                            if (notepadInputRefs.current[0]) {
                              notepadInputRefs.current[0]!.focus();
                            }
                          }, 0);
                        }}
                      >
                        {t.textareaPlaceholder}
                      </div>
                    ) : (
                      notepadItems.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-3 py-1">
                          <Checkbox
                            checked={item.isChecked}
                            onCheckedChange={() => toggleNotepadItem(item.id)}
                            className="h-4 w-4 border-2 border-black dark:border-slate-600 data-[state=checked]:bg-black dark:data-[state=checked]:bg-slate-600 data-[state=checked]:text-yellow-400 flex-shrink-0"
                          />
                          <StandardizedInput
                            variant="notepad"
                            isChecked={item.isChecked}
                            ref={(el) => {
                              notepadInputRefs.current[index] = el;
                            }}
                            type="text"
                            value={item.text}
                            onChange={(e) => {
                              // Allow free typing without restrictions for notepad items
                              // Only apply basic length limit to prevent memory issues
                              const newText = e.target.value;
                              if (newText.length <= 200) { // Increased limit for notepad items
                                debouncedUpdateNotepad(item.id, newText);
                              }
                            }}
                            onKeyDown={(e) => {
                              const currentIndex = notepadItems.findIndex(i => i.id === item.id);

                              if (e.key === 'Enter') {
                                e.preventDefault();
                                // Create new item at next position
                                const newItem: NotepadItem = {
                                  id: `notepad-${Date.now()}`,
                                  text: '',
                                  isChecked: false
                                };
                                setNotepadItems(prev => {
                                  const newItems = [...prev];
                                  newItems.splice(currentIndex + 1, 0, newItem);
                                  return newItems;
                                });
                                // Focus the new input after state update
                                setTimeout(() => {
                                  if (notepadInputRefs.current[currentIndex + 1]) {
                                    notepadInputRefs.current[currentIndex + 1]!.focus();
                                  }
                                }, 0);

                              } else if (e.key === 'Backspace') {
                                if (item.text === '' && currentIndex > 0) {
                                  e.preventDefault();
                                  // Delete current item and focus previous
                                  setNotepadItems(prev => prev.filter(i => i.id !== item.id));
                                  setTimeout(() => {
                                    if (notepadInputRefs.current[currentIndex - 1]) {
                                      notepadInputRefs.current[currentIndex - 1]!.focus();
                                      // Move cursor to end of text
                                      const input = notepadInputRefs.current[currentIndex - 1]!;
                                      input.setSelectionRange(input.value.length, input.value.length);
                                    }
                                  }, 0);
                                }

                              } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                if (currentIndex > 0 && notepadInputRefs.current[currentIndex - 1]) {
                                  notepadInputRefs.current[currentIndex - 1]!.focus();
                                }

                              } else if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                if (currentIndex < notepadItems.length - 1 && notepadInputRefs.current[currentIndex + 1]) {
                                  notepadInputRefs.current[currentIndex + 1]!.focus();
                                }
                              }
                            }}
                            placeholder={index === 0 && notepadItems.length === 1 ? "הקלד פריט..." : ""}
                          />
                        </div>
                      ))
                    )}
                  </div>

                  {/* Quick Add Form */}
                  <div className="mt-4 p-3 bg-white/60 dark:bg-slate-700/60 border-2 border-gray-300 dark:border-slate-600 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      {/* Item Name Input */}
                      <StandardizedInput
                        type="text"
                        value={quickAddText}
                        onChange={(e) => setQuickAddText(e.target.value)}
                        placeholder={language === 'he' ? 'הוסף פריט חדש...' : 'Add new item...'}
                        className="flex-1 h-9 text-sm border-gray-400 focus:border-yellow-400 bg-white/80 dark:bg-slate-800/80"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleQuickAdd();
                          }
                        }}
                      />

                      {/* Quantity Input */}
                      <Input
                        type="number"
                        min="1"
                        value={quickAddQuantity}
                        onChange={(e) => setQuickAddQuantity(parseInt(e.target.value) || 1)}
                        className="w-14 h-9 text-center text-sm border-gray-400 focus:border-yellow-400 bg-white/80 dark:bg-slate-800/80"
                      />

                      {/* Unit Select */}
                      <Select value={quickAddUnit} onValueChange={(value) => setQuickAddUnit(value as Unit)}>
                        <SelectTrigger className="w-16 h-9 text-xs border-gray-400 focus:border-yellow-400 bg-white/80 dark:bg-slate-800/80">
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

                      {/* Quick Add Button */}
                      <button
                        onClick={handleQuickAdd}
                        className="h-9 px-3 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg border-2 border-black font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-1"
                      >
                        <Plus size={16} />
                        <span>{language === 'he' ? 'הוסף' : 'Add'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 mt-4 w-full transition-all duration-300 ease-in-out relative z-10">
                    <div className={`flex gap-2 overflow-hidden p-1 transition-all duration-300 ease-in-out ${notepadItems.length > 0 ? 'w-full sm:w-1/3 opacity-100' : 'w-0 opacity-0'}`}>
                      <Button
                        onClick={() => setNotepadItems([])}
                        variant="ghost"
                        className="flex-1 text-gray-700 dark:text-slate-400 hover:bg-gray-200 hover:text-red-700 h-11 text-base font-medium rounded-full"
                      >
                        <Trash2 className="mr-2 h-5 w-5" />
                        {t.clearAllButton}
                      </Button>
                    </div>
                    <div className="flex gap-2 p-1">
                      <Button
                        onClick={() => handleQuickAdd()} // Always add blank row when clicking this button
                        variant="outline"
                        className="flex-1 h-11 text-base font-bold border-2 border-gray-400 hover:border-gray-600 text-gray-600 hover:text-gray-800 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <Plus size={20} />
                        <span>{language === 'he' ? 'הוסף שורה' : 'Add Row'}</span>
                      </Button>
                    <Button
                      onClick={handlePaste}
                      disabled={notepadItems.length === 0}
                      className="flex-1 h-11 text-base font-bold bg-yellow-400 text-black hover:bg-yellow-500 px-8 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-black"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      {language === "he" ? "הפוך לרשימה" : "Turn into List"}
                    </Button>
                  </div>
                </div>
              </div>
              )}

              {/* Single Item Row */}
              <div className="bg-[#FEFCE8] dark:bg-slate-800 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black dark:border-slate-700 p-2 sm:p-3 md:p-4 mb-6 w-full relative overflow-visible">
                {/* Decorative "Tape" */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-white/30 dark:bg-white/10 rotate-[-2deg] border-l border-r border-white/40 dark:border-white/20 backdrop-blur-[1px]" />

                <div className="flex w-full items-center gap-1 sm:gap-2 flex-nowrap relative z-10">
                  <StandardizedInput
                    variant="single-item"
                    ref={singleItemInputRef}
                    placeholder={t.addItemPlaceholder}
                    value={singleItemInput}
                    onChange={(e) => setSingleItemInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAddSingleItem()}
                  />
                  <Input
                    type="number"
                    min="0"
                    step={singleItemUnit === 'units' ? "1" : "0.1"}
                    value={singleItemQuantity}
                    onChange={(e) => setSingleItemQuantity(e.target.value)}
                    className="w-[2.5rem] sm:w-[3.5rem] h-9 sm:h-10 text-center text-[10px] sm:text-xs rounded-lg shrink-0 px-0 border-2 border-black dark:border-slate-700 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-white dark:bg-slate-900 !text-black dark:!text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
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
                    <SelectTrigger className="w-[3.5rem] sm:w-[4.5rem] h-9 sm:h-10 text-[10px] sm:text-xs rounded-lg shrink-0 px-0 sm:px-1 border-2 border-black dark:border-slate-700 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-white dark:bg-slate-900 text-center justify-center [&>span]:w-full [&>span]:text-center [&>svg]:hidden !text-black dark:!text-slate-100">
                      <span className="truncate w-full text-center">
                        {(() => {
                          const u = UNITS.find(u => u.value === (singleItemUnit || 'units'));
                          return u ? (language === 'he' ? u.labelHe : u.labelEn) : '';
                        })()}
                      </span>
                    </SelectTrigger>
                    <SelectContent className="border-2 border-black dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white dark:bg-slate-900">
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
                      className="w-9 h-9 sm:w-10 sm:h-10 p-0 shrink-0 grid place-items-center bg-yellow-400 text-black rounded-lg border-2 border-transparent hover:bg-yellow-500 hover:scale-105 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:bg-stone-300 disabled:text-stone-500"
                    >
                      <Plus className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={3} />
                    </Button>
                  </div>
                </div>
              </div>


            </>
          ) : (
            // Notebook Style Input
            <div className="relative bg-[#FEFCE8] dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-xl p-4 md:p-6 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] focus-within:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:border-yellow-400 focus-within:border-yellow-400 transition-all duration-200 hover:-translate-y-1 focus-within:-translate-y-1"
              style={theme !== 'dark' ? {
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)'
              } : {}}
            >
              {/* Spiral Binding Effect */}
              <div className={`absolute top-0 bottom-4 ${language === 'he' ? '-right-3' : '-left-3'} w-8 flex flex-col justify-evenly py-2 z-20 pointer-events-none ${theme === 'dark' ? 'hidden' : ''}`}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="relative h-4 w-full">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#1a1a1a] rounded-full shadow-inner" />
                    <div className={`absolute top-1/2 ${language === 'he' ? 'left-1/2' : 'right-1/2'} w-6 h-1.5 bg-zinc-400 rounded-full transform ${language === 'he' ? '-translate-x-1/2 rotate-12' : 'translate-x-1/2 -rotate-12'} shadow-sm`} />
                  </div>
                ))}
              </div>

              {/* Quick Paste Button */}
              {showPaste && (
                <button
                  onClick={handleQuickPaste}
                  className={`absolute top-4 ${language === 'he' ? 'left-4' : 'right-4'} flex items-center gap-2 text-gray-600 hover:text-black dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer z-10`}
                  title={language === 'he' ? 'הדבק מהלוח' : 'Paste from clipboard'}
                >
                  <ClipboardPaste className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {language === 'he' ? 'הדבק' : 'Paste'}
                  </span>
                </button>
              )}

              {/* Paste Feedback Animation */}
              {showPasteFeedback && (
                <div className={`absolute top-4 ${language === 'he' ? 'left-20' : 'right-20'} bg-green-500 text-white px-3 py-1 rounded-lg shadow-lg text-sm font-medium animate-in fade-in slide-in-from-right-2 duration-300`}>
                  {language === 'he' ? 'הודבק!' : 'Pasted!'}
                </div>
              )}

              {/* Smart Input Toolbar */}
              <div className="flex gap-4 text-gray-500 mb-4 px-2">
                {/* Voice Dictation Button */}
                <button
                  onClick={handleVoiceDictation}
                  className={`p-2 rounded-lg hover:text-black dark:hover:text-white transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 ${isVoiceRecording ? 'text-red-500 animate-pulse' : ''
                    }`}
                  title={language === 'he' ? 'הקלטת קול' : 'Voice Dictation'}
                  disabled={isProcessingImage}
                >
                  <Mic className="h-5 w-5" />
                </button>

                {/* Camera OCR Button */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className={`p-2 rounded-lg hover:text-black dark:hover:text-white transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 ${isProcessingImage ? 'text-blue-500 animate-pulse' : ''
                    }`}
                  title={language === 'he' ? 'סריקת רשימה' : 'Scan List'}
                  disabled={isVoiceRecording}
                >
                  <Camera className="h-5 w-5" />
                </button>

                {/* Handwriting Button */}
                <button
                  onClick={() => setIsHandwritingOpen(true)}
                  className={`p-2 rounded-lg hover:text-black dark:hover:text-white transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 ${isProcessingImage ? 'text-blue-500 animate-pulse' : ''
                    }`}
                  title={language === 'he' ? 'כתב יד' : 'Handwriting'}
                  disabled={isVoiceRecording}
                >
                  <PenLine className="h-5 w-5" />
                </button>

                {/* Hidden File Input for Camera */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraOCR}
                  className="hidden"
                />
              </div>

              {/* Notepad Items List */}
              <div className="min-h-[140px] space-y-2">
                {notepadItems.length === 0 ? (
                  <div
                    className="text-center py-8 text-gray-600 dark:text-slate-400 font-hand text-lg font-normal leading-relaxed whitespace-pre-line cursor-pointer"
                    onClick={() => {
                      const newItem: NotepadItem = {
                        id: `notepad-${Date.now()}`,
                        text: '',
                        isChecked: false
                      };
                      setNotepadItems([newItem]);
                      // Focus the first input
                      setTimeout(() => {
                        if (notepadInputRefs.current[0]) {
                          notepadInputRefs.current[0]!.focus();
                        }
                      }, 0);
                    }}
                  >
                    {t.textareaPlaceholder}
                  </div>
                ) : (
                  notepadItems.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3 py-1">
                      <Checkbox
                        checked={item.isChecked}
                        onCheckedChange={() => toggleNotepadItem(item.id)}
                        className="h-4 w-4 border-2 border-black dark:border-slate-600 data-[state=checked]:bg-black dark:data-[state=checked]:bg-slate-600 data-[state=checked]:text-yellow-400 flex-shrink-0"
                      />
                      <input
                        ref={(el) => {
                          notepadInputRefs.current[index] = el;
                        }}
                        type="text"
                        value={item.text}
                        onChange={(e) => {
                          const newText = e.target.value;
                          setNotepadItems(prev => prev.map(i =>
                            i.id === item.id ? { ...i, text: newText } : i
                          ));
                        }}
                        onKeyDown={(e) => {
                          const currentIndex = notepadItems.findIndex(i => i.id === item.id);

                          if (e.key === 'Enter') {
                            e.preventDefault();
                            // Create new item at next position
                            const newItem: NotepadItem = {
                              id: `notepad-${Date.now()}`,
                              text: '',
                              isChecked: false
                            };
                            setNotepadItems(prev => {
                              const newItems = [...prev];
                              newItems.splice(currentIndex + 1, 0, newItem);
                              return newItems;
                            });
                            // Focus the new input after state update
                            setTimeout(() => {
                              if (notepadInputRefs.current[currentIndex + 1]) {
                                notepadInputRefs.current[currentIndex + 1]!.focus();
                              }
                            }, 0);

                          } else if (e.key === 'Backspace') {
                            if (item.text === '' && currentIndex > 0) {
                              e.preventDefault();
                              // Delete current item and focus previous
                              setNotepadItems(prev => prev.filter(i => i.id !== item.id));
                              setTimeout(() => {
                                if (notepadInputRefs.current[currentIndex - 1]) {
                                  notepadInputRefs.current[currentIndex - 1]!.focus();
                                  // Move cursor to end of text
                                  const input = notepadInputRefs.current[currentIndex - 1]!;
                                  input.setSelectionRange(input.value.length, input.value.length);
                                }
                              }, 0);
                            }

                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            if (currentIndex > 0 && notepadInputRefs.current[currentIndex - 1]) {
                              notepadInputRefs.current[currentIndex - 1]!.focus();
                            }

                          } else if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            if (currentIndex < notepadItems.length - 1 && notepadInputRefs.current[currentIndex + 1]) {
                              notepadInputRefs.current[currentIndex + 1]!.focus();
                            }
                          }
                        }}
                        className={`flex-1 text-lg font-normal font-hand bg-transparent outline-none caret-yellow-500 dark:caret-white ${item.isChecked ? 'line-through text-gray-500 dark:text-slate-500' : 'text-black dark:text-slate-200'} placeholder:text-gray-400 dark:placeholder:text-slate-500`}
                        placeholder={index === 0 && notepadItems.length === 1 ? "הקלד פריט..." : ""}
                      />
                    </div>
                  ))
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-4 w-full transition-all duration-300 ease-in-out relative z-10">
                {/* Secondary buttons */}
                <div className={`flex gap-2 overflow-hidden p-1 transition-all duration-300 ease-in-out ${notepadItems.length > 0 ? 'w-full sm:w-1/3 opacity-100' : 'w-0 opacity-0'}`}>
                  <Button
                    onClick={() => setNotepadItems([])}
                    variant="ghost"
                    className="flex-1 text-gray-700 dark:text-slate-400 hover:bg-gray-200 hover:text-red-700 h-11 text-base font-medium rounded-full"
                  >
                    <Trash2 className="mr-2 h-5 w-5" />
                    {t.clearAllButton}
                  </Button>
                </div>
                {/* Add button */}
                <Button
                  onClick={handlePaste}
                  disabled={notepadItems.length === 0}
                  className={`h-11 text-base font-bold bg-yellow-400 text-black hover:bg-yellow-500 px-8 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-black ${notepadItems.length > 0 ? 'w-full sm:w-2/3' : 'w-full'}`}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  {language === "he" ? "הפוך לרשימה" : "Turn into List"}
                </Button>
              </div>
            </div>
          )
        }

        {/* Quick Start Templates */}
        {items.length === 0 && (
          <SortableTemplates
            systemTemplates={currentTemplates}
            language={language}
            onTemplateClick={handleTemplateClick}
            onCreateNew={() => setIsCreateTemplateDialogOpen(true)}
          />
        )}

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

        {/* Secondary Action Bar */}
        {
          items && items.length > 0 && (
            <div className="flex justify-start mb-4">
              <button
                onClick={() => {
                  if (items && items.length > 0) {
                    setItems(items.map(item => ({ ...item, checked: false })));
                    toast.success(language === 'he' ? 'כל הסימונים אופסו' : 'All checks reset');
                  }
                }}
                className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{language === 'he' ? 'אפס סימונים' : 'Reset Checks'}</span>
              </button>
            </div>
          )
        }

        {/* Items List */}
        {
          items && items.length > 0 && (
            <div className="space-y-4">
              {/* Pending Items */}
              <div className="space-y-2.5">
                {items.filter(item => !item.checked).map((item) => (
                  <ShoppingListItem
                    key={item.id}
                    item={item}
                    onToggle={toggleItem}
                    onDelete={deleteItem}
                    onQuantityChange={updateItemQuantity}
                    onUnitChange={updateItemUnit}
                  />
                ))}
              </div>

              {/* Completed Items Separator */}
              {items.filter(item => item.checked).length > 0 && (
                <div className="text-gray-500 dark:text-slate-500 text-sm font-medium py-4 flex items-center gap-4 before:h-px before:flex-1 before:bg-gray-300 dark:before:bg-slate-600 after:h-px after:flex-1 after:bg-gray-300 dark:after:bg-slate-600">
                  <span className="whitespace-nowrap">
                    {language === 'he' ? `בוצע (${items.filter(item => item.checked).length})` : `Completed (${items.filter(item => item.checked).length})`}
                  </span>
                </div>
              )}

              {/* Completed Items (Always Visible) */}
              {items.filter(item => item.checked).length > 0 && (
                <div className="space-y-2.5">
                  {items.filter(item => item.checked).map((item) => (
                    <ShoppingListItem
                      key={item.id}
                      item={item}
                      onToggle={toggleItem}
                      onDelete={deleteItem}
                      onQuantityChange={updateItemQuantity}
                      onUnitChange={updateItemUnit}
                      isCompleted={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        {
          items && items.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-3 sm:p-4 safe-area-inset-bottom">
              <div className="max-w-3xl mx-auto">
                <div className="flex flex-row gap-2 sm:gap-4">
                  {(() => {
                    const isSavedList = activeListId && savedLists.some(list => list.id === activeListId);
                    return (
                      <Button variant="outline" onClick={handleSaveList} className="flex-1 h-11 sm:h-12 font-bold text-sm sm:text-base touch-manipulation rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all">
                        <Save className={`h-4 w-4 sm:h-5 sm:w-5 ${language === 'he' ? 'ml-1 sm:ml-2' : 'mr-1 sm:mr-2'}`} />
                        <span className="truncate">{isSavedList ? t.saveChangesButton : t.saveListButton}</span>
                      </Button>
                    );
                  })()}
                  <Button onClick={openFinishDialog} className="flex-1 h-11 sm:h-12 font-bold bg-slate-900 text-white hover:bg-slate-800 text-sm sm:text-base touch-manipulation rounded-xl border-2 border-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] sm:hover:translate-y-[-2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-y-[0px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-all">
                    <ClipboardList className={`h-4 w-4 sm:h-5 sm:w-5 ${language === 'he' ? 'ml-1 sm:ml-2' : 'mr-1 sm:mr-2'}`} />
                    <span className="truncate">{t.summarizeButton}</span>
                  </Button>
                </div>
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
                <StandardizedTextarea
                  id="templateItems"
                  value={newTemplateItems}
                  onChange={(e) => setNewTemplateItems(e.target.value)}
                  placeholder={language === 'he' ? 'הדבק או הקלד את רשימת הקניות שלך, כל פריט בשורה נפרדת' : 'Paste or type your shopping list, one item per line'}
                  className="min-h-[120px] text-base"
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

        <SettingsModal
          open={isSettingsModalOpen}
          onOpenChange={setIsSettingsModalOpen}
        />

        {isHandwritingOpen && (
          <HandwritingCanvas
            onSubmit={handleHandwritingSubmit}
            onCancel={() => setIsHandwritingOpen(false)}
            language={language}
          />
        )}
      </div >
    </div >
  );
};
