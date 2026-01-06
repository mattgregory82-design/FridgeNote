import { useState, useCallback } from "react";
import { createWorker, Word } from "tesseract.js";
import type { ShoppingItem } from "@shared/schema";

export function useOCR() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processImage = useCallback(async (imageFile: File | Blob): Promise<ShoppingItem[]> => {
    setIsProcessing(true);
    
    try {
      // Tesseract.js v5+ API: createWorker with language in options
      const worker = await createWorker('eng', 1, {
        logger: (m) => console.log(m),
      });
      
      const { data } = await worker.recognize(imageFile);
      
      // Parse the OCR text into shopping items
      const lines = data.text
        .split('\n')
        .filter(line => line.trim().length > 0)
        .filter(line => {
          // Filter out very short lines or lines that look like noise
          const trimmed = line.trim();
          return trimmed.length > 2 && /[a-zA-Z]/.test(trimmed);
        });

      // Get words from the result (Tesseract.js v5+ structure)
      const words: Word[] = (data as { words?: Word[] }).words || [];

      const items: ShoppingItem[] = lines.map((line, index) => {
        // Clean up the text
        const cleanText = line.trim()
          .replace(/[^\w\s()-]/g, '') // Remove special characters except parentheses and hyphens
          .replace(/\s+/g, ' '); // Normalize whitespace

        // Calculate confidence based on word data if available
        let confidence = 0.8; // Default confidence
        if (words.length > 0) {
          const lineWords = words.filter((word: Word) => 
            line.toLowerCase().includes(word.text.toLowerCase())
          );
          if (lineWords.length > 0) {
            confidence = lineWords.reduce((sum: number, word: Word) => sum + word.confidence, 0) / lineWords.length / 100;
          }
        }

        const matchedWord = words.find((word: Word) => line.includes(word.text));
        
        return {
          id: `ocr-${Date.now()}-${index}`,
          text: cleanText,
          confidence: Math.max(0.5, Math.min(1.0, confidence)), // Clamp between 0.5 and 1.0
          completed: false,
          position: matchedWord?.bbox ? {
            x: matchedWord.bbox.x0,
            y: matchedWord.bbox.y0,
            width: matchedWord.bbox.x1 - matchedWord.bbox.x0,
            height: matchedWord.bbox.y1 - matchedWord.bbox.y0,
          } : undefined,
        };
      });

      await worker.terminate();
      
      // Filter out items with very low confidence or empty text
      return items.filter(item => item.text.length > 0 && item.confidence > 0.4);
      
    } catch (error) {
      console.error("OCR processing failed:", error);
      
      // Fallback: return mock data for demo purposes
      return [
        {
          id: "fallback-1",
          text: "Unable to process image",
          confidence: 0.5,
          completed: false,
        }
      ];
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    processImage,
    isProcessing,
  };
}
