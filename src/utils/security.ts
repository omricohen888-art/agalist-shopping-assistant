// Security and anti-spam utilities for input handling

// Profanity filter word lists (Multiple languages)
const PROFANITY_WORDS = [
  // English
  'fuck', 'shit', 'damn', 'bitch', 'asshole', 'bastard', 'crap', 'piss',
  'dick', 'cock', 'pussy', 'cunt', 'whore', 'slut', 'fag', 'nigger',
  'nigga', 'chink', 'gook', 'kike', 'spic', 'wetback', 'coon', 'jap',
  
  // Hebrew
  'זבל', 'חרא', 'שרמוטה', 'כלב', 'בן זונה', 'שמוק', 'טמבל', 'אידיוט',
  'מטומטם', 'חמור', 'מניאק', 'פודל', 'שמוליק', 'פוץ', 'זין', 'כוס',
  'זונה', 'דפוק', 'מפגר', 'חארה', 'בהמה',
  
  // Spanish
  'puta', 'mierda', 'pendejo', 'cabron', 'chingar', 'joder', 'verga',
  'culo', 'polla', 'gilipollas', 'maricon', 'coño', 'hostia', 'cojones',
  
  // French
  'merde', 'putain', 'salaud', 'connard', 'enculer', 'bordel', 'nique',
  'salope', 'foutre', 'batard', 'con', 'pute',
  
  // German
  'scheiße', 'scheisse', 'arschloch', 'fick', 'ficken', 'hurensohn',
  'wichser', 'fotze', 'schwanz', 'schlampe', 'hure', 'verdammt',
  
  // Russian (transliterated)
  'blyad', 'suka', 'huy', 'pizda', 'ebat', 'mudak', 'zalupa',
  'pidar', 'gandon', 'debil', 'dolbaeb',
  
  // Arabic (transliterated)
  'kuss', 'sharmouta', 'ibn el sharmouta', 'ibn haram', 'ayre',
  'khara', 'maniak', 'hayawan', 'khawal',
  
  // Portuguese
  'puta', 'caralho', 'foda', 'merda', 'buceta', 'viado', 'cuzao',
  'porra', 'cacete', 'filho da puta',
  
  // Italian
  'cazzo', 'merda', 'puttana', 'stronzo', 'figa', 'vaffanculo',
  'minchia', 'coglione', 'troia', 'bastardo',
  
  // Turkish
  'siktir', 'amina', 'orospu', 'pic', 'gavat', 'ibne',
  
  // Dutch
  'kut', 'hoer', 'lul', 'godverdomme', 'klootzak', 'eikel',
  
  // Polish
  'kurwa', 'chuj', 'dupa', 'pierdol', 'skurwysyn', 'dziwka'
];

// Rate limiting constants
const ADD_COOLDOWN_MS = 300; // 300ms between adds
const MAX_LIST_SIZE = 100; // Maximum 100 items per list

/**
 * Sanitizes input text by removing HTML, scripts, and dangerous characters
 */
