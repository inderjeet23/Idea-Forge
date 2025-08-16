import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAppContext } from '../context/AppContext';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const LoginButton = () => {
  const { login } = useAppContext();
  const [authState, setAuthState] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleSuccess = async (credentialResponse) => {
    setAuthState('loading');
    setErrorMessage('');
    
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
      setAuthState('success');
      
      // Show success for a moment before transitioning
      setTimeout(() => {
        login(user); // Update global state with user data
      }, 1000);
    } catch (error) {
      console.error('Authentication Error:', error);
      setAuthState('error');
      setErrorMessage('Authentication failed. Please try again.');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setAuthState('idle');
        setErrorMessage('');
      }, 3000);
    }
  };

  const handleError = () => {
    console.log('Login Failed');
    setAuthState('error');
    setErrorMessage('Google login was cancelled or failed.');
    
    // Reset after 3 seconds
    setTimeout(() => {
      setAuthState('idle');
      setErrorMessage('');
    }, 3000);
  };

  if (authState === 'loading') {
    return (
      <div className="flex items-center space-x-2 text-blue-600">
        <Loader className="animate-spin" size={16} />
        <span className="text-sm">Signing in...</span>
      </div>
    );
  }

  if (authState === 'success') {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <CheckCircle size={16} />
        <span className="text-sm">Welcome!</span>
      </div>
    );
  }

  if (authState === 'error') {
    return (
      <div className="flex flex-col items-end">
        <div className="flex items-center space-x-2 text-red-600">
          <XCircle size={16} />
          <span className="text-sm">Login failed</span>
        </div>
        {errorMessage && (
          <span className="text-xs text-red-500 mt-1 max-w-xs text-right">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }

  return <GoogleLogin onSuccess={handleSuccess} onError={handleError} />;
};

export default LoginButton;