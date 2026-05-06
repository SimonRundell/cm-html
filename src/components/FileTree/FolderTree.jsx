/**
 * @fileoverview Asset folder tree rendered at the bottom of the file-tree sidebar.
 *
 * Displays all project files that live inside sub-folders (name contains "/")
 * plus any root-level image files.  Folders expand and collapse; text files
 * inside a folder open in the editor when clicked; all files can be deleted.
 *
 * An "Import" button reads any local file via FileReader and adds it to the
 * project under a user-specified (or auto-suggested) folder path.
 */

import { useState, useRef } from 'react';
import {
  Folder, FolderOpen, FileImage, File, FileCode2, FileType2,
  Trash2, Pencil, Upload, ChevronDown, ChevronRight,
} from 'lucide-react';
import { isImageFile } from '../../utils/languageDetect';
import Modal from '../Modal/Modal';

// ---------------------------------------------------------------------------
// Tree builder
// ---------------------------------------------------------------------------

/**
 * Converts a flat file list into a nested { children, files } tree.
 * Each node: { children: { [folderName]: node }, files: ProjectFile[] }
 * @param {import('../../hooks/useProject').ProjectFile[]} files
 * @returns {{ children: Object, files: Array }}
 */
function buildTree(files) {
  const root = { children: {}, files: [] };
  files.forEach(file => {
    const parts = file.name.split('/');
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node.children[parts[i]]) node.children[parts[i]] = { children: {}, files: [] };
      node = node.children[parts[i]];
    }
    node.files.push(file);
  });
  return root;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Renders a language-appropriate icon for a file entry in the folder tree.
 * @param {Object} props
 * @param {import('../../hooks/useProject').ProjectFile} props.file
 * @returns {JSX.Element}
 */
function FileIconFor({ file }) {
  if (file.isImage || file.language === 'image') return <FileImage size={13} />;
  if (file.language === 'html')  return <FileCode2  size={13} />;
  if (file.language === 'css')   return <FileType2  size={13} />;
  return <File size={13} />;
}

/**
 * Suggests a default destination folder path based on the imported file's type,
 * so the student rarely needs to edit the folder input manually.
 * @param {string} filename - The original filename from the user's filesystem.
 * @returns {string} A suggested folder name, e.g. "images" or "data".
 */
function suggestFolder(filename) {
  if (isImageFile(filename)) return 'images';
  const ext = filename.split('.').pop().toLowerCase();
  if (ext === 'json') return 'data';
  if (['mp3', 'wav', 'ogg'].includes(ext)) return 'audio';
  if (['mp4', 'webm'].includes(ext))       return 'video';
  return 'assets';
}

// ---------------------------------------------------------------------------
// FolderFileRow
// ---------------------------------------------------------------------------

/**
 * Renders a single file row inside the folder tree.
 *
 * Image files are non-editable (clicking does nothing, cursor stays default).
 * Text-based files can be clicked to open in the Monaco editor.
 * All files expose Rename (pencil) and Delete (trash) action buttons on hover.
 * Rename mode replaces the name label with a full-path input so students can
 * also relocate a file by editing the folder prefix.
 *
 * @param {Object} props
 * @param {import('../../hooks/useProject').ProjectFile} props.file
 * @param {number} props.depth - Nesting depth used to calculate left padding.
 * @param {boolean} props.isActive - True when this file is open in the editor.
 * @param {Function} props.onSelect - Called (no args) to open the file in the editor.
 * @param {Function} props.onDelete - Called with the file UUID to delete the file.
 * @param {Function} props.onRename - Called with (fileId, newName) to rename the file.
 * @param {string[]} props.existingNames - All current file names; used to detect collisions.
 * @returns {JSX.Element}
 */
