import { useRef, useEffect, useState } from "react";
import { useSpeech } from "../hooks/useSpeech";
import { AvatarCustomizer } from "./AvatarCustomizer";

export const ChatInterface = ({ hidden }) => {
  const input = useRef();
  const [inputValue, setInputValue] = useState("");
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const { tts, loading, message, startRecording, stopRecording, recording } = useSpeech();

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Alt + F to toggle microphone
      if (e.altKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (!loading && !message) {
          if (recording) {
            stopRecording();
          } else {
            startRecording();
          }
        }
      }
      
      // Ctrl + K to focus text input
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (!loading && !message && input.current) {
          input.current.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [loading, message, recording, startRecording, stopRecording]);

  const sendMessage = () => {
    const text = input.current.value;
    if (!loading && !message && text.trim()) {
      tts(text);
      input.current.value = "";
      setInputValue("");
    }
  };

  const handleAvatarCreated = (avatarUrl) => {
    localStorage.setItem('userAvatarUrl', avatarUrl);
    // Trigger a page reload to load the new avatar
    window.location.reload();
  };

  if (hidden) {
    return null;
  }

  return (
    <>
      <AvatarCustomizer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        onAvatarCreated={handleAvatarCreated}
      />
      
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        <div className="self-start backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <h1 className="font-black text-xl text-gray-700">Amol AI</h1>
            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm pointer-events-auto transition-colors duration-200"
            >
              Customize Avatar
            </button>
          </div>
          <p className="text-gray-600">
            {loading ? "Loading..." : (
              <span>
                Type a message (<kbd className="px-1 py-0.5 text-sm bg-gray-200 rounded">⌃ K</kbd>) or use microphone (<kbd className="px-1 py-0.5 text-sm bg-gray-200 rounded">⌥ F</kbd>) to chat with AI.
              </span>
            )}
          </p>
        </div>
        <div className="w-full flex flex-col items-end justify-center gap-4"></div>
        <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`bg-gray-500 hover:bg-gray-600 text-white p-4 px-4 font-semibold uppercase rounded-md ${
              recording ? "bg-red-500 hover:bg-red-600" : ""
            } ${loading || message ? "cursor-not-allowed opacity-30" : ""}`}
            title="Toggle microphone (⌥ F)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
              />
            </svg>
          </button>

          <input
            className="w-full placeholder:text-gray-800 placeholder:italic p-4 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
            placeholder="Type a message... (⌃ K to focus)"
            ref={input}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputValue.trim()) {
                sendMessage();
              }
            }}
          />
          <button
            disabled={loading || message}
            onClick={sendMessage}
            className={`text-white p-4 px-10 font-semibold uppercase rounded-md transition-colors duration-200 ${
              loading || message 
                ? "cursor-not-allowed opacity-30 bg-gray-500" 
                : inputValue.trim() 
                  ? "bg-emerald-500 hover:bg-emerald-600" 
                  : "bg-gray-500 hover:bg-gray-600"
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
};
