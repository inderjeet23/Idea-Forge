exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  
  if (!geminiApiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key not configured' })
    };
  }

  try {
    const { idea, insightType } = JSON.parse(event.body);
    
    if (!idea || !insightType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Idea and insight type are required' })
      };
    }

    let prompt;
    switch (insightType) {
      case 'targetAudience':
        prompt = constructTargetAudiencePrompt(idea);
        break;
      case 'monetization':
        prompt = constructMonetizationPrompt(idea);
        break;
      case 'roadmap':
        prompt = constructRoadmapPrompt(idea);
        break;
      case 'competitorAnalysis':
        prompt = constructCompetitorAndRiskAnalysisPrompt(idea);
        break;
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid insight type' })
        };
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
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
          temperature: 0.7,
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

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify(parsedResponse)
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('Serverless function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message || 'Failed to generate insights' })
    };
  }
};

const constructTargetAudiencePrompt = (idea) => {
  return `You are an expert market researcher and business analyst. Create a detailed target audience persona for this SaaS business idea:

BUSINESS IDEA:
Title: ${idea.title}
Description: ${idea.description}
Market: ${idea.market}
Tags: ${idea.tags?.join(', ') || 'N/A'}

Generate a realistic target audience persona with these details:

1. PERSONA PROFILE:
   - A memorable name and job title (e.g., "Marketing Manager Mary" or "Solo Developer Sarah")
   - Age range and professional background
   - Company size they typically work for
   - Technical skill level (Beginner/Intermediate/Advanced)

2. DEMOGRAPHICS:
   - Industry they work in
   - Years of experience in their role
   - Team size they manage or work with
   - Annual budget they control or influence

3. KEY PAIN POINTS:
   - 3-4 specific problems this persona faces that the idea would solve
   - Current workarounds or tools they use (and their limitations)
   - Impact of these problems on their work/business

4. GOALS & MOTIVATIONS:
   - What they're trying to achieve professionally
   - How success is measured in their role
   - What would make them consider adopting a new tool

5. BUYING BEHAVIOR:
   - How they discover new tools
   - Who else is involved in purchase decisions
   - What factors influence their buying decisions
   - Typical budget range for tools like this
   - Where they hang out online (specific subreddits, LinkedIn groups, forums, Slack communities)

6. DAY IN THE LIFE:
   - A brief narrative (2-3 sentences) of their typical workday, highlighting their key struggles and frustrations

Return ONLY valid JSON in this exact format:
{
  "persona": {
    "name": "string",
    "jobTitle": "string",
    "ageRange": "string",
    "background": "string",
    "companySize": "string",
    "techSkillLevel": "string"
  },
  "demographics": {
    "industry": "string",
    "experience": "string",
    "teamSize": "string",
    "budgetInfluence": "string"
  },
  "painPoints": [
    {
      "problem": "string",
      "currentSolution": "string",
      "impact": "string"
    }
  ],
  "goals": {
    "primaryGoal": "string",
    "successMetrics": ["string"],
    "adoptionMotivators": ["string"]
  },
  "buyingBehavior": {
    "discoveryChannels": ["string"],
    "decisionMakers": ["string"],
    "buyingFactors": ["string"],
    "budgetRange": "string",
    "wateringHoles": ["string"]
  },
  "dayInTheLife": "string"
}`;
};

const constructMonetizationPrompt = (idea) => {
  return `You are an expert SaaS pricing strategist and business model consultant. Create a comprehensive monetization strategy for this SaaS business idea:

BUSINESS IDEA:
Title: ${idea.title}
Description: ${idea.description}
Market: ${idea.market}
Complexity: ${idea.complexity}
Tags: ${idea.tags?.join(', ') || 'N/A'}

Generate a detailed monetization strategy with these components:

1. PRIMARY MODEL:
   - Recommended pricing model (Subscription, Usage-based, One-time, Freemium, etc.)
   - Justification for why this model fits best

2. PRICING TIERS:
   - 3 pricing tiers (e.g., Starter, Professional, Enterprise)
   - Monthly price for each tier
   - Key features included in each tier
   - Target customer segment for each tier

3. PRICING STRATEGY:
   - Value metric (what you charge based on)
   - Pricing psychology considerations
   - Competitive positioning

4. SECONDARY REVENUE STREAMS:
   - 2-3 additional ways to generate revenue
   - Revenue potential for each stream

5. FINANCIAL PROJECTIONS:
   - Estimated monthly recurring revenue (MRR) targets for Year 1
   - Industry-typical customer acquisition cost (CAC) with research-based ranges
   - More detailed customer lifetime value (LTV) calculation methodology
   - Realistic time to profitability assessment

Return ONLY valid JSON in this exact format:
{
  "primaryModel": {
    "type": "string",
    "justification": "string"
  },
  "pricingTiers": [
    {
      "name": "string",
      "monthlyPrice": "string",
      "features": ["string"],
      "targetSegment": "string"
    }
  ],
  "pricingStrategy": {
    "valueMetric": "string",
    "psychology": "string",
    "positioning": "string"
  },
  "secondaryStreams": [
    {
      "name": "string",
      "description": "string",
      "revenueEstimate": "string"
    }
  ],
  "projections": {
    "year1MRR": "string",
    "industryAverageCAC": "string",
    "customerLTV": "string",
    "timeToProfitability": "string"
  }
}`;
};

