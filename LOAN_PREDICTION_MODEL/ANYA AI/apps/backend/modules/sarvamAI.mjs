import dotenv from "dotenv";
import fetch from 'node-fetch';
import fs from 'fs';
import { join } from 'path';

dotenv.config();

// Language mapping for supported languages
const SUPPORTED_LANGUAGES = {
  'en': 'en-IN', // English
  'hi': 'hi-IN', // Hindi
  'bn': 'bn-IN', // Bengali
  'kn': 'kn-IN', // Kannada
  'ml': 'ml-IN', // Malayalam
  'mr': 'mr-IN', // Marathi
  'od': 'od-IN', // Odia
  'pa': 'pa-IN', // Punjabi
  'ta': 'ta-IN', // Tamil
  'te': 'te-IN', // Telugu
  'gu': 'gu-IN'  // Gujarati
};

// Speaker mapping for different languages
const LANGUAGE_SPEAKERS = {
  'en-IN': 'amol',     // English speaker
  'hi-IN': 'amol',     // Hindi speaker
  'bn-IN': 'amol',     // Bengali speaker
  'kn-IN': 'amol',     // Kannada speaker
  'ml-IN': 'amol',     // Malayalam speaker
  'mr-IN': 'amol',     // Marathi speaker
  'od-IN': 'amol',     // Odia speaker
  'pa-IN': 'amol',     // Punjabi speaker
  'ta-IN': 'amol',     // Tamil speaker
  'te-IN': 'amol',     // Telugu speaker
  'gu-IN': 'amol'      // Gujarati speaker
};

// Function to chunk text into smaller parts
function chunkText(text, maxLength = 450) { // Using 450 to be safe (under 500 limit)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

async function textToSpeech({ text, fileName, languageCode = 'en' }) {
  try {
    // Get the full language code from the mapping
    const targetLanguageCode = SUPPORTED_LANGUAGES[languageCode] || 'en-IN';
    const speaker = LANGUAGE_SPEAKERS[targetLanguageCode] || 'amol';

    // Split text into chunks if it's too long
    const textChunks = chunkText(text);
    const audioBuffers = [];

    // Process each chunk
    for (const chunk of textChunks) {
      const response = await fetch('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': process.env.SARVAM_API_KEY
        },
        body: JSON.stringify({
          inputs: [chunk],
          target_language_code: targetLanguageCode,
          speaker: speaker,
          model: "bulbul:v1",
          pitch: 0,
          pace: 1.0,
          loudness: 1.0,
          speech_sample_rate: 22050,
          enable_preprocessing: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sarvam AI API error response:', errorText);
        throw new Error(`Sarvam AI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.audios || !data.audios[0]) {
        throw new Error('No audio data received from Sarvam AI');
      }

      // Convert base64 to buffer and add to array
      audioBuffers.push(Buffer.from(data.audios[0], 'base64'));
    }

    // Combine all audio buffers
    const combinedBuffer = Buffer.concat(audioBuffers);
    const outputPath = join(process.cwd(), 'tmp', fileName);
    fs.writeFileSync(outputPath, combinedBuffer);

    return outputPath;
  } catch (error) {
    console.error('Error in Sarvam AI text-to-speech:', error);
    throw error;
  }
}

export { textToSpeech, SUPPORTED_LANGUAGES }; 