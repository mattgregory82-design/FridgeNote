// Server-side text sanitization without JSDOM dependency
// Using simple HTML entity encoding for security

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof dirty !== 'string') {
    return '';
  }
  
  // Remove all HTML tags and decode entities
  return dirty
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

/**
 * Sanitize text input by escaping HTML entities
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize shopping item text
 */
export function sanitizeShoppingItem(item: any): any {
  if (!item || typeof item !== 'object') {
    return null;
  }

  return {
    ...item,
    name: sanitizeText(item.name || ''),
    text: sanitizeText(item.text || ''),
    category: sanitizeText(item.category || ''),
    confidence: typeof item.confidence === 'number' ? item.confidence : 0
  };
}

/**
 * Validate input length to prevent DoS attacks
 */
export function validateInputLength(input: string, maxLength: number = 1000): boolean {
  return typeof input === 'string' && input.length <= maxLength;
}

/**
 * Validate that numeric inputs are within reasonable bounds
 */
export function validateNumericInput(input: any, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number | null {
  const num = Number(input);
  if (isNaN(num) || num < min || num > max) {
    return null;
  }
  return num;
}