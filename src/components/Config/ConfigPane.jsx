/**
 * @fileoverview Settings pane: editor preferences and project management.
 * Renders two sections: editor visual settings (font, theme, viewport width,
 * auto-save delay) and a project list with a create-new-project form.
 * All setting changes are forwarded immediately to the parent so they take
 * effect in the editor without the student needing to submit a form.
 */

import { useState, useEffect, useMemo } from 'react';
import { FolderOpen, Pencil, Download, Trash2, Check, X } from 'lucide-react';
import config from '../../config';
import './Config.css';

/** Conservative localStorage quota estimate — actual limit varies by browser (5–10 MB). */
const QUOTA_BYTES = 5 * 1024 * 1024;

/** Returns the total bytes consumed by all localStorage entries for this origin. */
function calcStorageBytes() {
  let bytes = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const val = localStorage.getItem(key) ?? '';
    bytes += (key.length + val.length) * 2; // UTF-16: 2 bytes per character
  }
  return bytes;
}

/** Returns the bytes used by a single named project's localStorage entry. */
function projectBytes(name) {
  const key = `${config.localStoragePrefix}${name}`;
  const val = localStorage.getItem(key) ?? '';
  return (key.length + val.length) * 2;
}

/** Formats a byte count as B / KB / MB. */
function formatBytes(bytes) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const FONT_FAMILIES = [
  { value: 'Courier New, monospace',  label: 'Courier New' },
  { value: 'Consolas, monospace',     label: 'Consolas' },
  { value: "'Fira Code', monospace",  label: 'Fira Code' },
  { value: 'monospace',               label: 'System Monospace' },
];

/**
 * Settings and project management pane displayed when the student selects the Settings tab.
 *
 * @param {Object} props
 * @param {Object} props.settings - Current editor/preview settings object.
 * @param {number} props.settings.fontSize - Editor font size in pixels (10–24).
 * @param {string} props.settings.fontFamily - CSS font-family string for the editor.
 * @param {string} props.settings.theme - Monaco theme identifier ('vs-dark' or 'vs').
 * @param {number} props.settings.mobileWidth - Mobile preview iframe width in pixels (320–768).
 * @param {number} props.settings.debounceMs - Auto-save debounce delay in milliseconds (250–2000).
 * @param {Function} props.onSettingsChange - Called with the complete updated settings object on any change.
 * @param {string} props.projectName - Name of the currently active project (highlighted in the list).
 * @param {string[]} props.savedProjects - Names of all projects saved in localStorage.
 * @param {Function} props.onNewProject - Called with a name string to create a new project.
 * @param {Function} props.onLoadProject - Called with a name string to switch to a saved project.
 * @param {import('../../hooks/useProject').ProjectFile[]} props.htmlFiles - HTML files in the project; shown in the preview root selector when there is more than one.
 * @param {string} props.previewRootFile - Filename of the current preview root HTML file.
 * @param {Function} props.onSetPreviewRoot - Called with a filename string to change the preview root.
 * @returns {JSX.Element}
 */
