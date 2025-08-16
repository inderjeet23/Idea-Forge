import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider, useAppContext } from './context/AppContext';
import ProfileStep from './components/ProfileStep';
import IdeasStep from './components/IdeasStep';
import ValidationStep from './components/ValidationStep';
import Dashboard from './components/Dashboard';
import Header from './components/Header';

const IdeaForgeContent = () => {
  const { currentStep, isAuthenticated } = useAppContext();

  // Show dashboard for authenticated users when on dashboard step
  if (isAuthenticated && currentStep === 'dashboard') {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {currentStep === 'profile' && <ProfileStep />}
      {currentStep === 'ideas' && (
        <div className="bg-gray-50">
          <Header />
          <div className="py-8 px-4">
            <IdeasStep />
          </div>
        </div>
      )}
      {currentStep === 'validation' && (
        <div className="bg-gray-50">
          <Header />
          <div className="py-8 px-4">
            <ValidationStep />
          </div>
        </div>
      )}
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