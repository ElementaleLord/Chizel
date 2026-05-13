import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
// COMPONENTS
import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { FileStructure } from '../components/chz-comp/FileStructure';
import { FileViewer } from '../components/chz-comp/FileViewer';
import { FolderViewer } from '../components/chz-comp/FolderViewer';
import type { FileItem } from '../data/fileExplorerData';
import {
  checkoutRepoRef,
  ensureRepoReady,
  fetchRepoFile,
  fetchRepoMeta,
  fetchRepoTree,
  type RepoMeta,
  type RepoNode,
} from '../lib/repoApi';

import './RepositoryFileExplorer.css';

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

function normalizeRepoPath(itemPath: string) {
  return itemPath.replace(/^\//, '') || '.';
}

function buildAncestorPaths(repoPath: string) {
  const normalized = repoPath.replace(/^\/+|\/+$/g, '');
  if (!normalized) {
    return [];
  }

  const segments = normalized.split('/').filter(Boolean);
  return segments.map((_, index) => segments.slice(0, index + 1).join('/'));
}

function mergeDirectoryNode(rootNode: RepoNode, directoryNode: RepoNode): RepoNode {
  if (rootNode.path === directoryNode.path) {
    return directoryNode;
  }

  if (!rootNode.children?.length) {
    return rootNode;
  }

  return {
    ...rootNode,
    children: rootNode.children.map((child) => {
      const isSameNode = child.path === directoryNode.path;
      const isAncestor =
        child.type === 'folder' &&
        directoryNode.path.startsWith(`${child.path === '/' ? '' : child.path}/`);

      if (isSameNode) {
        return directoryNode;
      }

      if (isAncestor) {
        return mergeDirectoryNode(child as RepoNode, directoryNode);
      }

      return child as RepoNode;
    }),
  };
}

export function RepositoryFileExplorer() {
  const { owner = 'sarahdev', repo = 'web-app', branch = 'main', '*': routePath = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [repoId, setRepoId] = useState<string | null>(null);
  const [repoMeta, setRepoMeta] = useState<RepoMeta | null>(null);
  const [fileTree, setFileTree] = useState<FileItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isBlobRoute = location.pathname.includes('/blob/');

  useEffect(() => {
    let isCancelled = false;

    async function loadExplorer() {
      try {
        setIsLoading(true);
        setError(null);

        const resolvedRepoId = await ensureRepoReady(owner, repo);
        const [meta, rootTree] = await Promise.all([
          fetchRepoMeta(resolvedRepoId),
          fetchRepoTree(resolvedRepoId, '.'),
        ]);

        let hydratedTree = rootTree;
        const ancestorFolders = isBlobRoute
          ? buildAncestorPaths(routePath).slice(0, -1)
          : buildAncestorPaths(routePath);

        for (const folderPath of ancestorFolders) {
          const directoryNode = await fetchRepoTree(resolvedRepoId, folderPath);
          hydratedTree = mergeDirectoryNode(hydratedTree, directoryNode);
        }

        const currentItem = isBlobRoute
          ? await fetchRepoFile(resolvedRepoId, routePath)
          : routePath
            ? await fetchRepoTree(resolvedRepoId, routePath)
            : hydratedTree;

        if (currentItem.type === 'folder') {
          hydratedTree = mergeDirectoryNode(hydratedTree, currentItem);
        }

        if (isCancelled) {
          return;
        }

        setRepoId(resolvedRepoId);
        setRepoMeta(meta);
        setFileTree(hydratedTree);
        setSelectedItem(currentItem);
      } catch (loadError) {
        if (isCancelled) {
          return;
        }
        console.error(loadError);
        setError(getErrorMessage(loadError, 'Unable to load repository explorer.'));
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadExplorer();

    return () => {
      isCancelled = true;
    };
  }, [owner, repo, routePath, isBlobRoute]);

  const handleSelectItem = async (item: RepoNode) => {
    try {
      if (!repoId) {
        throw new Error('Repository is not ready yet.');
      }

      const normalizedPath = normalizeRepoPath(item.path);

      if (item.type === 'folder') {
        const folder = await fetchRepoTree(repoId, normalizedPath);
        setFileTree((previousTree) => {
          if (!previousTree) {
            return folder;
          }
          return mergeDirectoryNode(previousTree as RepoNode, folder);
        });
        setSelectedItem(folder);
        navigate(`/repository/${owner}/${repo}/tree/${normalizedPath}`);
        return;
      }

      const file = await fetchRepoFile(repoId, normalizedPath);
      setSelectedItem(file);
      navigate(`/repository/${owner}/${repo}/blob/${repoMeta?.currentBranch || branch}/${normalizedPath}`);
    } catch (selectionError) {
      console.error(selectionError);
      setError(getErrorMessage(selectionError, 'Unable to load selected file.'));
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(`/repository/${owner}/${repo}`);
  };

  const handleSwitchBranch = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!repoMeta || !event.target.value) {
      return;
    }

    try {
      setIsLoading(true);
      await checkoutRepoRef(repoMeta.repoId, event.target.value);
      navigate(`/repository/${owner}/${repo}`);
    } catch (checkoutError) {
      console.error(checkoutError);
      setError(getErrorMessage(checkoutError, 'Unable to switch branch.'));
      setIsLoading(false);
    }
  };

  const isFileSelected = selectedItem?.type === 'file';
  const isFolderSelected = selectedItem?.type === 'folder';

  return (
    <div className="file-explorer-container">
      <ChzHeader pageTitle="File Explorer" />

      <div className="file-explorer-main">
        {fileTree && (
          <FileStructure
            structure={fileTree}
            onSelectItem={handleSelectItem}
            selectedId={selectedItem?.id || null}
            selectedPath={selectedItem?.path || null}
          />
        )}

        <div className="file-explorer-content">
          <div className="file-explorer-toolbar">
            <button type="button" className="file-explorer-back-btn" onClick={handleBack}>
              <ArrowLeft className="file-explorer-back-icon" />
              Back
            </button>

            {repoMeta && (
              <div className="file-explorer-branch-picker">
                <label htmlFor="file-explorer-branch-select" className="file-explorer-branch-label">
                  Branch
                </label>
                <select
                  id="file-explorer-branch-select"
                  className="file-explorer-branch-select"
                  value={repoMeta.currentBranch || ''}
                  onChange={handleSwitchBranch}
                >
                  {repoMeta.branches.map((branchRef) => (
                    <option key={branchRef.id} value={branchRef.name}>
                      {branchRef.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {isLoading && (
            <div className="file-explorer-empty">
              <div className="file-explorer-empty-text">
                Loading repository explorer...
              </div>
            </div>
          )}

          {!isLoading && error && (
            <div className="file-explorer-empty">
              <div className="file-explorer-empty-text">{error}</div>
            </div>
          )}

          {selectedItem && isFileSelected && (
            <FileViewer file={selectedItem} />
          )}

          {selectedItem && isFolderSelected && (
            <FolderViewer folder={selectedItem} onSelectItem={handleSelectItem} />
          )}

          {!isLoading && !error && !selectedItem && (
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
