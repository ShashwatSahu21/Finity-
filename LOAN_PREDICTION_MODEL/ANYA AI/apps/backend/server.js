import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { generateResponse } from "./modules/groq.mjs";
import { lipSync } from "./modules/lip-sync.mjs";
import { sendDefaultMessages, defaultResponse } from "./modules/defaultMessages.mjs";
import { translateText, transliterateText } from "./modules/sarvamTranslate.mjs";
import { speechToText, speechToTextTranslate } from "./modules/sarvamSpeechToText.mjs";
import { detectLanguage, analyzeText } from "./modules/sarvamTextAnalytics.mjs";
import { mkdirSync } from 'fs';
import { join } from 'path';

dotenv.config();

// Create necessary directories
const directories = ['tmp', 'audios'];
directories.forEach(dir => {
  const dirPath = join(process.cwd(), dir);
  try {
    mkdirSync(dirPath, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.error(`Error creating ${dir} directory:`, err);
    }
  }
});

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
const port = 3000;

// Helper function to translate messages
async function translateMessages(messages, targetLanguage) {
  const translatedMessages = [];
  for (const message of messages) {
    try {
      // First detect the language of the message
      const detectedLanguage = await detectLanguage(message.text);
      
      // Only translate if source and target languages are different
      if (detectedLanguage !== targetLanguage) {
        const translatedText = await translateText({
          text: message.text,
          sourceLanguage: detectedLanguage,
          targetLanguage
        });
        
        translatedMessages.push({
          ...message,
          text: translatedText,
          originalText: message.text,
          detectedLanguage
        });
      } else {
        // If same language, no translation needed
        translatedMessages.push({
          ...message,
          originalText: message.text,
          detectedLanguage
        });
      }
    } catch (error) {
      console.error('Translation error:', error);
      translatedMessages.push(message); // Use original message if translation fails
    }
  }
  return translatedMessages;
}

// New endpoint for speech-to-text with automatic language detection
app.post("/speech-to-text", async (req, res) => {
  try {
    const { audioData, targetLanguage = 'en-IN' } = req.body;
    
    if (!audioData) {
      res.status(400).send({ error: 'No audio data provided' });
      return;
    }

    // First convert speech to text in original language
    const transcribedText = await speechToText({ audioData });
    
    // Detect the language of the transcribed text
    const detectedLanguage = await detectLanguage(transcribedText);
    
    // If target language is different from detected language, translate
    let finalText = transcribedText;
    let translatedText = null;
    
    if (detectedLanguage !== targetLanguage) {
      const result = await speechToTextTranslate({
        audioData,
        sourceLanguage: detectedLanguage,
        targetLanguage
      });
      finalText = result.translatedText;
      translatedText = result.originalText;
    }
    
    // Analyze sentiment of the text
    const sentiment = await analyzeText(finalText);
    
    res.send({
      originalText: transcribedText,
      translatedText,
      detectedLanguage,
      targetLanguage,
      sentiment,
      success: true
    });
  } catch (error) {
    console.error('Error in speech-to-text endpoint:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Voice input endpoint
app.post("/voice-input", async (req, res) => {
  try {
    const { text, languageCode } = req.body;
    
    if (!text) {
      res.status(400).send({ error: 'No text provided' });
      return;
    }

    console.log('Received voice input text:', text);
    console.log('Target language:', languageCode);

    // Get AI response (it will be in English)
    let aiResponse;
    try {
      // If input is not in English, first translate it to English
      let englishQuery = text;
      if (languageCode !== 'en-IN') {
        englishQuery = await translateText({
          text,
          sourceLanguage: languageCode,
          targetLanguage: 'en-IN'
        });
      }
      console.log('English query for AI:', englishQuery);
      aiResponse = await generateResponse(englishQuery);
    } catch (error) {
      console.error('Error generating response:', error);
      aiResponse = defaultResponse;
    }

    try {
      // Translate AI response to target language
      const translatedMessages = await Promise.all(
        aiResponse.messages.map(async (message) => {
          try {
            // Only translate if target language is not English
            if (languageCode !== 'en-IN') {
              const translatedText = await translateText({
                text: message.text,
                sourceLanguage: 'en-IN',
                targetLanguage: languageCode
              });

              return {
                ...message,
                text: translatedText,
                originalText: message.text
              };
            }
            return {
              ...message,
              originalText: message.text
            };
          } catch (error) {
            console.error('Translation error:', error);
            return message;
          }
        })
      );

      // Process with lip sync
      const processedResponse = await lipSync({
        messages: translatedMessages,
        languageCode: languageCode.split('-')[0] // Extract language code without region
      });

      res.send({
        messages: processedResponse,
        targetLanguage: languageCode,
        success: true
      });
    } catch (error) {
      console.error('Error in translation/lip-sync:', error);
      // Fallback to English response
      const processedResponse = await lipSync({
        messages: aiResponse.messages,
        languageCode: 'en'
      });

      res.send({
        messages: processedResponse,
        targetLanguage: 'en-IN',
        success: true,
        fallback: true
      });
    }
  } catch (error) {
    console.error('Error in voice-input endpoint:', error);
    res.status(500).send({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Text input endpoint
app.post("/tts", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const languageCode = req.body.languageCode;
    
    if (!userMessage) {
      res.status(400).send({ error: 'No message provided' });
      return;
    }

    console.log('Received text input:', userMessage);
    console.log('Target language:', languageCode);

    // Get AI response (it will be in English)
    let aiResponse;
    try {
      // If input is not in English, first translate it to English
      let englishQuery = userMessage;
      if (languageCode !== 'en-IN') {
        englishQuery = await translateText({
          text: userMessage,
          sourceLanguage: languageCode,
          targetLanguage: 'en-IN'
        });
      }
      console.log('English query for AI:', englishQuery);
      aiResponse = await generateResponse(englishQuery);
    } catch (error) {
      console.error('Error generating response:', error);
      aiResponse = defaultResponse;
    }

    try {
      // Translate AI response to target language
      const translatedMessages = await Promise.all(
        aiResponse.messages.map(async (message) => {
          try {
            // Only translate if target language is not English
            if (languageCode !== 'en-IN') {
              const translatedText = await translateText({
                text: message.text,
                sourceLanguage: 'en-IN',
                targetLanguage: languageCode
              });

              return {
                ...message,
                text: translatedText,
                originalText: message.text
              };
            }
            return {
              ...message,
              originalText: message.text
            };
          } catch (error) {
            console.error('Translation error:', error);
            return message;
          }
        })
      );

      // Process with lip sync
      const processedResponse = await lipSync({
        messages: translatedMessages,
        languageCode: languageCode.split('-')[0] // Extract language code without region
      });

      res.send({
        messages: processedResponse,
        targetLanguage: languageCode,
        success: true
      });
    } catch (error) {
      console.error('Error in translation/lip-sync:', error);
      // Fallback to English response
      const processedResponse = await lipSync({
        messages: aiResponse.messages,
        languageCode: 'en'
      });

      res.send({
        messages: processedResponse,
        targetLanguage: 'en-IN',
        success: true,
        fallback: true
      });
    }
  } catch (error) {
    console.error('Error in TTS endpoint:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Amol AI is listening on port ${port}`);
});
