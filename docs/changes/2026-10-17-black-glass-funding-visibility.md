# Black glass and cleaner Budget funding — Planner 3.6

## Behavior

Budget previously listed every task encountered during funding traversal, including free tasks and containers without funded work. It now shows only task rows with positive own costs in integer cents. It continues traversing hidden parents, so a paid subtask remains visible under its nearest visible ancestor. Empty/unfunded containers and out-of-scope branches disappear. Total, Business, Personal and Analytics funding views use the same filter.

Required-budget counts now describe open funded tasks. Existing total/open funding, deduplication, expected-income estimates, completed costs and ledger cash flow retain their calculations. Free tasks that carry expected income remain included in the estimate summary but do not get a funding row. Task records, planning views and explicitly linked ledger references are retained. Changing a task estimate between zero and a positive amount immediately updates row visibility.

Carbon, Black Ice and Amethyst join the existing three glass themes and three classic themes. Their page canvas and browser chrome are pure black, with no background gradient. Silver, ice-blue or violet glass surfaces distinguish the materials. Preview cards use the same black base. Accent selection, encrypted settings sync, offline shell and reduced-transparency/increased-contrast fallbacks are reused.

## Scope

`control-center.js` changes the funding renderer, count and theme allow-list. `themes.css` adds three black materials and previews. Package, Worker health and PWA shell are prepared at 3.6.0. No new dependency, server API, data model, vault protocol, database migration, binding or owner-data rewrite is introduced.

## Validation

- `npm run build` passed, then `npm test` passed all 45 unit/API tests.
- `npm run test:funding-visibility` passed 11 checks with zero page errors: zero/unset costs hidden, funded subtasks retained through a free parent, empty containers omitted, scope filtering, Analytics consistency, completed paid work, correct totals and funded-task count, free-task income preserved in summary, edit between zero/positive and encrypted persistence without record removal.
- `npm run test:themes` passed 27 checks with zero page errors. All six glass themes apply and retain accents/focus. The three new themes assert an actual black computed background, no background image and black browser chrome. Checks include fresh-device encrypted sync, offline reopen, classic theme restoration, keyboard activation and reduced-transparency/increased-contrast media emulation.
- Black-theme screenshots/overflow checks cover Settings, Today, category budgets, task editors, Calendar and Projects on desktop 1512×982, simulated iPad portrait 1024×1366, iPad landscape 1366×1024 and phone 390×844. Representative Carbon desktop, Black Ice iPad and Amethyst phone layouts were visually inspected.
- Existing `npm run test:funding-envelopes` passed 19 funding/budget/transfer/reminder/block/icon checks with zero page errors. `npm run test:pwa` passed manifest/icons, Chromium installability, install UI, static-only cache, offline edit/reload and reconnect sync.
- `git diff --check` passed. All fixtures/screenshots are synthetic. Physical Safari/iPad testing and real device performance measurements are unavailable; Chromium emulation is not physical-device validation.

## Delivery state

Deployed with explicit user authorization at `2026-10-17T11:34:05.908819Z` UTC to https://planner.jeremydachojd.workers.dev/. Exact tested source `6f55566e6c1b61c2a324687c82f0312e4180c32f`, branch `feature/black-glass-funded-tasks`, PR https://github.com/muso-jd/Planner/pull/8, stacked on PR #7. No main merge.

Cloudflare reports deployment `07a4af81-9952-451e-9de5-97e0e01e6106`, Worker version `decf4ce3-2c20-4c32-bfaa-ef9518d42f4b`, at 100% traffic. Downloaded module exactly contains the tested build. Existing binding values and compatibility date were preserved. Full evidence and rollback to 3.5 are in `docs/DEPLOYMENT.md`.

Live release-qualified health returned HTTP 200 with version 3.6.0 and storage available. The live theme stylesheet and Budget/theme controller matched their local SHA-256 checksums.

Jeremy also established standing authorization to deploy requested Planner updates after validation without a separate deployment confirmation. This is recorded in `AGENTS.md` and the deployment guide; it does not create automatic Git deployment or authorize main merges/deployment deletion.
