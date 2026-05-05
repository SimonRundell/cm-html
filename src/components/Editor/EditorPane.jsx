/**
 * @fileoverview Editor pane: Monaco code editor with a slide-in help drawer overlay.
 * Composes CodeEditor and HelpDrawer into a single flex container so the
 * drawer slides over the editor without changing the editor's layout dimensions.
 */

import CodeEditor from './CodeEditor';
import HelpDrawer from '../HelpDrawer/HelpDrawer';
import './Editor.css';

/**
 * Composes the Monaco code editor with the contextual help drawer.
 *
 * @param {Object} props
 * @param {import('../../hooks/useProject').ProjectFile|undefined} props.file - File currently open in the editor, or undefined if no file is selected.
 * @param {Function} props.onChange - Forwarded to CodeEditor; called with updated content string on each change.
 * @param {Function} props.onKeywordSelect - Forwarded to CodeEditor; called with selected text to trigger a help lookup.
 * @param {boolean} props.helpDrawerOpen - Whether the help drawer is currently visible.
 * @param {Object} props.helpState - Full return value of useContextualHelp, passed through to HelpDrawer.
 * @param {Function} props.onCloseHelp - Called when the student closes the help drawer.
 * @param {Function} props.onManualSearch - Called with a query string when the student submits the drawer search form.
 * @param {Object} props.editorSettings - Visual settings forwarded to CodeEditor (fontSize, fontFamily, theme).
 * @param {number} props.editorSettings.fontSize - Font size in pixels.
 * @param {string} props.editorSettings.fontFamily - CSS font-family string.
 * @param {string} props.editorSettings.theme - Monaco theme identifier.
 * @param {Function} props.onSave - Forwarded to CodeEditor; called on Ctrl+S.
 * @returns {JSX.Element}
 */
export default function EditorPane({
  file,
  onChange,
  onKeywordSelect,
  helpDrawerOpen,
  helpState,
  onCloseHelp,
  onManualSearch,
  editorSettings,
  onSave,
}) {
  return (
    <div className="editor-pane">
      <CodeEditor
        file={file}
        onChange={onChange}
        onSelectionChange={onKeywordSelect}
        settings={editorSettings}
        onSave={onSave}
      />
      <HelpDrawer
        isOpen={helpDrawerOpen}
        onClose={onCloseHelp}
        helpEntry={helpState.helpEntry}
        mdnResults={helpState.mdnResults}
        isLoading={helpState.isLoading}
        searchQuery={helpState.searchQuery}
        onSearch={onManualSearch}
      />
    </div>
  );
}
