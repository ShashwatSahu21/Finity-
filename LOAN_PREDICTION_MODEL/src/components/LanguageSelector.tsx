import { useTranslation } from '../contexts/TranslationContext';

const languages = [
  { code: 'en-IN', name: 'English' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'bn-IN', name: 'Bengali' },
  { code: 'gu-IN', name: 'Gujarati' },
  { code: 'kn-IN', name: 'Kannada' },
  { code: 'ml-IN', name: 'Malayalam' },
  { code: 'mr-IN', name: 'Marathi' },
  { code: 'od-IN', name: 'Odia' },
  { code: 'pa-IN', name: 'Punjabi' },
  { code: 'ta-IN', name: 'Tamil' },
  { code: 'te-IN', name: 'Telugu' }
];

export default function LanguageSelector() {
  const { currentLanguage, setLanguage, isTranslating } = useTranslation();

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
  };

  return (
    <div className="relative">
      <select
        value={currentLanguage}
        onChange={handleLanguageChange}
        className="appearance-none bg-white/10 text-white px-4 py-2 pr-8 rounded-lg border border-white/20 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isTranslating}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-neutral-900">
            {lang.name}
          </option>
        ))}
      </select>
      
      {isTranslating && (
        <div className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center bg-black/50 rounded-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
} 