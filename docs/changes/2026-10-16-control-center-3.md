# Control Center 3 — coordinated workflow redesign

## Outcome and data boundaries

This iteration implements the requested Budget, Routines, Trackers, Journal, Tasks, Capture and global navigation changes without migrating owner records or changing encryption/merge semantics. It is developed on `feature/planner-control-center`, stacked on the existing sync branch. No main-branch merge is implied.

Monthly ledger projections and task funding are separate. A task requiring EUR 10,000 contributes -10,000 to the open-task funding balance. Funding allocations are not income; completed/archived tasks leave open requirements. Linked ledger transactions do not automatically change task estimates, and the two panels are not added together, avoiding implied/double-counted cash spending. The app is a manual planner, not a bank ledger or accounting system.

## Request fulfillment

| Request | Implementation |
|---|---|
| Recurring income/expenses | Daily, weekly, monthly or yearly series with interval; deterministic monthly occurrences, including month-end clamping |
| Monthly balances | Full selected-month projection plus a dated-through-today subtotal; Total / Business / Personal / Analytics tabs |
| Future expenses | Remaining calendar days plus automatically derived Planned / Due soon / Due today timing categories; original area/scope retained |
| Task/event connection | Ledger editor links to a task or time block; row opens the linked entry |
| Task funding balance | Separate panel aggregates required budget and expected income of open tasks, including business/personal scope |
| File upload | Multi-file attachments up to 20 MB each, chunked encrypted cloud storage and full backup/import support |
| Category/icon menu | Single-line horizontally scrollable palettes; unselected icons gray, selected icons category-colored; new routine type icons |
| Title color | White dot beside title opens picker; double-click restores category/project inheritance; old color button removed |
| Input labels | Floating labels inside input/select/textarea boxes retain programmatic labels |
| Income/expense and scope | Inline + / − buttons use green/red; personal/business icon switches replace menus |
| Routine schedules | Daily exclusions, one weekly weekday, or T−offset from month end; 0 = last day, 1 = previous day, short months clamp to first day |
| Routine UX | Time input left of title, type-icon strip, no instruction field; existing instructions are retained, not erased |
| Routine overview | Daily / Weekly / Monthly / Analysis tabs; scheduling reused by Today, progress and reminders |
| Completion controls | Large gray checkmarks become signal green; tasks retain note window and confirmation |
| Trackers | No timer in tracker overview; four rows of seven elapsed-day dots with 28-day paging and total elapsed count |
| Journal | New note button, notes included in history, archive and restore without permanent deletion |
| Feeling entry | Five progressively filled circles, context input and checkmark below title; check briefly turns green; rating/context save together to Journal |
| Capture | Same feeling strip above note capture; timer remains here |
| Task overview/editor | Filter tabs, synchronized custom category/text tabs, six sorting modes and collapsible recurrence/project/funding/dependency controls |
| Navigation | Header removed; capture/sync actions at sidebar bottom; lock in Settings |
| Sync state | Only last successful time displayed, red on errors; descriptive status remains in tooltip/accessibility label |
| Themes | Synchronized dark/white/black and accent color, with contrast-dependent primary-button text |
| iOS icon | Dedicated 180px touch icon and Safari installation guidance; no Apple Calendar/Reminders/Tasks integration |

## Technical changes

`planning.js` contains testable recurrence, month/scope accounting, task funding, timing, routine scheduling, tracker progress and sorting. `control-center.js` provides coordinated views and editor controls using the existing storage/sync API. `attachments.js` uses the existing authenticated encrypted-blob endpoint for bounded chunks; no D1 migration or extra binding is required. Full local/Drive backups include decrypted attachment parts inside the existing encrypted Drive envelope; import re-encrypts parts for the current workspace. The build and public-only PWA shell include the new modules and iOS icon.

## Limits and intentional behavior

- Editing a recurring ledger entry edits the series, not one occurrence. There are no settlement/payment confirmations, skipped-occurrence exceptions or bank imports. Date-based subtotals are not verified payments. Monthly recurrence retains its original date anchor.
- Future timing categories do not overwrite semantic categories such as Business or Health. The seven-day Due soon threshold is fixed.
- Routine historical percentages use the current schedule, as before. Weekly routines choose one weekday; monthly offsets range 0–30 and clamp in short months.
- Files need a network connection for upload/download; attachment bytes are not cached by the service worker. Upload cancellation/detachment can retain encrypted orphan chunks; no automatic permanent purge is added. Full backups may consume substantial browser memory for large workspaces.
- The 28 tracker dots show the current 28-day page, not an unlimited dot field. Total elapsed days remain visible.
- Task tabs save a category and/or text query; they are filters, not separate task storage. Removing a tab never deletes tasks.
- Existing PWA windows must close after downloading the new shell before activation. Native iOS/Android installation, physical Safari/iPad behavior and real Google writes are not inferred from Chromium tests.

## Validation

Build and 23 automated tests cover existing encryption/API behavior plus ledger recurrence, leap years, scope, funding separation, future timing, routines, tracker paging and sorting. The new Control Center suite passed 60 browser checks: editor controls, attachment download, recurring rows, task/event links, routines, dot trackers, Journal archive/mood, saved tabs, themes, iOS metadata, four viewport sizes and cross-device sync. The existing 63-check browser suite, PWA/offline regression, 42-record Journal regression, feeling sync and optional-deadline regression passed after adapting intentional control/status changes. A separate 1 MiB attachment test verified three encrypted chunks, full backup and restore to another workspace/key, then a byte-identical download. Desktop, simulated iPad portrait/landscape, phone, shared-editor and light-theme screenshots were inspected. Physical Safari/iPad/iOS/Android and real Google consent/writes remain unverified. Exact production source and deployment IDs are recorded in DEPLOYMENT.md.
