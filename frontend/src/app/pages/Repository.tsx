import type { CSSProperties, ReactNode } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { BookOpen, ChevronDown, FileText, GitCommit, Package, Scale, Tag,} from 'lucide-react';
// COMPENENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { RepositoryLayout } from '../components/chz-comp/RepositoryLayout';
import { RepositoryFileList } from '../components/chz-comp/RepositoryFileList';
// DATA
import { fileStructure } from '../data/fileExplorerData';
import { latestCommit, readmeContent } from '../data/repositoryData';

import './Repository.css';

type RepositorySidebarSectionProps = {
  title: string;
  children: ReactNode;
  trailing?: ReactNode;
};

type Contributor = {
  name: string;
  initials: string;
  accent: string;
};

type Language = {
  name: string;
  percentage: number;
  color: string;
};

function RepositorySidebarSection({ title, children, trailing }: RepositorySidebarSectionProps) {
  return (
    <section className="repo-sidebar-section" aria-labelledby={`repo-sidebar-${title}`}>
      <div className="repo-sidebar-section-header">
        <div className="repo-sidebar-heading-row">
          <h2 className="repo-sidebar-section-title" id={`repo-sidebar-${title}`}>
            {title}
          </h2>
          {trailing}
        </div>
      </div>
      <div className="repo-sidebar-section-body">{children}</div>
    </section>
  );
}

export function Repository() {
  const { owner = 'sarahdev', repo = 'web-app' } = useParams();
  const navigate = useNavigate();
  const repositoryDescription =
    'Collaborative repository for the graduation platform, with repository browsing, README docs, and shared developer workflows.';
  const aboutLinks = [
    { label: 'README', icon: BookOpen },
    { label: 'MIT License', icon: Scale },
    { label: 'Report repository', icon: FileText },
  ];
  const contributors: Contributor[] = [
    { name: 'Sarah Dev', initials: 'SD', accent: '#f78166' },
    { name: 'Lina Khoury', initials: 'LK', accent: '#58a6ff' },
    { name: 'Omar Haddad', initials: 'OH', accent: '#3fb950' },
    { name: 'Maya Nassar', initials: 'MN', accent: '#d2a8ff' },
  ];
  const languages: Language[] = [
    { name: 'TypeScript', percentage: 48, color: '#3178c6' },
    { name: 'CSS', percentage: 26, color: '#563d7c' },
    { name: 'C#', percentage: 18, color: '#9b4f96' },
    { name: 'SQL', percentage: 8, color: '#e38c05' },
  ];

  const handleFileClick = (file: { type: 'file' | 'folder'; name: string }) => {
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
              <div className="repo-code-layout">
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
                    <Link
                      to={`/repository/${owner}/${repo}/commits`}
                      className="repo-toolbar-commits-btn"
                    >
                      <GitCommit className="h-4 w-4" />
                      View Commits
                    </Link>
                  </div>

                  {/* File Browser */}
                  <RepositoryFileList
                    structure={fileStructure}
                    owner={owner}
                    repo={repo}
                    onFileSelect={handleFileClick}
                    latestCommit={latestCommit}
                  />

                  {/* README Section */}
                  <div className="repo-readme-card">
                    <div className="repo-readme-header">
                      <h3 className="repo-readme-title">README.md</h3>
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

                <aside className="repo-sidebar" aria-label="Repository information">
                  <div className="repo-sidebar-card">
                    <RepositorySidebarSection
                      title="About"
                      trailing={<span className="repo-sidebar-badge">Public</span>}
                    >
                      <div className="repo-sidebar-about">
                        <p className="repo-sidebar-description">{repositoryDescription}</p>
                        <div className="repo-sidebar-meta-list">
                          {aboutLinks.map(({ label, icon: Icon }) => (
                            <button key={label} type="button" className="repo-sidebar-meta-item">
                              <Icon className="repo-sidebar-meta-icon" />
                              <span>{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </RepositorySidebarSection>

                    <RepositorySidebarSection title="Releases (WIP)">
                      <div className="repo-sidebar-empty-state">
                        <button type="button" className="repo-sidebar-link-button">
                          <Tag className="repo-sidebar-inline-icon" />
                          Create a new release
                        </button>
                      </div>
                    </RepositorySidebarSection>

                    <RepositorySidebarSection title="Packages (WIP)">
                      <div className="repo-sidebar-empty-state">
                        <button type="button" className="repo-sidebar-link-button">
                          <Package className="repo-sidebar-inline-icon" />
                          Publish your first package
                        </button>
                      </div>
                    </RepositorySidebarSection>

                    <RepositorySidebarSection
                      title="Contributors"
                      trailing={<span className="repo-sidebar-count-pill">{contributors.length}</span>}
                    >
                      <ul className="repo-contributors-list">
                        {contributors.map((contributor) => (
                          <li key={contributor.name} className="repo-contributor-item">
                            <div
                              className="repo-contributor-avatar"
                              style={{ '--avatar-accent': contributor.accent } as CSSProperties}
                              aria-hidden="true"
                            >
                              {contributor.initials}
                            </div>
                            <div className="repo-contributor-copy">
                              <span className="repo-contributor-name">{contributor.name}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </RepositorySidebarSection>

                    <RepositorySidebarSection title="Languages">
                      <div className="repo-language-bar" aria-hidden="true">
                        {languages.map((language) => (
                          <span
                            key={language.name}
                            className="repo-language-bar-segment"
                            style={{
                              width: `${language.percentage}%`,
                              backgroundColor: language.color,
                            }}
                          />
                        ))}
                      </div>
                      <ul className="repo-language-list">
                        {languages.map((language) => (
                          <li key={language.name} className="repo-language-item">
                            <div className="repo-language-label-group">
                              <span
                                className="repo-language-dot"
                                style={{ backgroundColor: language.color }}
                                aria-hidden="true"
                              />
                              <span className="repo-language-name">{language.name}</span>
                            </div>
                            <span className="repo-language-percent">{language.percentage}%</span>
                          </li>
                        ))}
                      </ul>
                    </RepositorySidebarSection>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </main>
      </RepositoryLayout>
    </>
  );
}