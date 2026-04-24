import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { useParams, Link } from 'react-router';
import { ChevronRight, AlertTriangle, Trash2 } from 'lucide-react';
import { RepositoryLayout } from '../components/chz-comp/RepositoryLayout';
import './RepositorySettings.css';

const features = [
  { label: 'Issues', desc: 'Track bugs and feature requests' },
  { label: 'Projects', desc: 'Organize and track work' },
  { label: 'Wiki', desc: 'Document your repository' },
  { label: 'Discussions', desc: 'Engage with the community' },
];

export function RepositorySettings() {
  const { owner, repo } = useParams();

  return (
    <>
      <ChzHeader pageTitle={`${owner} / ${repo}`} />
      <RepositoryLayout>
        <div className="settings-wrapper">
          <div className="settings-container">
            {/* Header */}
            <div className="settings-header">
              <div className="settings-breadcrumb">
                <Link to={`/repository/${owner}/${repo}`} className="settings-breadcrumb-link">
                  {owner}/{repo}
                </Link>
                <ChevronRight className="settings-breadcrumb-icon" />
                <span className="settings-breadcrumb-text">Settings</span>
              </div>
              <h1 className="settings-title">Repository Settings</h1>
            </div>

            {/* Settings Sections */}
            <div className="settings-sections">
              {/* General Section */}
              <div className="settings-section">
                <h2 className="settings-section-title">General</h2>
                <div className="settings-form-group">
                  <div className="settings-field">
                    <label className="settings-label">Repository name</label>
                    <input
                      type="text"
                      defaultValue={repo}
                      className="settings-input"
                    />
                  </div>
                  <div className="settings-field">
                    <label className="settings-label">Description</label>
                    <textarea
                      rows={3}
                      defaultValue="A modern web application built with React and TypeScript"
                      className="settings-textarea"
                    />
                  </div>
                  <div className="settings-field">
                    <label className="settings-label">Website</label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      className="settings-input"
                    />
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="settings-section">
                <h2 className="settings-section-title">Features</h2>
                <div className="settings-features-list">
                  {features.map((feature) => (
                    <div key={feature.label} className="settings-feature-item">
                      <div className="settings-feature-info">
                        <div className="settings-feature-label">{feature.label}</div>
                        <div className="settings-feature-desc">{feature.desc}</div>
                      </div>
                      <label className="settings-toggle">
                        <input
                          type="checkbox"
                          className="settings-toggle-input"
                          defaultChecked
                        />
                        <div className="settings-toggle-slider"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Access Section */}
              <div className="settings-section">
                <h2 className="settings-section-title">Access</h2>
                <div className="settings-access-item">
                  <div className="settings-access-info">
                    <div className="settings-access-label">Visibility</div>
                    <div className="settings-access-desc">Control who can see this repository</div>
                  </div>
                  <select className="settings-select">
                    <option>Public</option>
                    <option>Private</option>
                  </select>
                </div>
              </div>

              {/* Save Button */}
              <div className="settings-section">
                <button className="settings-save-btn">
                  Save changes
                </button>
              </div>

              {/* Danger Zone */}
              <div className="settings-section settings-danger-zone">
                <div className="settings-danger-header">
                  <AlertTriangle className="settings-danger-icon" />
                  <div className="settings-danger-content">
                    <h2 className="settings-danger-title">Danger Zone</h2>
                    <p className="settings-danger-desc">
                      Once you delete a repository, there is no going back. Please be certain.
                    </p>
                  </div>
                </div>
                <button className="settings-delete-btn">
                  <Trash2 className="settings-delete-icon" />
                  Delete this repository
                </button>
              </div>
            </div>
          </div>
        </div>
      </RepositoryLayout>
    </>
  );
}