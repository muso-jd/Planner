# Current features

| Area | Behavior |
|---|---|
| Today | Three suggested ready actions, daily progress, compact mood entry, scheduled routines/time blocks and morning/evening entries |
| Capture | Quick notes, convert note to task, mood/feeling entry, timer; default landing on phones |
| Calendar | Month/week seven-column grids on all viewports; horizontal scrolling on phones; tasks and blocks; routines remain in Today/Routines; select days or add events; task recurrence generates the next dated task on completion |
| Tasks | Saved category/text tabs, six sort options, confirmation-based completion, importance, optional due date/time, reminders, repeat interval, focus date and funding estimates |
| Projects/goals | Funding, dates, nested goals/projects, contained actions/milestones; derived completion/progress; separate inherited project accent color |
| Dependencies | Task/goal/project prerequisites plus required contained work; mixed cycles rejected; Graph/Outline/Board/Table views; search/type/status/project filters; full/upstream/downstream highlights; budget/time gates retained |
| Subtasks | Parent task grouping, separate prerequisite links; parent cycles rejected |
| Routines | Daily/weekly/monthly tabs, end-of-month offsets, Monday-first weekday circles, inline time, type icons and completion analysis; old instructions retained but no instruction input |
| Budget | Recurring EUR income/expenses, business/personal scope tabs, monthly cash-flow projections, timing countdowns, links, files and separate task funding |
| Journal | Notes, diary, morning/evening templates, compact mood entry and values check-ins; day/history/archive actions share one toolbar; history is shown on demand |
| Tracking | Abstinence/time-since logs and paged 28-dot grids; timer and recorded-session history remain in Capture, with a running dock, not Trackers |
| Insights | Overview, Time & focus, Tasks, Routines, Budget, Wellbeing, Projects & goals and Trackers; 7/28/90-day ranges, trends, category/weekday bars and chart data tables |
| Health | Physical, Mental, Sleep and Analysis tabs; weight, workout, sleep and stress entries; Google Health sleep/exercise/weight/HRV/resting-heart-rate imports; RPE and device zones; adjustable planned rest |
| Connections | Encrypted device sync; reviewed JSON/ICS import, full JSON/ICS export; on-demand Calendar/Tasks pull/push plus individual task export; separate read-only Google Health authorization |

## Deliberate limits and setup

- Google needs your own OAuth web client ID and API consent. There is no preconfigured Google account or unattended bidirectional sync. Authorization and actual Google account writes are not verified until configured.
- Google Tasks supports a date, not scheduled time/reminder fields. Use Calendar time blocks for timed external reminders.
- Individual task rows offer Send to Google, with Tasks/Calendar choice. Undated tasks can go to Tasks; Calendar requires a date. Previously exported Planner-owned items update in the same destination. Export links for Tasks and Calendar are kept separately. Archived remote items are not recreated automatically on a failed PATCH.
- Health imports require Google Health API enabled and consent to three read-only Health scopes. Tokens stay in browser memory; imported readings join the encrypted workspace and full backups. Imports are manual, reviewed and paginated; errors are reported per data type, and successful types can still be imported. No live Google account authorization is inferred from fixture tests.
- Google Health has no documented direct stress-score data type. Stress is self-reported; HRV is shown separately. Workout RPE is self-reported, device heart-rate zones are labelled, and planned rest hours do not prove physiological recovery. Manual health entries can be edited/archived; imported measurement values are read-only, with editable workout notes/intensity/rest annotations.
- Health trends cover 28 days ending on the selected date; weight/workout/sleep/stress lists show the latest 30 records per type. Google imports support 7/28/90-day windows. Repeated imports update stable Google IDs, preserve manual entries/annotations and do not resurrect archived records. Google-side deletions are not propagated.
- Browser reminders run while Planner is open; no Web Push service or closed-browser delivery is implemented. Morning/evening prompts default to 04:00 and 23:00 Vienna time and are adjustable.
- Apple Calendar/Reminders/Tasks integrations are excluded. Custom iOS Home Screen icon/installation metadata is included as requested.
- ICS import supports basic VEVENT/VTODO title, notes, due/start, completion and basic recurrence. It does not expand RRULE/EXDATE/VTIMEZONE into occurrences, preserve all alarms, or handle every third-party timezone. Use Google import for expanded calendar occurrences.
- Repeating tasks create one next occurrence on completion. Repeating blocks expand in Today and the week view and export as recurrence rules. Editing a repeating block changes the series; per-occurrence exceptions are not implemented.
- Analytics describe entered records, not inferred facts. Historical routine percentages reflect the current routine roster; archive/edit can change the denominator.
- Budget entries are a manual planning ledger, not bank sync, tax calculation or double-entry bookkeeping.
- Routine medication instructions are entered by the user. Imported routine slots were placeholders, not a verified medication plan.
- Cloud history retains encrypted save versions; UI currently lists their timestamps rather than offering one-click restoration. History is unpruned, so storage grows with saves.
- Encryption protects cloud records. The browser's working cache is readable on the device; lock clears the active cache once sync is complete. The public app shell supports offline reopening after one successful online load; cached workspace records can be edited offline and sync when the connection returns. First-time unlock and uncached diary images need a connection.
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

