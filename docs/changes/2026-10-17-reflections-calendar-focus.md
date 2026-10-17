# Planner 3.3 — reflection timestamps, Calendar layers and Focus

## Result

Morning/evening diary reflections now display save date and time in Vienna in Journal, history/archive and editors. Today displays latest saved Morning/Evening status separately from scheduled reminder times. New diary saves get a stable `at`; edits preserve it. Legacy entries with only `updated` are labelled Last edited. Unknown original times are never fabricated.

Calendar adds independent weekly/monthly routine layer toggles, both initially off and synced through encrypted settings. Daily routines remain hidden. Existing schedules, month-end offsets, per-day check state, reminders and routine data are retained.

The default dependency experience is now Focus: collapsible project/task outline, selected-item inspector, Requires/Unlocks and ready upstream actions. Advanced filters are initially collapsed; narrow-screen item selection scrolls to details. Graph, Outline, Board and Table remain optional. This redesign does not change dependency/completion semantics or stored work.

## Validation and boundaries

- Build and 38 unit/API tests passed, including timestamp provenance/timezone and independent routine-layer cases.
- New reflection/calendar/focus browser suite passed 13 checks with no page errors: stable timestamp after edit, new reflection timestamp persistence, legacy labels, foreign device timezone, weekly/monthly visibility and reload persistence, default Focus inspector, editing, collapse/expand, four viewport sizes.
- Existing Control Center suite passed 60 checks; Calendar/Health passed 57 checks; PWA installability/offline/reconnect checks passed.
- Existing dependency/history suite passed 30 checks with 239 mocked Health requests. Journal regression passed same-day/history pagination, navigation, edits and phone layout.
- Simulated desktop, iPad portrait/landscape and phone Focus screenshots inspected. Real Safari and physical devices are not claimed.
- No production owner-record writes, database migration, new binding, Health scope changes or main-branch merge. Source/deployment evidence is recorded in DEPLOYMENT.md after rollout.
