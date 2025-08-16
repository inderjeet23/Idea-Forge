import React from 'react';
import { Github, Globe, LogOut, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import OnboardingFlow from './OnboardingFlow';
import LoginButton from './LoginButton';

const ProfileStep = () => {
  const { user, isAuthenticated, logout } = useAppContext();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="text-center pt-4 pb-2">
        <div className="flex justify-between items-center max-w-4xl mx-auto px-4 mb-4">
          <div className="flex items-center space-x-6 text-sm text-gray-500">
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
          
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {user.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-700">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <LogOut size={16} className="mr-1" />
                  Sign Out
                </button>
              </div>
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          IdeaForge
        </h1>
        <p className="text-lg md:text-xl text-gray-600">AI-powered SaaS idea discovery tailored to you</p>
        {isAuthenticated && (
          <p className="text-sm text-gray-500 mt-2">Welcome back, {user.name}!</p>
        )}
      </div>
      
      <OnboardingFlow />
    </div>
  );
};

export default ProfileStep;