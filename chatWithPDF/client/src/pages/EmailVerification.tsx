import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Button } from '../components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const EmailVerification = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification token');
        return;
      }

      try {
        const response = await apiService.verifyEmail(token);
        if (response.status) {
          setStatus('success');
          setMessage(response.message);
        } else {
          setStatus('error');
          setMessage(response.message);
        }
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Verification failed');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bamboo-light to-bamboo-cream">
      <div className="max-w-md w-full mx-4 p-8 bg-white rounded-lg shadow-lg text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 animate-spin text-bamboo-pink mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Email</h2>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Button 
              onClick={() => navigate('/')}
              className="w-full bg-gradient-primary hover:opacity-90 text-white"
            >
              Continue to Login
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Button 
              onClick={() => navigate('/')}
              className="w-full bg-gradient-primary hover:opacity-90 text-white"
            >
              Back to Home
            </Button>
          </>
        )}
      </div>
    </div>
  );
};