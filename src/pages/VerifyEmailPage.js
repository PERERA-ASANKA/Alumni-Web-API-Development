import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const hasVerifiedRef = useRef(false);
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  useEffect(() => {
    if (hasVerifiedRef.current) return undefined;
    hasVerifiedRef.current = true;

    let redirectTimer;

    const verify = async () => {
      const result = await verifyEmail(token);
      setLoading(false);
      if (result.success) {
        setSuccess(true);
        redirectTimer = setTimeout(() => navigate('/login'), 8000);
      } else {
        setError(result.error);
      }
    };

    verify();

    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [token, verifyEmail, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center border border-green-100">
        {loading && (
          <>
            <Loader size={48} className="mx-auto text-[#008000] animate-spin mb-4" />
            <h1 className="text-2xl font-bold text-[#008000] mb-2">Verifying Email...</h1>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </>
        )}

        {success && !loading && (
          <>
            <CheckCircle size={48} className="mx-auto text-[#008000] mb-4" />
            <h1 className="text-2xl font-bold text-[#008000] mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-4">
              Your email has been verified successfully. You can now log in to your account.
            </p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </>
        )}

        {error && !loading && (
          <>
            <AlertCircle size={48} className="mx-auto text-[#008000] mb-4" />
            <h1 className="text-2xl font-bold text-[#008000] mb-2">Verification Failed</h1>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 px-4 py-2 bg-[#008000] text-white rounded-lg hover:bg-[#006b00]"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
