import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAppContext } from '../context/AppContext';

const LoginButton = () => {
  const { login } = useAppContext();

  const handleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('/.netlify/functions/auth-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (!response.ok) {
        throw new Error('Backend authentication failed.');
      }

      const { user } = await response.json();
      login(user); // Update global state with user data
    } catch (error) {
      console.error('Authentication Error:', error);
    }
  };

  const handleError = () => {
    console.log('Login Failed');
  };

  return <GoogleLogin onSuccess={handleSuccess} onError={handleError} />;
};

export default LoginButton;