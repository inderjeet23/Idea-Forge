import React from 'react';
import { Github, Globe, LogOut, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import OnboardingFlow from './OnboardingFlow';
import LoginButton from './LoginButton';

const ProfileStep = () => {
  const { user, isAuthenticated, logout } = useAppContext();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="text-center pt-2 pb-1">
        <div className="flex justify-between items-center max-w-4xl mx-auto px-4 mb-2">
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <a 
              href="https://github.com/yourusername/ideaforge" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center hover:text-gray-600"
            >
              <Github size={12} className="mr-1" />
              GitHub
            </a>
            <span className="flex items-center">
              <Globe size={12} className="mr-1" />
              Open Source
            </span>
          </div>
          
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {user.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name} 
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                  <span className="text-xs text-gray-600">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <LogOut size={12} className="mr-1" />
                  Sign Out
                </button>
              </div>
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
        
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-1">
          IdeaForge
        </h1>
        <p className="text-sm text-gray-500">AI-powered SaaS idea discovery</p>
      </div>
      
      <OnboardingFlow />
    </div>
  );
};

export default ProfileStep;