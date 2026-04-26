import { Copy, Download } from 'lucide-react';
// DATA
import type { FileItem } from '../../data/fileExplorerData';

import './FileViewer.css';

interface FileViewerProps {
  file: FileItem;
}

// Utility functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getBreadcrumbPath(path: string): { name: string; path: string }[] {
  const parts = path.split('/').filter(Boolean);
  const breadcrumbs: { name: string; path: string }[] = [{ name: 'root', path: '/' }];

  let currentPath = '';
  parts.forEach((part) => {
    currentPath += '/' + part;
    breadcrumbs.push({ name: part, path: currentPath });
  });

  return breadcrumbs;
}

function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

function isTextFile(filename: string): boolean {
  const extension = getFileExtension(filename);
  const textExtensions = [
    'txt',
    'md',
    'json',
    'js',
    'tsx',
    'ts',
    'jsx',
    'css',
    'html',
    'xml',
    'yaml',
    'yml',
    'ini',
    'env',
    'py',
    'java',
    'cpp',
    'c',
    'h',
    'go',
    'rs',
  ];
  return textExtensions.includes(extension);
}

// Recursive Component for breadcrumb items
interface BreadcrumbItemProps {
  crumbs: { name: string; path: string }[];
  index: number;
}

function BreadcrumbItem({ crumbs, index }: BreadcrumbItemProps) {
  const crumb = crumbs[index];
  const isLast = index === crumbs.length - 1;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span className={isLast ? 'file-breadcrumb-current' : 'file-breadcrumb-item'}>
        {crumb.name}
      </span>
      {!isLast && <span className="file-breadcrumb-separator">/</span>}
      {!isLast && (
        // Recursive call - renders next breadcrumb item
        <BreadcrumbItem crumbs={crumbs} index={index + 1} />
      )}
    </div>
  );
}

// Recursive Component for breadcrumb list
interface BreadcrumbListProps {
  crumbs: { name: string; path: string }[];
}

function BreadcrumbList({ crumbs }: BreadcrumbListProps) {
  return (
    <div className="file-breadcrumb">
      {/* Start recursive breadcrumb rendering from index 0 */}
      <BreadcrumbItem crumbs={crumbs} index={0} />
    </div>
  );
}

export function FileViewer({ file }: FileViewerProps) {
  const breadcrumbs = getBreadcrumbPath(file.path);
  const isText = isTextFile(file.name);
  const hasContent = file.content !== undefined;

  const handleCopy = () => {
    if (file.content) {
      navigator.clipboard.writeText(file.content);
    }
  };

  return (
    <div className="file-viewer-container">
      {/* Breadcrumb - using recursive component */}
      <BreadcrumbList crumbs={breadcrumbs} />

      {/* File Header */}
      <div className="file-viewer-header">
        <div className="file-viewer-info">
          <span className="file-viewer-name">{file.name}</span>
          <div className="file-viewer-meta">
            {file.lastModified && (
              <div className="file-viewer-meta-item">
                <span>Modified: {file.lastModified}</span>
              </div>
            )}
            {file.size && (
              <div className="file-viewer-meta-item">
                <span>Size: {formatFileSize(file.size)}</span>
              </div>
            )}
          </div>
        </div>
        <div className="file-viewer-actions">
          {hasContent && (
            <button className="file-viewer-btn" onClick={handleCopy} title="Copy content">
              <Copy className="inline" style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.25rem' }} />
              Copy
            </button>
          )}
          <button className="file-viewer-btn" title="Download file">
            <Download className="inline" style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.25rem' }} />
            Download
          </button>
        </div>
      </div>

      {/* File Content */}
      <div className="file-viewer-content">
        {hasContent ? (
          isText ? (
            <div className="file-viewer-code">{file.content}</div>
          ) : (
            <div className="file-viewer-text">{file.content}</div>
          )
        ) : (
          <div className="file-viewer-binary">
            <div>
              <p>Binary file</p>
              <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                Cannot display binary file content
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
