/**
 * @fileoverview Central project state hook.
 * Manages files, active file selection, project name, and file CRUD operations.
 * All mutations go through updateProject so that every change is automatically
 * persisted to localStorage in a single consistent path.
 */

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { detectLanguage } from '../utils/languageDetect';
import {
  defaultHtml,
  defaultCss,
  defaultJs,
  blankHtml,
  blankCss,
  blankJs,
} from '../utils/defaultTemplates';
import config from '../config';

/**
 * @typedef {Object} ProjectFile
 * @property {string} id - UUID that uniquely identifies this file within the project.
 * @property {string} name - Filename or full relative path for images (e.g. "images/cat.png").
 * @property {string} content - Full text content, or a base64 data URL for image files.
 * @property {string} language - Monaco language ID (e.g. "html", "css", "javascript", "image").
 * @property {boolean} [isImage] - True for image files stored as base64 data URLs.
 */

/**
 * @typedef {Object} ProjectState
 * @property {string} projectName - Human-readable project name used as the localStorage key suffix.
 * @property {ProjectFile[]} files - All files belonging to this project.
 * @property {string} activeFileId - UUID of the file currently open in the editor.
 * @property {string} previewRootFile - Filename of the HTML file rendered in the preview iframe.
 */

/**
 * Creates the initial default project with index.html, style.css, and script.js.
 * @param {string} name - Project name shown in the toolbar and used as storage key.
 * @returns {ProjectState}
 */
function createDefaultProject(name) {
  const htmlId = uuidv4();
  const cssId  = uuidv4();
  const jsId   = uuidv4();
  return {
    projectName: name,
    files: [
      { id: htmlId, name: 'index.html', content: defaultHtml(name), language: 'html' },
      { id: cssId,  name: 'style.css',  content: defaultCss(),       language: 'css' },
      { id: jsId,   name: 'script.js',  content: defaultJs(),        language: 'javascript' },
    ],
    activeFileId: htmlId,
    previewRootFile: 'index.html',
  };
}

/**
 * Saves project state to localStorage.
 * Also updates the "lastProject" marker so the correct project is restored
 * on the next page load.
 * @param {ProjectState} state - The project state to serialise and store.
 */
/**
 * Saves project state to localStorage. Throws a DOMException (QuotaExceededError)
 * if the browser storage quota is full — callers are responsible for catching this.
 */
function saveToStorage(state) {
  const key = `${config.localStoragePrefix}${state.projectName}`;
  localStorage.setItem(key, JSON.stringify(state));
  localStorage.setItem(`${config.localStoragePrefix}lastProject`, state.projectName);
}

/**
 * Loads a project from localStorage by name.
 * @param {string} name - The project name (used as the key suffix).
 * @returns {ProjectState|null} The parsed project state, or null if not found.
 */
