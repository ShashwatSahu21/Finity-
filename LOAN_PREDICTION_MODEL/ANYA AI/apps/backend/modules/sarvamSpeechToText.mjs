import dotenv from "dotenv";
import fetch from 'node-fetch';
import fs from 'fs';

dotenv.config();

async function speechToText({ audioData, languageCode = 'en-IN' }) {
  try {
    // Convert audio data to base64 if it's not already
    const audioBase64 = Buffer.isBuffer(audioData) 
      ? audioData.toString('base64')
      : audioData.replace(/^data:audio\/\w+;base64,/, '');

    const response = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': process.env.SARVAM_API_KEY
      },
      body: JSON.stringify({
        audio: audioBase64,
        language_code: languageCode,
        enable_preprocessing: true,
        model: "whisper:v1"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sarvam AI STT API error response:', errorText);
      throw new Error(`Sarvam AI STT API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error in Sarvam AI speech-to-text:', error);
    throw error;
  }
}

async function speechToTextTranslate({ audioData, sourceLanguage = 'en-IN', targetLanguage = 'en-IN' }) {
  try {
    const audioBase64 = Buffer.isBuffer(audioData)
      ? audioData.toString('base64')
      : audioData.replace(/^data:audio\/\w+;base64,/, '');

    const response = await fetch('https://api.sarvam.ai/speech-to-text-translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': process.env.SARVAM_API_KEY
      },
      body: JSON.stringify({
        audio: audioBase64,
        source_language_code: sourceLanguage,
        target_language_code: targetLanguage,
        enable_preprocessing: true,
        model: "whisper:v1"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sarvam AI STT-Translate API error response:', errorText);
      throw new Error(`Sarvam AI STT-Translate API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      originalText: data.text,
      translatedText: data.translated_text
    };
  } catch (error) {
    console.error('Error in Sarvam AI speech-to-text-translate:', error);
    throw error;
  }
}

export { speechToText, speechToTextTranslate }; 