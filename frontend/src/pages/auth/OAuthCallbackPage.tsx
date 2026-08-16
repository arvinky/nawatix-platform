import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { axiosClient } from '../../api/axiosClient';

export const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processOAuth = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('Google Authentication Failed. Token missing.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        // Save the token manually so checkAuth can use it immediately
        localStorage.setItem('athletix_token', token);
        
        // Ensure default axiosClient has the token
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        await checkAuth(); // Refreshes the auth context state (fetches user profile)
        navigate('/dashboard'); // Go to dashboard
      } catch (err: any) {
        console.error('OAuth Callback Error:', err);
        setError('Failed to authenticate with Google. Please try again.');
        localStorage.removeItem('athletix_token');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    processOAuth();
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-6 text-center">
      <div className="saas-card p-10 max-w-md w-full shadow-2xl flex flex-col items-center space-y-6">
        {error ? (
          <>
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
              <span className="text-3xl font-black">!</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Sign In Failed</h2>
            <p className="text-sm text-slate-500">{error}</p>
            <p className="text-xs text-slate-400 mt-2">Redirecting back to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Authenticating...</h2>
            <p className="text-sm text-slate-500">Connecting your Google Account securely to NAWATIX.</p>
          </>
        )}
      </div>
    </div>
  );
};
