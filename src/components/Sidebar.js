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
  History
} from 'lucide-react';

const Sidebar = () => {
  const { 
    savedIdeas, 
    isAuthenticated, 
    validateIdeaWithTrends, 
    startOnboardingFlow,
    setCurrentStep,
    setSavedIdeas,
    sidebarOpen,
    setSidebarOpen
  } = useAppContext();
  
  const isOpen = sidebarOpen;
  const [filter, setFilter] = useState('all'); // all, recent, high-score

  if (!isAuthenticated) {
    return null;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!isOpen);
  };

  const sortedIdeas = savedIdeas
    .filter(idea => {
      if (filter === 'recent') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return new Date(idea.savedAt) > sevenDaysAgo;
      }
      if (filter === 'high-score') {
        return idea.matchScore >= 85;
      }
      return true;
    })
    .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

  const removeIdea = (ideaId, e) => {
    e.stopPropagation();
    setSavedIdeas(savedIdeas.filter(idea => idea.id !== ideaId));
  };

  const handleIdeaClick = (idea) => {
    validateIdeaWithTrends(idea);
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg z-40 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-80 lg:w-80 md:w-72 sm:w-64 overflow-hidden flex flex-col`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <History className="mr-2 text-purple-600" size={20} />
              Saved Ideas
            </h2>
            <button
              onClick={toggleSidebar}
              className="p-1 hover:bg-white rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-500" />
            </button>
          </div>
          
          {/* Filter tabs */}
          <div className="flex space-x-1 bg-white rounded-lg p-1">
            {[
              { key: 'all', label: 'All', count: savedIdeas.length },
              { key: 'recent', label: 'Recent', count: savedIdeas.filter(idea => {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return new Date(idea.savedAt) > sevenDaysAgo;
              }).length },
              { key: 'high-score', label: 'Top', count: savedIdeas.filter(idea => idea.matchScore >= 85).length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                  filter === tab.key 
                    ? 'bg-purple-100 text-purple-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Ideas List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {sortedIdeas.length > 0 ? (
            sortedIdeas.map(idea => (
              <div
                key={idea.id}
                onClick={() => handleIdeaClick(idea)}
                className="bg-gray-50 hover:bg-gray-100 rounded-lg p-3 cursor-pointer transition-colors border border-gray-200 group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900 pr-2 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                    {idea.title}
                  </h3>
                  <button
                    onClick={(e) => removeIdea(idea.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                  >
                    <X size={14} className="text-red-500" />
                  </button>
                </div>
                
                <p className="text-xs text-gray-600 mb-2 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                  {idea.description}
                </p>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
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
                  
                  <TrendingUp size={12} className="text-blue-500" />
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
            ))
          ) : (
            <div className="text-center py-8">
              <Lightbulb className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 mb-2">
                {filter === 'all' ? 'No saved ideas yet' : `No ${filter} ideas`}
              </p>
              <p className="text-xs text-gray-400">
                Generate ideas to see them here
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="space-y-2">
            <button
              onClick={startOnboardingFlow}
              className="w-full flex items-center justify-center px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Generate New Ideas
            </button>
            
            <button
              onClick={() => setCurrentStep('dashboard')}
              className="w-full flex items-center justify-center px-3 py-2 bg-white text-gray-700 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Toggle button when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed left-4 top-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      )}

      {/* Main content spacing */}
      <div className={`transition-all duration-300 ${isOpen ? 'ml-80' : 'ml-0'}`}>
        {/* This div creates space for the main content when sidebar is open */}
      </div>
    </>
  );
};

export default Sidebar;