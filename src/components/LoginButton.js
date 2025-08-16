import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { supabase } from '../supabaseClient';
import { useAppContext } from '../context/AppContext';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const LoginButton = () => {
  const { setCurrentStep } = useAppContext();
  const [authState, setAuthState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSuccess = async (credentialResponse) => {
    setAuthState('loading');
    setErrorMessage('');
    
    try {
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credentialResponse.credential,
      });

      if (error) {
        throw new Error(error.message || 'Supabase authentication failed.');
      }

      setAuthState('success');
      
      setTimeout(() => {
        setCurrentStep('dashboard');
      }, 1000);

    } catch (error) {
      console.error('Authentication Error:', error);
      setAuthState('error');
      setErrorMessage('Authentication failed. Please try again.');
      setTimeout(() => setAuthState('idle'), 3000);
    }
  };

  const handleError = () => {
    setAuthState('error');
    setErrorMessage('Google login was cancelled or failed.');
    setTimeout(() => setAuthState('idle'), 3000);
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