const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { idea, userId } = JSON.parse(event.body);
  console.log('Received data:', { idea, userId });
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  console.log('Environment check:', { 
    hasUrl: !!supabaseUrl, 
    hasKey: !!supabaseKey,
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'missing'
  });

  if (!supabaseUrl || !supabaseKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error.' }) };
  }

  if (!idea || !userId) {
    console.log('Missing required data:', { hasIdea: !!idea, hasUserId: !!userId });
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing idea or userId.' }) };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Save the idea to the 'saved_ideas' table
    const { data: savedIdea, error: saveError } = await supabase
      .from('saved_ideas')
      .insert({
        user_id: userId,
        idea_id: idea.id,
        title: idea.title,
        description: idea.description,
        market: idea.market,
        complexity: idea.complexity,
        time_to_revenue: idea.timeToRevenue,
        match_score: idea.matchScore,
        tags: idea.tags,
        match_reasoning: idea.matchReasoning,
        confidence: idea.confidence,
        generated_by: idea.generatedBy,
        saved_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) throw saveError;

    return {
      statusCode: 200,
      body: JSON.stringify({ savedIdea }),
    };
  } catch (error) {
    console.error('Error saving idea:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: 'Failed to save idea.', 
        details: error.message,
        code: error.code 
      }) 
    };
  }
};