const { OAuth2Client } = require('google-auth-library');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { token } = JSON.parse(event.body);
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Google Client ID not configured.' }) };
  }

  const client = new OAuth2Client(googleClientId);

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    // This is where you would find or create a user in your database.
    const user = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };

    return {
      statusCode: 200,
      body: JSON.stringify({ user }),
    };
  } catch (error) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token.' }) };
  }
};