# Android installation — 2.3.0

Life Planner previously opened only as a browser tab and had no manifest or offline shell. This update adds a stable manifest, regular and maskable launcher icons, a standalone window, installation controls under Connect and on the unlock screen, and an explicit browser-menu fallback. It keeps the existing phone-first capture/mood/time layout.

The versioned service worker caches only an allowlist of public assets, enables offline reopening of previously loaded device records, and leaves API/Google/image requests on the network. Existing local edits reconnect through the established encrypted sync. New code waits until old app windows close to activate; it never forces a reload during editing. No push service, Play Store listing or native APK is added.

Validation: build and 16 automated tests passed. The focused Chromium PWA check reports zero installability errors, validates PNG sizes/MIME and manifest fields, exercises install-dialog wiring with a synthetic prompt, verifies static-only cache contents, and saves/reloads a note offline before synchronizing online. A synthetic prompt is not an Android OS install; physical Android packaging and launcher behavior remain unverified. Responsive browser results are recorded with deployment evidence.

Source artwork and exports, font, public manifest and shell contain no workspace key or private records. Existing D1 and service bindings remain unchanged. Deployment source/IDs and rollback are recorded in docs/DEPLOYMENT.md.
