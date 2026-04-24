import { Link, useParams, useNavigate } from 'react-router';
import { ChevronDown, GitCommit } from 'lucide-react';
// COMPENENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { RepositoryLayout } from '../components/chz-comp/RepositoryLayout';
// DATA
import { repositoryFiles, latestCommit, readmeContent } from '../data/repositoryData';

import './Repository.css';

export function Repository() {
  const { owner = 'sarahdev', repo = 'web-app' } = useParams();
  const navigate = useNavigate();

  const handleFileClick = (file: typeof repositoryFiles[0]) => {
    if (file.type === 'folder') {
      navigate(`/repository/${owner}/${repo}/tree/${file.name}`);
    } else {
      navigate(`/repository/${owner}/${repo}/blob/main/${file.name}`);
    }
  };

  return (
    <>
      <ChzHeader pageTitle={`${owner} / ${repo}`} />
      <RepositoryLayout>
        <main>
          <div className="repo-code-wrapper">
            <div className="repo-code-container">
              <div className="repo-code-space">
                {/* Branch and Navigation */}
                <div className="repo-branch-section">
                  <div className="repo-branch-controls">
                    <Link
                      to={`/repository/${owner}/${repo}/branches`}
                      className="repo-branch-btn"
                    >
                      <span>main</span>
                      <ChevronDown className="repo-branch-btn-icon" />
                    </Link>
                    <Link to={`/repository/${owner}/${repo}/branches`} className="repo-branch-info">
                      <span className="repo-branch-info-count">24</span> branches
                    </Link>
                    <span className="repo-branch-tags">
                      <span className="repo-branch-tags-count">8</span> tags
                    </span>
                  </div>
                </div>

                {/* File Browser */}
                <div className="repo-file-card">
                  <div className="repo-file-header">
                    <div className="repo-file-avatar"></div>
                    <span className="repo-file-author">{owner}</span>
                    <Link 
                      to={`/repository/${owner}/${repo}/commits`} 
                      className="repo-file-message"
                    >
                      {latestCommit.message}
                    </Link>
                    <Link 
                      to={`/repository/${owner}/${repo}/commits`} 
                      className="repo-file-time"
                    >
                      {latestCommit.time}
                    </Link>
                  </div>

                  <div className="repo-file-list">
                    {repositoryFiles.map((file) => (
                      <div
                        key={file.name}
                        onClick={() => handleFileClick(file)}
                        className="repo-file-item"
                      >
                        <div className="repo-file-item-content">
                          {file.type === 'folder' ? (
                            <svg className="repo-file-icon repo-file-icon-folder" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z"/>
                            </svg>
                          ) : (
                            <svg className="repo-file-icon repo-file-icon-file" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75z"/>
                            </svg>
                          )}
                          <span className="repo-file-name">{file.name}</span>
                        </div>
                        <span className="repo-file-updated">{file.updated}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* README Section */}
                <div className="repo-readme-card">
                  <div className="repo-readme-header">
                    <h3 className="repo-readme-title">README.md</h3>
                    <Link 
                      to={`/repository/${owner}/${repo}/commits`}
                      className="repo-readme-commits-btn"
                    >
                      <GitCommit className="h-4 w-4" />
                      View Commits
                    </Link>
                  </div>
                  <div className="repo-readme-content">
                    <h2 className="repo-readme-h2">{readmeContent.title}</h2>
                    <p className="repo-readme-p">
                      {readmeContent.description}
                    </p>
                    <h3 className="repo-readme-h3">Features</h3>
                    <ul className="repo-readme-list">
                      {readmeContent.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                    <h3 className="repo-readme-h3">Getting Started</h3>
                    <pre className="repo-readme-code">
                      <code>{readmeContent.gettingStarted}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </RepositoryLayout>
    </>
  );
}