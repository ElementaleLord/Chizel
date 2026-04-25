import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { BrandLogo } from '../components/layout/BrandLogo';
import { useAuth } from '../components/auth/AuthContext';

import './SignUp.css';

export function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signUp(email, password, username);
      navigate('/', { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create your account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="signup-container">
      <ChzHeader pageTitle="Sign-Up" />

      <main className="signup-main">
        <div className="signup-wrapper">
          <div className="signup-card">
            {/* Header */}
            <div className="signup-header">
              <div className="signup-logo">
                <BrandLogo
                  className="w-fit"
                  imageClassName="h-12 w-12"
                  showLabel={false}
                />
              </div>
              <h1 className="signup-title">Create Your Account</h1>
            </div>

            {/* Form */}
            <form className="signup-form" onSubmit={handleSubmit}>
              {/* Username Field */}
              <div className="signup-form-group">
                <label htmlFor="username" className="signup-label">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="johndoe"
                  className="signup-input"
                />
              </div>

              {/* Email Field */}
              <div className="signup-form-group">
                <label htmlFor="email" className="signup-label">Email address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="signup-input"
                />
              </div>

              {/* Password Field */}
              <div className="signup-form-group">
                <label htmlFor="password" className="signup-label">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password"
                  className="signup-input"
                />
                <p className="signup-input-hint">
                  Must be at least 8 characters
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="signup-error-alert">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="signup-submit-btn"
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            {/* Footer */}
            <p className="signup-footer">
              Already have an account?{' '}
              <Link to="/signin" className="signup-footer-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}