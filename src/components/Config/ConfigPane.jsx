/**
 * @fileoverview Settings pane: editor preferences and project management.
 * Renders two sections: editor visual settings (font, theme, viewport width,
 * auto-save delay) and a project list with a create-new-project form.
 * All setting changes are forwarded immediately to the parent so they take
 * effect in the editor without the student needing to submit a form.
 */

import { useState } from 'react';
import './Config.css';

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
  htmlFiles,
  previewRootFile,
  onSetPreviewRoot,
}) {
  const [newProjectName, setNewProjectName] = useState('');

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
          <label className="config-label" htmlFor="cfg-theme">Editor Theme</label>
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
            {savedProjects.map(name => (
              <div key={name} className={`config-project-item${name === projectName ? ' current' : ''}`}>
                <span className="config-project-name">{name}</span>
                <div className="config-project-actions">
                  {name !== projectName && (
                    <button
                      className="config-btn"
                      onClick={() => onLoadProject(name)}
                    >
                      Load
                    </button>
                  )}
                  {name === projectName && (
                    <span className="config-current-badge">Current</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
