import React, { useState, useRef, useEffect } from 'react';
import { Lightbulb, Target, TrendingUp, Crown, Search, Loader, Star, ChevronLeft, ChevronRight, Check } from 'lucide-react';
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
    geminiApiKey,
    savedIdeas
  } = useAppContext();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSwipe = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && currentIndex < generatedIdeas.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }
  };

  const nextIdea = () => {
    if (currentIndex < generatedIdeas.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevIdea = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const topMatch = generatedIdeas.length > 0 ? generatedIdeas[0] : null;
  const otherIdeas = generatedIdeas.slice(1);

  const CarouselIdeaCard = ({ idea, index, isActive }) => {
    const isAlreadySaved = savedIdeas.find(saved => saved.id === idea.id);
    
    return (
    <div className={`${isActive ? 'block' : 'hidden'} w-full`}>
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-200 shadow-lg p-4 sm:p-6 lg:p-8 relative min-h-[500px] sm:min-h-[400px]">
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold flex items-center">
            <Crown className="mr-1" size={12} />
            {index === 0 ? 'Best Match' : `#${index + 1} Match`}
          </span>
        </div>
        
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
            <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
              idea.matchScore >= 90 ? 'bg-green-100 text-green-700' :
              idea.matchScore >= 80 ? 'bg-blue-100 text-blue-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {idea.matchScore}% match
            </span>
            <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
              idea.generatedBy === 'Gemini AI' ? 'bg-purple-100 text-purple-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {idea.generatedBy === 'Gemini AI' ? 'Gemini' : 'AI'}
            </span>
          </div>
          
          <h3 className="font-bold text-lg sm:text-xl lg:text-2xl mb-3 sm:mb-4 text-gray-900">{idea.title}</h3>
          <p className="text-gray-700 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 leading-relaxed">{idea.description}</p>
          
          {idea.matchReasoning && (
            <div className="bg-white/70 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 border border-purple-100">
              <p className="text-xs sm:text-sm text-purple-800">
                <strong className="text-purple-900">Why this is perfect for you:</strong> {idea.matchReasoning}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
            <div className="bg-white/70 p-2 sm:p-3 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Market Size</div>
              <div className="font-semibold text-gray-900 text-xs sm:text-sm">{idea.market}</div>
            </div>
            <div className="bg-white/70 p-2 sm:p-3 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Complexity</div>
              <div className="font-semibold text-gray-900 text-xs sm:text-sm">{idea.complexity}</div>
            </div>
            <div className="bg-white/70 p-2 sm:p-3 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Time to Revenue</div>
              <div className="font-semibold text-gray-900 text-xs sm:text-sm">{idea.timeToRevenue}</div>
            </div>
            {idea.confidence && (
              <div className="bg-white/70 p-2 sm:p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Confidence</div>
                <div className="font-semibold text-gray-900 text-xs sm:text-sm">{idea.confidence}%</div>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
            {idea.tags.slice(0, 4).map(tag => (
              <span key={tag} className="px-2 py-1 bg-white/70 text-gray-700 rounded-full text-xs font-medium">
                {tag}
              </span>
            ))}
            {idea.tags.length > 4 && (
              <span className="px-2 py-1 bg-white/70 text-gray-700 rounded-full text-xs font-medium">
                +{idea.tags.length - 4} more
              </span>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button
              onClick={() => validateIdeaWithTrends(idea)}
              disabled={isValidating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 sm:px-6 lg:px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center text-sm sm:text-base"
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
            <button
              onClick={() => saveIdea(idea)}
              disabled={isAlreadySaved}
              className={`px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors border-2 flex items-center justify-center text-sm sm:text-base ${
                isAlreadySaved 
                  ? 'bg-green-50 text-green-600 border-green-200 cursor-not-allowed'
                  : 'bg-white text-purple-600 hover:bg-purple-50 border-purple-200'
              }`}
            >
              {isAlreadySaved ? <Check className="mr-2" size={16} /> : <Star className="mr-2" size={16} />}
              {isAlreadySaved ? 'Saved!' : 'Save Idea'}
            </button>
          </div>
        </div>
      </div>
    </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Your Personalized Opportunities</h2>
        <p className="text-gray-600 text-sm sm:text-base">
          {geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here' 
            ? 'AI-generated SaaS opportunities based on your unique profile'
            : 'Enhanced personalized SaaS opportunities based on your unique profile'
          }
        </p>
        <div className="flex items-center justify-center mt-3 sm:mt-4 space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-500">
          <span className="flex items-center">
            <Lightbulb className="mr-1" size={14} />
            {geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here' ? 'Gemini AI' : 'Enhanced AI'}
          </span>
          <span className="flex items-center">
            <Target className="mr-1" size={14} />
            Personalized
          </span>
          <span className="flex items-center">
            <TrendingUp className="mr-1" size={14} />
            Market-Validated
          </span>
        </div>
      </div>

      {generatedIdeas.length > 0 && (
        <div className="relative">
          {/* Mobile Carousel */}
          {isMobile ? (
            <div 
              className="relative overflow-hidden"
              ref={carouselRef}
              onTouchStart={(e) => {
                touchStartX.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                touchEndX.current = e.changedTouches[0].clientX;
                handleSwipe();
              }}
            >
              {generatedIdeas.map((idea, index) => (
                <CarouselIdeaCard
                  key={idea.id}
                  idea={idea}
                  index={index}
                  isActive={index === currentIndex}
                />
              ))}
              
              {/* Navigation arrows */}
              <div className="absolute top-1/2 left-2 transform -translate-y-1/2">
                <button
                  onClick={prevIdea}
                  disabled={currentIndex === 0}
                  className="bg-white/80 hover:bg-white p-2 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={20} className="text-gray-700" />
                </button>
              </div>
              
              <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
                <button
                  onClick={nextIdea}
                  disabled={currentIndex === generatedIdeas.length - 1}
                  className="bg-white/80 hover:bg-white p-2 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={20} className="text-gray-700" />
                </button>
              </div>
              
              {/* Dot indicators */}
              <div className="flex justify-center mt-4 space-x-2">
                {generatedIdeas.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex 
                        ? 'bg-purple-600 w-6' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
              
              {/* Current index indicator */}
              <div className="text-center mt-2 text-sm text-gray-500">
                {currentIndex + 1} of {generatedIdeas.length}
              </div>
            </div>
          ) : (
            /* Desktop Layout */
            <div>
              {topMatch && (
                <div className="mb-8">
                  <CarouselIdeaCard idea={topMatch} index={0} isActive={true} />
                </div>
              )}
              
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
            </div>
          )}
        </div>
      )}

      <div className="text-center mt-6 sm:mt-8 pb-4">
        <button
          onClick={() => setCurrentStep('profile')}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
        >
          ← Back to Profile
        </button>
      </div>
    </div>
  );
};

export default IdeasStep;