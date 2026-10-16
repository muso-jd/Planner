# Changelog

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