export default function ConfigPane({
  settings,
  onSettingsChange,
  projectName,
  savedProjects,
  onNewProject,
  onLoadProject,
  onRenameProject,
  onDeleteProject,
  onExportProject,
  htmlFiles,
  previewRootFile,
  onSetPreviewRoot,
}) {
  const [newProjectName, setNewProjectName] = useState('');
  const [renamingProject, setRenamingProject] = useState(null);
  const [renameValue, setRenameValue]         = useState('');
  const [confirmDelete, setConfirmDelete]     = useState(null);

  const { storageUsed, storagePct, sizes } = useMemo(() => {
    const used = calcStorageBytes();
    return {
      storageUsed: used,
      storagePct:  Math.min((used / QUOTA_BYTES) * 100, 100),
      sizes:       Object.fromEntries(savedProjects.map(n => [n, projectBytes(n)])),
    };
  }, [savedProjects]);
  const [motd, setMotd] = useState('');

  useEffect(() => {
    fetch('/MOTD.txt')
      .then(r => r.text())
      .then(setMotd)
      .catch(() => {});
  }, []);

  /**
   * Merges a single changed setting key into the current settings object and
   * forwards the result. Spreading the existing settings ensures unrelated
   * fields are not accidentally cleared.
   * @param {string} key - The settings key to update (e.g. 'fontSize').
   * @param {*} value - The new value for that key.
   */
  function update(key, value) {
    onSettingsChange({ ...settings, [key]: value });
  }

  /**
   * Creates a new project with the name entered in the input field,
   * then clears the input so the student can create another if needed.
   */
  function handleCreateProject() {
    const name = newProjectName.trim();
    if (name) {
      onNewProject(name);
      setNewProjectName('');
    }
  }

  function startRename(name) {
    setRenamingProject(name);
    setRenameValue(name);
    setConfirmDelete(null);
  }

  function commitRename(oldName) {
    const newName = renameValue.trim();
    if (newName && newName !== oldName) onRenameProject(oldName, newName);
    setRenamingProject(null);
  }

  return (
    <div className="config-pane">
      <h2 className="config-section-title">Editor Settings</h2>

      <div className="config-section">
        <div className="config-row">
          <label className="config-label" htmlFor="cfg-font-size">Font Size</label>
          <div className="config-control config-range-row">
            <input
              id="cfg-font-size"
              type="range"
              min={10}
              max={24}
              value={settings.fontSize}
              onChange={e => update('fontSize', Number(e.target.value))}
            />
            <span className="config-value-label">{settings.fontSize}px</span>
          </div>
        </div>

        <div className="config-row">
          <label className="config-label" htmlFor="cfg-font-family">Font Family</label>
          <select
            id="cfg-font-family"
            className="config-select"
            value={settings.fontFamily}
            onChange={e => update('fontFamily', e.target.value)}
          >
            {FONT_FAMILIES.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <div className="config-row">
          <label className="config-label" htmlFor="cfg-theme">Theme</label>
          <select
            id="cfg-theme"
            className="config-select"
            value={settings.theme}
            onChange={e => update('theme', e.target.value)}
          >
            <option value="vs-dark">Dark</option>
            <option value="vs">Light</option>
          </select>
        </div>

        <div className="config-row">
          <label className="config-label" htmlFor="cfg-mobile-width">Mobile Preview Width</label>
          <div className="config-control config-range-row">
            <input
              id="cfg-mobile-width"
              type="range"
              min={320}
              max={768}
              value={settings.mobileWidth}
              onChange={e => update('mobileWidth', Number(e.target.value))}
            />
            <span className="config-value-label">{settings.mobileWidth}px</span>
          </div>
        </div>

        <div className="config-row">
          <label className="config-label" htmlFor="cfg-debounce">Auto-save Delay</label>
          <div className="config-control config-range-row">
            <input
              id="cfg-debounce"
              type="range"
              min={250}
              max={2000}
              step={250}
              value={settings.debounceMs}
              onChange={e => update('debounceMs', Number(e.target.value))}
            />
            <span className="config-value-label">{settings.debounceMs}ms</span>
          </div>
        </div>

        {htmlFiles.length > 1 && (
          <div className="config-row">
            <label className="config-label" htmlFor="cfg-preview-root">Preview Root File</label>
            <select
              id="cfg-preview-root"
              className="config-select"
              value={previewRootFile}
              onChange={e => onSetPreviewRoot(e.target.value)}
            >
              {htmlFiles.map(f => (
                <option key={f.id} value={f.name}>{f.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <h2 className="config-section-title">Projects</h2>

      <div className="config-section">
        <div className="config-new-project">
          <input
            className="config-input"
            placeholder="New project name…"
            value={newProjectName}
            onChange={e => setNewProjectName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreateProject()}
          />
          <button
            className="config-btn config-btn-accent"
            onClick={handleCreateProject}
          >
            Create
          </button>
        </div>

        {savedProjects.length > 0 && (
          <div className="config-project-list">
            {savedProjects.map(name => {
              const isCurrent  = name === projectName;
              const isRenaming = renamingProject === name;
              const isPendingDelete = confirmDelete === name;
              return (
                <div key={name} className={`config-project-item${isCurrent ? ' current' : ''}`}>
                  {isRenaming ? (
                    <input
                      className="config-input config-project-rename-input"
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter')  commitRename(name);
                        if (e.key === 'Escape') setRenamingProject(null);
                      }}
                      onBlur={() => commitRename(name)}
                      autoFocus
                    />
                  ) : (
                    <span className="config-project-name">
                      {name}
                      <span className="config-project-size">{formatBytes(sizes[name] ?? 0)}</span>
                    </span>
                  )}

                  <div className="config-project-actions">
                    {!isRenaming && (
                      <>
                        {isCurrent
                          ? <span className="config-current-badge">Current</span>
                          : <button className="config-btn config-btn-icon" title="Load project" onClick={() => { onLoadProject(name); setConfirmDelete(null); }}><FolderOpen size={13} /></button>
                        }
                        <button className="config-btn config-btn-icon" title="Rename" onClick={() => startRename(name)}><Pencil size={13} /></button>
                        <button className="config-btn config-btn-icon" title="Export zip" onClick={() => onExportProject(name)}><Download size={13} /></button>
                        {isPendingDelete
                          ? <button className="config-btn config-btn-icon config-btn-danger" title="Confirm delete" onClick={() => { onDeleteProject(name); setConfirmDelete(null); }}><Check size={13} /></button>
                          : <button className="config-btn config-btn-icon config-btn-danger" title="Delete project" onClick={() => setConfirmDelete(name)}><Trash2 size={13} /></button>
                        }
                      </>
                    )}
                    {isRenaming && (
                      <>
                        <button className="config-btn config-btn-icon config-btn-accent" title="Save name" onMouseDown={() => commitRename(name)}><Check size={13} /></button>
                        <button className="config-btn config-btn-icon" title="Cancel" onMouseDown={() => setRenamingProject(null)}><X size={13} /></button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <h2 className="config-section-title">Storage</h2>
      <div className="config-section">
        <div className="config-storage-header">
          <span>localStorage usage</span>
          <span className="config-storage-label-right">
            {formatBytes(storageUsed)} <span className="config-storage-quota">of ~{formatBytes(QUOTA_BYTES)}</span>
          </span>
        </div>
        <div className="config-storage-bar">
          <div
            className={`config-storage-fill${storagePct > 80 ? ' danger' : storagePct > 60 ? ' warn' : ''}`}
            style={{ width: `${storagePct}%` }}
          />
        </div>
        {storagePct > 80 && (
          <p className="config-storage-warning">
            Storage is nearly full. Export and delete unused projects to free space.
          </p>
        )}
      </div>

      <h3>Recent Updates</h3>
      <div className="motd-para">This application is currently in development. 
        Please inform <a href="mailto:simonrundell@exe-coll.ac.uk">simonrundell@exe-coll.ac.uk</a> of any suggestions or bug reports.</div>
      <div className="motd-para">Recent updates include:</div>
      {motd && <div className="motd-para" dangerouslySetInnerHTML={{ __html: motd }} />}
    </div>
  );
}
