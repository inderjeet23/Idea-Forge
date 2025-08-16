import React from 'react';
import { Lightbulb, Target, TrendingUp, Crown, Search, Loader, Star } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import IdeaCard from './IdeaCard';

const IdeasStep = () => {
  const {
    generatedIdeas,
    validateIdeaWithTrends,
    saveIdea,
    isValidating,
    selectedIdea,
    setCurrentStep,
    geminiApiKey
  } = useAppContext();

  const topMatch = generatedIdeas.length > 0 ? generatedIdeas[0] : null;
  const otherIdeas = generatedIdeas.slice(1);

  const TopMatchCard = ({ idea }) => (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-200 shadow-lg p-8 mb-8 relative">
      <div className="absolute top-4 right-4">
        <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
          <Crown className="mr-1" size={14} />
          Best Match for You
        </span>
      </div>
      
      <div className="max-w-4xl">
        <div className="flex items-center space-x-3 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            idea.matchScore >= 90 ? 'bg-green-100 text-green-700' :
            idea.matchScore >= 80 ? 'bg-blue-100 text-blue-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {idea.matchScore}% match
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            idea.generatedBy === 'Gemini AI' ? 'bg-purple-100 text-purple-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {idea.generatedBy === 'Gemini AI' ? 'Gemini' : 'AI'}
          </span>
        </div>
        
        <h3 className="font-bold text-2xl mb-4 text-gray-900">{idea.title}</h3>
        <p className="text-gray-700 text-lg mb-6 leading-relaxed">{idea.description}</p>
        
        {idea.matchReasoning && (
          <div className="bg-white/70 p-4 rounded-lg mb-6 border border-purple-100">
            <p className="text-sm text-purple-800">
              <strong className="text-purple-900">Why this is perfect for you:</strong> {idea.matchReasoning}
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/70 p-3 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Market Size</div>
            <div className="font-semibold text-gray-900">{idea.market}</div>
          </div>
          <div className="bg-white/70 p-3 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Complexity</div>
            <div className="font-semibold text-gray-900">{idea.complexity}</div>
          </div>
          <div className="bg-white/70 p-3 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Time to Revenue</div>
            <div className="font-semibold text-gray-900">{idea.timeToRevenue}</div>
          </div>
          {idea.confidence && (
            <div className="bg-white/70 p-3 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Confidence</div>
              <div className="font-semibold text-gray-900">{idea.confidence}%</div>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {idea.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-white/70 text-gray-700 rounded-full text-sm font-medium">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => validateIdeaWithTrends(idea)}
            disabled={isValidating}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center"
          >
            {isValidating && selectedIdea?.id === idea.id ? (
              <>
                <Loader className="animate-spin mr-2" size={18} />
                Validating...
              </>
            ) : (
              <>
                <Search className="mr-2" size={18} />
                Validate with Market Data
              </>
            )}
          </button>
          <button
            onClick={() => saveIdea(idea)}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors border-2 border-purple-200 flex items-center"
          >
            <Star className="mr-2" size={18} />
            Save Idea
          </button>
        </div>
      </div>
    </div>
  );
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Here are the opportunities we've uncovered for you</h2>
        <p className="text-gray-600">
          {geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here' 
            ? 'AI-generated SaaS opportunities based on your unique profile'
            : 'Enhanced personalized SaaS opportunities based on your unique profile'
          }
        </p>
        <div className="flex items-center justify-center mt-4 space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <Lightbulb className="mr-1" size={16} />
            {geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here' ? 'Gemini AI' : 'Enhanced AI'}
          </span>
          <span className="flex items-center">
            <Target className="mr-1" size={16} />
            Personalized
          </span>
          <span className="flex items-center">
            <TrendingUp className="mr-1" size={16} />
            Market-Validated
          </span>
        </div>
      </div>

      {topMatch && <TopMatchCard idea={topMatch} />}

      {otherIdeas.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Other Great Options</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherIdeas.map(idea => (
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
        </div>
      )}

      <div className="text-center mt-8">
        <button
          onClick={() => setCurrentStep('profile')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Profile
        </button>
      </div>
    </div>
  );
};

export default IdeasStep;