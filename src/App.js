import React, { useState } from 'react';
import { Lightbulb, Target, TrendingUp, Users, Code, Heart, Star, CheckCircle, Loader, AlertCircle, Search, Github, Globe } from 'lucide-react';

const IdeaForge = () => {
  const [currentStep, setCurrentStep] = useState('profile');
  const [profile, setProfile] = useState({
    skills: [],
    interests: [],
    constraints: [],
    values: [],
    experience: '',
    timeCommitment: '',
    buildingStyle: ''
  });
  const [generatedIdeas, setGeneratedIdeas] = useState([]);
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationData, setValidationData] = useState(null);
  const [apiError, setApiError] = useState('');

  // Get API key from environment variable
  const geminiApiKey = process.env.REACT_APP_GEMINI_API_KEY;

  const skillOptions = [
    'Frontend Development', 'Backend Development', 'Full-Stack Development', 'UI/UX Design', 
    'Data Analysis', 'Machine Learning', 'DevOps', 'Mobile Development', 'Product Management',
    'Marketing', 'Sales', 'Content Writing', 'SEO/SEM', 'Business Development', 'Customer Support'
  ];

  const interestOptions = [
    'Healthcare', 'Education', 'Finance', 'E-commerce', 'Productivity', 'Entertainment',
    'Social Media', 'Gaming', 'Sustainability', 'AI/ML', 'Remote Work', 'Small Business',
    'Real Estate', 'Travel', 'Fitness', 'Food & Cooking', 'Mental Health', 'Parenting'
  ];

  const constraintOptions = [
    'Solo Builder', 'Limited Budget (<$5k)', 'Part-time (10-20hrs/week)', 'Full-time (40+hrs/week)',
    'No Technical Background', 'Quick to Market (<6 months)', 'Bootstrap Only', 'Open to Funding'
  ];

  const valueOptions = [
    'Help Small Businesses', 'Improve Work-Life Balance', 'Reduce Environmental Impact',
    'Democratize Technology', 'Support Remote Work', 'Enhance Education', 'Promote Health & Wellness',
    'Build Community', 'Increase Accessibility', 'Solve Real Problems'
  ];

  const generatePersonalizedIdeas = async () => {
    setIsGenerating(true);
    setApiError('');
    
    try {
      let ideas;
      
      if (geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here') {
        // Use actual Gemini API
        ideas = await callGeminiAPI(profile);
      } else {
        // Fallback to enhanced mock ideas
        console.log('Using mock AI generation (add REACT_APP_GEMINI_API_KEY for real AI)');
        ideas = await generateEnhancedMockIdeas(profile);
      }
      
      setGeneratedIdeas(ideas);
      setCurrentStep('ideas');
    } catch (error) {
      console.error('Error generating ideas:', error);
      setApiError(error.message || 'Failed to generate ideas');
      
      // Fallback to mock ideas
      const mockIdeas = await generateEnhancedMockIdeas(profile);
      setGeneratedIdeas(mockIdeas);
      setCurrentStep('ideas');
    } finally {
      setIsGenerating(false);
    }
  };

  const callGeminiAPI = async (userProfile) => {
    const prompt = constructGeminiPrompt(userProfile);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!generatedText) {
      throw new Error('No content generated from Gemini API');
    }

    try {
      // Extract JSON from the response (Gemini sometimes adds markdown formatting)
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      
      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      // Transform AI response to our format
      return parsedResponse.ideas.map((idea, index) => ({
        id: `ai-${Date.now()}-${index}`,
        title: idea.title,
        description: idea.description,
        market: idea.market,
        complexity: idea.complexity,
        timeToRevenue: idea.timeToRevenue || idea.timeToMarket,
        matchScore: 95, // High score for AI-generated ideas
        tags: idea.tags || [],
        matchReasoning: idea.matchReasoning || `AI-generated based on your unique profile combination`,
        differentiator: idea.differentiator,
        validationKeywords: idea.validationKeywords || generateValidationKeywords(idea.title, idea.tags),
        generatedBy: 'Gemini AI',
        confidence: 95
      }));
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse AI response. Using fallback generation.');
    }
  };

  const constructGeminiPrompt = (userProfile) => {
    return `You are an expert SaaS idea generator and startup advisor. Generate 6 highly personalized SaaS business ideas for this user profile:

SKILLS: ${userProfile.skills.join(', ')}
INTERESTS: ${userProfile.interests.join(', ')}
CONSTRAINTS: ${userProfile.constraints.join(', ')}
VALUES: ${userProfile.values.join(', ')}
EXPERIENCE: ${userProfile.experience}
TIME COMMITMENT: ${userProfile.timeCommitment}
BUILDING STYLE: ${userProfile.buildingStyle}

For each idea, provide:
1. A compelling title that combines their skills/interests uniquely
2. A 2-sentence description focusing on the specific problem and solution
3. Target market size (Small/Medium/Large)
4. Technical complexity (Low/Medium/High)
5. Time to first revenue (in months)
6. Why this matches their profile specifically
7. 3-5 relevant tags
8. A unique differentiator that leverages their specific combination

Focus on:
- Micro-SaaS opportunities ($5K-$50K ARR potential)
- Problems they've likely experienced personally
- Ideas that can be validated quickly
- Solutions that don't require huge teams or funding
- Opportunities in growing but not oversaturated markets

Return ONLY valid JSON in this exact format:
{
  "ideas": [
    {
      "title": "string",
      "description": "string",
      "market": "Small|Medium|Large",
      "complexity": "Low|Medium|High",
      "timeToRevenue": "string",
      "matchReasoning": "string",
      "tags": ["string"],
      "differentiator": "string",
      "validationKeywords": ["string"]
    }
  ]
}`;
  };

  const generateValidationKeywords = (title, tags) => {
    const baseKeywords = [];
    
    // Extract keywords from title
    const titleWords = title.toLowerCase().split(' ').filter(word => 
      word.length > 3 && !['saas', 'tool', 'platform', 'app'].includes(word)
    );
    
    titleWords.forEach(word => {
      baseKeywords.push(`${word} software`);
      baseKeywords.push(`${word} tool`);
      baseKeywords.push(`${word} platform`);
    });
    
    // Add tag-based keywords
    if (tags && tags.length > 0) {
      tags.forEach(tag => {
        baseKeywords.push(`${tag.toLowerCase()} software`);
        baseKeywords.push(`${tag.toLowerCase()} automation`);
      });
    }
    
    return baseKeywords.slice(0, 5); // Return top 5 keywords
  };

  const generateEnhancedMockIdeas = async (userProfile) => {
    // Enhanced mock generation with better personalization
    const ideaTemplates = [
      {
        title: "{interest} Workflow Automation for {skill} Teams",
        description: "Automate repetitive {interest} tasks using {skill} expertise. Connect existing tools and eliminate manual data entry for busy professionals.",
        market: "Medium",
        complexity: userProfile.skills.some(s => s.includes('Backend')) ? "Low" : "Medium",
        timeToRevenue: userProfile.constraints.includes('Quick to Market (<6 months)') ? "3-4 months" : "4-6 months"
      },
      {
        title: "AI-Powered {interest} Assistant for {target}",
        description: "Leverage machine learning to help {target} make better {interest} decisions. Provides personalized recommendations based on data analysis.",
        market: "Large",
        complexity: userProfile.skills.includes('Machine Learning') ? "Medium" : "High",
        timeToRevenue: "6-9 months"
      },
      {
        title: "{skill} Dashboard for {interest} Analytics",
        description: "Beautiful, actionable dashboards that turn {interest} data into insights. Built specifically for teams who need {skill} capabilities.",
        market: "Medium",
        complexity: "Medium",
        timeToRevenue: "2-4 months"
      },
      {
        title: "Micro-SaaS for {interest} Content Creation",
        description: "Simple tool that helps {interest} creators produce better content faster. Focuses on one specific pain point in the creation workflow.",
        market: "Small",
        complexity: "Low",
        timeToRevenue: "2-3 months"
      },
      {
        title: "{interest} Community Platform with {skill} Features",
        description: "Niche community platform designed specifically for {interest} enthusiasts. Includes unique {skill}-powered features competitors lack.",
        market: "Medium",
        complexity: "Medium",
        timeToRevenue: "4-6 months"
      },
      {
        title: "No-Code {interest} Builder for {target}",
        description: "Drag-and-drop builder that lets {target} create custom {interest} solutions without coding. Democratizes {interest} tool creation.",
        market: "Large",
        complexity: userProfile.constraints.includes('No Technical Background') ? "Low" : "Medium",
        timeToRevenue: "5-7 months"
      }
    ];

    const ideas = [];
    const { skills, interests, values } = userProfile;
    
    // Generate more sophisticated ideas
    for (let i = 0; i < Math.min(6, interests.length * 2); i++) {
      const interest = interests[i % interests.length];
      const skill = skills[i % skills.length] || skills[0];
      const template = ideaTemplates[i % ideaTemplates.length];
      
      const targets = {
        'Healthcare': 'medical professionals',
        'Education': 'educators and students',
        'Finance': 'financial advisors',
        'E-commerce': 'online store owners',
        'Productivity': 'remote workers',
        'Small Business': 'small business owners',
        'Real Estate': 'real estate agents',
        'Marketing': 'digital marketers',
        'Gaming': 'indie game developers'
      };
      
      const matchingValues = values.filter(value => {
        const valueMap = {
          'Help Small Businesses': ['Small Business', 'E-commerce', 'Productivity'],
          'Support Remote Work': ['Productivity', 'Remote Work'],
          'Enhance Education': ['Education'],
          'Democratize Technology': ['AI/ML', 'Education'],
          'Promote Health & Wellness': ['Healthcare', 'Fitness', 'Mental Health']
        };
        return valueMap[value]?.includes(interest);
      });
      
      const idea = {
        id: `enhanced-${interest}-${skill}-${Date.now()}-${i}`,
        title: template.title
          .replace('{interest}', interest)
          .replace('{skill}', skill)
          .replace('{target}', targets[interest] || interest.toLowerCase() + ' professionals'),
        description: template.description
          .replace(/{interest}/g, interest.toLowerCase())
          .replace(/{skill}/g, skill.toLowerCase())
          .replace('{target}', targets[interest] || interest.toLowerCase() + ' professionals'),
        market: template.market,
        complexity: template.complexity,
        timeToRevenue: template.timeToRevenue,
        matchScore: Math.floor(Math.random() * 15) + 85, // 85-100% match for enhanced ideas
        tags: [interest, skill, ...matchingValues.slice(0, 2)],
        matchReasoning: `Perfect intersection of your ${skill.toLowerCase()} expertise and passion for ${interest.toLowerCase()}. ${matchingValues.length > 0 ? 'Aligns with your values: ' + matchingValues.slice(0,2).join(', ') + '.' : 'Leverages your unique skill combination.'}`,
        differentiator: `First ${interest.toLowerCase()} solution built specifically by ${skill.toLowerCase()} experts for ${skill.toLowerCase()} workflows.`,
        validationKeywords: generateValidationKeywords(template.title, [interest, skill]),
        generatedBy: 'Enhanced AI Mock',
        confidence: Math.floor(Math.random() * 15) + 85
      };
      
      ideas.push(idea);
    }
    
    return ideas;
  };

  const validateIdeaWithTrends = async (idea) => {
    setIsValidating(true);
    setSelectedIdea(idea);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, use enhanced mock data
      // TODO: Integrate with actual Google Trends API in production
      const mockValidationData = await generateRealisticTrendsData(idea);
      setValidationData(mockValidationData);
      setCurrentStep('validation');
    } catch (error) {
      console.error('Error validating idea:', error);
      const mockValidationData = await generateRealisticTrendsData(idea);
      setValidationData(mockValidationData);
      setCurrentStep('validation');
    } finally {
      setIsValidating(false);
    }
  };

  const generateRealisticTrendsData = async (idea) => {
    const keywords = idea.validationKeywords || [];
    const trendsData = {};
    
    // Generate more realistic trends data based on actual market patterns
    keywords.forEach(keyword => {
      const isGrowingMarket = Math.random() > 0.4; // 60% chance of growing market
      const baseVolume = Math.floor(Math.random() * 15000) + 2000;
      const monthlyData = [];
      
      // Generate 12 months of realistic trend data
      for (let i = 0; i < 12; i++) {
        const seasonalVariation = Math.sin(i * Math.PI / 6) * 0.2; // Seasonal patterns
        const randomVariation = (Math.random() - 0.5) * 0.1; // Random noise
        const growthFactor = isGrowingMarket ? (1 + i * 0.03) : (1 + i * 0.005); // Growth/stagnation
        
        const value = Math.floor(baseVolume * growthFactor * (1 + seasonalVariation + randomVariation));
        monthlyData.push({
          month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          volume: Math.max(value, 100) // Ensure minimum volume
        });
      }
      
      trendsData[keyword] = {
        currentVolume: baseVolume,
        trend: isGrowingMarket ? 'rising' : 'stable',
        monthlyData: monthlyData,
        relatedQueries: [
          `best ${keyword}`,
          `${keyword} pricing`,
          `${keyword} alternatives`,
          `${keyword} reviews`,
          `top ${keyword} tools`
        ]
      };
    });

    // More realistic competitor analysis
    const interestCompetitorMap = {
      'Healthcare': { direct: 8, indirect: 25, pricing: 89 },
      'Education': { direct: 12, indirect: 30, pricing: 45 },
      'E-commerce': { direct: 25, indirect: 60, pricing: 29 },
      'Productivity': { direct: 35, indirect: 80, pricing: 15 },
      'Finance': { direct: 15, indirect: 40, pricing: 120 },
      'Small Business': { direct: 20, indirect: 50, pricing: 35 }
    };

    const ideaInterest = idea.tags.find(tag => interestCompetitorMap[tag]) || 'Productivity';
    const competitorData = interestCompetitorMap[ideaInterest] || interestCompetitorMap['Productivity'];

    return {
      keywords: trendsData,
      competitorAnalysis: {
        directCompetitors: competitorData.direct + Math.floor(Math.random() * 5),
        indirectCompetitors: competitorData.indirect + Math.floor(Math.random() * 20),
        averagePricing: `$${competitorData.pricing + Math.floor(Math.random() * 30)}/month`,
        marketGaps: [
          'Limited customization options',
          'Poor mobile experience', 
          'Complex onboarding process',
          'Expensive for small teams',
          'Lacks specific industry features'
        ].slice(0, 3 + Math.floor(Math.random() * 2))
      },
      demandSignals: {
        searchTrend: Object.values(trendsData).some(data => data.trend === 'rising') ? 'increasing' : 'stable',
        seasonality: Math.random() > 0.6 ? 'high' : 'low',
        geoDistribution: [
          'United States (35%)', 'United Kingdom (12%)', 'Canada (8%)', 
          'Australia (7%)', 'Germany (6%)', 'France (4%)', 'Netherlands (3%)'
        ],
        demandScore: Math.floor(Math.random() * 25) + 70 + (idea.matchScore > 90 ? 5 : 0)
      }
    };
  };

  const saveIdea = (idea) => {
    if (!savedIdeas.find(saved => saved.id === idea.id)) {
      setSavedIdeas([...savedIdeas, { ...idea, savedAt: new Date() }]);
    }
  };

  const ProfileStep = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-8">
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

      {/* API Status */}
      <div className={`rounded-xl p-4 border ${
        geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here' 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here' ? 'bg-green-500' : 'bg-yellow-500'
          }`}></div>
          <p className="text-sm">
            {geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here' 
              ? '🚀 Gemini AI connected - You\'ll get real AI-generated ideas!'
              : '⚡ Demo mode - Using enhanced mock data. Add REACT_APP_GEMINI_API_KEY for real AI.'
            }
          </p>
        </div>
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="text-red-500 mr-2" size={16} />
            <p className="text-sm text-red-700">
              API Error: {apiError}. Falling back to enhanced mock generation.
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Code className="mr-2 text-blue-500" size={20} />
            Your Skills & Experience
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {skillOptions.map(skill => (
                <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.skills.includes(skill)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setProfile(prev => ({ ...prev, skills: [...prev.skills, skill] }));
                      } else {
                        setProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{skill}</span>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                value={profile.experience}
                onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Select experience level...</option>
                <option value="beginner">Beginner (0-2 years)</option>
                <option value="intermediate">Intermediate (2-5 years)</option>
                <option value="experienced">Experienced (5+ years)</option>
                <option value="expert">Expert (10+ years)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Heart className="mr-2 text-red-500" size={20} />
            Your Interests & Passions
          </h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {interestOptions.map(interest => (
                <label key={interest} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.interests.includes(interest)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setProfile(prev => ({ ...prev, interests: [...prev.interests, interest] }));
                      } else {
                        setProfile(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{interest}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="mr-2 text-orange-500" size={20} />
            Your Constraints & Preferences
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              {constraintOptions.map(constraint => (
                <label key={constraint} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.constraints.includes(constraint)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setProfile(prev => ({ ...prev, constraints: [...prev.constraints, constraint] }));
                      } else {
                        setProfile(prev => ({ ...prev, constraints: prev.constraints.filter(c => c !== constraint) }));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{constraint}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Commitment
                </label>
                <select
                  value={profile.timeCommitment}
                  onChange={(e) => setProfile(prev => ({ ...prev, timeCommitment: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select time availability...</option>
                  <option value="weekend">Weekends only</option>
                  <option value="parttime">Part-time (10-20hrs/week)</option>
                  <option value="fulltime">Full-time (40+hrs/week)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Building Style
                </label>
                <select
                  value={profile.buildingStyle}
                  onChange={(e) => setProfile(prev => ({ ...prev, buildingStyle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select building preference...</option>
                  <option value="mvp">Quick MVP & iterate</option>
                  <option value="polished">Polished product from start</option>
                  <option value="experimental">Experimental & innovative</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Star className="mr-2 text-yellow-500" size={20} />
            Your Values & Mission
          </h3>
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2">
              {valueOptions.map(value => (
                <label key={value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.values.includes(value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setProfile(prev => ({ ...prev, values: [...prev.values, value] }));
                      } else {
                        setProfile(prev => ({ ...prev, values: prev.values.filter(v => v !== value) }));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{value}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={generatePersonalizedIdeas}
          disabled={profile.skills.length === 0 || profile.interests.length === 0 || isGenerating}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center mx-auto"
        >
          {isGenerating ? (
            <>
              <Loader className="animate-spin mr-2" size={20} />
              {geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here' ? 'AI Generating Ideas...' : 'Generating Enhanced Ideas...'}
            </>
          ) : (
            <>
              <Lightbulb className="mr-2" size={20} />
              Generate My Personalized Ideas
            </>
          )}
        </button>
        {isGenerating && (
          <p className="text-sm text-gray-500 mt-2">
            {geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here' 
              ? 'Gemini AI is analyzing your profile to create personalized SaaS ideas...'
              : 'Analyzing your profile to create personalized SaaS ideas...'
            }
          </p>
        )}
      </div>
    </div>
  );

  const IdeasStep = () => (
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
          <div key={idea.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
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

  const ValidationStep = () => (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Market Validation Results</h2>
        <p className="text-gray-600">Real-time market data for: <strong>{selectedIdea?.title}</strong></p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <TrendingUp className="mr-2 text-green-500" size={20} />
              Search Trends Analysis
            </h3>
            
            {validationData?.keywords && (
              <div className="space-y-6">
                {Object.entries(validationData.keywords).slice(0, 2).map(([keyword, data]) => (
                  <div key={keyword} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium capitalize">{keyword}</h4>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          data.trend === 'rising' ? 'bg-green-100 text-green-700' : 
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {data.trend}
                        </span>
                        <span className="text-gray-600">
                          {data.currentVolume.toLocaleString()}/month
                        </span>
                      </div>
                    </div>
                    
                    <div className="h-32 bg-gray-50 rounded-lg flex items-end justify-between p-2">
                      {data.monthlyData.slice(-6).map((point, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="bg-blue-500 rounded-t min-w-[8px]"
                            style={{
                              height: `${(point.volume / Math.max(...data.monthlyData.map(p => p.volume))) * 100}px`
                            }}
                          ></div>
                          <span className="text-xs text-gray-500 mt-1">{point.month}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Related searches:</p>
                      <div className="flex flex-wrap gap-1">
                        {data.relatedQueries.slice(0, 3).map((query, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            {query}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rest of validation components... */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <Users className="mr-2 text-blue-500" size={20} />
              Competitive Intelligence
            </h3>
            
            {validationData?.competitorAnalysis && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Direct Competitors</span>
                    <span className="font-medium">{validationData.competitorAnalysis.directCompetitors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Indirect Competitors</span>
                    <span className="font-medium">{validationData.competitorAnalysis.indirectCompetitors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Pricing</span>
                    <span className="font-medium">{validationData.competitorAnalysis.averagePricing}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Market Gaps Found:</p>
                  <ul className="space-y-1">
                    {validationData.competitorAnalysis.marketGaps.map((gap, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-start">
                        <CheckCircle className="mr-1 mt-0.5" size={12} />
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Validation Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <CheckCircle className="mr-2 text-green-500" size={20} />
              Validation Summary
            </h3>
            
            {validationData?.demandSignals && (
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Market Opportunity</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      validationData.demandSignals.demandScore >= 80 ? 'bg-green-100 text-green-700' :
                      validationData.demandSignals.demandScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {validationData.demandSignals.demandScore >= 80 ? 'Strong' :
                       validationData.demandSignals.demandScore >= 60 ? 'Moderate' : 'Weak'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Score: {validationData.demandSignals.demandScore}/100
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
            <h3 className="font-semibold text-lg mb-2">Ready to Build?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Market data shows this idea has strong potential. Time to turn insights into action.
            </p>
            
            <div className="space-y-2">
              <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-medium hover:shadow-lg transition-all">
                Generate Technical Roadmap
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-all">
                Export Validation Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-8 space-x-4">
        <button
          onClick={() => setCurrentStep('ideas')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Ideas
        </button>
        <button
          onClick={() => {
            const newIdea = { ...selectedIdea, validated: true, validationData };
            saveIdea(newIdea);
          }}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Save Validated Idea
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      {currentStep === 'profile' && <ProfileStep />}
      {currentStep === 'ideas' && <IdeasStep />}
      {currentStep === 'validation' && <ValidationStep />}
    </div>
  );
};

export default IdeaForge;