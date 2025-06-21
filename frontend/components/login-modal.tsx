"use client"

import React, { useState } from 'react';
import { useClientOnly } from '@/hooks/use-hydration-safe';
import { GoogleAuthButton } from '@/components/auth/google-auth';
import { auth } from '@/lib/auth';
import { useAuth } from './auth/auth-context';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isClient = useClientOnly();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!email.trim() || !password.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const result = await auth.login({ email: email.trim(), password });
      login(result.user);
      onClose();
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Please try again.");
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user } = await auth.register({ name, email, password });
      login(user);
      onClose();
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    if (isRegistering) {
      handleRegister(e);
    } else {
      handleLogin(e);
    }
  };

  // Don't render until client-side to prevent hydration mismatch
  if (!isClient || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
            {isRegistering ? 'Create an account' : 'Login'}
          </h3>
          <div className="px-7 py-3">
            <form onSubmit={handleSubmit} suppressHydrationWarning>
              {isRegistering && (
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    suppressHydrationWarning
                  />
                </div>
              )}
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  suppressHydrationWarning
                />
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  suppressHydrationWarning
                />
              </div>
              {error && <div className="text-red-600 text-sm text-center mb-2">{error}</div>}
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                suppressHydrationWarning
                disabled={loading}
              >
                {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
              </button>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-sm text-gray-500">or</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              <GoogleAuthButton
                mode="login"
                onSuccess={(userData) => {
                  login(userData);
                  onClose();
                  window.location.href = "/dashboard";
                }}
                onError={(err) => setError(err)}
              />

              <p className="text-center text-gray-500 text-xs mt-2">
                {isRegistering ? 'Already have an account?' : "Don't have an account?"}
                <button
                  type="button"
                  className="text-blue-500 ml-1"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError('');
                  }}
                >
                  {isRegistering ? 'Login' : 'Register'}
                </button>
              </p>
            </form>
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
              suppressHydrationWarning
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
