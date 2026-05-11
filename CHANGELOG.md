# Changelog

All notable changes to cm-html are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.2.1] — 2026-05-11

### Fixed

#### YouTube embeds in preview
- YouTube `<iframe>` embeds inside student pages no longer show a player error in
  the preview pane.  YouTube's embed player rejects pages served from `blob:` URLs
  (the scheme used by the preview) because their origin is opaque — Vimeo and other
  providers are unaffected.
- YouTube iframes are now detected during preview build and replaced with a styled
  **thumbnail placeholder**: the real video thumbnail is fetched from YouTube's
  image CDN, overlaid with a play-button icon, and clicking opens the video in a
  new browser tab.  Width and height from the original `<iframe>` attributes are
  preserved so the student's layout renders correctly.
- The placeholder is purely a preview convenience — the `<iframe>` embed in the
  student's source is untouched and will play normally when the project is exported
  and hosted on a real HTTP/HTTPS server.
- Affects `src/utils/blobPreview.js` only; no project file format changes.

---

## [0.2.0] — 2026-05-09

### Added

#### Teaching Drawer — structured HTML/CSS reference panel

- A **Learn** button (BookOpen icon) appears at the right end of the tab bar,
  separated from the Editor / Preview / Settings tabs by a flex spacer.
  Clicking it opens or closes the teaching drawer without switching the active pane.
- The drawer slides in from the right over the current editor or preview content
  at 72 % of the content area width (min 540 px).
- A **240 px sidebar** lists all 13 chapters, each labelled with a colour-coded
  badge (`HTML` / `CSS` / `Design` / `A11y`).  Selecting a chapter scrolls the
  content panel back to the top and highlights the active entry.
- A **search bar** in the sidebar performs full-text filtering across chapter
  titles, intros, and section bodies in real time.  The chapter list narrows to
  only matching entries; a "no results" message is shown when nothing matches.
- The **content panel** renders each chapter with:
  - A coloured badge and title heading.
  - An introductory paragraph.
  - 4–6 sections, each with explanatory text and one or more of: an annotated
    code block, an attribute/property reference table, or a tip callout.
  - A **Key Points** summary card at the foot of each chapter.
  - **Previous / Next** chapter navigation buttons.
- Every code block has a **Copy** button that writes the code to the clipboard
  and briefly shows "Copied!".
- The drawer closes on **Escape** or the ✕ button.
- Fully respects the dark / light theme via the existing CSS custom properties.

#### Curriculum content — 13 fully-written chapters

| # | Chapter | Badge |
|---|---------|-------|
| 1 | HTML Basics | HTML |
| 2 | Semantic HTML | HTML |
| 3 | Links & Navigation | HTML |
| 4 | Images & Media | HTML |
| 5 | Forms & Input | HTML |
| 6 | CSS Basics | CSS |
| 7 | The Box Model | CSS |
| 8 | Flexbox | CSS |
| 9 | CSS Grid | CSS |
| 10 | Responsive Design | CSS |
| 11 | Design Principles | Design |
| 12 | Accessibility | A11y |
| 13 | Micro-interactions | CSS |

Content follows the pedagogical progression from the *Unlock the Cinema System*
scheme of work but is written generically — not tied to the cinema project theme.

### Changed

- `TabBar.jsx` — added `isTeachingOpen` and `onTeachingToggle` props; the Learn
  button is rendered outside the `TABS` array with a `.tab-bar-spacer` pushing it
  to the far right; `.tab-bar-learn.active` highlights it with the accent colour.
- `AppLayout.jsx` — imports and renders `<TeachingDrawer>` inside `.app-pane`
  (which already carries `position: relative`); accepts and threads
  `isTeachingOpen` / `onTeachingToggle` props.
- `App.jsx` — adds `isTeachingOpen` state and a stable `handleTeachingToggle`
  callback (via `useCallback`) passed down to `AppLayout`.

### New files

