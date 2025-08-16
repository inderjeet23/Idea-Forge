import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider, useAppContext } from './context/AppContext';
import ProfileStep from './components/ProfileStep';
import IdeasStep from './components/IdeasStep';
import ValidationStep from './components/ValidationStep';
import Dashboard from './components/Dashboard';

const IdeaForgeContent = () => {
  const { currentStep, isAuthenticated } = useAppContext();



  // If user is authenticated and on profile step, show dashboard instead
  if (isAuthenticated && currentStep === 'profile') {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      {currentStep === 'profile' && <ProfileStep />}
      {currentStep === 'ideas' && <IdeasStep />}
      {currentStep === 'validation' && <ValidationStep />}
    </div>
  );
};

const IdeaForge = () => {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <AppProvider>
        <IdeaForgeContent />
      </AppProvider>
    </GoogleOAuthProvider>
  );
};

export default IdeaForge;