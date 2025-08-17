import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

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
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(1);
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
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user;
      setUser(currentUser ?? null);
      setIsAuthenticated(!!currentUser);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      // Auto-close sidebar on mobile, auto-open on desktop
      const isDesktop = window.innerWidth >= 1024;
      setSidebarOpen(isDesktop);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchSavedIdeas = async () => {
      if (!user?.id) {
        setSavedIdeas([]);
        return;
      }
      
      try {
        const response = await fetch(`/.netlify/functions/get-saved-ideas?userId=${user.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setSavedIdeas([]);
          } else {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error('Server error details:', errorData);
            throw new Error(`Could not fetch saved ideas: ${errorData.details || errorData.error || 'Unknown error'}`);
          }
        } else {
          const data = await response.json();
          setSavedIdeas(data);
        }
      } catch (error) {
        console.error('Error fetching saved ideas:', error);
      }
    };

    if (isAuthenticated && user?.id) {
      fetchSavedIdeas();
    }
  }, [user, isAuthenticated]);


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
    'Solo Builder', 'Limited Budget (<$5k)', 'No Technical Background', 
    'Quick to Market (<6 months)', 'Bootstrap Only', 'Open to Funding'
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
    const response = await fetch('/.netlify/functions/generate-ideas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userProfile })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Serverless function error: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return data.ideas;
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

  const callGeminiAPIWithCustomPrompt = async (customPrompt) => {
    const response = await fetch('/.netlify/functions/generate-ideas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customPrompt })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Serverless function error: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return data.ideas;
  };

  const generateIdeasFromCustomPrompt = async (customPrompt) => {
    setIsGenerating(true);
    setApiError('');
    
    try {
      let ideas;
      
      try {
        ideas = await callGeminiAPIWithCustomPrompt(customPrompt);
      } catch (apiError) {
        console.log('Serverless function unavailable, using mock AI generation:', apiError.message);
        // Generate mock ideas based on custom prompt
        ideas = await generateMockIdeasFromPrompt(customPrompt);
      }
      
      setGeneratedIdeas(ideas);
      setCurrentStep('ideas');
    } catch (error) {
      console.error('Error generating ideas:', error);
      setApiError(error.message || 'Failed to generate ideas');
      
      const mockIdeas = await generateMockIdeasFromPrompt(customPrompt);
      setGeneratedIdeas(mockIdeas);
      setCurrentStep('ideas');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockIdeasFromPrompt = async (customPrompt) => {
    // Create mock ideas based on custom prompt
    const promptWords = customPrompt.toLowerCase().split(' ');
    const ideaTemplates = [
      {
        title: "AI-Powered Solution for Your Needs",
        description: `Smart tool that addresses your specific requirements: "${customPrompt}". Uses modern technology to streamline workflows and improve efficiency.`,
        market: "Medium",
        complexity: "Medium",
        timeToRevenue: "4-6 months"
      },
      {
        title: "Custom Platform Based on Your Vision",
        description: `Tailored platform built around your concept: "${customPrompt}". Designed to scale and adapt to growing user needs.`,
        market: "Large",
        complexity: "High",
        timeToRevenue: "6-9 months"
      },
      {
        title: "Micro-SaaS for Specific Use Case",
        description: `Focused solution targeting the specific problem outlined in: "${customPrompt}". Simple, effective, and quick to market.`,
        market: "Small",
        complexity: "Low",
        timeToRevenue: "2-3 months"
      }
    ];

    const ideas = ideaTemplates.map((template, index) => ({
      id: `custom-${Date.now()}-${index}`,
      title: template.title,
      description: template.description,
      market: template.market,
      complexity: template.complexity,
      timeToRevenue: template.timeToRevenue,
      tags: promptWords.slice(0, 3),
      matchScore: Math.floor(Math.random() * 30) + 70,
      validationKeywords: promptWords.filter(word => word.length > 3).slice(0, 4)
    }));

    return ideas;
  };

  const generatePersonalizedIdeas = async () => {
    setIsGenerating(true);
    setApiError('');
    
    try {
      let ideas;
      
      try {
        ideas = await callGeminiAPI(profile);
      } catch (apiError) {
        console.log('Serverless function unavailable, using mock AI generation:', apiError.message);
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

  const generateValidationInsights = async (idea, insightType) => {
    try {
      const response = await fetch('/.netlify/functions/generate-validation-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea, insightType })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error generating ${insightType}:`, error);
      // Return fallback data based on insight type
      return generateFallbackInsight(idea, insightType);
    }
  };

  const generateFallbackInsight = (idea, insightType) => {
    switch (insightType) {
      case 'targetAudience':
        return {
          persona: {
            name: "Alex Thompson",
            jobTitle: "Product Manager",
            ageRange: "28-35",
            background: "Tech professional with 5+ years experience",
            companySize: "50-200 employees",
            techSkillLevel: "Intermediate"
          },
          demographics: {
            industry: idea.tags?.[0] || "Technology",
            experience: "3-7 years",
            teamSize: "5-15 people",
            budgetInfluence: "Recommends purchases up to $10K"
          },
          painPoints: [
            {
              problem: "Manual processes taking too much time",
              currentSolution: "Spreadsheets and basic tools",
              impact: "Reduces productivity by 20-30%"
            }
          ],
          goals: {
            primaryGoal: "Increase team efficiency and productivity",
            successMetrics: ["Time saved", "Error reduction", "Team satisfaction"],
            adoptionMotivators: ["Easy implementation", "Clear ROI", "Good support"]
          },
          buyingBehavior: {
            discoveryChannels: ["Google search", "Peer recommendations", "LinkedIn"],
            decisionMakers: ["Product Manager", "Engineering Lead"],
            buyingFactors: ["Price", "Features", "Integration capabilities"],
            budgetRange: "$50-500/month"
          }
        };
      case 'monetization':
        return {
          primaryModel: {
            type: "Subscription SaaS",
            justification: "Predictable recurring revenue with ongoing value delivery"
          },
          pricingTiers: [
            {
              name: "Starter",
              monthlyPrice: "$29",
              features: ["Core features", "Email support", "Up to 5 users"],
              targetSegment: "Small teams and startups"
            },
            {
              name: "Professional",
              monthlyPrice: "$99",
              features: ["All Starter features", "Advanced analytics", "Priority support", "Up to 25 users"],
              targetSegment: "Growing businesses"
            },
            {
              name: "Enterprise",
              monthlyPrice: "$299",
              features: ["All Pro features", "Custom integrations", "Dedicated support", "Unlimited users"],
              targetSegment: "Large organizations"
            }
          ],
          pricingStrategy: {
            valueMetric: "Number of users or projects managed",
            psychology: "Anchor high-value tier to make middle tier attractive",
            positioning: "Premium but accessible compared to enterprise solutions"
          },
          secondaryStreams: [
            {
              name: "Premium Integrations",
              description: "Paid connectors to specialized tools",
              revenueEstimate: "$5-15 per integration per month"
            },
            {
              name: "Professional Services",
              description: "Setup and training services",
              revenueEstimate: "$500-2000 per project"
            }
          ],
          projections: {
            year1MRR: "$5,000-25,000",
            estimatedCAC: "$150-300",
            estimatedLTV: "$1,200-3,600",
            breakEvenTimeframe: "6-12 months"
          }
        };
      case 'roadmap':
        return {
          mvp: {
            timeline: "3-4 months",
            coreFeatures: ["User authentication", "Core workflow", "Basic dashboard", "Data export"],
            techStack: {
              frontend: "React with TypeScript",
              backend: "Node.js with Express",
              database: "PostgreSQL"
            },
            keyDecisions: ["API-first architecture", "Cloud deployment", "Responsive design"]
          },
          phase2: {
            timeline: "2-3 months after MVP",
            features: ["Advanced analytics", "Team collaboration", "API integrations"],
            improvements: ["Performance optimization", "Enhanced UI/UX", "Mobile responsiveness"],
            scalingNotes: "Implement caching and optimize database queries"
          },
          phase3: {
            timeline: "4-6 months after Phase 2",
            advancedFeatures: ["AI-powered insights", "Advanced reporting", "Workflow automation"],
            integrations: ["Slack", "Microsoft Teams", "Zapier"],
            enterpriseFeatures: ["SSO", "Advanced permissions", "Custom branding"]
          },
          technicalConsiderations: {
            architecture: "Microservices with API gateway",
            thirdPartyServices: ["Authentication service", "Email service", "Analytics platform"],
            securityRequirements: ["Data encryption", "Regular security audits", "GDPR compliance"],
            performanceGoals: ["< 2s page load time", "99.9% uptime", "Handle 1000+ concurrent users"]
          },
          resourceRequirements: {
            mvpTeam: ["Full-stack developer", "UI/UX designer", "Product manager"],
            developmentHours: "800-1200 hours",
            keySkills: ["React", "Node.js", "PostgreSQL", "AWS/Azure"],
            budgetRange: "$50K-100K for MVP"
          }
        };
      default:
        return {};
    }
  };

  const validateIdeaWithTrends = async (idea) => {
    setIsValidating(true);
    setSelectedIdea(idea);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate basic validation data
      const mockValidationData = await generateRealisticTrendsData(idea);
      
      // Generate enhanced insights using Gemini (with fallbacks)
      const [targetAudience, monetizationStrategy] = await Promise.all([
        generateValidationInsights(idea, 'targetAudience'),
        generateValidationInsights(idea, 'monetization')
      ]);
      
      // Combine all data
      const enhancedValidationData = {
        ...mockValidationData,
        targetAudience,
        monetizationStrategy,
        roadmapGenerated: false // Will be generated on-demand
      };
      
      setValidationData(enhancedValidationData);
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

  const generateTechnicalRoadmap = async (idea) => {
    try {
      const roadmapData = await generateValidationInsights(idea, 'roadmap');
      setValidationData(prev => ({
        ...prev,
        roadmap: roadmapData,
        roadmapGenerated: true
      }));
      return roadmapData;
    } catch (error) {
      console.error('Error generating roadmap:', error);
      const fallbackRoadmap = generateFallbackInsight(idea, 'roadmap');
      setValidationData(prev => ({
        ...prev,
        roadmap: fallbackRoadmap,
        roadmapGenerated: true
      }));
      return fallbackRoadmap;
    }
  };

  const saveIdea = async (idea) => {
    if (!user) {
      alert('Please sign in to save ideas.');
      return;
    }
    if (savedIdeas.find(saved => saved.id === idea.id)) return;
    setIsSaving(true);
    try {
      const response = await fetch('/.netlify/functions/save-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, userId: user.id })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Server error details:', errorData);
        throw new Error(`Failed to save idea: ${errorData.details || errorData.error || 'Unknown error'}`);
      }
      setSavedIdeas(prev => [...prev, { ...idea, savedAt: new Date().toISOString() }]);
    } catch (error) {
      console.error('Error saving idea:', error);
      alert(`Failed to save idea: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentStep('profile');
  };

  const startOnboardingFlow = () => {
    // Reset profile and start fresh
    setProfile({
      skills: [],
      interests: [],
      constraints: [],
      values: [],
      experience: '',
      timeCommitment: '',
      buildingStyle: ''
    });
    setCurrentOnboardingStep(1);
    setCurrentStep('profile');
  };

  const value = {
    currentStep,
    setCurrentStep,
    currentOnboardingStep,
    setCurrentOnboardingStep,
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
    isSaving,
    setIsSaving,
    validationData,
    setValidationData,
    apiError,
    setApiError,
    sidebarOpen,
    setSidebarOpen,
    chatHistory,
    setChatHistory,
    skillOptions,
    interestOptions,
    constraintOptions,
    valueOptions,
    generatePersonalizedIdeas,
    generateIdeasFromCustomPrompt,
    validateIdeaWithTrends,
    generateTechnicalRoadmap,
    saveIdea,
    handleProfileChange,
    user,
    isAuthenticated,
    logout,
    startOnboardingFlow
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};