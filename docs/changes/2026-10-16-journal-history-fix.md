# Journal history navigation fix — 2.2.1

## Problem and result

The Journal history's View day button used the same global date action as the planner calendar. That action always switched to Today, so choosing a previous journal day showed tasks/routines instead of its saved reflection. History also excluded entries matching the selected day and silently stopped after 30 entries.

Journal date actions now carry their own context and stay in Journal. The selected day's full notes/photos render at the top. Journal history includes every non-archived diary/reflection/values entry, including selected-day entries; older records are available through explicit 30-entry pagination. Date/type labels and text previews make records easier to identify. Sorting tolerates missing dates, with undated records editable from history. Calendar/analytics date actions retain their existing Today behavior. No saved entries or database rows are rewritten by this fix.

## Validation

- Reproduced the navigation failure in a dedicated browser test before editing: clicking View day yielded heading `Today, with intention.` instead of `Pause. Notice. Reflect.`.
- `npm run build`: passed.
- `npm test`: 16 automated tests passed.
- `npm run test:journal` with the existing Playwright/Chromium 153 setup: passed. A synthetic encrypted workspace with 42 journal records verified selected-day history inclusion, loading beyond 30 records, navigating to yesterday while remaining in Journal, showing its saved note/date, editing a historical note, and selecting today's record at phone width (390 px) with no page overflow.
- Physical Safari/iPad and real Google account behavior were not tested. The full 63-check browser suite belongs to the preceding release; this fix used the targeted journal regression plus the current automated suite.

## Deployment

Continues the same feature branch and PR. Exact deployed source, version, UTC time, IDs and rollback target are recorded in DEPLOYMENT.md after rollout. Existing workspace keys, folder configuration, gatekeeper and image storage are retained.

Deployed at 2026-10-16T09:12:31.766809Z from source `fa260b27692b20a073d2e6ef643fed871c9447be`. Live health confirmed 2.2.1, and live app.js matched the tested build. Exact deployment/version IDs and rollback are in DEPLOYMENT.md.
