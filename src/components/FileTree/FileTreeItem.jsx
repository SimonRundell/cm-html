/**
 * @fileoverview A single file entry in the file tree sidebar.
 * Shows rename/delete/set-preview-root actions on hover.
 *
 * Rename validation mirrors the FileTree add-file validation: extension must be
 * in the allowlist and the new name must not clash with an existing file.
 * Delete is gated behind a confirmation modal to prevent accidental data loss.
 */

import { useState } from 'react';
import {
  FileCode2, FileType2, File, Eye, Pencil, Trash2, MonitorPlay,
} from 'lucide-react';
import Modal from '../Modal/Modal';

/**
 * Renders a language-appropriate Lucide icon for a project file entry.
 * @param {Object} props
 * @param {string} props.language - Monaco language identifier (e.g. "html", "css", "javascript").
 * @returns {JSX.Element}
 */
function FileIcon({ language }) {
  if (language === 'html') return <FileCode2 size={14} />;
  if (language === 'css')  return <FileType2 size={14} />;
  return <File size={14} />;
}

/**
 * Renders a single file row in the file tree sidebar.
 *
 * @param {Object} props
 * @param {import('../../hooks/useProject').ProjectFile} props.file - The file object to display.
 * @param {boolean} props.isActive - True when this file is currently open in the editor.
 * @param {boolean} props.isPreviewRoot - True when this file is the preview iframe's root document.
 * @param {Function} props.onSelect - Called (no arguments) when the student clicks the file row.
 * @param {Function} props.onRename - Called with the validated new filename string when a rename is committed.
 * @param {Function} props.onDelete - Called (no arguments) after the student confirms the delete modal.
 * @param {Function} props.onSetPreviewRoot - Called (no arguments) to make this file the preview root.
 * @param {string[]} props.existingNames - All current filenames in the project, used to prevent name collisions.
 * @param {string[]} props.allowedExtensions - Lowercase extensions that are permitted for renaming.
 * @returns {JSX.Element}
 */
export default function FileTreeItem({
  file,
  isActive,
  isPreviewRoot,
  onSelect,
  onRename,
  onDelete,
  onSetPreviewRoot,
  existingNames,
  allowedExtensions,
}) {
  const [renaming, setRenaming]       = useState(false);
  const [renameValue, setRenameValue] = useState(file.name);
  const [renameError, setRenameError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  /** Enters rename mode, pre-filling the input with the current filename. */
  function startRename() {
    setRenameValue(file.name);
    setRenameError('');
    setRenaming(true);
  }

  /**
   * Validates and commits the rename, or shows an inline error.
   * If the name is unchanged or empty the rename is silently cancelled.
   */
  function commitRename() {
    const name = renameValue.trim();
    if (!name || name === file.name) { setRenaming(false); return; }

    const ext = name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setRenameError(`Extension .${ext} not allowed.`);
      return;
    }
    if (existingNames.includes(name)) {
      setRenameError(`"${name}" already exists.`);
      return;
    }

    onRename(name);
    setRenaming(false);
    setRenameError('');
  }

  /**
   * Keyboard shortcuts for the rename input: Enter commits, Escape cancels.
   * @param {React.KeyboardEvent} e
   */
  function handleRenameKeyDown(e) {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') { setRenaming(false); setRenameError(''); }
  }

  /**
   * Opens the confirmation modal instead of deleting immediately,
   * preventing accidental data loss.
   * @param {React.MouseEvent} e
   */
  function handleDeleteClick(e) {
    e.stopPropagation();
    setConfirmDelete(true);
  }

  return (
    <div
      className={`file-tree-item${isActive ? ' active' : ''}`}
      onClick={!renaming ? onSelect : undefined}
    >
      <span className="file-tree-item-icon">
        <FileIcon language={file.language} />
      </span>

      {renaming ? (
        <div className="file-tree-rename-wrap">
          <input
            className="file-tree-rename-input"
            value={renameValue}
            onChange={e => { setRenameValue(e.target.value); setRenameError(''); }}
            onBlur={commitRename}
            onKeyDown={handleRenameKeyDown}
            autoFocus
            onClick={e => e.stopPropagation()}
          />
          {renameError && <div className="file-tree-error">{renameError}</div>}
        </div>
      ) : (
        <span className="file-tree-item-name">{file.name}</span>
      )}

      {isPreviewRoot && !renaming && (
        <span className="file-tree-preview-badge" title="Preview root">
          <Eye size={11} />
        </span>
      )}

      {!renaming && (
        <span className="file-tree-item-actions">
          {file.language === 'html' && !isPreviewRoot && (
            <button
              title="Set as preview root"
              onClick={e => { e.stopPropagation(); onSetPreviewRoot(); }}
            >
              <MonitorPlay size={12} />
            </button>
          )}
          <button title="Rename" onClick={e => { e.stopPropagation(); startRename(); }}>
            <Pencil size={12} />
          </button>
          <button title="Delete" onClick={handleDeleteClick} className="danger">
            <Trash2 size={12} />
          </button>
        </span>
      )}

      <Modal
        isOpen={confirmDelete}
        type="confirm"
        variant="danger"
        title="Delete file"
        message={`Delete "${file.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => { setConfirmDelete(false); onDelete(); }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
