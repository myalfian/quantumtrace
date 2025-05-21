<<<<<<< HEAD
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signUp, signInWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signUp(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleGoogleSignIn() {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleForgotPassword() {
    try {
      await resetPassword(email);
      alert('Password reset email sent!');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen flex auth-background">
      <div className="sky"></div>
      <div className="cloud"></div>
      <div className="cloud"></div>
      <div className="cloud"></div>
      <div className="cloud"></div>
      <div className="cloud"></div>
      <div className="cloud"></div>
      {/* Welcome Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 p-12 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-6">Quantum Trace</h1>
          <p className="text-xl text-white/90">Precision in Every Project Move</p>
        </div>
        <p className="text-white/80">Ensures accuracy and complete control over project progress</p>
      </div>

      {/* Auth Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {error && <div className="error-message">{error}</div>}

              <div>
                <label htmlFor="email" className="form-label">Email address</label>
                <input
                  id="email"
                  type="email"
                  required
                  className="form-input mt-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  className="form-input mt-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {isLogin ? 'Sign in' : 'Sign up'}
              </button>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="btn-secondary w-full flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            </motion.form>
          </AnimatePresence>

          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
=======
... (file content here) ...
>>>>>>> bc89eace20afea15e84765f55420225a62189f67
