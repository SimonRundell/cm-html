/**
 * @fileoverview Generates a blob: URL for the preview iframe from multi-file project state.
 *
 * Asset resolution runs in three ordered passes before the HTML is processed:
 *
 *   1. Images — stored as base64 data URLs; used directly (no new blob created).
 *   2. CSS    — `url()` references rewritten to resolved image values, then a
 *               blob URL is created for the processed CSS.
 *   3. Other  — JS, JSON, and remaining non-HTML files converted to blob URLs.
 *
 * The HTML file then has its `<link href>`, `<script src>`, and `<img src>`
 * attributes rewritten to blob/data URLs so all assets load inside the iframe.
 *
 * A nav-interceptor `<script>` is also injected into the bottom of every HTML
 * blob.  It listens (capture phase) for clicks on relative anchor links and
 * posts a `{ type: 'cm-navigate', href }` message to the parent window instead
 * of allowing the browser to navigate (which would 404 against a blob URL).
 * App.jsx listens for these messages to drive multi-page preview navigation.
 *
 * All created blob URLs are tracked and revoked on the next rebuild to prevent
 * memory leaks.
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
 * 2. Map image files using their stored base64 data URLs directly (no blob needed).
 * 3. Create blob URLs for CSS files, rewriting any url() references to image data URLs.
 * 4. Create blob URLs for remaining non-HTML assets (JS, etc.).
 * 5. Rewrite `<link href>`, `<script src>`, and `<img src>` in the HTML.
 * 6. Return a blob URL for the final HTML.
 *
 * Only relative references that have a matching project file are rewritten;
 * absolute URLs (http/https, data:, //) are left untouched.
 *
 * @param {Object[]} files - Array of project file objects.
 * @param {string} activeHtmlFilename - The filename of the HTML file to use as the root document.
 * @returns {string|null} A blob: URL string pointing at the rendered HTML, or null if no HTML file is found.
 */
export function buildPreviewUrl(files, activeHtmlFilename) {
  revokeAll();

  const assetBlobMap = {};

  // Pass 1: images — already stored as data URLs, use directly
  files.forEach(file => {
    if (file.isImage) {
      assetBlobMap[file.name] = file.content;
    }
  });

  // Pass 2: CSS — create blob URLs after rewriting url() image references
  files.forEach(file => {
    if (file.name.match(/\.css$/i)) {
      const cssContent = file.content.replace(
        /url\(\s*(['"]?)([^'")\s]+)\1\s*\)/gi,
        (match, quote, path) => {
          if (/^(https?:|\/\/|data:)/i.test(path)) return match;
          const resolved = assetBlobMap[path];
          return resolved ? `url(${quote}${resolved}${quote})` : match;
        }
      );
      assetBlobMap[file.name] = createTrackedBlob(cssContent, 'text/css');
    }
  });

  // Pass 3: all other non-HTML, non-image assets (JS, JSON, etc.)
  files.forEach(file => {
    if (!file.name.match(/\.(html|htm)$/i) && !file.isImage && !file.name.match(/\.css$/i)) {
      assetBlobMap[file.name] = createTrackedBlob(file.content, mimeType(file.name));
    }
  });

  // Prefer the explicitly selected root file; fall back to the first HTML file found
  const htmlFile = files.find(f => f.name === activeHtmlFilename)
    || files.find(f => f.name.match(/\.(html|htm)$/i));

  if (!htmlFile) return null;

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

  // Replace <img src="path/to/image.png"> references
  htmlContent = htmlContent.replace(
    /(<img\b[^>]+\bsrc=["'])([^"']+)["']/gi,
    (match, prefix, filename) => {
      if (/^(https?:|\/\/|data:)/i.test(filename)) return match;
      const blobUrl = assetBlobMap[filename];
      return blobUrl ? `${prefix}${blobUrl}"` : match;
    }
  );

  // YouTube embed pass — YouTube's player rejects blob: origins, so replace
  // YouTube iframes with a thumbnail placeholder that opens in a new tab.
  // The video will embed normally when the project is exported and hosted on a
  // real HTTP/HTTPS server.
  htmlContent = htmlContent.replace(
    /<iframe\b([^>]*)\bsrc=(["'])((?:https?:)?\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_\-]+)[^"']*)\2([^>]*)><\/iframe>/gi,
    (match, pre, _q, _src, videoId, post) => {
      const attrs       = pre + ' ' + post;
      const widthMatch  = attrs.match(/\bwidth=["']?(\d+)/i);
      const heightMatch = attrs.match(/\bheight=["']?(\d+)/i);
      const w = widthMatch  ? widthMatch[1]  + 'px' : '560px';
      const h = heightMatch ? heightMatch[1] + 'px' : '315px';
      const thumbUrl = 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg';
      const watchUrl = 'https://www.youtube.com/watch?v=' + videoId;
      return '<div style="position:relative;width:' + w + ';height:' + h + ';background:#000;'
        + 'display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:4px;flex-shrink:0;">'
        + '<img src="' + thumbUrl + '" alt="YouTube thumbnail" '
        + 'style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.7;"/>'
        + '<a href="' + watchUrl + '" target="_blank" rel="noopener" '
        + 'style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:8px;text-decoration:none;">'
        + '<span style="width:64px;height:64px;background:rgba(200,0,0,0.9);border-radius:50%;'
        + 'display:flex;align-items:center;justify-content:center;">'
        + '<svg viewBox="0 0 24 24" width="28" height="28" fill="white"><polygon points="9.5,7 9.5,17 17,12"/></svg>'
        + '</span>'
        + '<span style="color:#fff;font-size:12px;font-family:sans-serif;'
        + 'background:rgba(0,0,0,0.65);padding:4px 10px;border-radius:4px;">'
        + '&#9654; Open video in new tab'
        + '</span>'
        + '</a>'
        + '</div>';
    }
  );

  // Inject nav interceptor so relative anchor clicks post a message to the
  // parent window instead of navigating the blob iframe (which would 404).
  // Uses a capture-phase listener so it fires before any page scripts.
  const navScript = '<script>(function(){'
    + 'document.addEventListener("click",function(e){'
    + 'var a=e.target.closest("a");if(!a)return;'
    + 'var h=a.getAttribute("href");if(!h)return;'
    + 'if(/^(https?:|[/][/]|data:|#|mailto:|tel:|javascript:)/i.test(h))return;'
    + 'e.preventDefault();'
    + 'window.parent.postMessage({type:"cm-navigate",href:h},"*");'
    + '},true);'
    + '})();<\/script>';

  if (htmlContent.includes('</body>')) {
    htmlContent = htmlContent.replace('</body>', navScript + '</body>');
  } else {
    htmlContent += navScript;
  }

  const htmlBlobUrl = createTrackedBlob(htmlContent, 'text/html');
  return htmlBlobUrl;
}
