import { File, Folder } from 'lucide-react';
// DATA
import type { FileItem } from '../../data/fileExplorerData';

import './FolderViewer.css';

interface FolderViewerProps {
  folder: FileItem;
  onSelectItem: (item: FileItem) => void;
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

// Recursive Component for individual folder items
interface FolderItemProps {
  item: FileItem;
  onSelectItem: (item: FileItem) => void;
}

function FolderItem({ item, onSelectItem }: FolderItemProps) {
  const handleItemClick = () => {
    onSelectItem(item);
  };

  return (
    <button
      onClick={handleItemClick}
      className="folder-item"
    >
      {item.type === 'folder' ? (
        <Folder className="folder-item-icon" />
      ) : (
        <File className="folder-item-icon" />
      )}
      <div className="folder-item-info">
        <span className="folder-item-name">{item.name}</span>
        <div className="folder-item-meta">
          {item.type === 'file' && item.lastModified && (
            <span>{item.lastModified}</span>
          )}
          {item.type === 'file' && item.size && (
            <span>{formatFileSize(item.size)}</span>
          )}
          {item.type === 'folder' && <span>Folder</span>}
        </div>
      </div>
    </button>
  );
}

// Recursive Component for folder item list
interface FolderItemListProps {
  items: FileItem[];
  onSelectItem: (item: FileItem) => void;
}

function FolderItemList({ items, onSelectItem }: FolderItemListProps) {
  return (
    <div className="folder-viewer-list">
      {items.map((item) => (
        // Recursive call - renders FolderItem for each item
        <FolderItem
          key={item.id}
          item={item}
          onSelectItem={onSelectItem}
        />
      ))}
    </div>
  );
}

export function FolderViewer({ folder, onSelectItem }: FolderViewerProps) {
  const breadcrumbs = getBreadcrumbPath(folder.path);
  const children = folder.children || [];

  return (
    <div className="folder-viewer-container">
      {/* Breadcrumb */}
      <div className="file-breadcrumb">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="file-breadcrumb-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className={index === breadcrumbs.length - 1 ? 'file-breadcrumb-current' : 'file-breadcrumb-item'}>
              {crumb.name}
            </span>
            {index < breadcrumbs.length - 1 && <span className="file-breadcrumb-separator">/</span>}
          </div>
        ))}
      </div>

      {/* Folder Header */}
      <div className="folder-viewer-header">
        <Folder className="folder-viewer-icon" />
        <span className="folder-viewer-name">{folder.name}</span>
      </div>

      {/* Folder Content */}
      <div className="folder-viewer-content">
        {children.length > 0 ? (
          // Recursive component for rendering list
          <FolderItemList
            items={children}
            onSelectItem={onSelectItem}
          />
        ) : (
          <div className="folder-empty">
            <p>This folder is empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
