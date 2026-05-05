/**
 * @fileoverview Top toolbar: project name editor, project switcher dropdown,
 * file import/export actions, and the Run/Save buttons.
 *
 * The project name is displayed as a button that turns into an inline text
 * input on click, committing on blur or Enter and reverting on Escape.
 * The project switcher dropdown is driven by local state so it does not
 * pollute the global project store with transient UI concerns.
 */

import { useRef, useState } from 'react';
import {
  Code2, FilePlus2, FolderOpen, Download, Save, Play, ChevronDown,
} from 'lucide-react';
import './Toolbar.css';

/**
 * Application toolbar rendered at the top of the layout.
 *
 * @param {Object} props
 * @param {string} props.projectName - The current project's display name.
 * @param {Function} props.onProjectNameChange - Called with the trimmed new name when the student renames the project.
 * @param {Function} props.onNewProject - Called with a project name string to create a new project.
 * @param {Function} props.onSave - Called to manually persist the current project to localStorage.
 * @param {Function} props.onRun - Called when the Run button is clicked; typically switches to the preview tab.
 * @param {Function} props.onImport - Called with a browser File object when a .zip is selected for import.
 * @param {Function} props.onExport - Called to export the current project as a downloadable .zip file.
 * @param {string[]} props.savedProjectNames - Names of all projects saved in localStorage, used to populate the switcher dropdown.
 * @param {Function} props.onLoadProject - Called with a project name string to load a previously saved project.
 * @returns {JSX.Element}
 */
export default function Toolbar({
  projectName,
  onProjectNameChange,
  onNewProject,
  onSave,
  onRun,
  onImport,
  onExport,
  savedProjectNames,
  onLoadProject,
}) {
  const fileInputRef = useRef(null);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue]     = useState(projectName);
  const [showProjects, setShowProjects] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewInput, setShowNewInput]     = useState(false);

  /**
   * Commits the edited project name on blur, or reverts if unchanged/empty.
   */
  function handleNameBlur() {
    setEditingName(false);
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== projectName) {
      onProjectNameChange(trimmed);
    } else {
      // Revert to the current name if the student blanked the field or made no change
      setNameValue(projectName);
    }
  }

  /**
   * Submits on Enter and cancels on Escape without requiring the student to click away.
   * @param {React.KeyboardEvent} e
   */
  function handleNameKeyDown(e) {
    if (e.key === 'Enter') e.target.blur();
    if (e.key === 'Escape') { setNameValue(projectName); setEditingName(false); }
  }

  /** Opens the hidden file input so the browser's native file picker appears. */
  function handleImportClick() {
    fileInputRef.current.click();
  }

  /**
   * Passes the selected file to the parent and resets the input so the same
   * file can be re-imported if the student selects it again.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  }

  /**
   * Creates a new project with the name entered in the inline input,
   * then closes the dropdown and resets the input field.
   */
  function handleNewProject() {
    const name = newProjectName.trim() || 'my-project';
    onNewProject(name);
    setNewProjectName('');
    setShowNewInput(false);
    setShowProjects(false);
  }

  // Keep local name value in sync when the active project changes externally
  // (e.g. the student loads a different project via the switcher).
  if (nameValue !== projectName && !editingName) {
    setNameValue(projectName);
  }

  return (
    <header className="toolbar">
      {/* Left group */}
      <div className="toolbar-group toolbar-left">
        <img src="/images/codemonkey.png" alt="CodeMonkey Design" className="toolbar-logo" />

        {editingName ? (
          <input
            className="toolbar-name-input"
            value={nameValue}
            onChange={e => setNameValue(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            autoFocus
          />
        ) : (
          <button
            className="toolbar-name-btn"
            onClick={() => setEditingName(true)}
            title="Click to rename project"
          >
            {projectName}
          </button>
        )}

        {/* Project switcher */}
        <div className="toolbar-project-switcher">
          <button
            className="toolbar-btn toolbar-btn-icon"
            onClick={() => setShowProjects(v => !v)}
            title="Switch project"
          >
            <ChevronDown size={14} />
          </button>
          {showProjects && (
            <div className="toolbar-dropdown">
              <div className="toolbar-dropdown-header">Projects</div>
              {savedProjectNames.length === 0 && (
                <div className="toolbar-dropdown-empty">No saved projects</div>
              )}
              {savedProjectNames.map(name => (
                <button
                  key={name}
                  className={`toolbar-dropdown-item${name === projectName ? ' active' : ''}`}
                  onClick={() => { onLoadProject(name); setShowProjects(false); }}
                >
                  {name}
                </button>
              ))}
              <div className="toolbar-dropdown-divider" />
              {showNewInput ? (
                <div className="toolbar-new-project-row">
                  <input
                    className="toolbar-new-project-input"
                    placeholder="Project name…"
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleNewProject(); if (e.key === 'Escape') setShowNewInput(false); }}
                    autoFocus
                  />
                  <button className="toolbar-btn toolbar-btn-accent" onClick={handleNewProject}>Create</button>
                </div>
              ) : (
                <button className="toolbar-dropdown-item" onClick={() => setShowNewInput(true)}>
                  + New project…
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Centre group */}
      <div className="toolbar-group toolbar-centre">
        <button className="toolbar-btn" onClick={() => { setShowNewInput(true); setShowProjects(true); }} title="New project">
          <FilePlus2 size={16} />
          <span>New</span>
        </button>
        <button className="toolbar-btn" onClick={handleImportClick} title="Import .zip">
          <FolderOpen size={16} />
          <span>Import</span>
        </button>
        <button className="toolbar-btn" onClick={onExport} title="Export .zip">
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>

      {/* Right group */}
      <div className="toolbar-group toolbar-right">
        <button className="toolbar-btn" onClick={onSave} title="Save (Ctrl+S)">
          <Save size={16} />
          <span>Save</span>
        </button>
        <button className="toolbar-btn toolbar-btn-run" onClick={onRun} title="Run preview">
          <Play size={16} />
          <span>Run</span>
        </button>
      </div>

      {/* Hidden file input for zip import — triggered programmatically via handleImportClick */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </header>
  );
}
