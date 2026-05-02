import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface TranslationContextType {
  currentLanguage: string;
  isTranslating: boolean;
  translateText: (text: string) => Promise<string>;
  setLanguage: (language: string) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Cache for storing translated texts
const translationCache: { [key: string]: { [key: string]: string } } = {};

// Queue for managing translation requests
let translationQueue: { text: string; resolve: (value: string) => void }[] = [];
let isProcessingQueue = false;

const RETRY_DELAY = 1000; // 1 second delay between retries
const MAX_RETRIES = 3;

const SARVAM_API_KEY = import.meta.env.VITE_SARVAM_API_KEY;

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState('en-IN');
  const [isTranslating, setIsTranslating] = useState(false);

  const processQueue = useCallback(async () => {
    if (isProcessingQueue || translationQueue.length === 0) return;
    
    isProcessingQueue = true;
    const { text, resolve } = translationQueue[0];
    
    try {
      const response = await fetch('https://api.sarvam.ai/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': SARVAM_API_KEY
        },
        body: JSON.stringify({
          input: text,
          source_language_code: 'en-IN',
          target_language_code: currentLanguage,
          mode: 'formal',
          enable_preprocessing: true
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          // If rate limited, wait and retry
          translationQueue.push(translationQueue.shift()!);
          setTimeout(processQueue, RETRY_DELAY);
          return;
        }
        throw new Error('Translation failed');
      }

      const data = await response.json();
      resolve(data.translated_text);
      
      // Cache the result
      if (!translationCache[currentLanguage]) {
        translationCache[currentLanguage] = {};
      }
      translationCache[currentLanguage][text] = data.translated_text;
      
    } catch (error) {
      console.error('Translation error:', error);
      resolve(text); // Return original text on error
    } finally {
      translationQueue.shift();
      isProcessingQueue = false;
      if (translationQueue.length > 0) {
        setTimeout(processQueue, 200); // Add small delay between requests
      } else {
        setIsTranslating(false);
      }
    }
  }, [currentLanguage]);

  const translateText = useCallback(async (text: string): Promise<string> => {
    if (currentLanguage === 'en-IN') return text;
    
    // Check cache first
    if (translationCache[currentLanguage]?.[text]) {
      return translationCache[currentLanguage][text];
    }

    setIsTranslating(true);

    return new Promise((resolve) => {
      translationQueue.push({ text, resolve });
      processQueue();
    });
  }, [currentLanguage, processQueue]);

  const setLanguage = useCallback((language: string) => {
    setCurrentLanguage(language);
  }, []);

  return (
    <TranslationContext.Provider 
      value={{ 
        currentLanguage, 
        isTranslating, 
        translateText, 
        setLanguage 
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
} 