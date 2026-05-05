/**
 * @fileoverview Default file content templates shown when a new project is created
 * or when a new file is added.
 *
 * Each function returns a string of starter code that gives Further Education
 * students a working starting point rather than a blank screen. The templates
 * deliberately use only well-supported, beginner-friendly syntax.
 */

/**
 * Returns the default HTML5 boilerplate for index.html.
 * Includes a linked stylesheet and script file so the three-file project
 * structure works out of the box without any student configuration.
 * @param {string} [projectName='My Project'] - The student's project name, used in the `<title>` tag.
 * @returns {string} A complete HTML document string.
 */
export function defaultHtml(projectName = 'My Project') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <h1>Hello, World!</h1>
  <p>Start editing this file to build your web page.</p>

  <script src="script.js"></script>
</body>
</html>`;
}

/**
 * Returns the default CSS stylesheet content for style.css.
 * Uses a CSS reset (box-sizing, margin, padding) and readable body styles
 * so students see a clean canvas rather than browser default styles.
 * @returns {string} A CSS string with sensible starter rules.
 */
export function defaultCss() {
  return `/* style.css — Your stylesheet */

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, sans-serif;
  font-size: 16px;
  background-color: #ffffff;
  color: #333333;
  padding: 20px;
}

h1 {
  color: #005eb8;
  margin-bottom: 16px;
}

p {
  line-height: 1.6;
}`;
}

/**
 * Returns the default JavaScript file content for script.js.
 * Wraps code in DOMContentLoaded so students don't encounter timing issues
 * when accessing DOM elements from a script tag placed before the body.
 * @returns {string} A JS string with a DOMContentLoaded starter block.
 */
export function defaultJs() {
  return `// script.js — Your JavaScript file

// This script runs when the page is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Page loaded!');
});`;
}

/**
 * Returns the starting content for a blank new CSS file.
 * The filename is added as a comment so students can see which file they are editing.
 * @param {string} filename - The filename (used in the leading comment).
 * @returns {string} A minimal CSS starter string.
 */
export function blankCss(filename) {
  return `/* ${filename} */\n\n`;
}

/**
 * Returns the starting content for a blank new HTML file.
 * Links the shared style.css by default so the file inherits project styles immediately.
 * @param {string} filename - The filename (extension is stripped for the `<title>`).
 * @returns {string} A complete minimal HTML5 document string.
 */
export function blankHtml(filename) {
  const title = filename.replace('.html', '');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

</body>
</html>`;
}

/**
 * Returns the starting content for a blank new JS file.
 * The filename is added as a comment so students can identify the file at a glance.
 * @param {string} filename - The filename (used in the leading comment).
 * @returns {string} A minimal JS starter string.
 */
export function blankJs(filename) {
  return `// ${filename}\n\n`;
}
