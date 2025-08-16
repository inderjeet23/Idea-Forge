const { OAuth2Client } = require('google-auth-library');
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { token } = JSON.parse(event.body);

  // Environment variables from Netlify
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!googleClientId || !supabaseUrl || !supabaseServiceKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error.' }) };
  }

  const googleClient = new OAuth2Client(googleClientId);
  // Initialize Supabase with the admin key
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: google_id } = payload;

    // Check if a user with this google_id already exists in our public.users table
    let { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', google_id)
      .single();

    if (findError && findError.code !== 'PGRST116') { // PGRST116 = 'no rows found'
        throw findError;
    }

    // If user does not exist, create them in Supabase auth and our public table
    if (!user) {
        // Create user in Supabase auth first
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            email_confirm: true,
            user_metadata: {
                name: name,
                avatar_url: picture,
                google_id: google_id
            }
        });

        if (authError) throw authError;

        // Now create in our public users table
        const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
                id: authUser.user.id,
                email: email,
                name: name,
                avatar_url: picture,
                google_id: google_id
            })
            .select()
            .single();

        if (createError) throw createError;
        user = newUser;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ user }),
    };
  } catch (error) {
    console.error('Authentication or DB error:', error);
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token or database error.' }) };
  }
};