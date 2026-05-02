import React, { useState } from 'react';
import { AvatarCreator } from '@readyplayerme/react-avatar-creator';

export const AvatarCustomizer = ({ onAvatarCreated, isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const config = {
    clearCache: true,
    bodyType: 'fullbody',
    quickStart: false,
    language: 'en',
    enableBodyShape: true,
    enableFaceBuilder: true,
    enableHairSelector: true,
    enableOutfitSelector: true,
    enableWireframe: false,
    enableRotation: true,
    enableTranslation: true,
    enableBeard: true,
    enableEmotions: true,
    enablePoses: true,
    modelFormat: 'glb',
    quality: 'high'
  };

  const style = { 
    width: '100%', 
    height: '100vh', 
    border: 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 50
  };

  const handleOnAvatarExported = (event) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get the avatar URL directly
      const avatarUrl = event.data.url;
      console.log('Avatar URL:', avatarUrl);
    
      // Save to localStorage
      localStorage.setItem('userAvatarUrl', avatarUrl);
      
      // Notify parent component
      onAvatarCreated(avatarUrl);
      
      // Close the customizer
      onClose();

      // Force a clean reload after a short delay
      setTimeout(() => {
        const currentUrl = window.location.href.split('?')[0];
        window.location.href = `${currentUrl}?t=${Date.now()}`;
      }, 500);

    } catch (error) {
      console.error('Error processing avatar:', error);
      setError('Failed to create avatar. Please try again.');
      // Fallback to default avatar if there's an error
      const defaultUrl = '/models/avatar.glb';
      localStorage.setItem('userAvatarUrl', defaultUrl);
      onAvatarCreated(defaultUrl);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnUserSet = (event) => {
    console.log('User ID set:', event.data.id);
  };

  const handleAssetUnlocked = (event) => {
    console.log('Asset unlocked:', event.data);
  };

  const handleUserAuthorized = (event) => {
    console.log('User authorized:', event.data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-50">
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-[51]">
        <p className="text-gray-700 text-center">
          <span className="font-bold block mb-2">Create Your Avatar:</span>
          1. Take a selfie or choose a base avatar
          <br />
          2. Customize your features
          <br />
          3. Click "Done" when finished
        </p>
      </div>

      {isLoading && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg shadow-lg z-[51] flex items-center">
          <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Creating your avatar... Please wait.
        </div>
      )}

      {error && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-lg z-[51]">
          {error}
        </div>
      )}

      <AvatarCreator
        subdomain="talking-avatar-ai"
        config={config}
        style={style}
        onUserSet={handleOnUserSet}
        onAvatarExported={handleOnAvatarExported}
        onAssetUnlocked={handleAssetUnlocked}
        onUserAuthorized={handleUserAuthorized}
      />

      <button
        onClick={onClose}
        disabled={isLoading}
        className="fixed top-4 right-4 z-[51] bg-white rounded-full p-2 hover:bg-gray-100 disabled:opacity-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}; 