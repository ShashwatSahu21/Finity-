import React from 'react';
import { useSpeech } from '../hooks/useSpeech';

const languages = {
  'en': 'English',
  'hi': 'हिंदी (Hindi)',
  'bn': 'বাংলা (Bengali)',
  'kn': 'ಕನ್ನಡ (Kannada)',
  'ml': 'മലയാളം (Malayalam)',
  'mr': 'मराठी (Marathi)',
  'od': 'ଓଡ଼ିଆ (Odia)',
  'pa': 'ਪੰਜਾਬੀ (Punjabi)',
  'ta': 'தமிழ் (Tamil)',
  'te': 'తెలుగు (Telugu)',
  'gu': 'ગુજરાતી (Gujarati)'
};

export const LanguageSelector = () => {
  const { selectedLanguage, setSelectedLanguage } = useSpeech();

  return (
    <div className="absolute top-4 right-4 z-50">
      <select
        value={selectedLanguage}
        onChange={(e) => setSelectedLanguage(e.target.value)}
        className="bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {Object.entries(languages).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}; 