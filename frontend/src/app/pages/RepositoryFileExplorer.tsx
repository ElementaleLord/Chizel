import { useState } from 'react';
// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { FileStructure } from '../components/chz-comp/FileStructure';
import { FileViewer } from '../components/chz-comp/FileViewer';
import { FolderViewer } from '../components/chz-comp/FolderViewer';
// DATA
import { fileStructure, type FileItem } from '../data/fileExplorerData';

import './RepositoryFileExplorer.css';

interface FileExplorerProps {
  fileData?: FileItem;
}

export function RepositoryFileExplorer({ fileData = fileStructure }: FileExplorerProps) {
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);

  const handleSelectItem = (item: FileItem) => {
    setSelectedItem(item);
  };

  const isFileSelected = selectedItem?.type === 'file';
  const isFolderSelected = selectedItem?.type === 'folder';

  return (
    <div className="file-explorer-container">
      <ChzHeader pageTitle="File Explorer" />

      <div className="file-explorer-main">
        {/* File Structure Sidebar - passing data via props */}
        <FileStructure
          structure={fileData}
          onSelectItem={handleSelectItem}
          selectedId={selectedItem?.id || null}
        />

        {/* Content Area */}
        <div className="file-explorer-content">
          {selectedItem && isFileSelected && (
            // FileViewer - passing file data via props
            <FileViewer file={selectedItem} />
          )}

          {selectedItem && isFolderSelected && (
            // FolderViewer - passing folder data via props
            <FolderViewer folder={selectedItem} onSelectItem={handleSelectItem} />
          )}

          {!selectedItem && (
            <div className="file-explorer-empty">
              <div className="file-explorer-empty-text">
                Select a file or folder to view its contents
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