export const sanitizeInput = (text: string): string => {
  if (!text || typeof text !== 'string') return '';

  let sanitized = text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags with content
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers (onclick=, etc.)
    .replace(/[<>{}]/g, '') // Remove angle brackets and curly braces
    .replace(/&[#\w]+;/g, '') // Remove HTML entities
    .trim();

  // Enforce max length
  if (sanitized.length > 50) {
    sanitized = sanitized.substring(0, 50);
  }

  return sanitized;
};

/**
 * Checks if text contains profanity - returns true if blocked word found
 * Uses simple includes() for Hebrew since \b word boundaries don't work with Hebrew
 */
export const containsProfanity = (text: string): boolean => {
  if (!text || typeof text !== 'string') return false;

  const normalizedText = text.toLowerCase().trim();
  
  return PROFANITY_WORDS.some(word => {
    const normalizedWord = word.toLowerCase();
    // Simple includes check works better for Hebrew
    return normalizedText.includes(normalizedWord);
  });
};

/**
 * Filters profanity by replacing bad words with asterisks
 */
export const filterProfanity = (text: string): string => {
  if (!text || typeof text !== 'string') return '';

  let filtered = text;

  PROFANITY_WORDS.forEach(word => {
    try {
      // Escape special regex characters in the word
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Case-insensitive replacement with word boundaries
      const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    } catch (error) {
      console.error('Error filtering profanity for word:', word, error);
    }
  });

  return filtered;
};

/**
 * Validates input text for security and spam prevention
 */
export const validateInput = (text: string): { isValid: boolean; error?: string } => {
  if (!text || typeof text !== 'string') {
    return { isValid: false, error: 'Invalid input' };
  }

  const trimmed = text.trim();

  // Check for empty/whitespace only
  if (!trimmed) {
    return { isValid: false, error: 'Item cannot be empty' };
  }

  // Too short (less than 2 characters)
  if (trimmed.length < 2) {
    return { isValid: false, error: 'קצר מדי' };
  }

  // Too long (more than 50 characters)
  if (trimmed.length > 50) {
    return { isValid: false, error: 'ארוך מדי' };
  }

  // Repeated characters (e.g., "aaaaaaa" - 4+ same char in a row)
  if (/(.)\1{3,}/i.test(trimmed)) {
    return { isValid: false, error: 'תוכן לא תקין' };
  }

  // Repeated words (e.g., "milk milk milk" - same word 3+ times)
  const words = trimmed.toLowerCase().split(/\s+/);
  if (words.length >= 3) {
    const wordCounts: Record<string, number> = {};
    for (const word of words) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
      if (wordCounts[word] >= 3) {
        return { isValid: false, error: 'תוכן לא תקין' };
      }
    }
  }

  // Check for HTML/script content (basic detection)
  if (/<script|javascript:|on\w+=/i.test(text)) {
    return { isValid: false, error: 'Invalid content detected' };
  }

  return { isValid: true };
};

/**
 * Rate limiting class for preventing spam
 */
export class RateLimiter {
  private lastAddTime: number = 0;

  /**
   * Checks if an action can be performed (not spamming)
   */
  canAdd(): { allowed: boolean; waitTime?: number } {
    const now = Date.now();
    const timeSinceLastAdd = now - this.lastAddTime;

    if (timeSinceLastAdd < ADD_COOLDOWN_MS) {
      return {
        allowed: false,
        waitTime: ADD_COOLDOWN_MS - timeSinceLastAdd
      };
    }

    return { allowed: true };
  }

  /**
   * Records that an add action was performed
   */
  recordAdd(): void {
    this.lastAddTime = Date.now();
  }
}

/**
 * Checks if the list has reached maximum size
 */
export const checkListSize = (currentItems: unknown[]): { allowed: boolean; error?: string } => {
  if (!Array.isArray(currentItems)) {
    return { allowed: false, error: 'Invalid list' };
  }

  if (currentItems.length >= MAX_LIST_SIZE) {
    return {
      allowed: false,
      error: 'הגעתם למקסימום פריטים ברשימה' // Max items reached
    };
  }

  return { allowed: true };
};

/**
 * Comprehensive input processing with all security measures
 */
export const processInput = (
  rawText: string,
  currentItems: unknown[],
  rateLimiter: RateLimiter
): {
  processedText: string;
  isValid: boolean;
  error?: string;
  canAdd: boolean;
  waitTime?: number;
} => {
  // Rate limiting check
  const rateCheck = rateLimiter.canAdd();
  if (!rateCheck.allowed) {
    return {
      processedText: '',
      isValid: false,
      error: 'נא להאט את קצב ההקלדה', // Please slow down
      canAdd: false,
      waitTime: rateCheck.waitTime
    };
  }

  // List size check
  const sizeCheck = checkListSize(currentItems);
  if (!sizeCheck.allowed) {
    return {
      processedText: '',
      isValid: false,
      error: sizeCheck.error,
      canAdd: false
    };
  }

  // Sanitize input
  const sanitized = sanitizeInput(rawText);

  // Validate input
  const validation = validateInput(sanitized);
  if (!validation.isValid) {
    return {
      processedText: sanitized,
      isValid: false,
      error: validation.error,
      canAdd: false
    };
  }

  // Filter profanity
  const filtered = filterProfanity(sanitized);

  return {
    processedText: filtered,
    isValid: true,
    canAdd: true
  };
};

