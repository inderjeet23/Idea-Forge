import React from 'react';
import { Star, Search, Loader } from 'lucide-react';

const IdeaCard = ({ idea, validateIdeaWithTrends, saveIdea, isValidating, selectedIdea }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              idea.matchScore >= 90 ? 'bg-green-100 text-green-700' :
              idea.matchScore >= 80 ? 'bg-blue-100 text-blue-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {idea.matchScore}% match
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              idea.generatedBy === 'Gemini AI' ? 'bg-purple-100 text-purple-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {idea.generatedBy === 'Gemini AI' ? 'Gemini' : 'AI'}
            </span>
          </div>
          <button
            onClick={() => saveIdea(idea)}
            className="text-gray-400 hover:text-yellow-500 transition-colors"
          >
            <Star size={18} />
          </button>
        </div>
        
        <h3 className="font-semibold text-lg mb-2">{idea.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{idea.description}</p>
        
        {idea.matchReasoning && (
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="text-xs text-blue-700">
              <strong>Why this matches you:</strong> {idea.matchReasoning}
            </p>
          </div>
        )}
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Market Size:</span>
            <span className="font-medium">{idea.market}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Complexity:</span>
            <span className="font-medium">{idea.complexity}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Time to Revenue:</span>
            <span className="font-medium">{idea.timeToRevenue}</span>
          </div>
          {idea.confidence && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Confidence:</span>
              <span className="font-medium">{idea.confidence}%</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {idea.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
        
        <button
          onClick={() => validateIdeaWithTrends(idea)}
          disabled={isValidating}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {isValidating && selectedIdea?.id === idea.id ? (
            <>
              <Loader className="animate-spin mr-2" size={16} />
              Validating...
            </>
          ) : (
            <>
              <Search className="mr-2" size={16} />
              Validate with Market Data
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default IdeaCard;