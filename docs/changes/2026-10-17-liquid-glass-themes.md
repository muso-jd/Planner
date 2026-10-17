# Optional liquid-glass themes — Planner 3.5 source

## Result

Adds three selectable materials in Settings → Make it yours: Pearl (bright frost), Dusk (blue/violet twilight) and Obsidian (smoked glass). Each has a visual preview and pressed/selected state. Classic Dark, White and Black remain available, and no existing choice is replaced. Theme selection preserves keyboard focus after rendering and uses the existing encrypted settings record with custom accents.

Glass modes use soft gradient light, frosted panels, reflective edges, restrained icon shadows, system typography and a floating desktop sidebar/phone dock. Editors, budgets, project/dependency views and Calendar inherit the material. Dense rows/cells avoid individual backdrop filters. Static CSS gradients and bounded blur replace any need for animation, a shader or pointer tracking. Opaque shell fallbacks cover unsupported backdrop filters; reduced-transparency and increased-contrast media preferences strengthen surfaces when available.

## Components and scope

`public/themes.css` contains the new materials and preview visuals. `control-center.js` owns the allow-list and picker. `index.html`, `scripts/build.mjs` and `sw.js` load/embed/cache the sheet. Package, health-endpoint and PWA versions are prepared at 3.5.0. No server API, vault protocol, schema migration or planning behavior changes.

## Validation

- `npm run build` passed; `npm test` passed all 45 unit/API tests.
- `npm run test:themes` passed 24 targeted checks with zero page errors: three material selections, accent retention, focus restoration, encrypted save, fresh-device retrieval, offline cached reopen, all classic selections, keyboard activation, reduced-transparency and increased-contrast media emulation, and overflow/editor checks across twelve theme/viewport combinations.
- `npm run test:control-center` passed 60 existing checks with no page errors. `npm run test:pwa` passed manifest/icons, Chromium installability, install UI, static-only cache, offline edit/reload and reconnect sync.
- Screenshots cover Settings, Today, budgets, task editor, Calendar and Projects in all three themes at desktop 1512×982, simulated iPad portrait 1024×1366, iPad landscape 1366×1024 and phone 390×844. Representative light/dark desktop, iPad and phone layouts were visually inspected. Reduced-transparency output was also captured.
- A test-harness call used a context method instead of a page method in its final keyboard check; it was corrected and the complete theme suite rerun successfully. No application defect was involved.

Fixtures and screenshots use synthetic records only. Chromium 153 and the installed Playwright runtime were used. Physical iPad/Safari and unsupported-filter browsers are not available for direct testing; prefix/fallback rules are source-reviewed. Browser emulation is not physical-device validation. No device battery, frame-rate or cross-browser accessibility certification is claimed.

## Release state

Prepared on `feature/liquid-glass-themes`, based on the 3.4 branch, for a reviewable pull request stacked on PR #6. Production remains the verified 3.4 deployment until separately rolled out. No main merge or production upload is part of this source preparation. Rollback is described in `docs/DEPLOYMENT.md`.
