/**
 * @fileoverview Preview pane: renders the student's project in a sandboxed iframe.
 * Supports desktop and mobile viewport modes, HTML file selection, and refresh.
 *
 * The iframe uses a `key` that combines the blob URL with a manual refresh counter
 * so the student can force a reload without changing any file content.
 *
 * Sandbox policy: scripts and same-origin access are permitted (required for blob:
 * URL resolution). Popups and presentation are also allowed so that third-party
 * embeds such as YouTube iframes function correctly inside student pages.
 *
 * Permissions Policy (`allow` attribute): common media capabilities
 * (autoplay, encrypted-media, fullscreen, etc.) are delegated to all nested
 * frames so that embedded players — YouTube, Vimeo, etc. — can operate normally.
 * Without this delegation the browser denies those features to cross-origin nested
 * iframes by default, causing player errors even when sandbox is permissive.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { RefreshCw, ExternalLink, Monitor, Smartphone, ArrowLeft, ArrowRight } from 'lucide-react';
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

  // iframe navigation history tracking
  const iframeRef      = useRef(null);
  const navHistoryRef  = useRef([]);
  const navIndexRef    = useRef(-1);
  const pendingNavRef  = useRef(false);
  const [canGoBack,    setCanGoBack]    = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  // Reset navigation history whenever the preview rebuilds
  useEffect(() => {
    navHistoryRef.current = [];
    navIndexRef.current   = -1;
    pendingNavRef.current = false;
    setCanGoBack(false);
    setCanGoForward(false);
  }, [previewUrl, refreshKey]);

  /** Called on every iframe load — records new pages or updates buttons after back/forward. */
  const handleIframeLoad = useCallback(() => {
    if (pendingNavRef.current) {
      // A programmatic back/forward just completed — update buttons, don't push history.
      pendingNavRef.current = false;
      setCanGoBack(navIndexRef.current > 0);
      setCanGoForward(navIndexRef.current < navHistoryRef.current.length - 1);
      return;
    }
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const url = iframe.contentWindow.location.href;
      // Truncate any forward entries and push the new URL
      navHistoryRef.current = [...navHistoryRef.current.slice(0, navIndexRef.current + 1), url];
      navIndexRef.current   = navHistoryRef.current.length - 1;
      setCanGoBack(navIndexRef.current > 0);
      setCanGoForward(false);
    } catch {
      // Cross-origin restriction — can't read location; leave buttons as-is.
    }
  }, []);

  const handleBack = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || navIndexRef.current <= 0) return;
    navIndexRef.current  -= 1;
    pendingNavRef.current = true;
    iframe.contentWindow.history.back();
  }, []);

  const handleForward = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || navIndexRef.current >= navHistoryRef.current.length - 1) return;
    navIndexRef.current  += 1;
    pendingNavRef.current = true;
    iframe.contentWindow.history.forward();
  }, []);

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
        {/* Back / Forward navigation */}
        <button
          className="preview-toolbar-btn"
          onClick={handleBack}
          disabled={!canGoBack}
          title="Go back"
        >
          <ArrowLeft size={14} />
        </button>
        <button
          className="preview-toolbar-btn"
          onClick={handleForward}
          disabled={!canGoForward}
          title="Go forward"
        >
          <ArrowRight size={14} />
        </button>

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
            ref={iframeRef}
            src={previewUrl}
            onLoad={handleIframeLoad}
            className={`preview-frame${isMobile ? ' mobile-mode' : ''}`}
            style={isMobile ? { width: `${mobileWidth}px` } : { width: '100%' }}
            sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
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
