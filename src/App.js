import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import ProfileStep from './components/ProfileStep';
import IdeasStep from './components/IdeasStep';
import ValidationStep from './components/ValidationStep';

const IdeaForgeContent = () => {
  const { currentStep } = useAppContext();



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
    <AppProvider>
      <IdeaForgeContent />
    </AppProvider>
  );
};

export default IdeaForge;