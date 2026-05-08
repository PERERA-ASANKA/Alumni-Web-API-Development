import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  useEffect(() => {
    const validateToken = async () => {
      try {
        await authAPI.validateResetToken(token);
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired reset link');
      } finally {
        setCheckingToken(false);
      }
    };

    validateToken();
  }, [token]);

  const validatePassword = (pwd) => {
    const minLength = pwd.length >= 8;
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*]/.test(pwd);
    return { minLength, hasUppercase, hasNumber, hasSpecial };
  };

  const pwd = validatePassword(password);
  const isPasswordValid = pwd.minLength && pwd.hasUppercase && pwd.hasNumber && pwd.hasSpecial;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not meet requirements');
      return;
    }

    setLoading(true);
    const result = await resetPassword(token, password);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 5000);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-green-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#008000]">Reset Password</h1>
          <p className="text-gray-600 mt-2">Enter your new password</p>
        </div>

        {checkingToken && (
          <div className="py-10 text-center">
            <Loader2 size={40} className="mx-auto text-[#008000] animate-spin mb-3" />
            <p className="text-gray-600">Checking reset link...</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle size={20} className="text-[#008000] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#008000] font-semibold">Password Reset Successful!</p>
              <p className="text-green-700 text-sm mt-1">You can now login with your new password.</p>
            </div>
          </div>
        )}

        {error && !checkingToken && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-[#008000] flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!checkingToken && !error && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-3 text-[#008000]/70" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008000]"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="mt-3 space-y-1 text-xs">
              <div className={pwd.minLength ? 'text-[#008000]' : 'text-gray-500'}>
                ✓ At least 8 characters
              </div>
              <div className={pwd.hasUppercase ? 'text-[#008000]' : 'text-gray-500'}>
                ✓ One uppercase letter
              </div>
              <div className={pwd.hasNumber ? 'text-[#008000]' : 'text-gray-500'}>
                ✓ One number
              </div>
              <div className={pwd.hasSpecial ? 'text-[#008000]' : 'text-gray-500'}>
                ✓ One special character (!@#$%^&*)
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-3 text-[#008000]/70" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008000]"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid || success}
            className="w-full bg-[#008000] hover:bg-[#006b00] disabled:bg-[#008000] text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        )}

        <div className="mt-6 pt-6 border-t border-green-100 text-center text-sm">
          <Link to="/login" className="text-[#008000] hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
