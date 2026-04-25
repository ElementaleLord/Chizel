import { GitBranch, Code, Users } from 'lucide-react';
import { Link } from 'react-router';
// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';

import './Landing.css';

export function Landing() {
  return (
    <div className="landing-container">
      <ChzHeader pageTitle="Landing" /*isLoggedIn={false}*/ />

      <main>
        <section className="landing-hero-section">
          <div className="landing-hero-content">
            <h1 className="landing-hero-title">
              Code Hosting For <span className="landing-hero-title-accent">Modern Teams</span>
            </h1>
            <p className="landing-hero-subtitle">
              Collaborate On Code With Version Control And Code Review. <br />
              With Chizel, We Prioritize Your Privacy.
            </p>
            <div className="landing-hero-actions">
              <Link
                to="/signup"
                className="landing-btn landing-btn-primary"
              >
                Get Started For Free
              </Link>
              <Link
                to="/signin"
                className="landing-btn landing-btn-secondary"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        <section className="landing-features-section">
          <div className="landing-features-container">
            <div className="landing-features-grid">
              <div className="landing-feature-card">
                <div className="landing-feature-icon-box">
                  <GitBranch className="landing-feature-icon" />
                </div>
                <h3 className="landing-feature-title">Version Control</h3>
                <p className="landing-feature-description">
                  Branch, Merge, And Collaborate With Confidence Using chz Workflows.
                </p>
              </div>
              <div className="landing-feature-card">
                <div className="landing-feature-icon-box">
                  <Code className="landing-feature-icon" />
                </div>
                <h3 className="landing-feature-title">Code Review</h3>
                <p className="landing-feature-description">
                  Review Code, Suggest Changes, And Approve Pull Requests All In One Place.
                </p>
              </div>
              <div className="landing-feature-card">
                <div className="landing-feature-icon-box">
                  <Users className="landing-feature-icon" />
                </div>
                <h3 className="landing-feature-title">Team Repository</h3>
                <p className="landing-feature-description">
                  Work Together Seamlessly With Team Repositories.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}