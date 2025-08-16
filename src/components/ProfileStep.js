import React from 'react';
import { Github, Globe } from 'lucide-react';
import OnboardingFlow from './OnboardingFlow';

const ProfileStep = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="text-center pt-8 pb-4">
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
      
      <OnboardingFlow />
    </div>
  );
};

export default ProfileStep;