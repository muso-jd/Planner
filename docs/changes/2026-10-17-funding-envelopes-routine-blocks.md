# Planner 3.4 — funding, envelopes, transfer dates and routine blocks

## Delivered behavior

Project/goal funding is calculated from nested task own costs, with ID deduplication. Budget shows projects/goals and their sub-items, total needed and still-open requirements. Manual container estimates remain stored but are not double counted. Confirmed task costs stay in project total cost but leave open requirements; estimates and allocated funds remain separate from ledger cash flow.

Category budgets support named weekly/monthly allowances, active dates, scope/color, explicit expense assignment and Month/Week/Day reporting. Proration uses cumulative integer cents over actual calendar days. Cards distinguish dated spend, future scheduled spend and native-period remaining. Current rules apply retroactively; no automatic rollover or historical allowance snapshots are introduced.

Recurring income/expenses have a separate first transfer date; monthly anchors safely clamp. T−0/1/2/3/7-day reminders run at a chosen Vienna time while Planner is open, with optional browser notifications. This is planning, not bank transfer execution or payment verification.

Routine-to-block links reuse the same records. Block schedule/time/recurrence drives linked routines, with minute offsets validated inside the block and same day. Calendar renders them within blocks, and Today/reminders/analytics follow the same schedule. Unlinking or deleting a block restores the retained own routine schedule.

Expanded solid icons provide distinct navigation symbols and additional budget/activity categories, with custom per-entry icon selection.

## Verification

- Build and 45 unit/API tests passed, including nested funding/deduplication, exact-cent proration, leap years, partial weeks, transfer anchors, reminder year boundaries, canonical routine links and unique navigation icons.
- New funding/envelopes/blocks browser suite passed 19 checks, including expense deductions in three views, weekly budget creation, editing, transfer recurrence/reminder configuration, actual open-app reminder dispatch, block moves/offsets/unlinking, icon persistence, second-device sync and four viewport sizes. No page errors.
- Existing Control Center 60 checks, Calendar/Health 57 checks, Reflection/Focus 13 checks and PWA installability/offline/reconnect passed. Other final reruns are recorded with rollout evidence.
- Desktop, simulated iPad portrait/landscape and phone funding/envelope screenshots inspected. No physical Safari/device or owner-data test is claimed. All fixtures are synthetic.
- No production record migration, new binding, changed security policy, bank operation or main-branch merge. Rollout evidence is recorded in DEPLOYMENT.md after deployment.