| File | Purpose |
|------|---------|
| `src/components/TeachingDrawer/TeachingDrawer.jsx` | Main drawer component |
| `src/components/TeachingDrawer/TeachingDrawer.css` | Drawer styles |
| `src/components/TeachingDrawer/teachingContent.js` | All 13 chapters of curriculum content |

---

## [0.1.3] — 2026-05-07

### Added

#### CodePen zip import
- A **CodePen zip** checkbox in the toolbar (between Import and Export) flags an
  import as a CodePen export archive.
- When checked, `importCodePenZip` reads only the `src/` folder from the zip
  (ignoring the compiled `dist/` output).
- The body-only HTML that CodePen writes to `src/index.html` is automatically
  wrapped in a full HTML5 boilerplate (`<!DOCTYPE html>`, `<head>`, charset and
  viewport meta tags, `<title>`).
- `<link rel="stylesheet">` tags are added for every `.css` file found in `src/`,
  and `<script>` tags for every `.js` file, so the project is immediately runnable.
- If `src/index.html` already contains a `<!DOCTYPE>` or `<html>` element it is
  used as-is without additional wrapping.
- A clear error modal is shown if the zip has no `src/` folder.

#### Project management — rename, delete, and export from Settings tab
- Each project row in the Settings tab now has icon action buttons (Lucide icons):
  - **Load** (`FolderOpen`) — switches to that project (non-current projects only).
  - **Rename** (`Pencil`) — replaces the name with an inline input; confirms on
    Enter or blur, cancels on Escape.  The old localStorage key is removed so no
    orphan entry is left behind.
  - **Export** (`Download`) — downloads that project as a `.zip` without switching
    to it.
  - **Delete** (`Trash2`) — two-click confirmation (click once → button becomes
    `Check` "Sure?", click again to confirm).  Deleting the active project
    automatically switches to the next saved project, or creates a fresh default if
    none remain.

#### localStorage storage monitor
- A **Storage** section in the Settings tab shows a progress bar of localStorage
  usage against the browser's estimated ~5 MB quota.
- The bar turns amber above 60 % and red above 80 %, with a written warning
  prompting students to export and delete unused projects.
- Each project row now displays its storage footprint in small monospace text so
  students can identify which projects are consuming the most space.

### Fixed

- `renameProject` previously left the old localStorage key behind when the active
  project was renamed, gradually accumulating orphan entries.  The old key is now
  removed as part of the rename operation.

- `saveToStorage` previously swallowed `QuotaExceededError` silently, meaning
  students would lose unsaved work without any indication.  The error now
  propagates through `useProject` and is shown as an error modal in `App.jsx`,
  directing students to free space via the Settings tab.

---

## [0.1.2] — 2026-05-06

### Added

#### Message of the Day (MOTD)
- The Settings tab now shows a **Recent Updates** section at the bottom, loaded
  from `/public/MOTD.txt` on startup.
- Content is rendered as raw HTML, allowing simple formatted update notes.
- A static notice directs students to report bugs/suggestions by email.

#### Preview root file selection
- On zip import and new project creation the preview now prefers `index.html` as
  the root file, falling back to the first HTML file found.
- A **Preview Root File** selector appears in the Settings tab whenever the project
  contains more than one HTML file.

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

### Fixed

#### Embedded third-party iframes (YouTube, Vimeo, etc.)
- YouTube embeds and similar third-party players now render correctly inside
  student pages.  Two browser mechanisms were blocking them:
  - **Sandbox inheritance** — nested iframes inherit the parent sandbox's
    restrictions.  `allow-popups`, `allow-popups-to-escape-sandbox`, and
    `allow-presentation` have been added to the preview iframe so that player
    fullscreen and navigation links are not blocked.
  - **Permissions Policy** — the browser denies cross-origin nested iframes
    access to `encrypted-media`, `autoplay`, `fullscreen`, etc. unless the
    parent iframe explicitly delegates those permissions via its `allow`
    attribute.  The preview iframe now carries
    `allow="accelerometer; autoplay; clipboard-write; encrypted-media;
    fullscreen; gyroscope; picture-in-picture; web-share"`.
- These changes affect `PreviewPane.jsx` only; no project file format changes.

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
