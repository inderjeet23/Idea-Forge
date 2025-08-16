import React from 'react';
import OnboardingFlow from './OnboardingFlow';
import Header from './Header';

const ProfileStep = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <OnboardingFlow />
    </div>
  );
};

export default ProfileStep;