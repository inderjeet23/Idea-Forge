const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { userId } = event.queryStringParameters || {};
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error.' }) };
  }

  if (!userId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing userId parameter.' }) };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase
      .from('saved_ideas')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (error) throw error;

    // Transform the data to match the frontend format
    const transformedData = data.map(item => ({
      id: item.idea_id,
      title: item.title,
      description: item.description,
      market: item.market,
      complexity: item.complexity,
      timeToRevenue: item.time_to_revenue,
      matchScore: item.match_score,
      tags: item.tags || [],
      matchReasoning: item.match_reasoning,
      confidence: item.confidence,
      generatedBy: item.generated_by,
      savedAt: item.saved_at
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(transformedData),
    };
  } catch (error) {
    console.error('Error fetching saved ideas:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch ideas.' }) };
  }
};