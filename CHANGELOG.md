# Changelog

All notable changes to cm-html are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.1.1] — 2026-05-06

### Added

#### Image and asset file support
- Image files (png, jpg, jpeg, gif, svg, webp, ico, bmp) are now recognised as a
  distinct file type with the internal language identifier `'image'`.
- `isImageFile(filename)` exported from `utils/languageDetect.js` for use across
  the codebase.

#### Zip import/export with folder structure
- Zip import now reads image files as base64 data URLs and **preserves their full
  path** from the zip archive (e.g. `images/cat.png` stays `images/cat.png`).
  Previously all binary files were silently skipped.
- Zip export writes image files back as raw binary (decoded from the stored data
  URL) and preserves folder paths, producing a round-trip-safe archive.
- Non-image binary files (fonts, etc.) continue to be skipped with a console
  warning.

#### Asset folder tree (sidebar)
- A new **Assets** section is rendered at the bottom of the file-tree sidebar,
  above the app logo.
- Files stored under a sub-path (e.g. `images/cat.png`, `data/config.json`) and
  any root-level image files are displayed in a collapsible folder tree.
- Folders expand and collapse; nested folders are supported to any depth.
- Text-based asset files (e.g. `data/config.json`) can be clicked to open in the
  Monaco editor.
- Image files display a `FileImage` icon and are non-editable (cursor remains
  default).
- All asset files support **rename** (inline input pre-filled with the full path,
  allowing both filename and folder-path changes) and **delete** (with
  confirmation modal).
- Root-level text files (HTML, CSS, JS, JSON) are unaffected and continue to
  appear in their existing type groups.

#### Import file into project
- An **Upload** button (↑) in the Assets header opens the OS file picker for any
  file type.
- After selecting a file a compact inline form appears showing the filename, a
  folder-path input pre-filled with a smart default (`images/` for images,
  `data/` for JSON, `audio/` for mp3/wav, `video/` for mp4/webm, `assets/` for
  everything else), and a live path preview.
- Confirming adds the file to the project under `<folder>/<filename>` — this
  implicitly creates the folder structure without needing a separate "new folder"
  action.
- `addImportedFile(name, content, isImage)` added to `useProject` to support this
  flow.

#### Live preview — image rendering
- `buildPreviewUrl` now rewrites `<img src="…">` attributes in HTML to blob/data
  URLs, matching the existing behaviour for `<link href>` and `<script src>`.
- CSS `url()` references are rewritten to resolve against stored image data URLs,
  enabling background images in student stylesheets.

#### Live preview — multi-page navigation
- Clicking a relative link (e.g. `<a href="about.html">`) inside the preview
  iframe now navigates the preview to that page **and** switches the Monaco
  editor to the corresponding file's source.
- A small nav-interceptor script is injected into every HTML blob at build time.
  It intercepts relative anchor clicks, prevents the default (which would 404
  against a blob URL), and posts a `cm-navigate` message to the parent window.
- `App.jsx` listens for these messages and calls `setPreviewRootFile` (rebuilds
  the preview) and `setActiveFile` (syncs the editor) — both independently of any
  tab switch, so students can inspect the source without leaving the preview.
- External links (`http://`, `https://`, `//`) and in-page anchors (`#`) are
  ignored and behave normally.

### Changed

- `ProjectFile` typedef updated: new optional fields `isImage?: boolean` (marks
  binary image assets stored as data URLs).
- `FileTree` type-group filters now exclude files with a `/` in their name and all
  image-language files, ensuring asset files appear exclusively in the new Assets
  section.
- `blobPreview.js` asset-building restructured into three ordered passes (images →
  CSS with `url()` rewriting → other assets) before HTML rewriting, ensuring image
  references in CSS are resolved correctly.

### Internal / developer

- `FolderTree.jsx` — new component (`src/components/FileTree/FolderTree.jsx`)
  containing `buildTree`, `FolderNode`, `FolderFileRow`, and the import-form UI.
- `FileTree.css` — asset/folder-tree styles added (`.folder-tree-*`, `.ft-item`,
  `.ft-rename-*`).
- `AppLayout.jsx` — new `onImportFile` prop threaded from `App` → `AppLayout` →
  `FileTree` → `FolderTree`.

---

## [0.1.0] — 2026-04-01

### Initial release

- Monaco Editor integration (HTML, CSS, JavaScript syntax highlighting,
  autocomplete, and formatting).
- Live sandboxed iframe preview rebuilt on every save via blob URLs.
- Multi-file project support: add, rename, and delete HTML, CSS, JS, JSON,
  Markdown, and plain-text files.
- File tree sidebar grouped by type (HTML / CSS / JS / Other) with
  rename, delete, and set-preview-root actions per file.
- Preview pane with desktop / mobile viewport toggle and manual refresh.
- Built-in Help drawer with bundled reference data for 50+ HTML elements,
  60+ CSS properties, and 47+ JavaScript methods; falls back to live MDN search.
- Contextual help: selecting a word in the editor looks it up automatically.
- Project management: multiple named projects stored in `localStorage`; switch,
  create, rename.
- Zip export and import (text files only in this release).
- Auto-save: debounced save to `localStorage` on every keystroke.
- Settings: editor font family, font size, theme (dark/light), auto-save delay,
  mobile preview width.
- Fully offline-capable (no backend, no external runtime dependencies).
