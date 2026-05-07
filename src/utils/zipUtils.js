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

/**
 * Imports a CodePen-exported zip file.
 *
 * CodePen zips contain `dist/` (standalone compiled page) and `src/` (raw source
 * files). This function reads only `src/` and wraps any body-only HTML content in
 * a full HTML5 boilerplate, linking whatever CSS and JS files were found alongside it.
 *
 * If the HTML file already has a `<!DOCTYPE` or `<html>` declaration it is used
 * as-is without additional wrapping.
 *
 * @param {File} zipFile - A browser File object obtained from an `<input type="file">`.
 * @param {string} [projectName='My Project'] - Used in the `<title>` of the generated HTML.
 * @returns {Promise<Array<{name: string, content: string, isImage?: boolean}>>}
 */
export async function importCodePenZip(zipFile, projectName = 'My Project') {
  const zip = await JSZip.loadAsync(zipFile);

  // Match only direct children of any src/ directory (e.g. pen-name/src/index.html)
  const srcEntries = Object.entries(zip.files).filter(
    ([path, entry]) =>
      !entry.dir &&
      /\/src\/[^/]+$/.test(path) &&
      !path.split('/').pop().startsWith('.') &&
      !path.includes('__MACOSX/')
  );

  if (srcEntries.length === 0) {
    throw new Error(
      'No files found in the src/ folder. Make sure this is a CodePen export zip.'
    );
  }

  const read = await Promise.all(
    srcEntries.map(async ([path, entry]) => {
      const filename = path.split('/').pop();
      if (isImageFile(filename)) {
        const ext = filename.split('.').pop().toLowerCase();
        const mime = IMAGE_MIME[ext] || 'application/octet-stream';
        const base64 = await entry.async('base64');
        return { filename, content: `data:${mime};base64,${base64}`, isImage: true };
      }
      try {
        const content = await entry.async('text');
        return { filename, content, isImage: false };
      } catch {
        console.warn(`Skipping binary file in src/: ${path}`); // eslint-disable-line no-console
        return null;
      }
    })
  );

  const valid = read.filter(Boolean);
  const cssFiles = valid.filter(f => !f.isImage && /\.css$/i.test(f.filename));
  const jsFiles  = valid.filter(f => !f.isImage && /\.js$/i.test(f.filename));

  return valid.map(entry => {
    if (entry.isImage) return { name: entry.filename, content: entry.content, isImage: true };

    if (/\.html?$/i.test(entry.filename)) {
      const trimmed = entry.content.trim();
      const isFullDoc = /^<!DOCTYPE/i.test(trimmed) || /^<html/i.test(trimmed);
      return {
        name: 'index.html',
        content: isFullDoc
          ? entry.content
          : buildCodePenHtml(entry.content, projectName, cssFiles, jsFiles),
      };
    }

    return { name: entry.filename, content: entry.content };
  });
}

/**
 * Wraps CodePen body-only HTML content in a full HTML5 boilerplate,
 * adding link and script tags for each CSS/JS file supplied.
 *
 * @param {string} bodyContent - Raw HTML that goes inside `<body>`.
 * @param {string} projectName - Used in `<title>`.
 * @param {{filename:string}[]} cssFiles - CSS files to add as `<link>` tags.
 * @param {{filename:string}[]} jsFiles  - JS files to add as `<script>` tags.
 * @returns {string} A complete HTML document string.
 */
function buildCodePenHtml(bodyContent, projectName, cssFiles, jsFiles) {
  const cssLinks  = cssFiles.map(f => `  <link rel="stylesheet" href="${f.filename}">`);
  const jsScripts = jsFiles.map(f => `  <script src="${f.filename}"></script>`);

  const headExtra  = cssLinks.length  ? '\n' + cssLinks.join('\n')        : '';
  const bodyScripts = jsScripts.length ? '\n' + jsScripts.join('\n') + '\n' : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>${headExtra}
</head>
<body>

${bodyContent.trim()}
${bodyScripts}
</body>
</html>`;
}
