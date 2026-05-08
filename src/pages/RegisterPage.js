import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

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
    const result = await register(email, password);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-green-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#008000]">Alumni Platform</h1>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle size={20} className="text-[#008000] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#008000] font-semibold">Registration successful!</p>
              <p className="text-green-700 text-sm mt-1">Check your email to verify your account.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-[#008000] flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              University Email
            </label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-3 text-[#008000]/70" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008000]"
                placeholder="user@university.edu"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
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
            disabled={loading || !isPasswordValid}
            className="w-full bg-[#008000] hover:bg-[#006b00] disabled:bg-[#008000] text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-green-100 text-center text-sm">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="text-[#008000] hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
