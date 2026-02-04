// Security and anti-spam utilities for input handling

// Profanity filter word lists (English and Hebrew)
const PROFANITY_WORDS = [
  // English profanity
  'fuck', 'shit', 'damn', 'bitch', 'asshole', 'bastard', 'crap', 'piss',
  'dick', 'cock', 'pussy', 'cunt', 'whore', 'slut', 'fag', 'nigger',
  'nigga', 'chink', 'gook', 'kike', 'spic', 'wetback', 'coon', 'jap',

  // Hebrew profanity (common words)
  'זבל', 'חרא', 'שרמוטה', 'כלב', 'בן זונה', 'שמוק', 'טמבל', 'אידיוט',
  'מטומטם', 'חמור', 'מניאק', 'פודל', 'שמוליק', 'פוץ', 'זין', 'כוס'
];

// Rate limiting constants
const ADD_COOLDOWN_MS = 300; // 300ms between adds
const MAX_LIST_SIZE = 100; // Maximum 100 items per list

/**
 * Sanitizes input text by removing potentially dangerous characters
 * and enforcing length limits
 */
export const sanitizeInput = (text: string): string => {
  if (!text || typeof text !== 'string') return '';

  // Remove HTML/script tags and dangerous characters
  let sanitized = text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[{}]/g, '') // Remove curly braces
    .replace(/\//g, '') // Remove forward slashes
    .trim();

  // Enforce max length of 50 characters per item
  if (sanitized.length > 50) {
    sanitized = sanitized.substring(0, 50);
  }

  return sanitized;
};

/**
 * Checks if text contains profanity - returns true if blocked word found
 */
export const containsProfanity = (text: string): boolean => {
  if (!text || typeof text !== 'string') return false;

  const lowerText = text.toLowerCase();
  return PROFANITY_WORDS.some(word => {
    try {
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
      return regex.test(lowerText);
    } catch {
      return lowerText.includes(word.toLowerCase());
    }
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

