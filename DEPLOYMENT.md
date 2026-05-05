# Deployment Guide — cm-html

This document covers how to build cm-html and deploy it to a college web server
(or any static file host). No server-side code is required — the app is entirely
client-side HTML/CSS/JavaScript after the build step.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18 or later | [nodejs.org](https://nodejs.org) |
| npm | 9 or later | Bundled with Node.js |

Check your versions:

```bash
node -v
npm -v
```

---

## 1. Install Dependencies

```bash
cd cm-html
npm install
```

---

## 2. Development Server

```bash
npm run dev
```

Opens at `http://localhost:5173`. The server hot-reloads on file save.

---

## 3. Production Build

```bash
npm run build
```

Output is written to the `dist/` folder. The build is self-contained — upload
the entire contents of `dist/` to your server.

---

## 4. Deploying to a College Web Server (Sub-directory)

If the app will be served from a sub-directory (e.g.
`https://college.ac.uk/tools/cm-html/`) you must set the `base` path in
`vite.config.js` **before** running the build:

```js
// vite.config.js
export default defineConfig({
  plugins: [react()],
  base: '/tools/cm-html/',   // ← match your server path exactly
  server: { port: 5173 },
});
```

Then build and upload:

```bash
npm run build
# Upload the contents of dist/ to /tools/cm-html/ on the server
```

> **Important:** Upload the *contents* of `dist/`, not the `dist/` folder itself.
> After upload, `index.html` should be directly accessible at the sub-directory URL.

If the app is served from the domain root, leave `base: './'` (the default).

---

## 5. Server Configuration

cm-html is a single-page application. The web server must serve `index.html`
for any request that does not match a static file.

### Apache (`.htaccess`)

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QL]
```

### Nginx

```nginx
location /tools/cm-html/ {
    try_files $uri $uri/ /tools/cm-html/index.html;
}
```

### IIS (`web.config`)

```xml
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPA" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
          </conditions>
          <action type="Rewrite" url="index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

---

## 6. Student Asset Files

If students need to use local images in their projects they should place image
files in `public/resources/` before the build, or instruct students to link to
external image URLs. The `public/resources/` folder is copied as-is into `dist/`
and is accessible at `/resources/filename.ext` in the deployed app.

---

## 7. Offline Use

The editor and live-preview work entirely offline. The only feature requiring
internet access is the **MDN Web Docs search** in the Help drawer, which calls
the MDN Search API. Students with no internet will still see the bundled
reference data (HTML, CSS, and JS entries) but will not see live MDN results.

---

## 8. Environment Summary

| Feature | Requires Internet? |
|---------|-------------------|
| Code editor (Monaco) | No — bundled |
| Live preview | No — blob URLs |
| File save / load | No — localStorage |
| Zip export / import | No — client-side |
| Bundled reference data | No — bundled JSON |
| MDN live search | Yes |

---

## 9. Updating the App

Pull the latest changes, re-install dependencies if `package.json` changed,
rebuild, and re-upload `dist/`:

```bash
git pull
npm install
npm run build
# Re-upload dist/
```

---

## 10. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Blank page after upload | Wrong `base` path | Match `base` in `vite.config.js` to the server sub-directory |
| CSS/JS 404 errors | Same as above | Same fix |
| Preview iframe blank | No HTML file in project | Check that `index.html` exists in the file tree |
| Monaco editor doesn't load | CDN blocked by network | Monaco loads from npm bundle — no CDN needed; check browser console |
| localStorage full warning | Student has many large projects | Ask student to export old projects as .zip and delete them |
