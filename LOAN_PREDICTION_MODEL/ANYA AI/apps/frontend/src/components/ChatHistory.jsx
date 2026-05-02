import React, { useState } from 'react';
import { useSpeech } from '../hooks/useSpeech';

export const ChatHistory = () => {
  const { chatHistory, clearHistory } = useSpeech();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat History Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 ease-in-out"
        title="Chat History"
      >
        {isOpen ? (
          // Close icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          // Chat history icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
        )}
      </button>

      {/* Chat History Panel */}
      <div
        className={`fixed right-4 bottom-20 w-80 h-[70vh] bg-white bg-opacity-50 backdrop-blur-md rounded-lg shadow-xl transform transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        } flex flex-col`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Conversation History</h2>
          <button
            onClick={clearHistory}
            className="text-red-500 hover:text-red-600 text-sm font-medium"
            title="Clear History"
          >
            Clear
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {chatHistory.length === 0 ? (
            <div className="text-center text-gray-500 mt-4">
              No conversation history yet
            </div>
          ) : (
            chatHistory.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.type === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm font-medium mb-1">
                    {message.type === 'user' ? 'You' : 'Avatar'}
                  </p>
                  <p className="text-sm">{message.text}</p>
                  {message.translatedText && message.translatedText !== message.text && (
                    <p className="text-xs mt-1 opacity-75">
                      Original: {message.translatedText}
                    </p>
                  )}
                  <p className="text-xs mt-1 opacity-50">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}; 