import { useEffect, useState } from 'react';
import { ChevronDown, File, Folder } from 'lucide-react';
// DATA
import type { FileItem } from '../../data/fileExplorerData';

import './FileStructure.css';

interface FileStructureProps {
  structure: FileItem;
  onSelectItem: (item: FileItem) => void;
  selectedId: string | null;
  selectedPath?: string | null;
}

// Recursive Component for file tree nodes
interface FileTreeNodeProps {
  item: FileItem;
  onSelectItem: (item: FileItem) => void;
  selectedId: string | null;
  selectedPath?: string | null;
  level?: number;
}

function FileTreeNode({
  item,
  onSelectItem,
  selectedId,
  selectedPath,
  level = 0,
}: FileTreeNodeProps) {
  const shouldAutoExpand =
    level === 0 ||
    (selectedPath != null &&
      (selectedPath === item.path ||
        selectedPath.startsWith(`${item.path === '/' ? '' : item.path}/`)));
  const [isExpanded, setIsExpanded] = useState(shouldAutoExpand);
  const hasChildren = item.type === 'folder' && item.children && item.children.length > 0;

  useEffect(() => {
    if (shouldAutoExpand) {
      setIsExpanded(true);
    }
  }, [shouldAutoExpand]);

  const handleSelect = () => {
    onSelectItem(item);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="file-tree-item">
      <button
        onClick={handleSelect}
        className={`file-tree-item-button ${selectedId === item.id ? 'file-tree-item-button-active' : ''}`}
        style={{ paddingLeft: `${level * 1 + 1}rem` }}
      >
        {hasChildren && (
          <div
            className={`file-tree-toggle ${!isExpanded ? 'file-tree-toggle-collapsed' : ''}`}
            onClick={handleToggle}
          >
            <ChevronDown className="file-tree-icon" />
          </div>
        )}
        {!hasChildren && <div className="file-tree-toggle"></div>}

        {item.type === 'folder' ? (
          <Folder className="file-tree-icon" />
        ) : (
          <File className="file-tree-icon" />
        )}

        <span className="file-tree-name">{item.name}</span>
      </button>

      {isExpanded && hasChildren && (
        <div className="file-tree-children">
          {item.children!.map((child) => (
            // Recursive call - renders FileTreeNode for each child
            <FileTreeNode
              key={child.id}
              item={child}
              onSelectItem={onSelectItem}
              selectedId={selectedId}
              selectedPath={selectedPath}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileStructure({ structure, onSelectItem, selectedId, selectedPath }: FileStructureProps) {
  return (
    <div className="file-structure-sidebar">
      <div className="file-structure-header">
        <div className="file-structure-title">Files</div>
      </div>
      <div className="file-tree">
        {/* Recursive component call */}
        <FileTreeNode
          item={structure}
          onSelectItem={onSelectItem}
          selectedId={selectedId}
          selectedPath={selectedPath}
          level={0}
        />
      </div>
    </div>
  );
}
