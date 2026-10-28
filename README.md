# Life Planner

A personal workspace for planning, projects, finances, routines, reflection and time tracking, deployed on Cloudflare Workers with encrypted D1 synchronization.

**Live:** https://planner.jeremydachojd.workers.dev/ · **Source:** https://github.com/muso-jd/Planner

Open your private activation link for the migrated workspace, then use **Settings → Copy pairing link** on another device. Keep the workspace key safe. Workspace enrollment is private; use the supplied activation link for the migrated records. Original device-local `matrix*V4` records migrate when that device opens the upgraded site using the same workspace key.

Projects opens a Focus dependency workspace with a collapsible outline, Requires/Unlocks inspector and ready next actions; Graph, Outline, Board and Table remain alternate views with search, type/status/project filters and directional chain highlights. Tasks, goals and projects can depend on each other; containment adds required work automatically. Project/goal progress is derived, with empty containers incomplete. Project accent colors inherit through nested work.

Tasks support **Urgent · Priority 0**, automatic overdue urgency, saved filter tabs, sorting and individual export to Google Tasks or Calendar. Shared editors use one labelled category strip, solid white content icons, inside-field labels and a white title-color dot (double-click to inherit). Task completion still asks for a note and confirmation. The sidebar places a green successful-sync timestamp above Life and a full-width Capture button at its bottom. Settings contains theme/accent controls, manual sync and workspace locking.

Planner 3.5 offers optional **Pearl**, **Dusk** and **Obsidian** liquid-glass themes under **Settings → Make it yours**, alongside Dark, White and Black. Visual previews, frosted surfaces, soft reflections, system typography and a floating dock carry across workspace views. Theme/accent choices sync with the encrypted workspace and remain available offline. Reduced transparency and increased contrast are respected when the browser exposes those preferences. See the [theme implementation and validation report](docs/changes/2026-10-17-liquid-glass-themes.md) for release details.

Planner 3.6 adds **Carbon**, **Black Ice** and **Amethyst**, all with true black backgrounds, and hides zero-cost task rows from Budget while keeping funded descendants and calculated totals. See the [black-glass and funding visibility report](docs/changes/2026-10-17-black-glass-funding-visibility.md) for validation and release details.

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



### 3.6.1 readability and routine window

Create a linked time block without leaving the routine editor. Compact text is 50% larger; dark-theme subtitles and field captions are white with gray supporting text. See [features](docs/FEATURES.md) and [change report](docs/changes/2026-10-20-routine-block-readability.md).


### 3.7.0 routine groups and UI controls

Routines now live inside project-style time-block cards, with independent routines shown separately. Create time blocks beside New routine. Settings → UI typography controls five shared sizes with adaptive scaling and individual adjustments. Tasks and routines can be duplicated into an editable draft. See [change report](docs/changes/2026-10-20-routine-groups-adaptive-fonts.md).


### 3.7.1 Today agenda and priority badges

Today shows all open urgent tasks without a three-task cap, including blocked tasks. Remaining open tasks and outgoing ledger payments due in the selected Monday–Sunday week appear below, with recurring occurrences and transfer dates resolved across month/year boundaries. Urgent tasks appear once. Ledger entries have no settlement state; this is the scheduled payment list, not an unpaid-bill inference. Three additional available actions remain below the agenda.

Every task title in shared lists and Calendar shows its rating; P0/overdue keeps red styling. Existing semantics remain: P0 is urgent, otherwise lower nonzero ratings mean greater importance. Daily rhythm uses equal-width panels, a full-width title, compact time/category metadata, natural wrapping and existing check/edit/duplicate controls. Canonical block times are respected.


### 3.7.2 Compact Today rows and ascending priorities
Task rows remove duplicate/Google-send controls and use equally sized checkmark, clock and P0–P10 chips. Today’s desktop agenda is two-thirds actions and one-third daily rhythm; screens at 1150 px and below stack the panels. Routine rows retain completion and editing, show only icon/title/right-aligned time, and truncate long titles to one line with the full title available on the edit control. Nonzero priority sorts P1 (highest) through P10 (lowest), after urgent work; the explicit Due date sort continues to prioritize dates. Editors, badges and Insights follow that meaning. Saved task ratings are unchanged.


### Huawei Health — 3.8.0
Health now offers a separate direct Huawei connection: sleep-stage intervals, daily heart-rate/resting-HR/stress/SpO₂ sample summaries and individual weight measurements. Stress retains Huawei’s 1–99 scale; sleep-stage calendar-day totals remain separate from nightly summaries. Server-side OAuth keeps the app secret private, and tokens are page-memory-only. Imports require preview/review, preserve manual data and notes, and use existing encrypted sync. Live connection requires a Huawei web app, approved scopes, and Worker credentials; none are invented or bundled. HRV/respiratory availability for GT 2, nightly scores and activity/workout mapping remain unverified/unimplemented. See [Huawei setup and capability matrix](docs/HUAWEI.md).
