# Current features

| Area | Behavior |
|---|---|
| Today | Three suggested ready actions, daily progress, mood entry, routines, blocks and morning/evening entries |
| Capture | Quick notes, convert note to task, mood/feeling entry, timer; default landing on phones |
| Plan | Week view, categorized blocks/events/tasks; edit date/time by tapping; recurrence of tasks generates the next dated task on completion |
| Tasks | Search/filter, completion, importance, due date/time, 30m/1h/1d reminders, repeat interval, focus date |
| Projects/goals | Funding target, amount saved, start/target dates, linked tasks, milestones and progress |
| Dependencies | Select prerequisite tasks; circular chains rejected; interactive SVG nodes open editors; budget/time allocation can block completion |
| Subtasks | Parent task grouping, separate prerequisite links; parent cycles rejected |
| Routines | Adjustable time, weekdays, own dose/instructions, medication/supplement kinds, completion per selected date |
| Budget | EUR income/expenses, business/personal scope, monthly cash flow, spending limit, category totals, CSV |
| Journal | Diary, morning/evening templates, mood history and values/conscience check-in |
| Tracking | Timestamp timer that survives reload, manual sessions, abstinence and time-since logs, adjustable start dates |
| Insights | 28-day completion heatmap, mood distribution, recorded hours by category, cash flow, blocked work and estimated backlog |
| Connections | Encrypted device sync; reviewed JSON/ICS import, full JSON/ICS export, Google OAuth token connection with on-demand pull/push |

## Deliberate limits and setup

- Google needs your own OAuth web client ID and API consent. There is no preconfigured Google account or unattended bidirectional sync. Authorization and actual Google account writes are not verified until configured.
- Google Tasks supports a date, not scheduled time/reminder fields. Use Calendar time blocks for timed external reminders.
- Browser reminders run while Planner is open; no Web Push service or closed-browser delivery is implemented. Morning/evening prompts default to 04:00 and 23:00 Vienna time and are adjustable.
- Apple integrations are excluded.
- ICS import supports basic VEVENT/VTODO title, notes, due/start, completion and basic recurrence. It does not expand RRULE/EXDATE/VTIMEZONE into occurrences, preserve all alarms, or handle every third-party timezone. Use Google import for expanded calendar occurrences.
- Repeating tasks create one next occurrence on completion. Repeating blocks expand in Today and the week view and export as recurrence rules. Editing a repeating block changes the series; per-occurrence exceptions are not implemented.
- Analytics describe entered records, not inferred facts. Historical routine percentages reflect the current routine roster; archive/edit can change the denominator.
- Budget entries are a manual planning ledger, not bank sync, tax calculation or double-entry bookkeeping.
- Routine medication instructions are entered by the user. Imported routine slots were placeholders, not a verified medication plan.
- Cloud history retains encrypted save versions; UI currently lists their timestamps rather than offering one-click restoration. History is unpruned, so storage grows with saves.
- Encryption protects cloud records. The browser's working cache is readable on the device; lock clears the active cache once sync is complete. No service worker/offline shell is installed; keep the page open for offline editing.
- One current timer is enforced within each loaded workspace, but simultaneous offline timer starts on separate devices can create multiple sessions for later manual reconciliation.
