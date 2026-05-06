/**
 * @fileoverview Project import/export using JSZip.
 * Export: packages all project files into a .zip and triggers a browser download.
 * Import: reads a .zip chosen by the user and returns its contents as file objects.
 *
 * Image files are imported as base64 data URLs with their full zip path preserved,
 * so folder structure (e.g. images/cat.png) is maintained in the project.
 * Other binary files (fonts, etc.) are silently skipped.
 */

import JSZip from 'jszip';
import { isImageFile } from './languageDetect';

/**
 * Exports the current project files as a downloadable zip file.
 * Creates a temporary anchor element to trigger the download without navigating away.
 * The object URL is revoked immediately after the click to release memory.
 *
 * @param {string} projectName - Used as the downloaded zip filename (without extension).
 * @param {Object[]} files - Array of file objects: { name: string, content: string }.
 * @returns {Promise<void>}
 */
export async function exportProjectZip(projectName, files) {
  const zip = new JSZip();

  files.forEach(file => {
    if (file.isImage && typeof file.content === 'string' && file.content.startsWith('data:')) {
      // Strip the data URL header and write the raw base64 bytes
      const base64Data = file.content.split(',')[1];
      if (base64Data) zip.file(file.name, base64Data, { base64: true });
    } else {
      zip.file(file.name, file.content);
    }
  });

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const url = URL.createObjectURL(blob);

  // Trigger browser download via a programmatically clicked link
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** MIME types for image extensions, used when building base64 data URLs. */
const IMAGE_MIME = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp',
  ico: 'image/x-icon', bmp: 'image/bmp',
};

/**
 * Imports a zip file and returns its contents as file objects.
 *
 * Filtering rules applied before reading:
 * - Directory entries are excluded (they have no content).
 * - Hidden files (starting with '.') are excluded.
 * - macOS metadata entries under `__MACOSX/` are excluded.
 *
 * Image files (png, jpg, gif, svg, webp, ico, bmp) are read as base64 data URLs
 * and their full zip path is preserved as the file name so folder structure is
 * retained in the project (e.g. "images/cat.png" stays "images/cat.png").
 *
 * Text files are flattened to their final filename segment ("src/style.css" → "style.css").
 * Non-image binary files (fonts, etc.) are silently skipped.
 *
 * @param {File} zipFile - A browser File object obtained from an `<input type="file">`.
 * @returns {Promise<Array<{name: string, content: string, isImage?: boolean}>>}
 */
export async function importProjectZip(zipFile) {
  const zip = await JSZip.loadAsync(zipFile);
  const files = [];

  const fileEntries = Object.entries(zip.files).filter(
    ([path, entry]) =>
      !entry.dir &&
      !path.split('/').pop().startsWith('.') &&
      !path.includes('__MACOSX/')
  );

  const results = await Promise.all(
    fileEntries.map(async ([path, entry]) => {
      if (isImageFile(path)) {
        // Preserve full path for images; encode as base64 data URL
        const cleanPath = path.replace(/^\//, '');
        const ext = path.split('.').pop().toLowerCase();
        const mime = IMAGE_MIME[ext] || 'application/octet-stream';
        const base64 = await entry.async('base64');
        return { name: cleanPath, content: `data:${mime};base64,${base64}`, isImage: true };
      }

      // Text files: flatten subdirectories to final filename segment
      const name = path.includes('/') ? path.split('/').pop() : path;
      try {
        const content = await entry.async('text');
        return { name, content };
      } catch {
        // Skip non-image binary files (fonts, etc.)
        console.warn(`Skipping binary file: ${name}`); // eslint-disable-line no-console
        return null;
      }
    })
  );

  results.forEach(r => { if (r) files.push(r); });
  return files;
}
