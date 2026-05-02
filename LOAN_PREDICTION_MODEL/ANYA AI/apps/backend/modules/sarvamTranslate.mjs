import dotenv from "dotenv";
import fetch from 'node-fetch';

dotenv.config();

// Helper function to validate text input
function isValidText(text) {
  return text && typeof text === 'string' && text.trim().length > 0;
}

// Helper function to normalize language codes
function normalizeLanguageCode(code) {
  if (!code) return 'en-IN';
  // If it's already in the format 'xx-IN', return as is
  if (code.includes('-')) return code;
  // Otherwise append '-IN'
  return `${code}-IN`;
}

async function translateText({ text, sourceLanguage = 'en-IN', targetLanguage }) {
  try {
    // Validate input
    if (!isValidText(text)) {
      console.log('Invalid or empty text provided for translation');
      return text;
    }

    // Normalize language codes
    const normalizedSource = normalizeLanguageCode(sourceLanguage);
    const normalizedTarget = normalizeLanguageCode(targetLanguage);

    console.log(`Translating from ${normalizedSource} to ${normalizedTarget}`);

    // If source and target languages are the same, return original text
    if (normalizedSource === normalizedTarget) {
      console.log('Source and target languages are the same, skipping translation');
      return text;
    }

    const response = await fetch('https://api.sarvam.ai/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': process.env.SARVAM_API_KEY
      },
      body: JSON.stringify({
        input: text.trim(),
        source_language_code: normalizedSource,
        target_language_code: normalizedTarget,
        speaker_gender: "Female",
        mode: "formal",
        enable_preprocessing: true,
        output_script: "fully-native",
        numerals_format: "international"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sarvam AI Translation API error response:', errorText);
      return text; // Return original text on error
    }

    const data = await response.json();
    return data.translated_text || text;
  } catch (error) {
    console.error('Error in translation:', error);
    return text; // Return original text on error
  }
}

async function transliterateText({ text, sourceLanguage = 'en-IN', targetLanguage }) {
  try {
    // Validate input
    if (!isValidText(text)) {
      console.log('Invalid or empty text provided for transliteration');
      return text;
    }

    // Normalize language codes
    const normalizedSource = normalizeLanguageCode(sourceLanguage);
    const normalizedTarget = normalizeLanguageCode(targetLanguage);

    const response = await fetch('https://api.sarvam.ai/transliterate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': process.env.SARVAM_API_KEY
      },
      body: JSON.stringify({
        input: text.trim(),
        source_language_code: normalizedSource,
        target_language_code: normalizedTarget,
        numerals_format: "international",
        spoken_form_numerals_language: "native",
        spoken_form: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sarvam AI Transliteration API error response:', errorText);
      return text;
    }

    const data = await response.json();
    return data.transliterated_text || text;
  } catch (error) {
    console.error('Error in transliteration:', error);
    return text;
  }
}

export { translateText, transliterateText }; 