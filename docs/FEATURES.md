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

## Urgency and entry colors (2.1.0)

- **Urgent · Priority 0** is a dedicated option in a task's priority selector. Existing importance scores 1–10 keep their meaning (higher is more important); 0 is the urgent override.
- An unfinished task becomes effectively P0 after its timed deadline in Europe/Vienna, or after its due date ends if no time is set. This is derived without overwriting the chosen importance. Rescheduling removes automatic overdue urgency; manual P0 remains urgent. Completing/archiving removes urgency.
- A persistent urgent summary appears across views, including phone capture. Urgent/overdue filters and urgent-first ordering make the queue reviewable. Budget/time/task prerequisites still apply to urgent work.
- In **Connect → Reminder preferences**, choose overdue reminders: every 30 minutes, hourly (default), daily or off. One grouped toast/optional browser notification lists up to three overdue titles. A per-device timestamp throttles reminders across reloads. Foreground reminders require the page to be visible; there is no closed-browser push.
- Edit an entry and choose **Custom title color**. Using the color picker enables the override. Turning it off restores the linked project's color, otherwise the category color. The color applies to entry title text across list/card/calendar/dependency views, not all metadata. Urgency badges retain a separate readable label/color. Colors synchronize and are included in full JSON backups; Google/ICS do not carry Planner's title-color override.

- Area/category icons appear on the left of entry titles and category tags. Existing Photography, IT, Household, Hardware, Cycling, Commerce and Health categories have matching icons; other categories use sensible defaults. Entry editors allow an icon override. Projects and goals now also expose category selection.
- Completing a task opens a dedicated note window. **Keep open** or Escape cancels; **Confirm completion** records the optional note and marks the task done. Notes remain separate from planning notes, sync with the task, and can be read in the task editor's **Completion notes** history. Recurring successors start with an empty completion history. Urgent/resource-blocked tasks retain prerequisite checks.

## Diary images and Google Drive (2.2.0)

- Diary editors accept one or several images, show thumbnails and a larger viewer, and synchronize references across devices. Copies are optimized to JPEG at up to 1600 px; originals are not retained. Format decoding depends on the browser.
- Images have their own encrypted Cloudflare storage rows, scoped to the workspace. This keeps them out of the 5 MB main sync snapshot and keeps diary display working without Google authorization on every device.
- When Drive is enabled and authorized, diary photos are additionally saved as **ordinary, unencrypted JPEGs** in the selected Drive folder. They can be viewed in Drive. When disconnected or an upload fails, the Cloudflare copy remains available and the image is marked pending; use **Save pending images to Drive** after connecting.
- **Save backup now** writes an encrypted full backup (including diary images) into the selected Drive folder. The optional daily backup runs while Planner is open and its short-lived Drive authorization is valid. It is not a server-side/unattended schedule. Large backups use a resumable upload session; interrupted uploads require retrying the backup.
- Full local JSON downloads include image payloads. Import accepts full local backups and encrypted `.planner-backup.json` files using the current workspace key. Removing an image from a diary entry detaches its reference; no Drive file or stored image is permanently deleted. Cancelled uploads can leave retained, encrypted orphan copies; automatic purging is not implemented.
- The provided destination folder is stored in encrypted workspace settings, not in this public repository. Its existence/permissions have not been verified with a real Google account. Drive saving is not active until the user configures OAuth/Picker and grants folder access. Calendar/Tasks authorization alone does not grant Drive access.
- The existing Artlook gatekeeper is connected internally for read-only, folder-restricted listing. This reuses its hidden API key without exposing it or changing Artlook. **Check Artlook gatekeeper** tests the read path; it cannot authorize uploads or replace Google write consent.
