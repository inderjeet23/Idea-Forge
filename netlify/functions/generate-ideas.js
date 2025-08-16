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
    const { userProfile } = JSON.parse(event.body);
    
    if (!userProfile) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User profile is required' })
      };
    }

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
      
      const processedIdeas = parsedResponse.ideas.map((idea, index) => ({
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

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ ideas: processedIdeas })
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
      body: JSON.stringify({ error: error.message || 'Failed to generate ideas' })
    };
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