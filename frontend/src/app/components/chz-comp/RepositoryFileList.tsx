import { Link } from 'react-router';
// DATA
import type { FileItem } from '../../data/fileExplorerData';

import './RepositoryFileList.css';

interface RepositoryFileListProps {
  structure: FileItem;
  owner: string;
  repo: string;
  onFileSelect?: (file: FileItem) => void;
  latestCommit?: {
    message: string;
    time: string;
  };
}

export function RepositoryFileList({
  structure,
  owner,
  repo,
  onFileSelect,
  latestCommit = {
    message: 'Latest commit',
    time: 'recently',
  },
}: RepositoryFileListProps) {
  // Get only root-level files and folders (first layer)
  const rootFiles = structure.children || [];

  const handleFileClick = (file: FileItem) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
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
        {rootFiles.map((file) => (
          <button
            key={file.id}
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
            <span className="repo-file-updated">{file.lastModified || 'N/A'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
