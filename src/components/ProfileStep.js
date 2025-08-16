import React from 'react';
import { Code, Heart, Target, Star, Lightbulb, Loader, AlertCircle, Github, Globe } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ProfileStep = () => {
  const {
    profile,
    handleProfileChange,
    generatePersonalizedIdeas,
    isGenerating,
    apiError,
    skillOptions,
    interestOptions,
    constraintOptions,
    valueOptions
  } = useAppContext();
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          IdeaForge
        </h1>
        <p className="text-xl text-gray-600">AI-powered SaaS idea discovery tailored to you</p>
        <div className="flex items-center justify-center mt-4 space-x-6 text-sm text-gray-500">
          <a 
            href="https://github.com/yourusername/ideaforge" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center hover:text-gray-700"
          >
            <Github size={16} className="mr-1" />
            GitHub
          </a>
          <span className="flex items-center">
            <Globe size={16} className="mr-1" />
            Open Source
          </span>
        </div>
      </div>


      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="text-red-500 mr-2" size={16} />
            <p className="text-sm text-red-700">
              API Error: {apiError}. Falling back to enhanced mock generation.
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Code className="mr-2 text-blue-500" size={20} />
            Your Skills & Experience
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {skillOptions.map(skill => (
                <label key={skill} className="flex items-center space-x-2 cursor-pointer">
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
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{skill}</span>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                value={profile.experience}
                onChange={(e) => handleProfileChange('experience', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Select experience level...</option>
                <option value="beginner">Beginner (0-2 years)</option>
                <option value="intermediate">Intermediate (2-5 years)</option>
                <option value="experienced">Experienced (5+ years)</option>
                <option value="expert">Expert (10+ years)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Heart className="mr-2 text-red-500" size={20} />
            Your Interests & Passions
          </h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {interestOptions.map(interest => (
                <label key={interest} className="flex items-center space-x-2 cursor-pointer">
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
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{interest}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="mr-2 text-orange-500" size={20} />
            Your Constraints & Preferences
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              {constraintOptions.map(constraint => (
                <label key={constraint} className="flex items-center space-x-2 cursor-pointer">
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
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{constraint}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Commitment
                </label>
                <select
                  value={profile.timeCommitment}
                  onChange={(e) => handleProfileChange('timeCommitment', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Star className="mr-2 text-yellow-500" size={20} />
            Your Values & Mission
          </h3>
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2">
              {valueOptions.map(value => (
                <label key={value} className="flex items-center space-x-2 cursor-pointer">
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
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{value}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={generatePersonalizedIdeas}
          disabled={profile.skills.length === 0 || profile.interests.length === 0 || isGenerating}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center mx-auto"
        >
          {isGenerating ? (
            <>
              <Loader className="animate-spin mr-2" size={20} />
              Generating Ideas...
            </>
          ) : (
            <>
              <Lightbulb className="mr-2" size={20} />
              Generate My Personalized Ideas
            </>
          )}
        </button>
        {isGenerating && (
          <p className="text-sm text-gray-500 mt-2">
            Analyzing your profile to create personalized SaaS ideas...
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileStep;