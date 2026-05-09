/**
 * @fileoverview Root application component.
 * Wires together all hooks and passes state down to AppLayout.
 * This is the single source of truth for settings, routing between tabs,
 * and coordinating project import/export errors.
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useProject, getSavedProjectNames } from './hooks/useProject';
import { usePreview } from './hooks/usePreview';
import { useContextualHelp } from './hooks/useContextualHelp';
import { useAutoSave } from './hooks/useAutoSave';
import AppLayout from './components/Layout/AppLayout';
import Modal from './components/Modal/Modal';
import { exportProjectZip, importProjectZip, importCodePenZip } from './utils/zipUtils';
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
  const [activeTab, setActiveTab]         = useState('editor');
  const [errorModal, setErrorModal]       = useState(null); // { title, message }
  const [isTeachingOpen, setIsTeachingOpen] = useState(false);

  const handleTeachingToggle = useCallback(
    () => setIsTeachingOpen(v => !v),
    [],
  );

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

  // Keep the HTML element's data-theme in sync so CSS variables cover the whole app.
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      settings.theme === 'vs' ? 'light' : 'dark',
    );
  }, [settings.theme]);

  const [projectListKey, setProjectListKey] = useState(0);
  const bumpProjectList = useCallback(() => setProjectListKey(k => k + 1), []);

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
    deleteProject,
    importFiles,
    addImportedFile,
    saveToStorage,
    storageError,
    clearStorageError,
  } = useProject();

  useEffect(() => {
    if (!storageError) return;
    setErrorModal({
      title: 'Storage full',
      message:
        'Your browser\'s localStorage quota is full — the last change could not be saved. ' +
        'Go to Settings and delete or export projects you no longer need to free up space.',
    });
    clearStorageError();
  }, [storageError, clearStorageError]);

  // Recomputes whenever a project is created, renamed, deleted, or the active project changes.
  const savedProjectNames = useMemo(
    () => getSavedProjectNames(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectListKey, project.projectName],
  );

  const { previewUrl } = usePreview(project.files, project.previewRootFile);

  // A ref that always holds the latest file list.  Used by the navigation
  // message handler below so it can look up files without being included in
  // that effect's dependency array (which would cause it to re-register on
  // every keystroke).  setPreviewRootFile / setActiveFile are already stable
  // useCallback refs, so the handler is registered exactly once.
  const filesRef = useRef(project.files);
  useEffect(() => { filesRef.current = project.files; }, [project.files]);

  /**
   * Handles `cm-navigate` postMessages sent by the nav-interceptor script
   * that blobPreview.js injects into every HTML blob.
   *
   * When the student clicks a relative link inside the preview iframe the
   * browser would normally try to navigate the blob: URL, which produces a
   * 404.  The interceptor prevents that default and posts the target href to
   * the parent window instead.  Here we:
   *   1. Strip any leading "./" from the href.
   *   2. Find the matching HTML file in the project.
   *   3. Update previewRootFile so usePreview rebuilds the preview for that page.
   *   4. Update activeFileId so the Monaco editor switches to that page's source.
   *
   * Non-HTML hrefs, external URLs, and hrefs with no matching project file
   * produce no visible effect (the postMessage is silently ignored).
   */
  useEffect(() => {
    function handleNavMessage(event) {
      if (!event.data || event.data.type !== 'cm-navigate') return;
      const href = String(event.data.href).replace(/^\.\//, '').trim();
      const target = filesRef.current.find(
        f => !f.isImage && f.name === href && /\.html?$/i.test(f.name)
      );
      if (!target) return;
      setPreviewRootFile(target.name);
      setActiveFile(target.id);
    }
    window.addEventListener('message', handleNavMessage);
    return () => window.removeEventListener('message', handleNavMessage);
  }, [setPreviewRootFile, setActiveFile]);

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
   * Exports any saved project by name, loading its files from localStorage.
   * @param {string} name - Project name to export.
   */
  const handleExportProject = useCallback((name) => {
    const raw = localStorage.getItem(`${config.localStoragePrefix}${name}`);
    if (!raw) return;
    const { projectName, files } = JSON.parse(raw);
    exportProjectZip(projectName, files);
  }, []);

  /**
   * Renames any saved project. For the active project, updates React state via
   * renameProject (which also cleans up the old localStorage key). For other
   * projects, manipulates localStorage directly and bumps the list version.
   * @param {string} oldName
   * @param {string} newName
   */
  const handleRenameProject = useCallback((oldName, newName) => {
    if (!newName || newName === oldName) return;
    if (oldName === project.projectName) {
      renameProject(newName);
    } else {
      const raw = localStorage.getItem(`${config.localStoragePrefix}${oldName}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        localStorage.setItem(
          `${config.localStoragePrefix}${newName}`,
          JSON.stringify({ ...parsed, projectName: newName }),
        );
        localStorage.removeItem(`${config.localStoragePrefix}${oldName}`);
      }
      bumpProjectList();
    }
  }, [project.projectName, renameProject, bumpProjectList]);

  /**
   * Deletes any saved project. For the active project, deleteProject switches
   * to another project (updating React state). For others, removes from
   * localStorage and bumps the list version to force a re-render.
   * @param {string} name - Project name to delete.
   */
  const handleDeleteProject = useCallback((name) => {
    deleteProject(name);
    if (name !== project.projectName) bumpProjectList();
  }, [deleteProject, project.projectName, bumpProjectList]);

  /**
   * Reads a .zip file chosen by the user and loads it as a new project.
   * Displays an error modal if the archive cannot be parsed.
   * @param {File} zipFile - The File object from the browser file-input.
   */
  const handleImport = useCallback(async (zipFile, isCodePen = false) => {
    try {
      const name = zipFile.name.replace(/\.zip$/i, '');
      const files = isCodePen
        ? await importCodePenZip(zipFile, name)
        : await importProjectZip(zipFile);
      importFiles(files, name);
    } catch (err) {
      console.error('Failed to import zip:', err);
      setErrorModal({
        title: 'Import failed',
        message: err.message || 'Could not read the zip file. Please make sure it is a valid .zip archive.',
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
      savedProjectNames={savedProjectNames}
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
      onRenameProject={handleRenameProject}
      onDeleteProject={handleDeleteProject}
      onExportProject={handleExportProject}
      onSettingsChange={handleSettingsChange}
      onImportFile={addImportedFile}
      isTeachingOpen={isTeachingOpen}
      onTeachingToggle={handleTeachingToggle}
    />
    <CMFloatAd color='#707070'/>
    </>
  );
}
