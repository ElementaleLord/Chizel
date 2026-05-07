import { useEffect, useState, type ReactNode } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { BookOpen, ChevronDown, FileText, GitCommit, Package, Scale, Tag,} from 'lucide-react';
// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { RepositoryLayout } from '../components/chz-comp/RepositoryLayout';
import { RepositoryFileList } from '../components/chz-comp/RepositoryFileList';
import { ensureRepoReady, fetchRepoFile, fetchRepoMeta, fetchRepoTree, type RepoMeta, type RepoNode } from '../lib/repoApi';
import { formatRelativeTime } from '../lib/time';

import './Repository.css';

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'error' in error.response.data &&
    typeof error.response.data.error === 'string'
  ) {
    return error.response.data.error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

type RepositorySidebarSectionProps = {
  title: string;
  children: ReactNode;
  trailing?: ReactNode;
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

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Sass: '#cf649a',
  HTML: '#e34c26',
  JSON: '#8b949e',
  TOML: '#9c4221',
  XML: '#0060ac',
  SQL: '#e38c05',
  Python: '#3572a5',
  Java: '#b07219',
  Kotlin: '#a97bff',
  Go: '#00add8',
  Rust: '#dea584',
  C: '#555555',
  'C Header': '#5c6bc0',
  'C++': '#f34b7d',
  'C++ Header': '#d46a92',
  'C#': '#178600',
  PHP: '#4f5d95',
  Ruby: '#701516',
  Swift: '#f05138',
  Shell: '#89e051',
  PowerShell: '#012456',
  Dockerfile: '#384d54',
  Makefile: '#427819',
  Skript: '#ffdd33',
  GPScript: '#35d3ff',
  Perl: '#ca1d1d'
};

function getLanguageColor(name: string) {
  return LANGUAGE_COLORS[name] ?? '#8b949e';
}

export function Repository() {
  const { owner = 'sarahdev', repo = 'web-app' } = useParams();
  const navigate = useNavigate();
  const [repoTree, setRepoTree] = useState<RepoNode | null>(null);
  const [repoReadme, setRepoReadme] = useState<RepoNode | null>(null);
  const [repoMeta, setRepoMeta] = useState<RepoMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadRepository() {
      try {
        setIsLoading(true);
        setError(null);

        const repoId = await ensureRepoReady(owner, repo);
        const [meta, tree] = await Promise.all([
          fetchRepoMeta(repoId),
          fetchRepoTree(repoId, '.'),
        ]);
        const readme = meta.readmePath
          ? await fetchRepoFile(repoId, meta.readmePath).catch(() => null)
          : null;

        if (isCancelled) {
          return;
        }

        setRepoMeta(meta);
        setRepoTree(tree);
        setRepoReadme(readme);
      } catch (loadError) {
        if (isCancelled) {
          return;
        }
        console.error(loadError);
        setError(getErrorMessage(loadError, 'Unable to load repository contents.'));
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadRepository();

    return () => {
      isCancelled = true;
    };
  }, [owner, repo]);

  const handleFileClick = (file: RepoNode) => {
    const targetPath = file.path.replace(/^\//, '');
    const activeBranch = repoMeta?.currentBranch || 'main';
    if (file.type === 'folder') {
      navigate(`/repository/${owner}/${repo}/tree/${targetPath}`);
    } else {
      navigate(`/repository/${owner}/${repo}/blob/${activeBranch}/${targetPath}`);
    }
  };

  const repositoryDescription = repoMeta?.description?.trim()
    || (repoMeta?.url ? `Source synchronized from ${repoMeta.url}.` : 'No repository description provided.');


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
                        <span>{repoMeta?.currentBranch || 'main'}</span>
                        <ChevronDown className="repo-branch-btn-icon" />
                      </Link>
                      <Link to={`/repository/${owner}/${repo}/branches`} className="repo-branch-info">
                        <span className="repo-branch-info-count">{repoMeta?.branchCount ?? 0}</span> branches
                      </Link>
                      <span className="repo-branch-tags">
                        <span className="repo-branch-tags-count">{repoMeta?.tagCount ?? 0}</span> tags
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
                  {isLoading ? (
                    <div className="repo-file-card">
                      <div className="repo-file-list">
                        <div className="repo-file-item">Loading repository files...</div>
                      </div>
                    </div>
                  ) : error || !repoTree ? (
                    <div className="repo-file-card">
                      <div className="repo-file-list">
                        <div className="repo-file-item">{error || 'Repository contents unavailable.'}</div>
                      </div>
                    </div>
                  ) : (
                    <RepositoryFileList
                      structure={repoTree}
                      owner={owner}
                      repo={repo}
                      onFileSelect={handleFileClick}
                      latestCommit={{
                        message: repoMeta?.latestCommit?.message || (repoMeta?.cached ? 'Local repo cache ready' : 'Repository snapshot'),
                        time: formatRelativeTime(repoMeta?.latestCommit?.timestamp || repoMeta?.updatedAt),
                      }}
                    />
                  )}

                  {/* README Section */}
                  <div className="repo-readme-card">
                    <div className="repo-readme-header">
                      <h3 className="repo-readme-title">{repoReadme?.name || 'README.md'}</h3>
                    </div>
                    <div className="repo-readme-content">
                      {repoReadme?.content ? (
                        <pre className="repo-readme-code">
                          <code>{repoReadme.content}</code>
                        </pre>
                      ) : (
                        <p className="repo-readme-p">No README in place.</p>
                      )}
                    </div>
                  </div>
                </div>

                <aside className="repo-sidebar" aria-label="Repository information">
                  <div className="repo-sidebar-card">
                    <RepositorySidebarSection
                      title="About"
                      trailing={<span className="repo-sidebar-badge">{repoMeta?.visibility || 'Public'}</span>}
                    >
                      <div className="repo-sidebar-about">
                        <p className="repo-sidebar-description">{repositoryDescription}</p>
                        <div className="repo-sidebar-meta-list">
                          <div className="repo-sidebar-meta-item">
                            <BookOpen className="repo-sidebar-meta-icon" />
                            <span>{repoMeta?.readmePath || 'No README detected'}</span>
                          </div>
                          <div className="repo-sidebar-meta-item">
                            <Scale className="repo-sidebar-meta-icon" />
                            <span>{repoMeta?.currentBranch ? `Current branch: ${repoMeta.currentBranch}` : 'No active branch'}</span>
                          </div>
                          <div className="repo-sidebar-meta-item">
                            <FileText className="repo-sidebar-meta-icon" />
                            <span>{repoMeta?.updatedAt ? `Updated ${formatRelativeTime(repoMeta.updatedAt)}` : 'No activity yet'}</span>
                          </div>
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
                      trailing={<span className="repo-sidebar-count-pill">{repoMeta?.contributors.length ?? 0}</span>}
                    >
                      {repoMeta?.contributors.length ? (
                        <ul className="repo-contributors-list">
                          {repoMeta.contributors.map((contributor) => (
                          <li key={contributor.name} className="repo-contributor-item">
                            <div className="repo-contributor-avatar" aria-hidden="true">{contributor.initials}</div>
                            <div className="repo-contributor-copy">
                              <span className="repo-contributor-name">{contributor.name}</span>
                              <span className="repo-contributor-role">
                                {contributor.commits} {contributor.commits === 1 ? 'commit' : 'commits'}
                              </span>
                            </div>
                          </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="repo-sidebar-muted">No contributors detected yet.</p>
                      )}
                    </RepositorySidebarSection>

                    <RepositorySidebarSection title="Languages">
                      {repoMeta?.languages.length ? (
                        <>
                          <div className="repo-language-bar" aria-hidden="true">
                            {repoMeta.languages.map((language) => (
                              <span
                                key={language.name}
                                className="repo-language-bar-segment"
                                style={{
                                  width: `${language.percentage}%`,
                                  backgroundColor: getLanguageColor(language.name),
                                }}
                              />
                            ))}
                          </div>
                          <ul className="repo-language-list">
                            {repoMeta.languages.map((language) => (
                              <li key={language.name} className="repo-language-item">
                                <div className="repo-language-label-group">
                                  <span
                                    className="repo-language-dot"
                                    style={{ backgroundColor: getLanguageColor(language.name) }}
                                    aria-hidden="true"
                                  />
                                  <span className="repo-language-name">{language.name}</span>
                                </div>
                                <span className="repo-language-percent">{language.percentage}%</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <p className="repo-sidebar-muted">No language usage data available yet.</p>
                      )}
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
