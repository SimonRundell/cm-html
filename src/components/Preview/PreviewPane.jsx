/**
 * @fileoverview Preview pane: renders the student's project in a sandboxed iframe.
 * Supports desktop and mobile viewport modes, HTML file selection, and refresh.
 *
 * The iframe uses a `key` that combines the blob URL with a manual refresh counter
 * so the student can force a reload without changing any file content. The sandbox
 * attribute permits scripts and same-origin access (needed for blob: URLs) while
 * blocking navigation and top-level frame access for safety.
 */

import { useState, useCallback } from 'react';
import { RefreshCw, ExternalLink, Monitor, Smartphone } from 'lucide-react';
import './Preview.css';

/**
 * Renders the project preview inside a sandboxed iframe with viewport controls.
 *
 * @param {Object} props
 * @param {string|null} props.previewUrl - Blob URL of the current HTML root document, or null if none exists.
 * @param {string} props.previewRootFile - Filename of the HTML file currently set as the preview root.
 * @param {import('../../hooks/useProject').ProjectFile[]} props.files - All project files (currently unused directly; reserved for future use).
 * @param {import('../../hooks/useProject').ProjectFile[]} props.htmlFiles - Subset of HTML files, used to populate the root-file picker.
 * @param {Function} props.onSetRootFile - Called with a filename string when the student changes the root file via the picker.
 * @param {Object} props.settings - Application settings object.
 * @param {number} props.settings.mobileWidth - Width in pixels for the mobile viewport simulation (default 375).
 * @returns {JSX.Element}
 */
export default function PreviewPane({
  previewUrl,
  previewRootFile,
  files,
  htmlFiles,
  onSetRootFile,
  settings,
}) {
  const [isMobile, setIsMobile]   = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const mobileWidth = settings?.mobileWidth || 375;

  /**
   * Increments the refresh key, which is included in the iframe's `key` prop,
   * causing React to unmount and remount the iframe without changing the blob URL.
   */
  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  /**
   * Opens the current preview blob URL in a new browser tab so students can
   * inspect it with DevTools or share the link temporarily.
   */
  const handleOpenInTab = useCallback(() => {
    if (previewUrl) window.open(previewUrl, '_blank');
  }, [previewUrl]);

  return (
    <div className="preview-pane">
      <div className="preview-toolbar">
        {/* HTML file picker */}
        {htmlFiles.length > 1 && (
          <select
            className="preview-file-select"
            value={previewRootFile}
            onChange={e => onSetRootFile(e.target.value)}
          >
            {htmlFiles.map(f => (
              <option key={f.id} value={f.name}>{f.name}</option>
            ))}
          </select>
        )}

        {/* Viewport controls */}
        <div className="preview-viewport-controls">
          <button
            className={`preview-toolbar-btn${!isMobile ? ' active' : ''}`}
            onClick={() => setIsMobile(false)}
            title="Desktop view"
          >
            <Monitor size={14} />
          </button>
          <button
            className={`preview-toolbar-btn${isMobile ? ' active' : ''}`}
            onClick={() => setIsMobile(true)}
            title={`Mobile view (${mobileWidth}px)`}
          >
            <Smartphone size={14} />
          </button>
          {isMobile && (
            <span className="preview-width-label">{mobileWidth}px</span>
          )}
        </div>

        <div className="preview-toolbar-spacer" />

        <button className="preview-toolbar-btn" onClick={handleRefresh} title="Refresh preview">
          <RefreshCw size={14} />
        </button>
        <button className="preview-toolbar-btn" onClick={handleOpenInTab} title="Open in new tab">
          <ExternalLink size={14} />
        </button>
      </div>

      <div className="preview-frame-container">
        {previewUrl ? (
          <iframe
            key={`${previewUrl}-${refreshKey}`}
            src={previewUrl}
            className={`preview-frame${isMobile ? ' mobile-mode' : ''}`}
            style={isMobile ? { width: `${mobileWidth}px` } : { width: '100%' }}
            sandbox="allow-scripts allow-same-origin allow-modals allow-forms"
            title="Preview"
          />
        ) : (
          <div className="preview-empty">
            <p>No HTML file found in the project.</p>
          </div>
        )}
      </div>
    </div>
  );
}
