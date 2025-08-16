import React from 'react';
import { Code, Heart, Target, Star, Lightbulb, Loader, AlertCircle, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const OnboardingFlow = () => {
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
    setCurrentOnboardingStep
  } = useAppContext();

  const nextStep = () => {
    if (currentOnboardingStep < 3) {
      setCurrentOnboardingStep(currentOnboardingStep + 1);
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
      default:
        return false;
    }
  };

  const renderProgressIndicator = () => (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500">Step {currentOnboardingStep} of 3</span>
        <span className="text-sm text-gray-400">{Math.round((currentOnboardingStep / 3) * 100)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentOnboardingStep / 3) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const renderPassionsStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          What are you passionate about?
        </h2>
        <p className="text-lg text-gray-600">
          Select the areas that excite you most. We'll use this to find ideas that align with your interests.
        </p>
      </div>
      
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
        <div className="flex items-center mb-6">
          <Heart className="mr-3 text-red-500" size={24} />
          <h3 className="text-xl font-semibold text-gray-900">Your Interests & Passions</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
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
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          What's your expertise?
        </h2>
        <p className="text-lg text-gray-600">
          Tell us about your skills and experience level to match you with the right opportunities.
        </p>
      </div>
      
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
        <div className="flex items-center mb-6">
          <Code className="mr-3 text-blue-500" size={24} />
          <h3 className="text-xl font-semibold text-gray-900">Your Skills & Experience</h3>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skillOptions.map(skill => (
              <label key={skill} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
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
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">{skill}</span>
              </label>
            ))}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
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
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          How do you like to build?
        </h2>
        <p className="text-lg text-gray-600">
          Understanding your constraints and values helps us suggest ideas that fit your lifestyle.
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <div className="flex items-center mb-6">
            <Target className="mr-3 text-orange-500" size={24} />
            <h3 className="text-xl font-semibold text-gray-900">Your Constraints & Preferences</h3>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3">
              {constraintOptions.map(constraint => (
                <label key={constraint} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
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
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{constraint}</span>
                </label>
              ))}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Time Commitment
                </label>
                <select
                  value={profile.timeCommitment}
                  onChange={(e) => handleProfileChange('timeCommitment', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select time availability...</option>
                  <option value="weekend">Weekends only</option>
                  <option value="parttime">Part-time (10-20hrs/week)</option>
                  <option value="fulltime">Full-time (40+hrs/week)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Building Style
                </label>
                <select
                  value={profile.buildingStyle}
                  onChange={(e) => handleProfileChange('buildingStyle', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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

        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <div className="flex items-center mb-6">
            <Star className="mr-3 text-yellow-500" size={24} />
            <h3 className="text-xl font-semibold text-gray-900">Your Values & Mission</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {valueOptions.map(value => (
              <label key={value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
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
                  className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                />
                <span className="text-sm font-medium text-gray-700">{value}</span>
              </label>
            ))}
          </div>
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
      default:
        return renderPassionsStep();
    }
  };

  const renderNavigation = () => (
    <div className="max-w-2xl mx-auto mt-8">
      {currentOnboardingStep < 3 ? (
        <button
          onClick={nextStep}
          disabled={!isStepValid(currentOnboardingStep)}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center justify-center text-lg"
        >
          Continue
          <ChevronRight className="ml-2" size={20} />
        </button>
      ) : (
        <button
          onClick={generatePersonalizedIdeas}
          disabled={!isStepValid(currentOnboardingStep) || isGenerating}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center justify-center text-lg"
        >
          {isGenerating ? (
            <>
              <Loader className="animate-spin mr-2" size={20} />
              Generating Ideas...
            </>
          ) : (
            <>
              <Lightbulb className="mr-2" size={20} />
              Generate My Ideas
            </>
          )}
        </button>
      )}
      
      {isGenerating && (
        <p className="text-sm text-gray-500 mt-3 text-center">
          Analyzing your profile to create personalized SaaS ideas...
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
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
        {renderCurrentStep()}
        {renderNavigation()}
      </div>
    </div>
  );
};

export default OnboardingFlow;