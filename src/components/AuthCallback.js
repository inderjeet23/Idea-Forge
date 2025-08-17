import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabaseClient';

const AuthCallback = () => {
  const { isAuthenticated } = useAppContext();
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Process the OAuth callback URL parameters
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          // Wait a moment then redirect to allow error handling
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
          return;
        }
        
        // Mark as processed to prevent multiple attempts
        setHasProcessed(true);
        
        // Wait for the auth state to propagate through the context
        // The onAuthStateChange listener in AppContext will handle the session
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        
      } catch (error) {
        console.error('Auth callback error:', error);
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    };

    if (!hasProcessed) {
      handleAuthCallback();
    }
  }, [hasProcessed]);

  // If user becomes authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated && hasProcessed) {
      window.location.href = '/';
    }
  }, [isAuthenticated, hasProcessed]);

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