## Journal history (2.2.1)

Journal history includes all saved non-archived diary, morning/evening and values entries, including the selected day. View day remains inside Journal and shows the chosen day’s full entries and images. Load older entries retrieves the next 30 records from the synchronized workspace; no older entries are silently hidden. Undated imported entries remain editable.

## Category icon presentation (2.2.2)

List entries reserve a full-height icon rail beside the title and metadata. White category glyphs glow in the entry’s effective color, including custom colors and project inheritance. Glyphs preserve their proportions for long diary entries. Phone layouts use a narrower rail, and card headings have larger inline icons. Category badges use the same white/glow treatment.

## Compact icons and typography (2.2.3)

Category icons now use compact 28 px glyphs (24 px on phones), thinner rounded strokes and the coordinated white/color glow. Additional space separates icons from text; title buttons no longer indent titles relative to category/metadata lines. Entry titles are 17 px on desktop/tablet and 16 px on phones, with larger card titles. The planner uses locally served Noto Sans Mono, with system fallback for unsupported glyphs.

## Android installation (2.3.0)

Open the live planner in Android Chrome. Use Connect → Install on Android, or Chrome’s menu → Install app / Add to Home screen → Install. A direct install button appears when the browser offers its installation event; otherwise the dialog explains the menu route. The unlock screen also includes this control. Installation creates a standalone launcher entry; browser/device behavior can vary. There is no Play Store listing or APK download.

Use the same workspace key and optionally Keep this device connected on your own phone. Phone launches prioritize capture, mood and timing. After loading online once, the app shell and existing device records can reopen offline; changes remain local until reconnect sync. Uncached diary images, Google exchange and backups need a connection. Installation does not enable closed-app reminders.

Updates wait until all existing planner tabs/app windows close, protecting in-progress edits. Reopen online to check for an update; close all planner windows and reopen again to activate a downloaded update.

## Feelings in Journal (2.3.1)

Save feeling and mood buttons from Today, Capture or Journal save a single mood observation that also appears in Journal’s selected-day view and history. Existing mood observations are included automatically, without migration or duplicate diary records. Entries show the rating (or Unrated), feeling/context and Vienna time. Historic entries use their existing update timestamp where no check-in timestamp exists; undated imported records remain in history. Editing an entry supports date, rating, context and optional notes. Mood analytics continues to use the same underlying records.

## Urgent alarm color (2.3.2)

