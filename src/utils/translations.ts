import { Language } from "@/hooks/use-language";

export const translations: Record<Language, {
    languageLabel: string;
    languageAria: string;
    appTitle: string;
    tagline: string;
    fabLabel: string;
    menuTitle: string;
    welcomeHeading: string;
    welcomeSubtitle: string;
    templatesHeading: string;
    recentListsHeading: string;
    viewAllListsButton: string;
    addItemButton: string;
    addItemPlaceholder: string;
    navigation: {
        list: string;
        history: string;
        compare: string;
        notebook: string;
        about: string;
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
        listUpdated: string;
    };
    saveListButton: string;
    saveChangesButton: string;
    exitEditMode: string;
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
    about: {
        title: string;
        description: string;
        betaNotice: string;
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
        recentListsHeading: "רשימות אחרונות",
        viewAllListsButton: "לכל הרשימות בפנקס",
        addItemButton: "הוסף פריט",
        addItemPlaceholder: "שם הפריט...",
        navigation: {
            list: "רשימה חדשה",
            history: "היסטוריה",
            compare: "השוואת קניות",
            notebook: "הפנקס שלי",
            about: "אודות"
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
            listRenamed: "שם הרשימה עודכן בהצלחה",
            listUpdated: "השינויים נשמרו ברשימה בהצלחה"
        },
        saveListButton: "שמור רשימה",
        saveChangesButton: "שמור שינויים",
        exitEditMode: "יציאה מעריכה",
        summarizeButton: "סיום ותיעוד",
        myListsTitle: "הפנקס שלי",
        emptyLists: "אין רשימות שמורות עדיין",
        itemsCount: (count: number) => `${count} פריטים`,
        moreItems: (count: number) => `+${count} נוספים`,
        saveDialog: {
            title: "שמירה ושיתוף הרשימה",
            nameLabel: "שם הרשימה",
            namePlaceholder: "רשימה ליום...",
            saveButton: "שמור לפנקס שלי",
            shareTitle: "או שתפו את הרשימה",
            shareWhatsapp: "ווטסאפ",
            shareCopy: "העתק",
            shareCsv: "אקסל",
            shareEmail: "אימייל",
            sharePrint: "הדפסה"
        },
        renameDialog: {
            title: "שנה שם רשימה",
            save: "שמור",
            cancel: "ביטול"
        },
        about: {
            title: "אודות עגליסט",
            description: "עגליסט היא אפליקציה חכמה לניהול רשימות קניות, שנועדה לעזור לך לקנות בצורה חכמה וחסכונית יותר.",
            betaNotice: "גרסת הרצה (Beta)"
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
        recentListsHeading: "Recent Lists",
        viewAllListsButton: "Go to My Notebook",
        addItemButton: "Add Item",
        addItemPlaceholder: "Item name...",
        navigation: {
            list: "New List",
            history: "History",
            compare: "Compare prices",
            notebook: "My Notebook",
            about: "About"
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
            listRenamed: "List renamed successfully",
            listUpdated: "Changes saved successfully"
        },
        saveListButton: "Save List",
        saveChangesButton: "Save Changes",
        exitEditMode: "Exit Edit Mode",
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
        },
        about: {
            title: "About Agalist",
            description: "Agalist is a smart shopping list app designed to help you shop smarter and save money.",
            betaNotice: "Beta Version"
        }
    }
};
