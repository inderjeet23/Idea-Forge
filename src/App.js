import React, { useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import ProfileStep from './components/ProfileStep';
import IdeasStep from './components/IdeasStep';
import ValidationStep from './components/ValidationStep';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import AuthCallback from './components/AuthCallback';

const IdeaForgeContent = () => {
  const { currentStep, isAuthenticated, setCurrentStep, sidebarOpen } = useAppContext();

  useEffect(() => {
    // Only redirect to profile if user is not authenticated and not already on profile
    if (!isAuthenticated && currentStep !== 'profile' && window.location.pathname !== '/auth/callback') {
      setCurrentStep('profile');
    }
  }, [isAuthenticated, currentStep, setCurrentStep]);

  // Handle auth callback by checking URL directly
  if (window.location.pathname === '/auth/callback') {
    return <AuthCallback />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-80' : 'ml-0'
      } min-h-screen`}>
        {currentStep === 'profile' && <ProfileStep />}
        {currentStep === 'ideas' && (
          <div className="min-h-screen bg-gray-50">
            <div className="py-8 px-4">
              <IdeasStep />
            </div>
          </div>
        )}
        {currentStep === 'validation' && (
          <div className="min-h-screen bg-gray-50">
            <div className="py-8 px-4">
              <ValidationStep />
            </div>
          </div>
        )}
        {currentStep === 'dashboard' && <Dashboard />}
      </div>
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