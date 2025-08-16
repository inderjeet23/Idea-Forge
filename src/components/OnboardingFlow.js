import React, { useState } from 'react';
import { Code, Heart, Target, Star, Lightbulb, Loader, AlertCircle, ChevronRight, ArrowLeft, Home } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const OnboardingFlow = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const {
    profile,
    handleProfileChange,
    generatePersonalizedIdeas,
    isGenerating,
    apiError,
    skillOptions,
    interestOptions,
    constraintOptions,
    valueOptions,
    currentOnboardingStep,
    setCurrentOnboardingStep,
    isAuthenticated,
    setCurrentStep
  } = useAppContext();

  const nextStep = () => {
    if (currentOnboardingStep < 4) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentOnboardingStep(currentOnboardingStep + 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const prevStep = () => {
    if (currentOnboardingStep > 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentOnboardingStep(currentOnboardingStep - 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 1:
        return profile.interests.length > 0;
      case 2:
        return profile.skills.length > 0 && profile.experience;
      case 3:
        return profile.timeCommitment && profile.buildingStyle;
      case 4:
        return profile.values.length > 0;
      default:
        return false;
    }
  };

  const renderProgressIndicator = () => (
    <div className="w-full max-w-md mx-auto mb-4 sm:mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <button
            onClick={prevStep}
            disabled={currentOnboardingStep === 1}
            className="mr-2 p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-xs font-medium text-gray-500">Step {currentOnboardingStep} of 4</span>
        </div>
        <div className="flex items-center space-x-2">
          {isAuthenticated && (
            <button
              onClick={() => setCurrentStep('dashboard')}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Go to Dashboard"
              title="Go to Dashboard"
            >
              <Home size={16} />
            </button>
          )}
          <span className="text-xs text-gray-400">{Math.round((currentOnboardingStep / 4) * 100)}%</span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1">
        <div 
          className="bg-gradient-to-r from-purple-600 to-blue-600 h-1 rounded-full transition-all duration-500"
          style={{ width: `${(currentOnboardingStep / 4) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const renderPassionsStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-3">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          What are you passionate about?
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          Select the areas that excite you most.
        </p>
      </div>
      
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center mb-3">
          <Heart className="mr-2 text-red-500" size={18} />
          <h3 className="text-base font-semibold text-gray-900">Your Interests & Passions</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {interestOptions.map(interest => (
            <label key={interest} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={profile.interests.includes(interest)}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleProfileChange('interests', [...profile.interests, interest]);
                  } else {
                    handleProfileChange('interests', profile.interests.filter(i => i !== interest));
                  }
                }}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 transition-transform hover:scale-110 checked:animate-pulse"
              />
              <span className="text-sm font-medium text-gray-700">{interest}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSkillsStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-3">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          Let's look at your strengths
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          Share your expertise so we can match you with opportunities.
        </p>
      </div>
      
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center mb-3">
          <Code className="mr-2 text-blue-500" size={18} />
          <h3 className="text-base font-semibold text-gray-900">Your Skills & Experience</h3>
        </div>
        
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skillOptions.map(skill => (
              <label key={skill} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={profile.skills.includes(skill)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleProfileChange('skills', [...profile.skills, skill]);
                    } else {
                      handleProfileChange('skills', profile.skills.filter(s => s !== skill));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-transform hover:scale-110 checked:animate-pulse"
                />
                <span className="text-sm font-medium text-gray-700">{skill}</span>
              </label>
            ))}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level
            </label>
            <select
              value={profile.experience}
              onChange={(e) => handleProfileChange('experience', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select your experience level...</option>
              <option value="beginner">Beginner (0-2 years)</option>
              <option value="intermediate">Intermediate (2-5 years)</option>
              <option value="experienced">Experienced (5+ years)</option>
              <option value="expert">Expert (10+ years)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBuildingStyleStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-3">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          How do you like to build?
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          Understanding your preferences helps us suggest fitting ideas.
        </p>
      </div>
      
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center mb-3">
          <Target className="mr-2 text-orange-500" size={18} />
          <h3 className="text-base font-semibold text-gray-900">Your Constraints & Preferences</h3>
        </div>
        
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            {constraintOptions.map(constraint => (
              <label key={constraint} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={profile.constraints.includes(constraint)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleProfileChange('constraints', [...profile.constraints, constraint]);
                    } else {
                      handleProfileChange('constraints', profile.constraints.filter(c => c !== constraint));
                    }
                  }}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 transition-transform hover:scale-110 checked:animate-pulse"
                />
                <span className="text-sm font-medium text-gray-700">{constraint}</span>
              </label>
            ))}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Commitment
              </label>
              <select
                value={profile.timeCommitment}
                onChange={(e) => handleProfileChange('timeCommitment', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select time availability...</option>
                <option value="weekend">Weekends only</option>
                <option value="parttime">Part-time (10-20hrs/week)</option>
                <option value="fulltime">Full-time (40+hrs/week)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Building Style
              </label>
              <select
                value={profile.buildingStyle}
                onChange={(e) => handleProfileChange('buildingStyle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select building preference...</option>
                <option value="mvp">Quick MVP & iterate</option>
                <option value="polished">Polished product from start</option>
                <option value="experimental">Experimental & innovative</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderValuesStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-3">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          What drives you?
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          Select the values that matter most to you in building products.
        </p>
      </div>
      
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center mb-3">
          <Star className="mr-2 text-yellow-500" size={18} />
          <h3 className="text-base font-semibold text-gray-900">Your Values & Mission</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          {valueOptions.map(value => (
            <label key={value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={profile.values.includes(value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleProfileChange('values', [...profile.values, value]);
                  } else {
                    handleProfileChange('values', profile.values.filter(v => v !== value));
                  }
                }}
                className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 transition-transform hover:scale-110 checked:animate-pulse"
              />
              <span className="text-sm font-medium text-gray-700">{value}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentOnboardingStep) {
      case 1:
        return renderPassionsStep();
      case 2:
        return renderSkillsStep();
      case 3:
        return renderBuildingStyleStep();
      case 4:
        return renderValuesStep();
      default:
        return renderPassionsStep();
    }
  };

  const renderNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 shadow-lg">
      <div className="max-w-2xl mx-auto">
        {currentOnboardingStep < 4 ? (
          <button
            onClick={nextStep}
            disabled={!isStepValid(currentOnboardingStep)}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center justify-center text-base"
          >
            Continue
            <ChevronRight className="ml-2" size={18} />
          </button>
        ) : (
          <button
            onClick={generatePersonalizedIdeas}
            disabled={!isStepValid(currentOnboardingStep) || isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center justify-center text-base"
          >
            {isGenerating ? (
              <>
                <Loader className="animate-spin mr-2" size={18} />
                Generating Ideas...
              </>
            ) : (
              <>
                <Lightbulb className="mr-2" size={18} />
                Generate My Ideas
              </>
            )}
          </button>
        )}
        
        {isGenerating && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Analyzing your profile to create personalized SaaS ideas...
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-2 px-3 sm:px-4 pb-24">
      <div className="max-w-4xl mx-auto">
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-2" size={16} />
              <p className="text-sm text-red-700">
                API Error: {apiError}. Falling back to enhanced mock generation.
              </p>
            </div>
          </div>
        )}

        {renderProgressIndicator()}
        <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {renderCurrentStep()}
        </div>
        {renderNavigation()}
      </div>
    </div>
  );
};

export default OnboardingFlow;