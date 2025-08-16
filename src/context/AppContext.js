import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
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

  const generateValidationKeywords = (title, tags) => {
    const baseKeywords = [];
    
    const titleWords = title.toLowerCase().split(' ').filter(word => 
      word.length > 3 && !['saas', 'tool', 'platform', 'app'].includes(word)
    );
    
    titleWords.forEach(word => {
      baseKeywords.push(`${word} software`);
      baseKeywords.push(`${word} tool`);
      baseKeywords.push(`${word} platform`);
    });
    
    if (tags && tags.length > 0) {
      tags.forEach(tag => {
        baseKeywords.push(`${tag.toLowerCase()} software`);
        baseKeywords.push(`${tag.toLowerCase()} automation`);
      });
    }
    
    return baseKeywords.slice(0, 5);
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
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      
      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      return parsedResponse.ideas.map((idea, index) => ({
        id: `ai-${Date.now()}-${index}`,
        title: idea.title,
        description: idea.description,
        market: idea.market,
        complexity: idea.complexity,
        timeToRevenue: idea.timeToRevenue || idea.timeToMarket,
        matchScore: 95,
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

  const generateEnhancedMockIdeas = async (userProfile) => {
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
        matchScore: Math.floor(Math.random() * 15) + 85,
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

  const generatePersonalizedIdeas = async () => {
    setIsGenerating(true);
    setApiError('');
    
    try {
      let ideas;
      
      if (geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here') {
        ideas = await callGeminiAPI(profile);
      } else {
        console.log('Using mock AI generation (add REACT_APP_GEMINI_API_KEY for real AI)');
        ideas = await generateEnhancedMockIdeas(profile);
      }
      
      setGeneratedIdeas(ideas);
      setCurrentStep('ideas');
    } catch (error) {
      console.error('Error generating ideas:', error);
      setApiError(error.message || 'Failed to generate ideas');
      
      const mockIdeas = await generateEnhancedMockIdeas(profile);
      setGeneratedIdeas(mockIdeas);
      setCurrentStep('ideas');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateRealisticTrendsData = async (idea) => {
    const keywords = idea.validationKeywords || [];
    const trendsData = {};
    
    keywords.forEach(keyword => {
      const isGrowingMarket = Math.random() > 0.4;
      const baseVolume = Math.floor(Math.random() * 15000) + 2000;
      const monthlyData = [];
      
      for (let i = 0; i < 12; i++) {
        const seasonalVariation = Math.sin(i * Math.PI / 6) * 0.2;
        const randomVariation = (Math.random() - 0.5) * 0.1;
        const growthFactor = isGrowingMarket ? (1 + i * 0.03) : (1 + i * 0.005);
        
        const value = Math.floor(baseVolume * growthFactor * (1 + seasonalVariation + randomVariation));
        monthlyData.push({
          month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          volume: Math.max(value, 100)
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

  const validateIdeaWithTrends = async (idea) => {
    setIsValidating(true);
    setSelectedIdea(idea);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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

  const saveIdea = (idea) => {
    if (!savedIdeas.find(saved => saved.id === idea.id)) {
      setSavedIdeas([...savedIdeas, { ...idea, savedAt: new Date() }]);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const value = {
    currentStep,
    setCurrentStep,
    profile,
    setProfile,
    generatedIdeas,
    setGeneratedIdeas,
    savedIdeas,
    setSavedIdeas,
    selectedIdea,
    setSelectedIdea,
    isGenerating,
    setIsGenerating,
    isValidating,
    setIsValidating,
    validationData,
    setValidationData,
    apiError,
    setApiError,
    geminiApiKey,
    skillOptions,
    interestOptions,
    constraintOptions,
    valueOptions,
    generatePersonalizedIdeas,
    validateIdeaWithTrends,
    saveIdea,
    handleProfileChange
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};