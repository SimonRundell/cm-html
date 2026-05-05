/**
 * @fileoverview Root shell component. Renders the full application layout:
 * toolbar at the top, sidebar (file tree) on the left, and a tab-switched
 * main pane on the right that shows the editor, preview, or settings.
 *
 * AppLayout is a pure presentational component — it owns no state and
 * delegates all user actions upward via callback props.
 */

import Toolbar    from '../Toolbar/Toolbar';
import FileTree   from '../FileTree/FileTree';
import TabBar     from '../TabBar/TabBar';
import EditorPane from '../Editor/EditorPane';
import PreviewPane from '../Preview/PreviewPane';
import ConfigPane  from '../Config/ConfigPane';
import './AppLayout.css';

/**
 * Full-screen application shell that composes all major UI regions.
 *
 * @param {Object} props
 * @param {'editor'|'preview'|'config'} props.activeTab - Which main pane is currently visible.
 * @param {Function} props.onTabChange - Called with the new tab id when the student switches tabs.
 * @param {import('../../hooks/useProject').ProjectState} props.project - Current project state (files, name, etc.).
 * @param {import('../../hooks/useProject').ProjectFile|undefined} props.activeFile - The currently open file object.
 * @param {Object} props.settings - Editor and preview settings (fontSize, fontFamily, theme, mobileWidth, debounceMs).
 * @param {string|null} props.previewUrl - Blob URL for the preview iframe, or null if no HTML file exists.
 * @param {Object} props.helpState - Return value of useContextualHelp; passed directly to EditorPane.
 * @param {string[]} props.savedProjectNames - Names of all projects saved in localStorage.
 * @param {Function} props.onFileSelect - Called with a file UUID when the student clicks a file in the tree.
 * @param {Function} props.onFileAdd - Called with a filename string when the student creates a new file.
 * @param {Function} props.onFileRename - Called with (fileId, newName) when a file is renamed.
 * @param {Function} props.onFileDelete - Called with a file UUID when a file is deleted.
 * @param {Function} props.onPreviewRootChange - Called with a filename string to set the preview root HTML file.
 * @param {Function} props.onContentChange - Called with the new file content string on every editor change.
 * @param {Function} props.onKeywordSelect - Called with a keyword string when the student selects text in the editor.
 * @param {Function} props.onRun - Called when the student clicks the Run button; switches to preview tab.
 * @param {Function} props.onSave - Called to manually trigger a localStorage save.
 * @param {Function} props.onExport - Called to download the project as a .zip file.
 * @param {Function} props.onImport - Called with a File object when the student imports a .zip.
 * @param {Function} props.onNewProject - Called with a project name string to create a fresh project.
 * @param {Function} props.onLoadProject - Called with a project name string to load a saved project.
 * @param {Function} props.onProjectRename - Called with a new name string to rename the current project.
 * @param {Function} props.onSettingsChange - Called with the updated settings object when any setting changes.
 * @returns {JSX.Element}
 */
export default function AppLayout({
  activeTab,
  onTabChange,
  project,
  activeFile,
  settings,
  previewUrl,
  helpState,
  savedProjectNames,
  onFileSelect,
  onFileAdd,
  onFileRename,
  onFileDelete,
  onPreviewRootChange,
  onContentChange,
  onKeywordSelect,
  onRun,
  onSave,
  onExport,
  onImport,
  onNewProject,
  onLoadProject,
  onProjectRename,
  onSettingsChange,
}) {
  // Pre-filter HTML files once so both PreviewPane and ConfigPane receive the same list
  const htmlFiles = project.files.filter(f => f.name.match(/\.html?$/i));

  return (
    <div className="app-layout">
      <Toolbar
        projectName={project.projectName}
        onProjectNameChange={onProjectRename}
        onNewProject={onNewProject}
        onSave={onSave}
        onRun={onRun}
        onImport={onImport}
        onExport={onExport}
        savedProjectNames={savedProjectNames}
        onLoadProject={onLoadProject}
      />
      <div className="app-body">
        <FileTree
          files={project.files}
          activeFileId={project.activeFileId}
          onSelectFile={onFileSelect}
          onAddFile={onFileAdd}
          onRenameFile={onFileRename}
          onDeleteFile={onFileDelete}
          previewRootFile={project.previewRootFile}
          onSetPreviewRoot={onPreviewRootChange}
        />
        <div className="app-content">
          <TabBar
            activeTab={activeTab}
            onTabChange={onTabChange}
            activeFileName={activeFile?.name || ''}
          />
          <div className="app-pane">
            {activeTab === 'preview' && (
              <PreviewPane
                previewUrl={previewUrl}
                previewRootFile={project.previewRootFile}
                files={project.files}
                htmlFiles={htmlFiles}
                onSetRootFile={onPreviewRootChange}
                settings={settings}
              />
            )}
            {activeTab === 'editor' && (
              <EditorPane
                file={activeFile}
                onChange={onContentChange}
                onKeywordSelect={onKeywordSelect}
                helpDrawerOpen={helpState.isOpen}
                helpState={helpState}
                onCloseHelp={helpState.closeDrawer}
                onManualSearch={helpState.manualSearch}
                editorSettings={{
                  fontSize:   settings.fontSize,
                  fontFamily: settings.fontFamily,
                  theme:      settings.theme,
                }}
                onSave={onSave}
              />
            )}
            {activeTab === 'config' && (
              <ConfigPane
                settings={settings}
                onSettingsChange={onSettingsChange}
                projectName={project.projectName}
                savedProjects={savedProjectNames}
                onNewProject={onNewProject}
                onLoadProject={onLoadProject}
                htmlFiles={htmlFiles}
                previewRootFile={project.previewRootFile}
                onSetPreviewRoot={onPreviewRootChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
