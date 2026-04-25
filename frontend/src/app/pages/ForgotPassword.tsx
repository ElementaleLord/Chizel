import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { BrandLogo } from '../components/layout/BrandLogo';

import './ForgotPassword.css';

export function ForgotPassword() {
  return (
    <div className="forgot-password-container">
      <ChzHeader pageTitle="Chizel" />

      <main className="forgot-password-main">
        <div className="forgot-password-wrapper">
          <div className="forgot-password-card">
            {/* Header */}
            <div className="forgot-password-header">
              <div className="forgot-password-logo">
                <BrandLogo className="w-fit" imageClassName="h-12 w-12" showLabel={false} />
              </div>
              <h1 className="forgot-password-title">Reset Your Password</h1>
              <p className="forgot-password-subtitle">
                Enter your email address and we'll send you a link to reset your password
              </p>
            </div>

            {/* Form */}
            <form className="forgot-password-form">
              <div className="forgot-password-form-group">
                <label htmlFor="email" className="forgot-password-label">Email address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="forgot-password-input"
                />
              </div>
              <button
                type="submit"
                className="forgot-password-submit-btn"
              >
                Send reset link
              </button>
            </form>

            {/* Back Link */}
            <Link
              to="/signin"
              className="forgot-password-back-link"
            >
              <ArrowLeft className="forgot-password-back-icon" />
              Back to sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}