Urgent/P0 badges, summary headings/actions, urgent row markers and overdue deadline text use vivid alarm red (#ff4d4f), with coordinated red borders/backgrounds. Task title and category colors retain their selected colors.

## Optional task deadlines (2.3.3)

In a task editor, choose Remove due date, then Save changes. This clears the due date/time and deadline reminder. Clearing the date field manually has the same saved result. Cancel leaves the saved deadline unchanged. Undated tasks stay in the backlog and remain undated when edited; they no longer count as overdue. Explicit Urgent / Priority 0, focus dates and recurrence preferences remain available. Existing recurring-task behavior schedules the next occurrence after completion.

## Current shared controls

At phone widths (600 CSS px or less), the primary bar contains Notes, Diary, Feeling and Time, plus More for other workspace sections. Notes is the phone landing view, Capture creates a new note, and the Time view has a timer plus recorded-session history. Feeling saves check-ins into Journal. Urgent-task banners are omitted from these four phone views to keep capture immediate; urgency remains available in Tasks/Today through More. Notes keeps recorded-time history in the dedicated Time view. Desktop/iPad retain the full navigation. Changing viewport width updates the navigation without reloading records.

The header is replaced by sidebar navigation with a full-width Capture action at the bottom. Manual sync and locking are in Settings. The last successful sync timestamp is above Life, green on success and red on issues, with detail in its tooltip/accessibility label. Phone navigation stays at the bottom, with safe-area spacing.

Editors use inside-field labels, an inline title-color dot and one single-row category strip with labelled solid icons. The duplicate icon-only strip is removed. Content icons are white; selected category/scope backgrounds and labels retain category colours. Navigation icons retain tab colours. The title dot opens the native picker; double-click restores inheritance. Income/expense is chosen with +/− controls and scope with Personal/Business icons. Task recurrence, funding, project and dependencies are grouped in an expandable section. Task filters are tabs; add synchronized category/text tabs and choose urgency, due date, title, recently updated, required budget or shortest-duration sorting.

Budget's Total/Business/Personal tabs show a full-month cash-flow projection and a dated-through-today subtotal. Daily/weekly/monthly/yearly ledger series expand in each selected month; editing changes the series. Future entries show remaining calendar days and an automatic timing category (Due soon within seven days), without changing their semantic area. The Analytics tab shows six months. Task/event links open their connected records. The separate task panel sums expected income minus required budget for open tasks, excluding completed/archived work; allocations are not income. It is not added to monthly cash flow. Dates in the manual ledger are not proof of payment; there is no bank reconciliation or per-occurrence settlement/exception system.

Attach files to ledger entries, tasks, events, routines, trackers, notes or diary entries: up to 20 MiB each, with encrypted chunk storage, cross-device downloads and inclusion in full local/Drive backups. Downloads require a connection; files are not in the offline shell cache. Detaching/cancelling retains encrypted chunks rather than permanently deleting data. Large full backups use browser memory and can take time.

Routines have Daily/Weekly/Monthly/Analysis tabs. Daily circles include/exclude days, Monday first; weekly selects one weekday. Monthly uses T−offset from month end: 0 last day, 1 previous day, 0–30 supported with short-month clamping. Click the inline HH:mm time to edit. A labelled Routine type select keeps type adjustable without the removed icon-only rail. The instruction input is removed while old text remains stored. Completion controls are gray checkmarks that turn signal green; tasks retain confirmation and a completion note window.

Trackers use four rows of seven dots, paging every 28 elapsed days while retaining the total day count. The timer is removed from Trackers but remains in Capture, along with recorded-session history and the running dock. Journal includes new notes, diary and feelings plus a restorable archive. New archives retain mood/diary observations in descriptive analytics; legacy deleted journal records can also be restored. Five progressively filled mood circles, a context field and a briefly green save checkmark appear under the title in Journal/Capture/Today. Selecting a mood does not save until the checkmark is pressed.

On iOS, Safari → Share → Add to Home Screen uses the custom 180px icon. Existing installed icons may require removing/re-adding the Home Screen shortcut to refresh branding; preserve pending edits and the workspace key before changing installation. No Apple Calendar, Reminders or Tasks access is added.

## Dependencies and Health history (3.2)

- A parent task cannot complete until its subtasks and prerequisite items are complete. Completing subtasks makes a parent ready; tasks retain explicit completion with a note. A previously confirmed parent becomes effectively incomplete while required work is reopened; its confirmation/history is retained.
- Projects/goals complete automatically only with nonempty, fully completed contained work and completed explicit prerequisites. Empty containers stay incomplete; old manual progress is retained in storage but no longer drives these calculations. Progress is the mean of direct contained-item progress. A 100% work rollup can still wait for a parent confirmation or external prerequisite.
- Missing/deleted explicit prerequisites block work; deleted contained items are excluded. Editors reject cycles introduced by prerequisite/parent/container changes. Imported legacy cycles render as blocked, rather than recursively completing.
- Project filters include descendants through project/goal membership and task parent links. Graph arrows run prerequisite → dependent; dashed lines mean contained work. Select a node to highlight; Open highlighted item edits it. Large graphs scroll.
- Health import offers 7/28/90/365 days ending on the selected reporting date, split into at most 28-day half-open windows. Preview checks sleep, exercise, weight, HRV, resting heart rate, daily oxygen saturation, daily respiratory rate and body fat. Returned/importable counts, coverage and access errors are separate. Other enabled APIs/types are not scanned.
- Stop reading aborts the current request and presents any completed partial results for review. No health readings are stored until Import is selected. The last availability report is saved as encrypted workspace metadata. OAuth tokens stay in browser memory. Manual entries, archived readings and workout annotations survive repeat imports.
