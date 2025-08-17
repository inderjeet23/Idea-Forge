import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  Lightbulb, 
  Clock, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  TrendingUp,
  X,
  History,
  Layout,
  User,
  LogOut,
  Github,
  Globe,
  Menu
} from 'lucide-react';
import LoginButton from './LoginButton';

const Sidebar = () => {
  const { 
    savedIdeas, 
    isAuthenticated, 
    validateIdeaWithTrends, 
    startOnboardingFlow,
    setCurrentStep,
    setSavedIdeas,
    sidebarOpen,
    setSidebarOpen,
    user,
    logout
  } = useAppContext();
  
  const isOpen = sidebarOpen;

  const toggleSidebar = () => {
    setSidebarOpen(!isOpen);
  };

  const handleIdeaClick = (idea) => {
    validateIdeaWithTrends(idea);
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg z-40 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-80 overflow-hidden flex flex-col`}>
        
        {/* Top/Header Section */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                IdeaForge
              </h1>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-1 hover:bg-white rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          
          {/* New Idea Journey Button */}
          <button
            onClick={startOnboardingFlow}
            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors shadow-sm"
          >
            <Plus size={18} className="mr-2" />
            ➕ New Idea Journey
          </button>

          {/* Additional links from original header */}
          <div className="flex items-center space-x-4 text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
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
        </div>

        {/* Main Content (Scrollable List) - Saved Ideas */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <History className="mr-2 text-purple-600" size={16} />
              Saved Ideas
            </h2>
          </div>
          
          {savedIdeas.length > 0 ? (
            <div className="space-y-3">
              {savedIdeas.map(idea => (
                <div
                  key={idea.id}
                  onClick={() => handleIdeaClick(idea)}
                  className="bg-gray-50 hover:bg-gray-100 rounded-lg p-3 cursor-pointer transition-colors border border-gray-200 group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900 pr-2 line-clamp-2">
                      {idea.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSavedIdeas(savedIdeas.filter(savedIdea => savedIdea.id !== idea.id));
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                    >
                      <X size={14} className="text-red-500" />
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {idea.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className={`flex items-center px-2 py-1 rounded ${
                      idea.matchScore >= 90 ? 'bg-green-100 text-green-700' :
                      idea.matchScore >= 80 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      <Star size={10} className="mr-1" />
                      {idea.matchScore}%
                    </span>
                    
                    <span className="text-gray-500 flex items-center">
                      <Clock size={10} className="mr-1" />
                      {new Date(idea.savedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {idea.tags && idea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {idea.tags.slice(0, 2).map(tag => (
                        <span 
                          key={tag}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Lightbulb className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 mb-2">No saved ideas yet</p>
              <p className="text-xs text-gray-400">
                Generate ideas to see them here
              </p>
            </div>
          )}
        </div>

        {/* Bottom/Footer Section */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          {/* Dashboard Link */}
          <button
            onClick={() => setCurrentStep('dashboard')}
            className="w-full flex items-center justify-center px-3 py-2 bg-white text-gray-700 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors mb-3"
          >
            <Layout size={16} className="mr-2" />
            Dashboard
          </button>
          
          {/* User Profile Section */}
          {isAuthenticated ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-2 bg-white rounded-lg border border-gray-200">
                {user?.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-400 bg-gray-100 rounded-full p-1" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || 'No email'}
                  </p>
                </div>
              </div>
              
              {/* Sign Out Button */}
              <button
                onClick={logout}
                className="w-full flex items-center justify-center px-3 py-2 text-red-600 text-sm rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </button>
            </div>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Toggle button when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed left-4 top-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
      )}
    </>
  );
};

export default Sidebar;