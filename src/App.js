import React, { useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import ProfileStep from './components/ProfileStep';
import IdeasStep from './components/IdeasStep';
import ValidationStep from './components/ValidationStep';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import AuthCallback from './components/AuthCallback';

const IdeaForgeContent = () => {
  const { currentStep, isAuthenticated, setCurrentStep } = useAppContext();

  useEffect(() => {
    // Check if we're on the auth callback path
    if (window.location.pathname === '/auth/callback') {
      setCurrentStep('auth-callback');
      return;
    }

    if (isAuthenticated && currentStep === 'profile') {
      setCurrentStep('dashboard');
    } else if (!isAuthenticated && currentStep !== 'profile') {
      setCurrentStep('profile');
    }
  }, [isAuthenticated, currentStep, setCurrentStep]);

  // Handle auth callback
  if (currentStep === 'auth-callback') {
    return <AuthCallback />;
  }

  if (isAuthenticated && currentStep === 'dashboard') {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {currentStep === 'profile' && <ProfileStep />}
      {currentStep === 'ideas' && <div className="bg-gray-50"><Header /><div className="py-8 px-4"><IdeasStep /></div></div>}
      {currentStep === 'validation' && <div className="bg-gray-50"><Header /><div className="py-8 px-4"><ValidationStep /></div></div>}
    </div>
  );
};

const IdeaForge = () => {
  return (
    <AppProvider>
      <IdeaForgeContent />
    </AppProvider>
  );
};

export default IdeaForge;