const constructRoadmapPrompt = (idea) => {
  return `You are an experienced product manager and technical lead. Create a detailed technical roadmap for building this SaaS product:

BUSINESS IDEA:
Title: ${idea.title}
Description: ${idea.description}
Complexity: ${idea.complexity}
Time to Revenue: ${idea.timeToRevenue}
Tags: ${idea.tags?.join(', ') || 'N/A'}

Generate a phased technical roadmap with these details:

1. MVP (MINIMUM VIABLE PRODUCT):
   - Timeline (weeks/months)
   - Core features that must be included
   - Technology stack recommendations
   - Key technical decisions

2. PHASE 2 (POST-MVP):
   - Timeline from MVP launch
   - Additional features to build
   - Technical improvements
   - Scaling considerations

3. PHASE 3 (GROWTH):
   - Timeline from Phase 2
   - Advanced features
   - Integrations and partnerships
   - Enterprise features

4. TECHNICAL CONSIDERATIONS:
   - Frontend framework recommendations
   - Backend architecture
   - Database choices
   - Third-party integrations needed
   - Security requirements

5. RESOURCE REQUIREMENTS:
   - Team composition for each phase
   - Estimated development hours
   - Key technical skills needed
   - Budget considerations

Return ONLY valid JSON in this exact format:
{
  "mvp": {
    "timeline": "string",
    "coreFeatures": ["string"],
    "techStack": {
      "frontend": "string",
      "backend": "string",
      "database": "string"
    },
    "keyDecisions": ["string"]
  },
  "phase2": {
    "timeline": "string",
    "features": ["string"],
    "improvements": ["string"],
    "scalingNotes": "string"
  },
  "phase3": {
    "timeline": "string",
    "advancedFeatures": ["string"],
    "integrations": ["string"],
    "enterpriseFeatures": ["string"]
  },
  "technicalConsiderations": {
    "architecture": "string",
    "thirdPartyServices": ["string"],
    "securityRequirements": ["string"],
    "performanceGoals": ["string"]
  },
  "resourceRequirements": {
    "mvpTeam": ["string"],
    "developmentHours": "string",
    "keySkills": ["string"],
    "budgetRange": "string"
  }
}`;
};

const constructCompetitorAndRiskAnalysisPrompt = (idea) => {
  return `You are a startup strategist and market analyst. For the business idea "${idea.title}", provide a deep competitor and risk analysis.

BUSINESS IDEA:
Title: ${idea.title}
Description: ${idea.description}
Market: ${idea.market}
Tags: ${idea.tags?.join(', ') || 'N/A'}

Generate a comprehensive analysis with these components:

1. TOP COMPETITORS:
   - Identify 3-5 key competitors (direct and indirect)
   - For each competitor, provide their URL and a SWOT analysis focusing on:
     * One key strength they have
     * One exploitable weakness you've identified

2. USER SENTIMENT ANALYSIS:
   - Research common complaints users have about existing solutions
   - Identify what users consistently praise about current tools
   - Focus on patterns that reveal market gaps

3. KEY RISKS & MITIGATION:
   - Identify 3-4 major risks this business idea faces
   - For each risk, provide a specific, actionable mitigation strategy
   - Consider market saturation, customer acquisition challenges, technical barriers, and competitive threats

Return ONLY valid JSON in this exact format:
{
  "topCompetitors": [
    {
      "name": "string",
      "url": "string", 
      "swot": {
        "strength": "string",
        "weakness": "string"
      }
    }
  ],
  "aggregatedUserSentiment": {
    "commonComplaints": ["string"],
    "positiveKeywords": ["string"]
  },
  "keyRisks": [
    {
      "risk": "string",
      "mitigation": "string"
    }
  ]
}`;
};