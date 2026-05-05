/**
 * @fileoverview Generates a blob: URL for the preview iframe from multi-file project state.
 * Rewrites relative CSS and JS references so the browser can resolve them inside the blob.
 *
 * Because blob: URLs are opaque to the browser's URL resolution logic, a plain
 * `href="style.css"` inside a blob HTML document would 404. This module converts
 * every known relative asset reference into its own blob URL before creating the
 * root HTML blob, so all assets load correctly inside the sandboxed iframe.
 */

/** @type {string[]} Tracks currently active blob URLs so they can be revoked on the next rebuild. */
let activeBlobUrls = [];

/**
 * Revokes all previously created blob URLs to free memory.
 * Called at the start of each rebuild so stale URLs don't accumulate.
 */
function revokeAll() {
  activeBlobUrls.forEach(url => URL.revokeObjectURL(url));
  activeBlobUrls = [];
}

/**
 * Creates a blob URL for a given string and MIME type. Registers the URL for
 * later revocation when the next preview build runs.
 * @param {string} content - File content string.
 * @param {string} mimeType - MIME type string, e.g. 'text/css'.
 * @returns {string} The new blob: URL.
 */
function createTrackedBlob(content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  activeBlobUrls.push(url);
  return url;
}

/**
 * Determines the MIME type from a filename's extension.
 * Falls back to 'text/plain' for unknown extensions.
 * @param {string} filename - The filename to inspect (e.g. "style.css").
 * @returns {string} A valid MIME type string.
 */
function mimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const map = {
    css: 'text/css',
    js: 'application/javascript',
    html: 'text/html',
    htm: 'text/html',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
  };
  return map[ext] || 'text/plain';
}

/**
 * Builds a preview blob URL from the current project file state.
 *
 * Steps:
 * 1. Revoke all previous blob URLs to avoid memory leaks.
 * 2. Create blob URLs for every non-HTML asset (CSS, JS, images, etc.).
 * 3. Rewrite `<link href>` and `<script src>` attributes in the HTML to point
 *    at those blob URLs so they resolve correctly inside the sandboxed iframe.
 * 4. Create and return a final blob URL for the modified HTML.
 *
 * Only relative references that have a matching project file are rewritten;
 * absolute URLs (http/https) and anchors (#) are left untouched.
 *
 * @param {Object[]} files - Array of project file objects: { name: string, content: string }.
 * @param {string} activeHtmlFilename - The filename of the HTML file to use as the root document.
 * @returns {string|null} A blob: URL string pointing at the rendered HTML, or null if no HTML file is found.
 */
export function buildPreviewUrl(files, activeHtmlFilename) {
  revokeAll();

  // Build a map of filename -> blob URL for all non-HTML files
  const assetBlobMap = {};
  files.forEach(file => {
    if (!file.name.match(/\.(html|htm)$/i)) {
      const mime = mimeType(file.name);
      assetBlobMap[file.name] = createTrackedBlob(file.content, mime);
    }
  });

  // Prefer the explicitly selected root file; fall back to the first HTML file found
  const htmlFile = files.find(f => f.name === activeHtmlFilename)
    || files.find(f => f.name.match(/\.(html|htm)$/i));

  if (!htmlFile) return null;

  // Rewrite HTML: replace relative href/src with blob URLs
  let htmlContent = htmlFile.content;

  // Replace <link href="filename.css"> references
  htmlContent = htmlContent.replace(
    /(<link[^>]+href=["'])([^"'#http][^"']*)["']/gi,
    (match, prefix, filename) => {
      const blobUrl = assetBlobMap[filename];
      return blobUrl ? `${prefix}${blobUrl}"` : match;
    }
  );

  // Replace <script src="filename.js"> references
  htmlContent = htmlContent.replace(
    /(<script[^>]+src=["'])([^"'#http][^"']*)["']/gi,
    (match, prefix, filename) => {
      const blobUrl = assetBlobMap[filename];
      return blobUrl ? `${prefix}${blobUrl}"` : match;
    }
  );

  // Create the final HTML blob and return its URL
  const htmlBlobUrl = createTrackedBlob(htmlContent, 'text/html');
  return htmlBlobUrl;
}
