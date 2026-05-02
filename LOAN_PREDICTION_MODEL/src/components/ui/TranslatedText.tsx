import { useEffect, useState } from 'react';
import { useTranslation } from '../../contexts/TranslationContext';

interface TranslatedTextProps {
  text: string;
  className?: string;
}

export default function TranslatedText({ text, className = '' }: TranslatedTextProps) {
  const { translateText, currentLanguage } = useTranslation();
  const [translatedContent, setTranslatedContent] = useState(text);

  useEffect(() => {
    const translate = async () => {
      const translated = await translateText(text);
      setTranslatedContent(translated);
    };

    if (currentLanguage !== 'en-IN') {
      translate();
    } else {
      setTranslatedContent(text);
    }
  }, [text, currentLanguage, translateText]);

  return <span className={className}>{translatedContent}</span>;
} 