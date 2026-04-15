import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const { data } = await api.post(endpoint, { email, password });

      // Persist JWT + user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center p-6 bg-background text-on-background selection:bg-primary selection:text-on-primary relative z-10">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Brand Identity Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-lg bg-surface-container-highest border border-outline-variant">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-on-background">Obsidian Resume</h1>
          <p className="text-secondary mt-2 font-medium tracking-tight">The Precision Builder for Engineers.</p>
        </div>

        {/* Auth Container */}
        <div className="w-full bg-surface-container border border-outline-variant rounded-xl p-8 auth-card-gradient shadow-2xl relative overflow-hidden">
          {/* Subtle Decorative Element */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/5 blur-3xl rounded-full"></div>

          {/* Toggle Header */}
          <div className="flex p-1 bg-surface-container-low rounded-lg border border-outline-variant mb-8">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${isLogin ? 'bg-surface-container-high text-primary shadow-sm' : 'text-secondary hover:text-on-background'}`}>
              Login
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${!isLogin ? 'bg-surface-container-high text-primary shadow-sm' : 'text-secondary hover:text-on-background'}`}>
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-2 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm font-medium">
              <span className="material-symbols-outlined text-base">error</span>
              {error}
            </div>
          )}

          {/* Form Section */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-secondary ml-1" htmlFor="email">Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-xl">mail</span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-11 pr-4 text-on-background placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="dev@obsidian.io"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold uppercase tracking-widest text-secondary" htmlFor="password">Password</label>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-xl">lock</span>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-11 pr-4 text-on-background placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Primary Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-on-primary font-bold py-3.5 rounded-lg transition-all duration-150 active:scale-[0.98] shadow-lg shadow-primary/10 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">refresh</span>
                  {isLogin ? 'Authenticating...' : 'Creating Account...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Authenticate' : 'Create Account'}
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Secondary Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-tighter">
              <span className="bg-surface-container px-3 text-secondary font-semibold">Secure Authentication</span>
            </div>
          </div>

          <p className="text-center text-xs text-secondary">
            {isLogin ? "Don't have an account? " : "Already registered? "}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-primary font-semibold hover:underline">
              {isLogin ? 'Sign up for free' : 'Log in'}
            </button>
          </p>
        </div>

        {/* Footer Security Message */}
        <div className="mt-8 flex items-center gap-2 text-outline">
          <span className="material-symbols-outlined text-sm">verified_user</span>
          <span className="text-xs font-medium uppercase tracking-widest">Enterprise grade 256-bit encryption</span>
        </div>

        {/* Privacy/Terms Links */}
        <div className="mt-16 flex gap-6 text-xs text-secondary font-medium">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <span className="text-outline">/</span>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <span className="text-outline">/</span>
          <a href="#" className="hover:text-primary transition-colors">Documentation</a>
        </div>
      </div>

      {/* Static Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-background">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-tertiary/5 blur-[120px] rounded-full"></div>
      </div>
    </main>
  );
}
