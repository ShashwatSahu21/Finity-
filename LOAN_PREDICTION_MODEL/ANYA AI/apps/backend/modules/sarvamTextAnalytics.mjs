import dotenv from "dotenv";
import fetch from 'node-fetch';

dotenv.config();

// Helper function to validate text input
function isValidText(text) {
  return text && typeof text === 'string' && text.trim().length > 0;
}

async function detectLanguage(text) {
  // Return default for invalid input
  if (!isValidText(text)) {
    console.log('Invalid or empty text provided for language detection');
    return 'en-IN';
  }

  try {
    const response = await fetch('https://api.sarvam.ai/text-analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': process.env.SARVAM_API_KEY
      },
      body: JSON.stringify({
        inputs: [text.trim()], // Wrap text in array as per API requirements
        task: "language_detection"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sarvam AI Language Detection API error response:', errorText);
      return 'en-IN'; // Default to English on error
    }

    const data = await response.json();
    // Extract language code from response
    const detectedLanguage = data.detected_languages?.[0]?.language_code || 'en-IN';
    console.log('Detected language:', detectedLanguage);
    return detectedLanguage;
  } catch (error) {
    console.error('Error in language detection:', error);
    return 'en-IN'; // Default to English on error
  }
}

async function analyzeText(text) {
  // Return default for invalid input
  if (!isValidText(text)) {
    console.log('Invalid or empty text provided for sentiment analysis');
    return {
      sentiment: 'neutral',
      confidence: 0.5
    };
  }

  try {
    const response = await fetch('https://api.sarvam.ai/text-analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': process.env.SARVAM_API_KEY
      },
      body: JSON.stringify({
        text: text.trim(),
        task: "sentiment_analysis"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sarvam AI Text Analytics API error response:', errorText);
      return {
        sentiment: 'neutral',
        confidence: 0.5
      };
    }

    const data = await response.json();
    return {
      sentiment: data.sentiment || 'neutral',
      confidence: data.confidence || 0.5
    };
  } catch (error) {
    console.error('Error in text analytics:', error);
    return {
      sentiment: 'neutral',
      confidence: 0.5
    };
  }
}

export { detectLanguage, analyzeText }; 