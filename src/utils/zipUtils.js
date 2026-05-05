/**
 * @fileoverview Project import/export using JSZip.
 * Export: packages all project files into a .zip and triggers a browser download.
 * Import: reads a .zip chosen by the user and returns its contents as file objects.
 *
 * Binary files (images, fonts, etc.) are silently skipped during import because
 * the editor can only work with text-based source files.
 */

import JSZip from 'jszip';

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
    zip.file(file.name, file.content);
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

/**
 * Imports a zip file and returns its contents as an array of text file objects.
 *
 * Filtering rules applied before reading:
 * - Directory entries are excluded (they have no content).
 * - Hidden files (starting with '.') are excluded.
 * - macOS metadata entries under `__MACOSX/` are excluded.
 * - Files whose content cannot be decoded as UTF-8 text (e.g. images) are skipped
 *   with a console warning rather than causing the whole import to fail.
 *
 * Subdirectory paths inside the zip are flattened: only the final filename segment
 * is used, so "src/style.css" becomes "style.css" in the project.
 *
 * @param {File} zipFile - A browser File object obtained from an `<input type="file">`.
 * @returns {Promise<Array<{name: string, content: string}>>} Array of readable text files.
 */
export async function importProjectZip(zipFile) {
  const zip = await JSZip.loadAsync(zipFile);
  const files = [];

  const fileEntries = Object.entries(zip.files).filter(
    ([path, entry]) => !entry.dir && !path.startsWith('.') && !path.includes('/__MACOSX/')
  );

  const results = await Promise.all(
    fileEntries.map(async ([path, entry]) => {
      // Flatten subdirectories: only keep the final filename component
      const name = path.includes('/') ? path.split('/').pop() : path;
      try {
        const content = await entry.async('text');
        return { name, content };
      } catch {
        // Skip binary files (images, etc.) that cannot be read as text
        console.warn(`Skipping binary file: ${name}`); // eslint-disable-line no-console
        return null;
      }
    })
  );

  results.forEach(r => { if (r) files.push(r); });
  return files;
}
