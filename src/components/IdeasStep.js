import React from 'react';
import { Lightbulb, Target, TrendingUp } from 'lucide-react';
import IdeaCard from './IdeaCard';

const IdeasStep = ({ 
  generatedIdeas, 
  validateIdeaWithTrends, 
  saveIdea, 
  isValidating, 
  selectedIdea, 
  setCurrentStep, 
  geminiApiKey 
}) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Your Personalized Ideas</h2>
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {generatedIdeas.map(idea => (
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