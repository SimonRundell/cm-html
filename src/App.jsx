/**
 * @fileoverview Root application component.
 * Wires together all hooks and passes state down to AppLayout.
 * This is the single source of truth for settings, routing between tabs,
 * and coordinating project import/export errors.
 */

import { useState, useCallback } from 'react';
import { useProject, getSavedProjectNames } from './hooks/useProject';
import { usePreview } from './hooks/usePreview';
import { useContextualHelp } from './hooks/useContextualHelp';
import { useAutoSave } from './hooks/useAutoSave';
import AppLayout from './components/Layout/AppLayout';
import Modal from './components/Modal/Modal';
import { exportProjectZip, importProjectZip } from './utils/zipUtils';
import CMFloatAd from './cmFloatAd';
import config from './config';
import './index.css';

/**
 * Root component. Holds global UI state (active tab, error modal, user settings)
 * and delegates project state to useProject.
 *
 * @returns {JSX.Element}
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('editor');
  const [errorModal, setErrorModal] = useState(null); // { title, message }

  // Settings are persisted to localStorage so they survive page reloads.
  // The initialiser function runs only once; the catch guard handles
  // corrupted or missing storage entries.
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(`${config.localStoragePrefix}settings`);
      return saved ? JSON.parse(saved) : {
        fontSize:    config.defaultFontSize,
        fontFamily:  config.defaultFontFamily,
        theme:       config.defaultTheme,
        mobileWidth: config.defaultMobileWidth,
        autoSave:    true,
        debounceMs:  config.debounceMs,
      };
    } catch {
      return {
        fontSize:    config.defaultFontSize,
        fontFamily:  config.defaultFontFamily,
        theme:       config.defaultTheme,
        mobileWidth: config.defaultMobileWidth,
        autoSave:    true,
        debounceMs:  config.debounceMs,
      };
    }
  });

  const {
    project,
    activeFile,
    updateActiveFileContent,
    setActiveFile,
    setPreviewRootFile,
    addFile,
    renameFile,
    deleteFile,
    loadProject,
    newProject,
    renameProject,
    importFiles,
    saveToStorage,
  } = useProject();

  const { previewUrl } = usePreview(project.files, project.previewRootFile);

  const help = useContextualHelp();

  // Auto-save on active file content changes
  useAutoSave(saveToStorage, activeFile?.content, settings.debounceMs);

  /**
   * Forwards the editor's selected-text event into the help system.
   * Wrapped in useCallback so child components don't re-render unnecessarily.
   * @param {string} keyword - The word or token the student selected.
   */
  const handleKeywordSelect = useCallback((keyword) => {
    help.lookupKeyword(keyword);
  }, [help]);

  /**
   * Switches to the preview tab when the student clicks "Run".
   */
  const handleRun = useCallback(() => {
    setActiveTab('preview');
  }, []);

  /**
   * Triggers a browser download of the current project as a .zip archive.
   */
  const handleExport = useCallback(() => {
    exportProjectZip(project.projectName, project.files);
  }, [project]);

  /**
   * Reads a .zip file chosen by the user and loads it as a new project.
   * Displays an error modal if the archive cannot be parsed.
   * @param {File} zipFile - The File object from the browser file-input.
   */
  const handleImport = useCallback(async (zipFile) => {
    try {
      const files = await importProjectZip(zipFile);
      const name = zipFile.name.replace(/\.zip$/i, '');
      importFiles(files, name);
    } catch (err) {
      console.error('Failed to import zip:', err);
      setErrorModal({
        title: 'Import failed',
        message: 'Could not read the zip file. Please make sure it is a valid .zip archive.',
      });
    }
  }, [importFiles]);

  /**
   * Persists updated settings to state and localStorage.
   * A try/catch is required because localStorage can throw when the quota
   * is exceeded on some browsers.
   * @param {Object} newSettings - The complete settings object to store.
   */
  const handleSettingsChange = useCallback((newSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(
        `${config.localStoragePrefix}settings`,
        JSON.stringify(newSettings),
      );
    } catch (err) {
      // localStorage quota exceeded
      console.warn('Could not save settings:', err);
    }
  }, []);

  return (
    <>
      <CMFloatAd />
      <Modal
        isOpen={!!errorModal}
        title={errorModal?.title ?? ''}
        message={errorModal?.message ?? ''}
        type="alert"
        confirmLabel="OK"
        onConfirm={() => setErrorModal(null)}
      />
      <AppLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        project={project}
        activeFile={activeFile}
      settings={settings}
      previewUrl={previewUrl}
      helpState={help}
      savedProjectNames={getSavedProjectNames()}
      onFileSelect={setActiveFile}
      onFileAdd={addFile}
      onFileRename={renameFile}
      onFileDelete={deleteFile}
      onPreviewRootChange={setPreviewRootFile}
      onContentChange={updateActiveFileContent}
      onKeywordSelect={handleKeywordSelect}
      onRun={handleRun}
      onSave={saveToStorage}
      onExport={handleExport}
      onImport={handleImport}
      onNewProject={newProject}
      onLoadProject={loadProject}
      onProjectRename={renameProject}
      onSettingsChange={handleSettingsChange}
    />
    <CMFloatAd color='#707070'/>
    </>
  );
}