function FolderFileRow({ file, depth, isActive, onSelect, onDelete, onRename, existingNames }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [renaming, setRenaming]           = useState(false);
  const [renameValue, setRenameValue]     = useState(file.name);
  const [renameError, setRenameError]     = useState('');
  const isImg = file.isImage || file.language === 'image';
  const shortName = file.name.split('/').pop();

  function startRename() {
    setRenameValue(file.name);
    setRenameError('');
    setRenaming(true);
  }

  function commitRename() {
    const newName = renameValue.trim();
    if (!newName || newName === file.name) { setRenaming(false); return; }
    if (existingNames.filter(n => n !== file.name).includes(newName)) {
      setRenameError(`"${newName}" already exists.`);
      return;
    }
    onRename(file.id, newName);
    setRenaming(false);
    setRenameError('');
  }

  function handleRenameKeyDown(e) {
    if (e.key === 'Enter')  commitRename();
    if (e.key === 'Escape') { setRenaming(false); setRenameError(''); }
  }

  return (
    <div
      className={`ft-item ft-file${isActive ? ' active' : ''}${isImg && !renaming ? ' no-select' : ''}`}
      style={{ paddingLeft: `${8 + depth * 14}px` }}
      onClick={!isImg && !renaming ? onSelect : undefined}
    >
      <span className="ft-item-icon"><FileIconFor file={file} /></span>

      {renaming ? (
        <div className="ft-rename-wrap">
          <input
            className="ft-rename-input"
            value={renameValue}
            onChange={e => { setRenameValue(e.target.value); setRenameError(''); }}
            onBlur={commitRename}
            onKeyDown={handleRenameKeyDown}
            autoFocus
            onClick={e => e.stopPropagation()}
          />
          {renameError && <div className="ft-rename-error">{renameError}</div>}
        </div>
      ) : (
        <span className="ft-item-name" title={file.name}>{shortName}</span>
      )}

      {!renaming && (
        <span className="ft-item-actions">
          <button title="Rename" onClick={e => { e.stopPropagation(); startRename(); }}>
            <Pencil size={12} />
          </button>
          <button
            className="danger"
            title="Delete"
            onClick={e => { e.stopPropagation(); setConfirmDelete(true); }}
          >
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
        onConfirm={() => { setConfirmDelete(false); onDelete(file.id); }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// FolderNode
// ---------------------------------------------------------------------------

/**
 * Renders a collapsible folder node and its contents (child folders and files).
 * Folders start expanded. Clicking the header row toggles open/closed state.
 *
 * @param {Object} props
 * @param {string} props.name - The folder's display name (single path segment).
 * @param {{ children: Object, files: Array }} props.node - Tree node from buildTree.
 * @param {number} props.depth - Nesting depth for left-padding calculation.
 * @param {string} props.activeFileId - UUID of the currently active editor file.
 * @param {Function} props.onSelect - Passed through to FolderFileRow for editor open.
 * @param {Function} props.onDelete - Passed through to FolderFileRow for deletion.
 * @param {Function} props.onRename - Passed through to FolderFileRow for rename.
 * @param {string[]} props.existingNames - All project file names for collision checks.
 * @returns {JSX.Element}
 */
function FolderNode({ name, node, depth, activeFileId, onSelect, onDelete, onRename, existingNames }) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <div
        className="ft-item ft-folder-row"
        style={{ paddingLeft: `${8 + depth * 14}px` }}
        onClick={() => setOpen(v => !v)}
      >
        <span className="ft-item-chevron">
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
        <span className="ft-item-icon">
          {open ? <FolderOpen size={13} /> : <Folder size={13} />}
        </span>
        <span className="ft-item-name">{name}</span>
      </div>

      {open && (
        <>
          {Object.entries(node.children).map(([childName, childNode]) => (
            <FolderNode
              key={childName}
              name={childName}
              node={childNode}
              depth={depth + 1}
              activeFileId={activeFileId}
              onSelect={onSelect}
              onDelete={onDelete}
              onRename={onRename}
              existingNames={existingNames}
            />
          ))}
          {node.files.map(file => (
            <FolderFileRow
              key={file.id}
              file={file}
              depth={depth + 1}
              isActive={file.id === activeFileId}
              onSelect={() => onSelect(file.id)}
              onDelete={onDelete}
              onRename={onRename}
              existingNames={existingNames}
            />
          ))}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FolderTree (exported)
// ---------------------------------------------------------------------------

/**
 * @param {Object} props
 * @param {import('../../hooks/useProject').ProjectFile[]} props.files
 * @param {string} props.activeFileId
 * @param {Function} props.onSelectFile - (fileId) open a text file in the editor
 * @param {Function} props.onDeleteFile - (fileId) delete a file
 * @param {Function} props.onRenameFile - (fileId, newName) rename a file
 * @param {Function} props.onImportFile - (name, content, isImage) add imported file
 */
export default function FolderTree({ files, activeFileId, onSelectFile, onDeleteFile, onRenameFile, onImportFile }) {
  const fileInputRef = useRef(null);
  const [pending, setPending]         = useState(null);  // { name, content, isImage }
  const [folderPath, setFolderPath]   = useState('');
  const [importError, setImportError] = useState('');

  // Asset files: anything in a subfolder, or root-level images
  const assetFiles = files.filter(f => f.name.includes('/') || f.isImage || f.language === 'image');
  const tree = buildTree(assetFiles);
  const hasContent = Object.keys(tree.children).length > 0 || tree.files.length > 0;
  const existingNames = files.map(f => f.name);

  // ---- file picker ----

  function openPicker() { fileInputRef.current?.click(); }

  function handleFileChange(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;

    const isImg = isImageFile(file.name);
    const reader = new FileReader();
    reader.onerror = () => setImportError('Could not read file.');
    reader.onload = evt => {
      setPending({ name: file.name, content: evt.target.result, isImage: isImg });
      setFolderPath(suggestFolder(file.name));
      setImportError('');
    };
    if (isImg) reader.readAsDataURL(file);
    else       reader.readAsText(file);
  }

  // ---- import form ----

  function handleConfirm(e) {
    e.preventDefault();
    if (!pending) return;
    const folder   = folderPath.trim().replace(/\/+$/, '');
    const fullName = folder ? `${folder}/${pending.name}` : pending.name;

    if (files.some(f => f.name === fullName)) {
      setImportError(`"${fullName}" already exists.`);
      return;
    }
    onImportFile(fullName, pending.content, pending.isImage);
    setPending(null);
    setFolderPath('');
    setImportError('');
  }

  function handleCancel() {
    setPending(null);
    setFolderPath('');
    setImportError('');
  }

  const previewPath = pending
    ? (folderPath.trim().replace(/\/+$/, '') ? `${folderPath.trim().replace(/\/+$/, '')}/${pending.name}` : pending.name)
    : '';

  return (
    <div className="folder-tree">
      <div className="folder-tree-header">
        <span className="folder-tree-label">Assets</span>
        <button className="folder-tree-upload-btn" onClick={openPicker} title="Import a file into the project">
          <Upload size={13} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="folder-tree-file-input"
          onChange={handleFileChange}
        />
      </div>

      {!hasContent && !pending && (
        <div className="folder-tree-empty">No assets yet — click&nbsp;↑&nbsp;to import.</div>
      )}

      {/* Root-level folder nodes */}
      {Object.entries(tree.children).map(([name, node]) => (
        <FolderNode
          key={name}
          name={name}
          node={node}
          depth={0}
          activeFileId={activeFileId}
          onSelect={onSelectFile}
          onDelete={onDeleteFile}
          onRename={onRenameFile}
          existingNames={existingNames}
        />
      ))}

      {/* Root-level orphan files (e.g. images imported without a folder) */}
      {tree.files.map(file => (
        <FolderFileRow
          key={file.id}
          file={file}
          depth={0}
          isActive={file.id === activeFileId}
          onSelect={() => onSelectFile(file.id)}
          onDelete={onDeleteFile}
          onRename={onRenameFile}
          existingNames={existingNames}
        />
      ))}

      {/* Import pending form */}
      {pending && (
        <div className="folder-tree-import-form">
          <div className="folder-tree-import-filename">
            {pending.isImage ? <FileImage size={13} /> : <File size={13} />}
            <span>{pending.name}</span>
          </div>
          <form onSubmit={handleConfirm}>
            <label className="folder-tree-import-label">Folder</label>
            <input
              className="folder-tree-path-input"
              placeholder="e.g. images"
              value={folderPath}
              onChange={e => { setFolderPath(e.target.value); setImportError(''); }}
              onKeyDown={e => e.key === 'Escape' && handleCancel()}
              autoFocus
            />
            {previewPath && (
              <div className="folder-tree-path-preview" title={previewPath}>{previewPath}</div>
            )}
            {importError && <div className="folder-tree-error">{importError}</div>}
            <div className="folder-tree-import-btns">
              <button type="submit" className="folder-tree-btn-primary">Add</button>
              <button type="button" className="folder-tree-btn-secondary" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
