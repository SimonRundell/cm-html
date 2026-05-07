# cm-html

> A browser-based multi-file HTML/CSS/JavaScript teaching editor for Further Education students.

[![Licence: CC BY-NC-SA 4.0](https://img.shields.io/badge/Licence-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Version](https://img.shields.io/badge/version-0.1.3-blue.svg)](CHANGELOG.md)

---

## Overview

**cm-html** is a self-contained web application that lets Level 2 and Level 3 FE
students write and preview real HTML, CSS, and JavaScript files — all inside a
browser, with no login, no installation, and no backend required.

Students can:

- Edit HTML, CSS, and JavaScript files side-by-side with Monaco (the VS Code editor engine)
- See an instant live preview of their work in a sandboxed iframe
- Click links in the preview to navigate between pages — the editor follows automatically
- Import images and other asset files into named folders within the project
- Use the built-in Help drawer to look up HTML tags, CSS properties, and JavaScript methods
- Save and load projects using browser localStorage
- Export and import entire projects as `.zip` files, with folder structure preserved

---

## Features

| Feature | Detail |
|---------|--------|
| **Monaco Editor** | Full syntax highlighting, autocomplete, and formatting for HTML, CSS, and JS |
| **Live Preview** | Iframe preview rebuilt on every save; CSS and JS are linked via blob URLs |
| **Multi-page navigation** | Clicking a relative link in the preview loads that page and syncs the editor to its source |
| **Multi-file projects** | Add, rename, and delete HTML, CSS, JS, JSON, Markdown, and plain text files |
| **Image & asset support** | Import images and other files into named project folders; preview resolves `<img src>` and CSS `url()` |
| **Asset folder tree** | Collapsible folder tree in the sidebar for imported assets; supports rename, delete, and arbitrary nesting |
| **File tree** | Grouped sidebar (HTML / CSS / JS / Other) with rename/delete/set-preview-root actions |
| **Help drawer** | Bundled reference for 50+ HTML elements, 60+ CSS properties, and 47+ JS methods; falls back to live MDN search |
| **Contextual help** | Select any word in the editor to look it up instantly |
| **Project management** | Multiple named projects in localStorage; switch, create, rename, delete, and export individual projects from the Settings tab |
| **Storage monitor** | Progress bar in Settings shows localStorage usage; per-project sizes listed; error modal if the quota is exceeded |
| **Zip export/import** | Full project round-trip as a `.zip` file; folder structure and images are preserved |
| **CodePen import** | Import a CodePen export zip directly — wraps the body-only HTML in a full boilerplate and links the CSS/JS automatically |
| **Mobile preview** | Preview pane can simulate a configurable mobile viewport width |
| **Settings** | Font family, font size, editor theme (dark/light), auto-save delay, mobile width |
| **Auto-save** | Debounced save to localStorage on every keystroke |
| **Offline capable** | Full editor, preview, and reference data work without internet |

---

## Tech Stack

| Library | Purpose |
|---------|---------|
| [React 18](https://react.dev) | UI framework |
| [Vite](https://vitejs.dev) | Build tool and dev server |
| [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react) | Monaco Editor wrapper |
| [JSZip](https://stuk.github.io/jszip/) | Client-side zip import/export |
| [uuid](https://github.com/uuidjs/uuid) | Unique file IDs |
| [lucide-react](https://lucide.dev) | Icon set |

No TypeScript, no Redux, no backend. Plain JavaScript with JSDoc throughout.

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/YOUR-USERNAME/cm-html.git
cd cm-html
npm install
```

### 2. Start the development server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### 3. Build for production

```bash
npm run build
```

The production-ready files are written to `dist/`. See [DEPLOYMENT.md](DEPLOYMENT.md)
for full server deployment instructions.

---

## Project Structure

```
cm-html/
├── public/
│   ├── images/              # App branding images
│   └── resources/           # Student asset folder (images, etc.)
├── src/
│   ├── main.jsx             # React entry point
│   ├── App.jsx              # Root component — wires all hooks and layout
│   ├── config.js            # Loads .config.json at build time
│   ├── index.css            # Global CSS reset and custom properties (design tokens)
│   │
│   ├── components/
│   │   ├── Layout/          # AppLayout — main shell (toolbar + sidebar + pane)
│   │   ├── Toolbar/         # Top toolbar: project name, save, run, import, export
│   │   ├── FileTree/        # Left sidebar: type-grouped file list + asset folder tree
│   │   │   ├── FileTree.jsx      # Type groups (HTML/CSS/JS/Other) + add-file form
│   │   │   ├── FileTreeItem.jsx  # Single file row with rename/delete/set-root
│   │   │   └── FolderTree.jsx    # Asset folder tree with import, rename, and delete
│   │   ├── TabBar/          # Editor / Preview / Settings tab switcher
│   │   ├── Editor/          # Monaco editor wrapper + editor+help combined pane
│   │   ├── Preview/         # Sandboxed iframe preview with viewport controls
│   │   ├── HelpDrawer/      # Slide-in reference + MDN search drawer
│   │   ├── Config/          # Settings UI
│   │   └── Modal/           # Reusable modal dialog (alert and confirm variants)
│   │
│   ├── hooks/
│   │   ├── useProject.js       # All project state: files, active file, CRUD
│   │   ├── useAutoSave.js      # Debounced localStorage auto-save
│   │   ├── usePreview.js       # Blob URL generation and iframe refresh
│   │   └── useContextualHelp.js # Keyword lookup from editor selection
│   │
│   ├── data/
│   │   ├── htmlReference.json  # Bundled HTML element reference (50+ entries)
│   │   ├── cssReference.json   # Bundled CSS property reference (60+ entries)
│   │   └── jsReference.json    # Bundled JS method/keyword reference (47+ entries)
│   │
│   └── utils/
│       ├── blobPreview.js      # Multi-file blob URL builder for preview
│       ├── defaultTemplates.js # Default HTML/CSS/JS starter content
│       ├── languageDetect.js   # Maps file extensions to Monaco language IDs
│       ├── mdnApi.js           # MDN Search API helper
│       └── zipUtils.js         # JSZip project import/export
│
├── .config.json             # Runtime configuration (font size, theme, etc.)
├── vite.config.js           # Vite build configuration
├── DEPLOYMENT.md            # Server deployment instructions
├── LICENSE                  # CC BY-NC-SA 4.0
└── README.md                # This file
```

---

## Configuration

`.config.json` at the project root controls runtime defaults. Edit before building:

```json
{
  "appName": "cm-html",
  "version": "1.0.0",
  "defaultFontSize": 14,
  "defaultFontFamily": "Courier New, monospace",
  "defaultTheme": "vs-dark",
  "defaultMobileWidth": 375,
  "debounceMs": 500,
  "defaultProjectName": "my-project",
  "mdnSearchBase": "https://developer.mozilla.org/api/v1/search",
  "mdnPageBase": "https://developer.mozilla.org/en-US/docs/Web",
  "helpDrawerWidth": 360,
  "localStoragePrefix": "cmhtml_"
}
```

| Key | Purpose |
|-----|---------|
| `defaultFontSize` | Starting editor font size (px) |
| `defaultFontFamily` | Starting editor font family |
| `defaultTheme` | `"vs-dark"` or `"vs"` (light) |
| `defaultMobileWidth` | Default mobile preview viewport width (px) |
| `debounceMs` | Auto-save debounce delay (ms) |
| `localStoragePrefix` | Prefix for all localStorage keys — change if running multiple instances on the same origin |

---

## How the Preview Works

### Asset resolution

1. When project files change, `usePreview` calls `buildPreviewUrl` in `utils/blobPreview.js`.
2. Asset resolution runs in three ordered passes:
   - **Pass 1 — images:** image files stored as base64 data URLs are placed directly into the asset map (no new blob needed).
   - **Pass 2 — CSS:** each stylesheet has its `url()` references rewritten to the resolved image values, then a blob URL is created for the processed CSS.
   - **Pass 3 — other assets:** JS, JSON, and any remaining non-HTML files are converted to blob URLs.
3. The active HTML file has its `<link href="...">`, `<script src="...">`, and `<img src="...">` attributes rewritten to point to the resolved blob/data URLs.
4. A final blob URL is created for the modified HTML and set as the `<iframe src>`.
5. Previous blob URLs are revoked on every rebuild to prevent memory leaks.

### Multi-page navigation

A small nav-interceptor `<script>` is injected into the bottom of every HTML blob.
It listens (in capture phase) for clicks on relative anchor links and, instead of
allowing the browser to navigate (which would 404 against a blob URL), sends a
`postMessage` to the parent window:

```js
{ type: 'cm-navigate', href: 'about.html' }
```

`App.jsx` listens for these messages and responds by calling:
- `setPreviewRootFile(name)` — rebuilds the preview blob for the new page
- `setActiveFile(id)` — switches the Monaco editor to that file's source

External links (`http://`, `https://`), protocol-relative URLs (`//`), in-page
anchors (`#`), and hrefs with no matching project file are all ignored.

### Sandbox and Permissions Policy

The preview iframe uses:

```
sandbox="allow-scripts allow-same-origin allow-modals allow-forms
         allow-popups allow-popups-to-escape-sandbox allow-presentation"
allow="accelerometer; autoplay; clipboard-write; encrypted-media;
       fullscreen; gyroscope; picture-in-picture; web-share"
```

`allow-same-origin` is required for blob URL resolution.  `allow-popups` and
`allow-presentation` are needed for third-party embeds (YouTube, Vimeo, etc.)
to function; without them the embedded player's fullscreen and navigation links
are blocked by the browser.

The `allow` attribute is equally important.  It sets a **Permissions Policy**
that is inherited by all nested frames.  Without it, the browser denies
cross-origin nested iframes (such as YouTube's player) access to features like
`encrypted-media`, `autoplay`, and `fullscreen` — even if the student has
added the correct `allow` attribute to their own `<iframe>` tag.  With it,
those capabilities are explicitly delegated down the frame tree.

This is an accepted trade-off in a controlled educational environment where
students run only their own code.

---

## Reference Data Files

The bundled reference JSON files in `src/data/` follow a common schema:

```json
{
  "keyword": "display",
  "type": "css",
  "title": "display",
  "summary": "Controls how an element is rendered in the layout.",
  "syntax": "selector {\n  display: flex;\n}",
  "values": [
    { "value": "flex", "description": "Enables flexbox layout." }
  ],
  "example": ".container {\n  display: flex;\n}",
  "level": 2,
  "mdnPath": "CSS/display"
}
```

- `level` — `2` for Level 2 FE, `3` for Level 3 / more advanced
- HTML entries use `attributes` instead of `values`
- JS entries use `parameters` and `returns` instead of `values`

To add new entries, edit the relevant JSON file and rebuild.

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome / Edge (Chromium) | Full |
| Firefox | Full |
| Safari 16+ | Full |
| Mobile browsers | Preview only (editor not optimised for touch) |

Monaco Editor requires a modern browser. Internet Explorer is not supported.

---

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for full instructions covering:

- Building for production
- Configuring the `base` path for sub-directory hosting
- Apache / Nginx / IIS server configuration for single-page app routing
- Offline use considerations

---

## Licence

Copyright (c) 2026 Simon Rundell / Exeter College.

This project is licensed under the
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International Licence](LICENSE).

You are free to share and adapt this work for non-commercial purposes, provided
you give appropriate credit and distribute any derivative works under the same licence.

See [LICENSE](LICENSE) for the full licence text.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a full version history.

---

## Acknowledgements

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — Microsoft, MIT Licence
- [MDN Web Docs](https://developer.mozilla.org/) — Mozilla, CC BY-SA 2.5
- [Lucide Icons](https://lucide.dev/) — Lucide Contributors, ISC Licence
- [JSZip](https://stuk.github.io/jszip/) — Stuart Knightley, MIT / GPLv3 Licence
