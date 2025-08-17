import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabaseClient';

const AuthCallback = () => {
  const { setCurrentStep } = useAppContext();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          // Redirect to login page on error
          setCurrentStep('profile');
          return;
        }
        
        if (data.session) {
          // User is authenticated, redirect to dashboard
          setCurrentStep('dashboard');
        } else {
          // No session found, redirect to login
          setCurrentStep('profile');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setCurrentStep('profile');
      }
    };

    handleAuthCallback();
  }, [setCurrentStep]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;