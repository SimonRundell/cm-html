/**
 * @fileoverview Left sidebar showing all project files grouped by type.
 * Supports adding, renaming, deleting files and setting the preview root.
 *
 * Files are grouped into labelled sections (HTML, CSS, JS, Other) to help
 * students quickly find what they are looking for in larger projects.
 * New file names are validated against an allowlist of extensions before
 * the add action is forwarded to the parent hook.
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import FileTreeItem from './FileTreeItem';
import FolderTree from './FolderTree';
import './FileTree.css';

const ALLOWED_EXTENSIONS = ['html', 'htm', 'css', 'js', 'json', 'txt', 'md'];

// Only show root-level (no path separator) non-image files in type groups.
// Files inside folders are shown exclusively in the FolderTree section below.
const inRoot = f => !f.name.includes('/') && f.language !== 'image' && !f.isImage;
const GROUPS = [
  { label: 'HTML',  filter: f => inRoot(f) && f.language === 'html' },
  { label: 'CSS',   filter: f => inRoot(f) && f.language === 'css' },
  { label: 'JS',    filter: f => inRoot(f) && f.language === 'javascript' },
  { label: 'Other', filter: f => inRoot(f) && !['html','css','javascript'].includes(f.language) },
];

/**
 * Left sidebar file tree with grouping, add-file form, and per-file actions.
 *
 * @param {Object} props
 * @param {import('../../hooks/useProject').ProjectFile[]} props.files - All files in the current project.
 * @param {string} props.activeFileId - UUID of the currently open file (highlighted in the tree).
 * @param {Function} props.onSelectFile - Called with a file UUID when the student clicks a file entry.
 * @param {Function} props.onAddFile - Called with a filename string after the add form is validated.
 * @param {Function} props.onRenameFile - Called with (fileId, newName) when a file rename is committed.
 * @param {Function} props.onDeleteFile - Called with a file UUID after the student confirms deletion.
 * @param {string} props.previewRootFile - Filename of the current preview root (shown with an eye badge).
 * @param {Function} props.onSetPreviewRoot - Called with a filename string to change the preview root.
 * @param {Function} props.onImportFile - Called with (name, content, isImage) to add an imported asset file.
 * @returns {JSX.Element}
 */
export default function FileTree({
  files,
  activeFileId,
  onSelectFile,
  onAddFile,
  onRenameFile,
  onDeleteFile,
  previewRootFile,
  onSetPreviewRoot,
  onImportFile,
}) {
  const [newFileName, setNewFileName]   = useState('');
  const [showNewInput, setShowNewInput] = useState(false);
  const [addError, setAddError]         = useState('');

  /**
   * Validates the new filename and forwards to the parent, or shows an inline error.
   * Validation runs here (not in the hook) so the UI can display a specific error
   * message without the hook needing to know about the form state.
   * @param {React.FormEvent} e
   */
  function handleAddSubmit(e) {
    e.preventDefault();
    const name = newFileName.trim();
    if (!name) return;

    const ext = name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setAddError(`Extension .${ext} is not allowed. Use: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return;
    }
    if (files.some(f => f.name === name)) {
      setAddError(`A file named "${name}" already exists.`);
      return;
    }

    onAddFile(name);
    setNewFileName('');
    setShowNewInput(false);
    setAddError('');
  }

  /**
   * Dismisses the add-file form on Escape without submitting.
   * @param {React.KeyboardEvent} e
   */
  function handleAddKeyDown(e) {
    if (e.key === 'Escape') {
      setShowNewInput(false);
      setNewFileName('');
      setAddError('');
    }
  }

  return (
    <aside className="file-tree">
      <div className="file-tree-header">
        <span className="file-tree-title">Files</span>
        <button
          className="file-tree-add-btn"
          onClick={() => setShowNewInput(v => !v)}
          title="Add new file"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="file-tree-body">
        {GROUPS.map(group => {
          const groupFiles = files.filter(group.filter);
          if (groupFiles.length === 0) return null;
          return (
            <div key={group.label} className="file-tree-group">
              <div className="file-tree-group-label">{group.label}</div>
              {groupFiles.map(file => (
                <FileTreeItem
                  key={file.id}
                  file={file}
                  isActive={file.id === activeFileId}
                  isPreviewRoot={file.name === previewRootFile}
                  onSelect={() => onSelectFile(file.id)}
                  onRename={(newName) => onRenameFile(file.id, newName)}
                  onDelete={() => onDeleteFile(file.id)}
                  onSetPreviewRoot={() => onSetPreviewRoot(file.name)}
                  existingNames={files.map(f => f.name)}
                  allowedExtensions={ALLOWED_EXTENSIONS}
                />
              ))}
            </div>
          );
        })}

        {showNewInput && (
          <div className="file-tree-new-file">
            <form onSubmit={handleAddSubmit}>
              <input
                className="file-tree-new-input"
                placeholder="filename.html"
                value={newFileName}
                onChange={e => { setNewFileName(e.target.value); setAddError(''); }}
                onKeyDown={handleAddKeyDown}
                autoFocus
              />
            </form>
            {addError && <div className="file-tree-error">{addError}</div>}
          </div>
        )}

        <div className="file-tree-assets">
          <FolderTree
            files={files}
            activeFileId={activeFileId}
            onSelectFile={onSelectFile}
            onDeleteFile={onDeleteFile}
            onRenameFile={onRenameFile}
            onImportFile={onImportFile}
          />
        </div>

        <img src="./images/cm-html.png" alt="CodeMonkey HTML/CSS/JavaScript Editor" title="This application licensed by Creative Commons BY-NC-SA 4.0 2026" className="logo" />
      </div>
    </aside>
  );
}
