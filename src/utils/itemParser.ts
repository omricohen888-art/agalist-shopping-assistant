import { Unit } from '@/types/shopping';

interface ParsedItem {
  text: string;
  quantity: number;
  unit: Unit;
}

/**
 * Parse item text to extract quantity and unit
 * Examples: "Sugar 1kg", "Tomatoes 500g", "Eggs 1 pack", "Milk 2"
 */
export const parseItemWithUnit = (input: string): ParsedItem => {
  const trimmed = input.trim();
  
  // Regex to match quantity and unit at the end
  // Matches: "1kg", "500g", "1 pack", "2 package", etc.
  const unitRegex = /(\d+(?:\.\d+)?)\s*(kg|g|pack|package|יח|חבילה|ק"ג|גרם)?\s*$/i;
  const match = trimmed.match(unitRegex);
  
  if (match) {
    const quantity = parseFloat(match[1]);
    const unitStr = match[2]?.toLowerCase() || 'units';
    let unit: Unit = 'units';
    
    // Map various unit strings to standardized units
    if (unitStr === 'kg' || unitStr === 'ק"ג') {
      unit = 'kg';
    } else if (unitStr === 'g' || unitStr === 'גרם') {
      unit = 'g';
    } else if (unitStr === 'pack' || unitStr === 'package' || unitStr === 'חבילה') {
      unit = 'package';
    } else if (unitStr === 'יח') {
      unit = 'units';
    } else {
      unit = 'units';
    }
    
    // Remove the quantity+unit part from text to get item name
    const itemText = trimmed.replace(unitRegex, '').trim();
    
    // If we couldn't parse quantity or text is empty, treat as plain text
    if (!itemText || isNaN(quantity)) {
      return {
        text: trimmed,
        quantity: 1,
        unit: 'units'
      };
    }
    
    return {
      text: itemText,
      quantity,
      unit
    };
  }
  
  // No quantity/unit found, return plain text
  return {
    text: trimmed,
    quantity: 1,
    unit: 'units'
  };
};

/**
 * Format item with quantity and unit for display
 */
export const formatItemDisplay = (text: string, quantity: number, unit: Unit, language: 'he' | 'en'): string => {
  if (quantity === 1 && unit === 'units') {
    return text;
  }
  
  const unitLabels: Record<Unit, Record<'he' | 'en', string>> = {
    'units': { he: "יח'", en: 'units' },
    'g': { he: 'גרם', en: 'g' },
    'kg': { he: 'ק"ג', en: 'kg' },
    'package': { he: 'חבילה', en: 'package' }
  };
  
  const unitLabel = unitLabels[unit][language];
  return `${text} ${quantity}${unitLabel}`;
};
