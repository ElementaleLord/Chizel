import { useParams, Link } from 'react-router';
import { ChevronRight, Copy, Download } from 'lucide-react';
// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { RepositoryLayout } from '../components/chz-comp/RepositoryLayout';
// DATA
import { exampleFileContent, fileAuthor } from '../data/fileContent';

import './RepositoryFile.css';

export function RepositoryFile() {
  const { owner, repo, '*': filePath } = useParams();
  const pathParts = filePath?.split('/') || [];

  return (
    <>
      <ChzHeader pageTitle={`${owner} / ${repo}`} />
      <RepositoryLayout>
        <div className="file-wrapper">
          <div className="file-container">
            {/* Breadcrumb Navigation */}
            <div className="file-breadcrumb-section">
              <div className="file-breadcrumb">
                <Link to={`/repository/${owner}/${repo}`} className="file-breadcrumb-link">
                  {repo}
                </Link>
                {pathParts.map((part, i) => (
                  <div key={i} className="file-breadcrumb-path">
                    <ChevronRight className="file-breadcrumb-icon" />
                    <Link
                      to={`/repository/${owner}/${repo}/tree/${pathParts.slice(0, i + 1).join('/')}`}
                      className="file-breadcrumb-link"
                    >
                      {part}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* File Card */}
            <div className="file-card">
              {/* File Header */}
              <div className="file-header">
                <div className="file-author-section">
                  <div className="file-avatar">
                    {fileAuthor.avatar}
                  </div>
                  <div className="file-author-info">
                    <div className="file-author-name">{fileAuthor.name}</div>
                    <div className="file-author-time">{fileAuthor.updated}</div>
                  </div>
                </div>
                <div className="file-actions">
                  <button className="file-action-btn">
                    <Copy className="file-action-icon" />
                    Copy
                  </button>
                  <button className="file-action-btn">
                    <Download className="file-action-icon" />
                    Download
                  </button>
                </div>
              </div>

              {/* File Content */}
              <div className="file-content">
                <pre className="file-code">
                  <code className="file-code-block">
                    {exampleFileContent.split('\n').map((line, i) => (
                      <div key={i} className="file-code-line">
                        <span className="file-line-number">
                          {i + 1}
                        </span>
                        <span className="file-line-content">{line || ' '}</span>
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </RepositoryLayout>
    </>
  );
}