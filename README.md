# Life Planner

A personal workspace for planning, projects, finances, routines, reflection and time tracking, deployed on Cloudflare Workers with encrypted D1 synchronization.

**Live:** https://planner.jeremydachojd.workers.dev/ · **Source:** https://github.com/muso-jd/Planner

Open your private activation link for the migrated workspace, then use **Settings → Copy pairing link** on another device. Keep the workspace key safe. Workspace enrollment is private; use the supplied activation link for the migrated records. Original device-local `matrix*V4` records migrate when that device opens the upgraded site using the same workspace key.

Projects opens a Focus dependency workspace with a collapsible outline, Requires/Unlocks inspector and ready next actions; Graph, Outline, Board and Table remain alternate views with search, type/status/project filters and directional chain highlights. Tasks, goals and projects can depend on each other; containment adds required work automatically. Project/goal progress is derived, with empty containers incomplete. Project accent colors inherit through nested work.

Tasks support **Urgent · Priority 0**, automatic overdue urgency, saved filter tabs, sorting and individual export to Google Tasks or Calendar. Shared editors use one labelled category strip, solid white content icons, inside-field labels and a white title-color dot (double-click to inherit). Task completion still asks for a note and confirmation. The sidebar places a green successful-sync timestamp above Life and a full-width Capture button at its bottom. Settings contains theme/accent controls, manual sync and workspace locking.

Budget has Total, Business, Personal and Analytics tabs, recurring income/expenses, future-payment countdowns, file attachments and task/event links. Monthly cash flow and the separate open-task funding balance are deliberately not added together. Routines support daily/weekly schedules and month-end offsets; trackers use 28-day dot grids. Journal contains notes, feelings and a restorable archive.

Morning/evening reflections show visible Vienna save timestamps, preserved after edits, with an honest Last edited fallback for legacy records. Today also shows saved reflection status. Calendar offers separate saved weekly/monthly routine visibility switches while daily routines stay hidden.

Calendar always uses a seven-column month/week grid, including on phones via horizontal scrolling. Journal history and archive open from the same toolbar as new entries. Insights has eight tabs and 7/28/90-day reporting. Health has Physical, Mental, Sleep and Analysis tabs, manual weight/workout/sleep/stress entries, and reviewed read-only Google Health imports for up to 365 days, including per-type availability reports. Workout intensity combines a separately labelled self-reported RPE and available device heart-rate zones. Recovery time is a user-adjustable planned-rest countdown, not a measured recovery score.

Phone navigation prioritizes **Notes, Diary, Feeling and Time**, with the rest of the workspace behind **More**. Notes is the initial phone view and the bottom Capture button opens a new note. Time has its own timer and session history; feeling check-ins are saved in Journal. Desktop and iPad retain full navigation.

Diary entries support image uploads and previews. Google Drive can receive normal JPEG copies and encrypted full backups after OAuth/Picker setup; the requested destination is configured privately. See [Google setup](docs/GOOGLE.md).

Budget now includes **Category budgets**: create weekly/monthly Food, Travel or other allowances, add assigned expenses, and switch Month/Week/Day balances. Calendar-day proration, dated spending and future scheduled spending are labelled separately. Project/goal funding is calculated from nested task own costs and shown with a breakdown. Recurring ledger entries have a first transfer/payment date and optional T−day reminders while Planner is open. Routines can be linked to time blocks and follow their Calendar schedule without creating duplicate records.

## Develop

Node.js 24 or newer. Production has no npm dependencies.

```sh
npm run build
npm test
```

`public/` contains the application. `src/worker.mjs` implements its API. The build embeds the public files into `dist/worker.mjs`; generated files are ignored. The API tests use real SQLite through Node's built-in `node:sqlite` with a D1 adapter. Browser checks use Playwright and an available Chromium executable; see the change report for the actual environment used.

## Documentation

- [Capabilities and limits](docs/FEATURES.md)
- [Architecture and data protection](docs/ARCHITECTURE.md)
- [Deployment and rollback](docs/DEPLOYMENT.md)
- [Google connection setup](docs/GOOGLE.md)
- [Upgrade and validation report](docs/changes/2026-10-16-life-workspace.md)
- [Urgency and color update](docs/changes/2026-10-16-urgency-colors.md)
- [Diary images and Drive](docs/changes/2026-10-16-diary-images-drive.md)
- [Control Center 3 redesign and validation](docs/changes/2026-10-16-control-center-3.md)
- [Calendar, Health and Insights update](docs/changes/2026-10-16-calendar-health-insights.md)
- [Dependencies and annual Health import](docs/changes/2026-10-16-dependencies-health-history.md)
- [Changelog](CHANGELOG.md)

This public repository contains application code and synthetic tests only. Personal list contents, migrated data, workspace keys and OAuth access tokens are excluded.

Typography uses locally served Noto Sans Mono. Font licensing and source provenance are recorded in `public/fonts/README.md`.

Android: open the live URL in Chrome, then choose **Install app** from the browser menu or use **Settings → Install app**. On iPhone/iPad, Safari → Share → Add to Home Screen uses the custom Life icon. Use your existing workspace key; after an online load, cached records can be edited offline and synchronized on reconnect. Run `npm run test:pwa` for installation/offline checks and `npm run test:control-center` for the redesigned workflows (Playwright required).
