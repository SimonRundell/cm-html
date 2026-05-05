/**
 * @fileoverview Maps file extensions to Monaco editor language identifiers.
 * Provides a human-readable label map used in the UI tab bar and file tree.
 */

/**
 * Maps lowercase file extensions to the Monaco editor's internal language IDs.
 * Extensions not listed here fall back to 'plaintext', which gives students
 * a usable editor with no syntax highlighting rather than an error.
 * @type {Object.<string, string>}
 */
const extensionMap = {
  html: 'html',
  htm:  'html',
  css:  'css',
  js:   'javascript',
  json: 'json',
  md:   'markdown',
  txt:  'plaintext',
};

/**
 * Returns the Monaco language identifier for a given filename.
 * Unknown extensions fall back to 'plaintext'.
 * @param {string} filename - The full filename including extension, e.g. "index.html".
 * @returns {string} A Monaco language identifier string (e.g. "html", "css", "javascript").
 */
export function detectLanguage(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  return extensionMap[ext] || 'plaintext';
}

/**
 * Returns a short, human-readable label for a Monaco language identifier.
 * Used in the tab bar sub-label and any other place where a brief language badge is needed.
 * Falls back to the uppercased language ID for any identifier not in the map.
 * @param {string} lang - A Monaco language identifier (e.g. "javascript").
 * @returns {string} A short display label (e.g. "JS", "HTML", "CSS").
 */
export function languageLabel(lang) {
  const labels = {
    html: 'HTML',
    css: 'CSS',
    javascript: 'JS',
    json: 'JSON',
    markdown: 'MD',
    plaintext: 'TXT',
  };
  return labels[lang] || lang.toUpperCase();
}
