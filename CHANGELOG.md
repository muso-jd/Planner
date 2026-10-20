# Changelog

## 3.6.1 — 2026-10-20

- Create and link a new time block directly inside the routine window, with title, date, start time, duration and recurrence. Saving persists both records together; closing discards the draft.
- Enlarge compact text (7–12 px) by 50% throughout classic and glass themes; retain icon-only navigation behavior.
- Use white subtitles and field captions on dark themes, readable dark equivalents on light themes, and muted gray descriptions.

## 3.6.0 — 2026-10-17

- Hide zero-cost and unset-cost task rows from Budget funding breakdowns and exclude them from the funded-task count. Keep paid descendants visible through free parent tasks; omit containers with no funded work in the selected scope. Preserve financial totals, estimates and task records.
- Add Carbon, Black Ice and Amethyst liquid-glass themes with pure black canvases and silver, blue or violet material highlights. Existing themes and custom accents remain available.

## 3.5.0 — 2026-10-17

- Add three optional liquid-glass themes: Pearl, Dusk and Obsidian, with visual previews in Settings, frosted panels, reflective edges, a floating navigation dock and system typography.
- Preserve custom accents and classic themes; synchronize theme selection through encrypted settings. Add reduced-transparency, increased-contrast and no-backdrop-filter fallbacks.
- Include theme styling in the offline PWA shell; retain the existing safe update activation behavior.

## 3.4.0 — 2026-10-17

- Derive project/goal funding from nested task own costs; show container/subtask breakdowns, total needed and still-open requirements in Budget. Retain legacy manual budgets without adding them again.
- Add weekly/monthly category budgets, explicitly assigned expenses, Month/Week/Day remaining balances, prorated allowances and separate future scheduled spend.
- Add first transfer/payment dates for recurring ledger entries, independently from record date, and configurable T−0/1/2/3/7-day reminders at Vienna times while Planner is open.
- Link routines to canonical time blocks, with minute offsets and inherited dates/time/recurrence. Calendar shows routines inside blocks without duplicate standalone events; block edits update linked routines.
- Expand solid icons, distinct navigation symbols, new budget categories and a per-entry custom-icon selector.


## 3.3.0 — 2026-10-17

- Display Vienna save timestamps for new diary reflections in Journal, history and editors, preserving them after edits. Show legacy last-edit timestamps honestly when original save time is unavailable.
- Show saved morning/evening reflection status and timestamps on Today.
- Add independent, workspace-synced Calendar visibility toggles for weekly and monthly routines, off by default. Daily routines remain excluded.
- Make Focus the default dependency view: collapsible work outline, selected-item inspector, Requires/Unlocks and ready upstream actions. Keep Graph/Outline/Board/Table as alternatives. Collapse advanced filters initially; scroll to the inspector after selection on narrow screens.


## 3.2.0 — 2026-10-16

- Remove scheduled routines from Calendar; retain Today and Routines records and reminders.
- Derive goal/project completion and progress from contained work; block parent task completion until subtasks and prerequisites are complete. Reopening required work blocks downstream completion immediately.
- Allow tasks, goals and projects as prerequisites and containers, with mixed-link cycle prevention.
- Add Graph, Outline, Board and Table dependency views, text/type/status/project filters and upstream/downstream chain highlights.
- Add separate project accent colors, inherited through nested projects/goals and subtasks.
- Add 365-day Google Health import, 28-day request windows, pagination, stopping/partial results and per-type availability reports.
- Read oxygen saturation, respiratory rate and body fat alongside the five existing Health types. Preserve manual readings, workout annotations and archived readings on repeat imports; batch vault writes.
- Keep Health connection disclosure and Google import review visible across background sync renders.


## 3.1.0 — 2026-10-16

- Focus phone navigation on Notes, Diary, Feeling and Time; put other sections behind More while keeping full desktop/iPad navigation. Give phones dedicated feeling and timer/history views, with Notes as the landing view and Capture creating a note.

- Rename Plan to Calendar with month/week grids that remain seven columns on every viewport, selectable dates and per-day event creation.
- Replace line icons with solid silhouettes: white content icons and coloured navigation; remove the duplicate icon-only editor strip while retaining labelled categories and routine type selection.
- Restore the editor action bar when starting a new ledger entry after import review.
- Remove the bottom-left Sync button, expand Capture across the sidebar, and place the sync timestamp above Life with green success/red error states.
- Add reviewed single-task export to Google Tasks or Calendar with independent destination links and repeat-export updates.
- Put Journal day/history/archive and entry actions in one toolbar; show history only when selected.
- Expand Insights into eight tabs with 7/28/90-day ranges, interactive chart points and accessible data tables.
- Add Health tabs, manual weight/workout/sleep/stress entries and reviewed read-only Google Health imports for sleep, exercise, weight, HRV and resting heart rate. Retain manual readings and workout annotations on repeat imports.
- Show self-reported workout intensity, device zones and an adjustable planned-rest countdown. No direct Google stress score or measured recovery result is fabricated.

## 3.0.0 — 2026-10-16

