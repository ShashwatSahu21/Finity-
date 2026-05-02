import { createContext, useContext, useEffect, useState } from "react";

const backendUrl = "http://localhost:3000";

const SpeechContext = createContext();

// Language mapping for speech recognition
const languageToSpeechCode = {
  'en': 'en-US',
  'hi': 'hi-IN',
  'bn': 'bn-IN',
  'kn': 'kn-IN',
  'ml': 'ml-IN',
  'mr': 'mr-IN',
  'od': 'or-IN', // Odia uses 'or' code for speech recognition
  'pa': 'pa-IN',
  'ta': 'ta-IN',
  'te': 'te-IN',
  'gu': 'gu-IN'
};

export const SpeechProvider = ({ children }) => {
  const [recording, setRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [chatHistory, setChatHistory] = useState([]);
  const [currentResponse, setCurrentResponse] = useState('');

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Initialize Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.lang = languageToSpeechCode[selectedLanguage] || 'en-US';

        recognition.onresult = async (event) => {
          const text = event.results[0][0].transcript;
          console.log('Recognized text:', text);
          addToChatHistory('user', text);
          await processVoiceInput(text);
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setRecording(false);
        };

        recognition.onend = () => {
          setRecording(false);
        };

        setRecognition(recognition);
      } else {
        console.error('Speech Recognition not supported in this browser');
      }
    }
  }, [selectedLanguage]);

  const addToChatHistory = (type, text, translatedText = null) => {
    // For avatar responses, combine with current response if it exists
    if (type === 'avatar' && currentResponse) {
      const combinedText = currentResponse + ' ' + text;
      setCurrentResponse(''); // Reset current response
      setChatHistory(prev => [...prev, {
        type,
        text: combinedText,
        translatedText,
        timestamp: new Date().toISOString()
      }]);
    } else if (type === 'avatar') {
      // Start collecting a new avatar response
      setCurrentResponse(text);
    } else {
      // For user messages, add directly
      setChatHistory(prev => [...prev, {
        type,
        text,
        translatedText,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const processVoiceInput = async (text) => {
    setLoading(true);
    try {
      const data = await fetch(`${backendUrl}/voice-input`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          text, 
          languageCode: `${selectedLanguage}-IN`
        }),
      });
      const response = await data.json();
      
      // Ensure we have a valid response format
      if (!response || !response.messages || !Array.isArray(response.messages)) {
        console.error('Invalid response format:', response);
        return;
      }

      // Process each message to extract clean text
      const processedMessages = response.messages.map(msg => {
        let cleanText = '';
        try {
          // If the text is a JSON string, parse it
          if (typeof msg.text === 'string' && msg.text.startsWith('{')) {
            const parsed = JSON.parse(msg.text);
            cleanText = parsed.text || msg.text;
          } else {
            cleanText = msg.text;
          }
        } catch (e) {
          cleanText = msg.text;
        }
        return {
          ...msg,
          text: cleanText
        };
      });

      // Combine all response messages into one
      const combinedResponse = processedMessages
        .map(msg => msg.text)
        .filter(text => text) // Remove any empty strings
        .join(' ');

      // Add the combined response to chat history immediately
      setChatHistory(prev => [...prev, {
        type: 'avatar',
        text: combinedResponse,
        translatedText: processedMessages[0]?.originalText,
        timestamp: new Date().toISOString()
      }]);
      
      setMessages(processedMessages);
    } catch (error) {
      console.error('Error processing voice input:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = () => {
    if (recognition) {
      recognition.lang = languageToSpeechCode[selectedLanguage] || 'en-US';
      recognition.start();
      setRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setRecording(false);
    }
  };

  const tts = async (message) => {
    setLoading(true);
    try {
      addToChatHistory('user', message);
      
      const data = await fetch(`${backendUrl}/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message, 
          languageCode: `${selectedLanguage}-IN`
        }),
      });
      const response = await data.json();
      
      // Ensure we have a valid response format
      if (!response || !response.messages || !Array.isArray(response.messages)) {
        console.error('Invalid response format:', response);
        return;
      }

      // Clean and process the messages
      const processedMessages = response.messages.map(msg => {
        // Handle string messages
        if (typeof msg === 'string') {
          return {
            text: msg,
            facialExpression: 'default',
            animation: 'Idle'
          };
        }

        // Handle object messages
        if (typeof msg === 'object') {
          // If msg.text is a string that looks like JSON
          if (typeof msg.text === 'string' && (msg.text.includes('"text":') || msg.text.startsWith('{'))) {
            try {
              const parsed = JSON.parse(msg.text);
              return {
                ...msg,
                text: parsed.text || msg.text
              };
            } catch (e) {
              // If parsing fails, use the text as is
              return msg;
            }
          }
          return msg;
        }

        return {
          text: String(msg),
          facialExpression: 'default',
          animation: 'Idle'
        };
      });

      // Extract clean text for chat history
      const cleanResponse = processedMessages
        .map(msg => msg.text)
        .filter(Boolean)
        .join(' ');

      // Add to chat history
      setChatHistory(prev => [...prev, {
        type: 'avatar',
        text: cleanResponse,
        translatedText: null,
        timestamp: new Date().toISOString()
      }]);
      
      // Set messages for animation
      setMessages(processedMessages);
    } catch (error) {
      console.error('Error in tts:', error);
    } finally {
      setLoading(false);
    }
  };

  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  const clearHistory = () => {
    setChatHistory([]);
    localStorage.removeItem('chatHistory');
  };

  return (
    <SpeechContext.Provider
      value={{
        startRecording,
        stopRecording,
        recording,
        tts,
        message,
        onMessagePlayed,
        loading,
        selectedLanguage,
        setSelectedLanguage,
        chatHistory,
        clearHistory
      }}
    >
      {children}
    </SpeechContext.Provider>
  );
};

export const useSpeech = () => {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error("useSpeech must be used within a SpeechProvider");
  }
  return context;
};
