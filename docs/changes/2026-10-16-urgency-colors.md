# Urgency, title colors, category icons and confirmed completion — 2.1.0

## Result

Overdue tasks previously had only a date badge, priority 0 could not be selected, and entry titles had no per-record color control. Completing a task immediately changed its status without a note or confirmation.

Unfinished tasks are now effectively Urgent · P0 after their Vienna due time (or the end of an untimed due date), without overwriting the user's chosen importance. Manual Priority 0 is available and preserved across edits/Google imports. Urgent-first sorting, urgent/overdue filters and a persistent summary help review the queue. Rescheduling clears automatic urgency; completed/archived tasks are excluded. Grouped overdue reminders default to hourly, with 30-minute, daily and off settings. Reminders run only while the page is visible and use a per-device timestamp to prevent alert floods.

Custom title colors apply across lists, cards, calendar and dependency titles. Tasks inherit a linked project's custom color unless overridden. Validated hex colors, icons and completion records synchronize through the existing encrypted vault; no database migration is needed. Area/category icons appear left of entry titles, matching existing category names automatically, with a per-entry selector. Projects/goals and other titled entries also expose a category selector.

Completion opens a dedicated optional-note dialog. Cancel/Escape keeps the task open. Confirmation rechecks prerequisites, saves `completionNotes` plus timestamped `completionLog`, marks the task done, then generates any recurring successor with a fresh completion history. Planning notes remain separate. Read previous completion notes in the task editor. A deferred autofocus callback that could steal focus during fast edits was removed after browser testing exposed it.

## Validation

- `npm run build`: passed.
- `npm test`: 14 tests passed, including elapsed timed/untimed Vienna deadlines, completed/archived exclusions, Priority 0 persistence semantics, rescheduling, urgency ordering, hex-color validation and the existing encryption/CAS/recurrence/migration tests.
- Playwright / existing Chromium 153: 61 checks passed, zero page errors. Desktop 1512×982, simulated iPad portrait 1024×1366, landscape 1366×1024 and phone 390×844. All 11 tabs had no document overflow at these widths. Screenshots were visually inspected privately.
- Browser checks exercised explicit P0 saving/reopening, custom title computed color, automatic overdue tagging, overdue filtering and clearing via rescheduling, cross-context priority/color sync, project color inheritance and left-side icon presence.
- Completion cancellation left the task open and generated no recurrence. Confirmation saved a note retrievable from completion history and created the next monthly occurrence.
- A synthetic Notification implementation and Playwright clock verified one grouped overdue alert, no repeated alert after 31 minutes, another after 62 minutes, and no further alerts when disabled. This verifies application logic, not actual OS notification delivery.
- Physical Safari/iPad and real Google API account writes remain unverified. Reminder delivery with the browser closed is not implemented. Colors/icons/completion history are preserved in full JSON and cloud sync; external calendar formats do not carry these Planner-only fields.

## Deployment

The existing feature branch/PR continues the same coherent planner upgrade. See DEPLOYMENT.md for the exact source commit, UTC deployment time, IDs and rollback target. Personal records were not altered to implement this feature; overdue urgency is computed from stored deadlines.
