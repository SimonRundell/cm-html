/**
 * @fileoverview Manages the preview iframe blob URL.
 * Rebuilds and refreshes the URL whenever project files change.
 * Blob URL cleanup is delegated to buildPreviewUrl, which revokes old URLs
 * before creating new ones to prevent memory leaks.
 */

import { useState, useEffect } from 'react';
import { buildPreviewUrl } from '../utils/blobPreview';

/**
 * Derives a blob: URL from the current project file state.
 * The URL is rebuilt on every change to `files` or `previewRootFile`, which
 * causes the iframe to reload with the latest student code.
 *
 * @param {import('../hooks/useProject').ProjectFile[]} files - All files in the project.
 * @param {string} previewRootFile - The filename of the HTML file to render as the root document.
 * @returns {{ previewUrl: string|null }} Object containing the current blob URL, or null if no HTML file exists.
 */
export function usePreview(files, previewRootFile) {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const url = buildPreviewUrl(files, previewRootFile);
    setPreviewUrl(url);
    // Cleanup: handled inside buildPreviewUrl (revokeAll called on each rebuild)
  }, [files, previewRootFile]);

  return { previewUrl };
}