function loadFromStorage(name) {
  const key = `${config.localStoragePrefix}${name}`;
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Returns a list of all project names saved in localStorage.
 * Excludes the special "lastProject" and "settings" keys that share the same prefix.
 * @returns {string[]} Array of project name strings.
 */
export function getSavedProjectNames() {
  const prefix = config.localStoragePrefix;
  return Object.keys(localStorage)
    .filter(k => k.startsWith(prefix) && k !== `${prefix}lastProject` && k !== `${prefix}settings`)
    .map(k => k.replace(prefix, ''));
}

/**
 * useProject — main hook for project state management.
 *
 * On first render, attempts to restore the last-used project from localStorage.
 * Falls back to a fresh default project if nothing is stored.
 *
 * @returns {{
 *   project: ProjectState,
 *   activeFile: ProjectFile|undefined,
 *   updateActiveFileContent: (content: string) => void,
 *   setActiveFile: (fileId: string) => void,
 *   setPreviewRootFile: (filename: string) => void,
 *   addFile: (filename: string) => void,
 *   renameFile: (fileId: string, newName: string) => void,
 *   deleteFile: (fileId: string) => void,
 *   loadProject: (name: string) => void,
 *   newProject: (name: string) => void,
 *   renameProject: (newName: string) => void,
 *   importFiles: (files: Object[], projectName: string) => void,
 *   saveToStorage: () => void,
 * }}
 */
export function useProject() {
  const lastProject = localStorage.getItem(`${config.localStoragePrefix}lastProject`);
  const restored = lastProject ? loadFromStorage(lastProject) : null;

  const [project, setProject] = useState(
    restored || createDefaultProject(config.defaultProjectName)
  );

  /** Set when any save operation fails due to a full storage quota. */
  const [storageError, setStorageError] = useState(null);
  const clearStorageError = useCallback(() => setStorageError(null), []);

  /**
   * Central state updater. Applies an updater function or object, then immediately
   * persists the resulting state so storage is always in sync with React state.
   * If the quota is exceeded, storageError is set asynchronously (deferred via
   * setTimeout because setState must not be called inside a setProject updater).
   * @param {function(ProjectState): ProjectState | ProjectState} updater
   */
  const updateProject = useCallback((updater) => {
    setProject(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        saveToStorage(next);
      } catch (err) {
        setTimeout(() => setStorageError(err), 0);
      }
      return next;
    });
  }, []);

  /**
   * Updates the content of the currently active file.
   * @param {string} newContent - The full updated text of the file.
   */
  const updateActiveFileContent = useCallback((newContent) => {
    updateProject(prev => ({
      ...prev,
      files: prev.files.map(f =>
        f.id === prev.activeFileId ? { ...f, content: newContent } : f
      ),
    }));
  }, [updateProject]);

  /**
   * Sets the active file by ID, opening it in the editor.
   * @param {string} fileId - UUID of the file to make active.
   */
  const setActiveFile = useCallback((fileId) => {
    updateProject(prev => ({ ...prev, activeFileId: fileId }));
  }, [updateProject]);

  /**
   * Sets which HTML file is rendered in the preview iframe.
   * @param {string} filename - Filename of the HTML file to use as the preview root.
   */
  const setPreviewRootFile = useCallback((filename) => {
    updateProject(prev => ({ ...prev, previewRootFile: filename }));
  }, [updateProject]);

  /**
   * Adds a new file to the project.
   * Provides sensible starter content based on file extension, then switches
   * the editor to the newly created file.
   * @param {string} filename - Name including extension (e.g. "about.html").
   */
  const addFile = useCallback((filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    let content = '';
    if (ext === 'html' || ext === 'htm') content = blankHtml(filename);
    else if (ext === 'css') content = blankCss(filename);
    else if (ext === 'js') content = blankJs(filename);

    const newFile = {
      id: uuidv4(),
      name: filename,
      content,
      language: detectLanguage(filename),
    };
    updateProject(prev => ({
      ...prev,
      files: [...prev.files, newFile],
      activeFileId: newFile.id,
    }));
  }, [updateProject]);

  /**
   * Renames a file. Also updates previewRootFile if the renamed file was the root,
   * so the preview continues to point at the right document after a rename.
   * @param {string} fileId - UUID of the file to rename.
   * @param {string} newName - The new filename including extension.
   */
  const renameFile = useCallback((fileId, newName) => {
    updateProject(prev => ({
      ...prev,
      files: prev.files.map(f =>
        f.id === fileId
          ? { ...f, name: newName, language: detectLanguage(newName) }
          : f
      ),
      // Keep previewRootFile in sync when the root HTML file is renamed
      previewRootFile: prev.files.find(f => f.id === fileId)?.name === prev.previewRootFile
        ? newName
        : prev.previewRootFile,
    }));
  }, [updateProject]);

  /**
   * Deletes a file from the project. Falls back to the first remaining file
   * if the deleted file was currently active.
   * @param {string} fileId - UUID of the file to delete.
   */
  const deleteFile = useCallback((fileId) => {
    updateProject(prev => {
      const remaining = prev.files.filter(f => f.id !== fileId);
      // If the deleted file was active, fall back to the first remaining file
      const newActive = remaining.find(f => f.id === prev.activeFileId)
        ? prev.activeFileId
        : remaining[0]?.id;
      return { ...prev, files: remaining, activeFileId: newActive };
    });
  }, [updateProject]);

  /**
   * Loads a project by name from localStorage, replacing the current project in state.
   * @param {string} name - The project name to load.
   */
  const loadProject = useCallback((name) => {
    const loaded = loadFromStorage(name);
    if (loaded) setProject(loaded);
  }, []);

  /**
   * Creates a brand-new project with default starter files and saves it immediately.
   * @param {string} name - The name for the new project.
   */
  const newProject = useCallback((name) => {
    const fresh = createDefaultProject(name);
    setProject(fresh);
    try { saveToStorage(fresh); } catch (err) { setStorageError(err); }
  }, []);

  /**
   * Renames the current project, removing the old localStorage key so no orphan entry is left.
   * @param {string} newName - The new project name.
   */
  const renameProject = useCallback((newName) => {
    updateProject(prev => {
      localStorage.removeItem(`${config.localStoragePrefix}${prev.projectName}`);
      return { ...prev, projectName: newName };
    });
  }, [updateProject]);

  /**
   * Deletes a project from localStorage. If the deleted project is currently active,
   * switches to the first remaining saved project or falls back to a fresh default.
   * For non-current projects the caller must trigger a re-render externally.
   * @param {string} name - Name of the project to delete.
   */
  const deleteProject = useCallback((name) => {
    localStorage.removeItem(`${config.localStoragePrefix}${name}`);
    setProject(prev => {
      if (prev.projectName !== name) return prev;
      const remaining = getSavedProjectNames();
      if (remaining.length > 0) {
        const loaded = loadFromStorage(remaining[0]);
        if (loaded) {
          localStorage.setItem(`${config.localStoragePrefix}lastProject`, loaded.projectName);
          return loaded;
        }
      }
      const fresh = createDefaultProject(config.defaultProjectName);
      saveToStorage(fresh);
      return fresh;
    });
  }, []);

  /**
   * Replaces all files in the project with files imported from a zip archive.
   * Automatically selects the first HTML file as the active file and preview root.
   * @param {Object[]} importedFiles - Array of { name: string, content: string } objects.
   * @param {string} projectName - Name to assign to the newly imported project.
   */
  const importFiles = useCallback((importedFiles, projectName) => {
    const files = importedFiles.map(f => ({
      id: uuidv4(),
      name: f.name,
      content: f.content,
      language: detectLanguage(f.name),
      ...(f.isImage ? { isImage: true } : {}),
    }));
    const htmlFile =
      files.find(f => !f.isImage && f.name.toLowerCase() === 'index.html') ||
      files.find(f => !f.isImage && f.name.match(/\.html?$/i));
    const fresh = {
      projectName,
      files,
      activeFileId: htmlFile?.id || files[0]?.id,
      previewRootFile: htmlFile?.name || files[0]?.name,
    };
    setProject(fresh);
    try { saveToStorage(fresh); } catch (err) { setStorageError(err); }
  }, []);

  /**
   * Adds a single file imported from the user's filesystem (not from a zip).
   * The name may include a folder path (e.g. "images/cat.png"). If a file
   * with the same name already exists the call is a no-op.
   * @param {string} name - Full relative path, e.g. "images/cat.png".
   * @param {string} content - Text content or base64 data URL for images.
   * @param {boolean} [isImage] - True when the file is a binary image.
   */
  const addImportedFile = useCallback((name, content, isImage = false) => {
    updateProject(prev => {
      if (prev.files.some(f => f.name === name)) return prev;
      const newFile = {
        id: uuidv4(),
        name,
        content,
        language: detectLanguage(name),
        ...(isImage ? { isImage: true } : {}),
      };
      return { ...prev, files: [...prev.files, newFile] };
    });
  }, [updateProject]);

  const activeFile = project.files.find(f => f.id === project.activeFileId);

  return {
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
    saveToStorage: () => {
      try { saveToStorage(project); } catch (err) { setStorageError(err); }
    },
    storageError,
    clearStorageError,
  };
}
