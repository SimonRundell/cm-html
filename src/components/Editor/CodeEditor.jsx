/**
 * @fileoverview Monaco editor wrapper.
 * Handles selection-based keyword detection for contextual help and the Ctrl+S save shortcut.
 *
 * A `key={file.id}` prop is applied to the MonacoEditor so React destroys and
 * recreates the editor instance when the active file changes. This prevents Monaco
 * from trying to merge undo/redo histories between incompatible file types.
 */

import { useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';

/**
 * Thin wrapper around the `@monaco-editor/react` component that wires up
 * selection-to-help-drawer and Ctrl+S keyboard handling.
 *
 * @param {Object} props
 * @param {import('../../hooks/useProject').ProjectFile} props.file - The file whose content and language are displayed.
 * @param {Function} props.onChange - Called with the updated content string on every editor change.
 * @param {Function} props.onSelectionChange - Called with the selected text string when the student highlights 2–40 non-whitespace characters.
 * @param {Object} props.settings - Visual editor settings applied to Monaco options.
 * @param {number} props.settings.fontSize - Font size in pixels.
 * @param {string} props.settings.fontFamily - CSS font-family string.
 * @param {string} props.settings.theme - Monaco theme identifier (e.g. 'vs-dark', 'vs').
 * @param {Function} props.onSave - Called when the student presses Ctrl+S / Cmd+S.
 * @returns {JSX.Element}
 */
export default function CodeEditor({ file, onChange, onSelectionChange, settings, onSave }) {
  const editorRef = useRef(null);

  const monacoOptions = {
    fontSize:              settings.fontSize,
    fontFamily:            settings.fontFamily,
    minimap:               { enabled: false },
    wordWrap:              'on',
    lineNumbers:           'on',
    scrollBeyondLastLine:  false,
    automaticLayout:       true,
    tabSize:               2,
    insertSpaces:          true,
    formatOnPaste:         true,
    suggest:               { preview: true },
    quickSuggestions:      { other: true, comments: false, strings: true },
    scrollbar:             { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
  };

  /**
   * Called once by MonacoEditor after the editor instance is ready.
   * Registers the selection listener and the Ctrl+S command here rather than
   * in useEffect because the Monaco API is only available after mount.
   * @param {import('monaco-editor').editor.IStandaloneCodeEditor} editor
   * @param {typeof import('monaco-editor')} monaco
   */
  function handleMount(editor, monaco) {
    editorRef.current = editor;

    // Selection-based contextual help: only trigger for short single-token selections
    // (2–40 chars, no whitespace) to avoid noisy lookups on multi-line selections.
    editor.onDidChangeCursorSelection((e) => {
      const selection = editor.getModel()?.getValueInRange(e.selection);
      const trimmed = (selection || '').trim();
      if (trimmed.length >= 2 && trimmed.length <= 40 && !/\s/.test(trimmed)) {
        onSelectionChange(trimmed);
      }
    });

    // Ctrl+S / Cmd+S save — intercept the key before the browser's default save dialog
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => onSave(),
    );
  }

  if (!file) {
    return <div className="code-editor-empty">No file selected.</div>;
  }

  return (
    <MonacoEditor
      height="100%"
      language={file.language}
      value={file.content}
      theme={settings.theme || 'vs-dark'}
      options={monacoOptions}
      onChange={onChange}
      onMount={handleMount}
      // key forces a new editor instance when the active file changes so Monaco
      // does not attempt to merge incompatible undo/redo histories across files
      key={file.id}
    />
  );
}
