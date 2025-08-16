import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import IdeaCard from './IdeaCard';
import { Plus, User, Lightbulb, TrendingUp, Clock, LogOut } from 'lucide-react';

const Dashboard = () => {
  const { user, logout, validateIdeaWithTrends, saveIdea, isValidating, selectedIdea, setCurrentStep } = useAppContext();
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIdeas = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/.netlify/functions/get-saved-ideas?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Could not fetch saved ideas.');
        }
        const data = await response.json();
        setSavedIdeas(data);
      } catch (error) {
        console.error('Error fetching saved ideas:', error);
        setError('Failed to load your saved ideas.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdeas();
  }, [user]);

  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);

  const handleGenerateNewIdeas = () => {
    setCurrentStep('profile');
  };

  const handleCustomPromptGeneration = () => {
    if (customPrompt.trim()) {
      // TODO: Implement custom prompt generation logic
      console.log('Generating ideas with custom prompt:', customPrompt);
      setCurrentStep('ideas');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your saved ideas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                IdeaForge
              </h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-gray-600 mb-6">
            Here are the ideas you've saved. Ready to take action on one of them?
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <Lightbulb className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Saved Ideas</p>
                  <p className="text-2xl font-bold text-gray-900">{savedIdeas.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Avg Match Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {savedIdeas.length > 0 
                      ? Math.round(savedIdeas.reduce((sum, idea) => sum + idea.matchScore, 0) / savedIdeas.length)
                      : 0
                    }%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Last Saved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {savedIdeas.length > 0 
                      ? new Date(savedIdeas[0].savedAt).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Generate More Ideas Section */}
        {savedIdeas.length > 0 && (
          <div className="mb-8 bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Want to explore more ideas?</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleGenerateNewIdeas}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <Plus className="mr-2" size={20} />
                Start New Idea Discovery Journey
              </button>
              
              <button
                onClick={() => setShowCustomPrompt(!showCustomPrompt)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors inline-flex items-center"
              >
                <Lightbulb className="mr-2" size={20} />
                Generate Ideas with Custom Prompt
              </button>
            </div>
            
            {showCustomPrompt && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe what kind of business ideas you're looking for:
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g., 'I want to build a SaaS tool for small businesses that helps with inventory management' or 'Ideas for sustainable products that solve everyday problems'"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={handleCustomPromptGeneration}
                    disabled={!customPrompt.trim()}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Generate Ideas
                  </button>
                  <button
                    onClick={() => setShowCustomPrompt(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ideas Grid */}
        {savedIdeas.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedIdeas.map(idea => (
              <IdeaCard 
                key={idea.id} 
                idea={idea} 
                validateIdeaWithTrends={validateIdeaWithTrends}
                saveIdea={saveIdea}
                isValidating={isValidating}
                selectedIdea={selectedIdea}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Lightbulb className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No saved ideas yet</h3>
            <p className="text-gray-600 mb-6">
              Start by generating some personalized business ideas based on your profile.
            </p>
            <div className="space-y-4">
              <button
                onClick={handleGenerateNewIdeas}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center mr-4"
              >
                <Plus className="mr-2" size={20} />
                Start Idea Discovery Journey
              </button>
              
              <button
                onClick={() => setShowCustomPrompt(!showCustomPrompt)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors inline-flex items-center"
              >
                <Lightbulb className="mr-2" size={20} />
                Generate Ideas with Custom Prompt
              </button>
              
              {showCustomPrompt && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe what kind of business ideas you're looking for:
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g., 'I want to build a SaaS tool for small businesses that helps with inventory management' or 'Ideas for sustainable products that solve everyday problems'"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={handleCustomPromptGeneration}
                      disabled={!customPrompt.trim()}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Generate Ideas
                    </button>
                    <button
                      onClick={() => setShowCustomPrompt(false)}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;