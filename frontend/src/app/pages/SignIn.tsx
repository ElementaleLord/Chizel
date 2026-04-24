import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../components/auth/AuthContext';
// COMPONENT
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { BrandLogo } from '../components/layout/BrandLogo';

import './SignIn.css';

export function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      navigate('/', { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="signin-container">
      <ChzHeader pageTitle="Sign-In" />

      <main className="signin-main">
        <div className="signin-wrapper">
          <div className="signin-card">
            <div className="signin-header">
              <div className="signin-logo">
                <BrandLogo
                  className="w-fit"
                  imageClassName="h-12 w-12"
                  showLabel={false}
                />
              </div>
              <h1 className="signin-title">Sign in to Chizel</h1>
            </div> 
            <form className="signin-form" onSubmit={handleSubmit}>
              <div className="signin-form-group">
                <label htmlFor="email" className="signin-label">Email address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="signin-input"
                />
              </div>
              <div className="signin-form-group">
                <div className="signin-label-wrapper">
                  <label htmlFor="password" className="signin-label">Password</label>
                  <Link to="/forgot-password" className="signin-forgot-link">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="signin-input"
                />
              </div>
              {error && (
                <div className="signin-error">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="signin-submit-btn"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="signin-footer">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="signin-signup-link">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}