import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const { register, error: authError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const navigate = useNavigate();

  const handleValidation = () => {
    if (!name || !email || !password || !confirmPassword) {
      setLocalError('All fields are required.');
      return false;
    }
    if (name.length < 2) {
      setLocalError('Name must be at least 2 characters.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return false;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return false;
    }
    setLocalError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handleValidation()) return;

    setLoading(true);
    setSuccessMsg(null);
    const result = await register(name, email, password);
    setLoading(false);

    if (result.success) {
      setSuccessMsg('Registration successful! Redirecting...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }
  };

  const activeError = localError || authError;

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold text-brand-textPrimary tracking-tight">Create Account</h2>
        <p className="text-xs text-brand-textSecondary mt-1">Get started with ExamGen AI Pro</p>
      </div>

      {activeError && (
        <div className="flex items-center space-x-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{activeError}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center space-x-2 text-xs text-brand-success bg-brand-success/10 border border-brand-success/20 px-4 py-3 rounded-xl animate-pulse">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-textSecondary/70">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setLocalError(null); }}
              placeholder="Alex Mercer"
              className="w-full bg-brand-darkBg border border-brand-border/60 hover:border-brand-border focus:border-brand-primary rounded-xl pl-10 pr-4 py-3 text-sm text-brand-textPrimary focus:outline-none transition-all placeholder:text-brand-textSecondary/40"
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-textSecondary/70">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setLocalError(null); }}
              placeholder="name@university.edu"
              className="w-full bg-brand-darkBg border border-brand-border/60 hover:border-brand-border focus:border-brand-primary rounded-xl pl-10 pr-4 py-3 text-sm text-brand-textPrimary focus:outline-none transition-all placeholder:text-brand-textSecondary/40"
            />
          </div>
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-textSecondary/70">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLocalError(null); }}
                placeholder="••••••"
                className="w-full bg-brand-darkBg border border-brand-border/60 hover:border-brand-border focus:border-brand-primary rounded-xl pl-10 pr-4 py-3 text-sm text-brand-textPrimary focus:outline-none transition-all placeholder:text-brand-textSecondary/40 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-textSecondary/70">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setLocalError(null); }}
                placeholder="••••••"
                className="w-full bg-brand-darkBg border border-brand-border/60 hover:border-brand-border focus:border-brand-primary rounded-xl pl-10 pr-4 py-3 text-sm text-brand-textPrimary focus:outline-none transition-all placeholder:text-brand-textSecondary/40 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-brand-primary to-brand-secondary hover:shadow-glow text-white text-sm font-semibold rounded-xl hover:brightness-110 active:scale-95 transition-all select-none cursor-pointer"
        >
          {loading ? 'Registering...' : 'Sign Up'}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-xs text-brand-textSecondary">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