- Redesign shared editors with inline category/icon palettes, color-dot titles, inside-field labels, income/expense and scope switches, and progressive task details.
- Add recurring ledger income/expenses, monthly projections, future-payment timing categories/countdowns, task/event links, encrypted file attachments and budget scope/analytics tabs.
- Add separate open-task funding balances; task costs and expected income do not become booked ledger entries.
- Add daily/weekly/month-end-offset routines, Monday-first include/exclude circles, inline time controls and routine analysis.
- Replace task/routine completion boxes with large gray/signal-green checkmarks; preserve task completion confirmation.
- Remove the timer from Trackers and add four-by-seven elapsed-day dot grids.
- Add Journal notes and restorable archive; unify compact mood/context/checkmark capture under view titles.
- Add saved task tabs and six sorting modes, sidebar actions, timestamp-only sync/error state, and synchronized dark/white/black themes with accent selection.
- Add custom iOS Home Screen icon and installation guidance; no Apple service integrations.

## 2.3.3 — 2026-10-16

- Add Remove due date in task editing, clearing the deadline time and reminder when saved.
- Keep undated tasks undated when reopening their editor instead of substituting today.
- Remove automatic overdue urgency when a deadline is cleared; preserve explicit Priority 0.

## 2.3.2 — 2026-10-16

- Use a vivid alarm red for urgent badges, summary text/actions, urgent row markers and overdue deadlines.
- Preserve custom title/category colors and readable urgency labels.

## 2.3.1 — 2026-10-16

- Include existing and new feelings/mood check-ins in Journal daily entries and paginated history.
- Show feeling context, mood rating and Vienna check-in time; allow editing without duplicating analytics records.
- Retain check-in timestamps independently of later edits and keep synchronized mood observations intact.

## 2.3.0 — 2026-10-16

- Make Life Planner installable as a standalone Android web app with launcher and maskable icons.
- Add installation controls on the unlock screen and in Connect, with browser-menu guidance.
- Cache the public app shell for offline reopening, preserving existing local edits and reconnect sync.
- Keep API/Google/image responses outside the service-worker cache; defer app updates until old windows close.

## 2.2.3 — 2026-10-16

- Reduce category icons to compact rounded outlines with more space before entry text.
- Align entry titles with their category/metadata text and increase title sizes.
- Use locally served Noto Sans Mono throughout the planner, including dependency graph labels.

## 2.2.2 — 2026-10-16

- Enlarge category icons into a full-height rail beside list entries.
- Use white icon strokes with a glow matching the entry color; preserve title colors.
- Scale icon rails for phone layouts and enlarge project/card heading icons.

## 2.2.1 — 2026-10-16

- Fix Journal history View day navigating to Today instead of the selected journal day.
- Include selected-day entries in history, add text previews and load-older pagination beyond 30 records.
- Handle undated journal records safely without rewriting saved entries.

## 2.2.0 — 2026-10-16

- Add diary image uploads, previews, separate encrypted image sync and full backups including photos.
- Add a privately configured Google Drive destination, pending image copies, manual/daily in-browser backups, and narrow folder selection/authorization.
- Save Drive images as regular JPEG files and keep planner backups encrypted.
- Reuse Artlook’s read-only gatekeeper via an authenticated, fixed-folder service binding without changing the source Worker or copying its secret.
- Explicitly show missing Google authorization; real Drive writes remain pending setup.

## 2.1.0 — 2026-10-16

- Add explicit Urgent · Priority 0 and automatic overdue urgency, including same-day timed deadlines in Vienna time.
- Add urgent/overdue filters, urgent-first sorting, and a persistent review banner.
- Add grouped overdue reminders every 30 minutes, hourly, daily, or off; hourly is the default while Planner is visible.
- Add custom entry title colors for tasks, projects, goals, blocks, routines, notes, journals, trackers, time and ledger entries. Linked tasks inherit a project color unless overridden.
- Add area/category icons before entry titles, with automatic category matching and a per-entry icon selector.
- Require a completion note window and confirmation before marking a task done; retain synchronized completion history and allow cancellation.
- Remove deferred editor autofocus that could steal focus from rapid edits.
- Preserve manually chosen Priority 0 when editing and importing linked Google tasks.

## 2.0.0 — 2026-10-16

- Replace device-only storage with encrypted EU D1 cloud workspaces, pairing keys, optimistic revisions, automatic merges and conflict review.
- Preserve original task/routine/roadmap formats and migrate device-local completion logs.
- Add responsive glass-panel workspace with phone-first capture, mood and timing.
- Add categorized tasks, due dates/times, reminders, recurrence, projects, goals, milestones, subtasks and resource dependencies with interactive graphs.
- Add adjustable routine/medication/supplement records, morning/evening reflections, diary and values check-ins.
- Add time sessions, cash-flow ledger, monthly spending budget, abstinence/time-since trackers and descriptive analytics.
- Add complete JSON backup, ICS exchange, ledger CSV and explicit Google Calendar/Tasks connection options.
- Exclude Apple integrations.

