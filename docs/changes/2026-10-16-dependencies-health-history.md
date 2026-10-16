# Planner 3.2: dependencies and annual Health history

Calendar excludes routines while keeping their records, reminders, Today scheduling and tracking. Parents require their subtasks; goal/project completion is derived from nonempty contained work plus explicit prerequisites. Stored confirmations remain intact, and effective completion changes immediately if required work reopens. Tasks, goals and projects can be prerequisites. Editors reject cycles across prerequisite and containment links; imported cycles remain blocked.

Four dependency views share search/type/status/project filters and full/upstream/downstream highlights. Graph links distinguish contained work from explicit prerequisites; nodes can be highlighted with mouse or keyboard and edited from the highlighted-item action. Project accents style cards, progress and inherited work separately from custom title colors. Nested containers appear on project cards; parent task rows show subtask rollup.

Health adds an annual preview/import with adjacent 28-day windows, pagination, stopping and partial-result review. Eight metrics are checked under the existing three read-only scopes: sleep, exercise, weight, daily HRV, resting heart rate, daily oxygen saturation, daily respiratory rate and body fat. Availability reports distinguish returned/importable records, date coverage, empty results and API errors. Other enabled APIs/types remain unchecked. Imports deduplicate and batch writes, retaining manual readings, annotations and tombstones. Tokens stay session-only.

Background sync no longer removes the Google import review or collapses the Health connection panel. No database migration, new binding, personal-health import, production data rewrite or main-branch merge is part of this change.

Validation evidence and deployment state are recorded below after the relevant checks complete. Physical Safari/iPad/phone and real Google authorization/read access are not claimed. The agent browser showed the locked production workspace; enabling APIs has not been independently verified in the user's Google project.

## Validation

- `npm run build` passed; `npm test` passed 36 tests (six new dependency/history cases).
- `tests/dependencies-history.mjs`: 30 browser assertions, 239 mocked Health requests, no page errors. Covered all four views, recursive project filtering, status/search, chain highlighting, inherited accent persistence, parent blocking, mixed-cycle rejection, downstream unblock/reblock, 365-day pagination, deduplication, permission failures, encrypted report persistence and token exclusion.
- Existing browser suites: 63 general, 60 Control Center and 57 Calendar/Health checks passed. Final relevant-suite reruns are recorded in rollout evidence.
- PWA suite passed static-shell caching, installability, offline edit/reopen and reconnect sync. No credentials or API responses entered the shell cache.
- Desktop 1512×982, iPad 1024×1366 / 1366×1024 and phone 390×844 Chromium layouts were simulated. Screenshot review found a missing grid span on the new explorer; corrected it and added a width assertion. Screenshots after correction were inspected. Physical devices/Safari remain untested.
- Background-sync render races and the intentional independent project-accent behavior required updates to inherited test expectations; all tested corrections passed. A fresh browser download was unavailable; an existing working Chromium 153 binary completed validation.
- Actual owner Health values, OAuth grants and enabled Google Cloud APIs remain unverified; the live workspace was locked in the agent browser. No personal data was added to this public repository or imported into production.
