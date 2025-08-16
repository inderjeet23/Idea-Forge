const { OAuth2Client } = require('google-auth-library');
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { token } = JSON.parse(event.body);
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!googleClientId || !supabaseUrl || !supabaseKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error.' }) };
  }

  const googleClient = new OAuth2Client(googleClientId);
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Upsert the user into the 'users' table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id: payload.sub, // Google's unique ID for the user
        email,
        name,
        avatar_url: picture,
      })
      .select()
      .single();

    if (userError) throw userError;

    return {
      statusCode: 200,
      body: JSON.stringify({ user: userData }),
    };
  } catch (error) {
    console.error('Authentication or DB error:', error);
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token or database error.' }) };
  }
};