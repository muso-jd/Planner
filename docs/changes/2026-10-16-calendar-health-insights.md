# Calendar, Health and Insights — 3.1.0

## Result and scope

This update addresses the next navigation/editor refinements and adds reviewed Google Health data access and broader descriptive reporting. Branch `feature/calendar-health-insights` is stacked on `feature/planner-control-center` (PR #2), not merged into main. The previously deployed 3.0.0 Worker remains the rollback target. The source commit and actual deployment evidence are recorded in DEPLOYMENT.md after publication.

| Request | Result |
|---|---|
| Plan → Calendar; always a grid | Monday-first month and week grids, selected/today dates, per-day add action; seven columns retained on phones through horizontal scrolling |
| Solid icons | Local filled SVG silhouettes replace outline paths; solid navigation icons retain tab colours |
| White content icons | White category, entry and event glyphs; category colours remain in labels/backgrounds/title colours and glow; white-theme icons gain a contrast backing |
| Simplify menus | Keep the labelled icon/category strip and Personal/Business scope switch; remove the duplicate icon-only strip; use a labelled routine-type select |
| Fix New ledger entry | Explicit button type; every generic editor open restores its action bar after import review |
| Remove bottom-left Sync | Removed sidebar Sync control; manual sync remains in Settings and automatic sync is unchanged |
| Expand Capture | Capture spans the sidebar action width, including the phone bottom bar |
| Top sync timestamp | Timestamp above Life; green when synced, red on issues, neutral while pending; detailed accessible label/tooltip retained |
| Individual Google export | Task row and saved-task editor action opens Tasks/Calendar choice; sends only that task and updates its existing exported destination item |
| Journal toolbar/history | Selected day, History, Archive and entry actions share one toolbar; History appears only when chosen; pagination and day editing retained |
| Broader Insights | Overview, Time & focus, Tasks, Routines, Budget, Wellbeing, Projects & goals and Trackers tabs; 7/28/90-day range controls |
| Phone usage priorities | Notes/Diary/Feeling/Time are the primary phone routes; other sections remain in More. Notes is the landing view, Capture creates a note, feeling saves to Journal, and Time exposes timer/session history. Desktop/iPad retain full navigation |
| More graphs/tracking | Daily trends, category and weekday bars, task priorities, completion counts, routine consistency, monthly recurring cash flow, task funding, project/milestone/funding progress and tracker event history |
| Health navigation | Physical, Mental, Sleep and Analysis tabs in a dedicated Health section |
| Google Health | Separate read-only browser OAuth; preview/import sleep, exercise, weight, daily HRV and resting heart rate with pagination and per-type error reporting |
| Weight | Manual weight entries plus imported Google readings, trend and editable manual history |
| Workouts/intensity | Manual/imported duration; self-reported RPE 1–10; device heart-rate zones, average pulse and distance when available |
| Recovery time | Optional adjustable rest hours per workout, with a countdown from its end; no measured physiological recovery is claimed |
| Stress | Manual 1–5 check-ins; HRV stays separately labelled because Google's documented API has no direct stress-score type |

## Implementation and data behavior

The new Calendar, Health, Insights, Health normalization and Google export modules use the established vault, merge, conflict and backup mechanisms. Health records use `type:health`; full JSON import accepts that type. Google Health tokens remain memory-only, separate from the Calendar/Tasks and Drive tokens. The only Worker behavior changes are health version 3.1.0 and permitting the Health API origin in CSP. No schema change, new binding, owner-record migration or private Google configuration rewrite is needed.

Health sleep reads use the reconciled v4 endpoint; other supported metrics use paginated lists with documented civil/daily filters. Preview shows successes and errors separately. Stable IDs prevent repeat imports from creating duplicate readings. Manual readings and workout notes/RPE/rest annotations remain intact; archived Google readings are not resurrected. Missing measurements are gaps rather than fabricated zero values. Weight is normalized from grams to kilograms; durations use minutes and documented protobuf seconds. Sleep uses minutes asleep or actual sleeping-stage intervals, never substitutes time in bed.

Task exports track Tasks and Calendar destination IDs independently. The old bulk-export link format remains readable. Repeated exports update only Planner-owned items. Calendar mirrors of exported tasks are skipped when importing blocks; Tasks imports match the existing exported task. New recurring task instances clear export links. Undated tasks can go to Tasks; Calendar requires a date and uses all-day dates when no time exists. Saved-task export does not include unsaved editor changes.

Insights derives current inventory separately from dated activity. Finished sessions contribute recorded focus time; historical task counts require completion timestamps and use Vienna reporting dates. Routine analytics use the current schedule. Charts offer hover descriptions, keyboard/tap date selection and expandable data tables. Month-level chart selections normalize to a valid first-of-month reporting date.

## Validation

- `npm run build` and `npm test`: 30 passing automated tests. Seven new tests cover calendar boundaries, Health filters/scopes, documented normalization/units/IDs, sleep fallback, planned rest/validation, missing data semantics and Google payloads/reminders/Vienna dates.
- `tests/calendar-health.mjs`: 57 passing Chromium checks with zero page errors. Includes month/week grids and day creation, solid white icons, sidebar state/width, editor reset after import, on-demand Journal history, individual Tasks POST/repeat PATCH/Calendar POST and undated rejection, export reimport without duplicates, manual health entries, read-only Health scope/requests, sleep reconciliation, multi-page weight, preview-before-import, per-type 403 handling, repeated-import preservation, all Health/Insights tabs, range/date selection, encrypted cross-device readings and absence of OAuth tokens from saved records. Phone checks verify the four primary routes, Notes landing/new-note capture, feeling-to-Journal save, timer start/stop/session history and More navigation.
- Existing `tests/browser.mjs`: 63 checks; `tests/control-center.mjs`: 60 checks; zero page errors. Tests use automatic sync triggers after removal of the sidebar button and the intended Journal/routine controls.
- Focused PWA installability/offline/reconnect, 42-entry Journal pagination/navigation/editing, mood sync, optional task deadline and 1 MiB three-chunk backup/restore regressions passed. Chromium reports no installability errors.
- Desktop 1512×982, simulated iPad portrait 1024×1366/landscape 1366×1024 and phone 390×844 exercised. Calendar, Health and Insights screenshots plus white-theme Health/workout editor inspected. No viewport-wide overflow; Calendar scrolling stays inside its grid container.
- Browser testing caught a weekly-grid CSS class collision, a numeric step-base error in the workout form and a tab-scroll selector typo; all were corrected before publication. Ambiguous test selectors and history tests were updated for the intended controls. Final suites rerun after corrections.

## Limits and setup

The user must enable Google Health API in their Google Cloud project and authorize the three documented read-only Health scopes. Real owner authorization, live Google health reads/writes, physical Android/iOS installation and physical Safari/iPad behavior are unverified. Tests use synthetic workspaces and intercepted Google endpoints; no owner records or external Google records are changed by validation.

Health imports are explicit and manual, not continuous/background sync. Empty or denied types remain visible as empty/error states. Google-side deletions do not propagate. Manual entries can be edited/archived; imported measurement values are read-only and workout annotations editable. Health lists show up to 30 latest entries per type, with trends over 28 days ending on the selected date. No derived stress, readiness or physiological recovery algorithm is introduced. RPE/rest hours must be supplied by the user; Google device metrics remain separately labelled. Workout lists can include distinct source records returned by Google; this does not infer cross-provider equivalence beyond Google's own identities.

There is no Apple health/calendar integration. Existing Drive images/backups, authenticated Gatekeeper binding and encrypted sync remain. Files and API data stay outside the service-worker shell cache. Existing PWA clients must allow the update to download, close old planner windows/tabs and reopen.

## References checked 2026-10-16

- https://developers.google.com/health/get-started
- https://developers.google.com/health/data-types
- https://developers.google.com/health/filters
- https://developers.google.com/health/reference/rest/v4/users.dataTypes.dataPoints
- https://developers.google.com/health/reference/rest/v4/users.dataTypes.dataPoints/list
- https://developers.google.com/health/reference/rest/v4/users.dataTypes.dataPoints/reconcile
- https://developers.cloudflare.com/workers/best-practices/workers-best-practices/

Workers type definitions retrieved: `@cloudflare/workers-types@5.20261016.1`. Deployment retains existing bindings and compatibility date; no new Node compatibility requirement is introduced.
