import React from 'react';
import { renderSafeText } from '@/lib/sanitize';

interface SafeTextProps {
  children: string;
  className?: string;
  [key: string]: any;
}

/**
 * SafeText component that automatically sanitizes user-generated content
 * Use this instead of directly rendering user text to prevent XSS
 */
export function SafeText({ children, className, ...props }: SafeTextProps) {
  const safeContent = renderSafeText(children || '');
  
  return (
    <span 
      className={className} 
      {...props}
      dangerouslySetInnerHTML={{ __html: safeContent }}
    />
  );
}

/**
 * SafeTextDiv component for larger text blocks
 */
export function SafeTextDiv({ children, className, ...props }: SafeTextProps) {
  const safeContent = renderSafeText(children || '');
  
  return (
    <div 
      className={className} 
      {...props}
      dangerouslySetInnerHTML={{ __html: safeContent }}
    />
  );
}