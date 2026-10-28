# Compact Today rows and priority semantics — 3.7.2

Task row actions now show only a P rating and clock; duplicate/Google-send row buttons are removed. The checkmark, priority chip and clock share a 40 × 40 px footprint; check/clock glyphs are 28 px. P0 remains red/urgent, including automatic overdue urgency. Other badges contain only P1–P10. Screen-reader labels and tooltips retain full urgency information.

Today uses two-thirds actions and one-third daily rhythm on desktop/landscape. At 1150 px and below the panels stack to preserve readable single-line routines. Routines retain their checkmark and edit action, show icon/title/right-aligned canonical time, and omit category/kind/duplicate controls. Long titles use ellipsis and retain their full title in the edit control tooltip/editor.

Priority order is now P0 urgent, then P1 highest through P10 lowest. Shared task ordering applies priority before deadline; explicit Due date sorting still orders by deadline. Editor options and Insights labels use the same semantics. No saved task ratings are rewritten.

Validation: build and 53 unit/API tests passed; syntax and diff checks passed. The focused Chromium 153 suite verified removed row buttons, matching control sizes, compact badge labels, ascending sorting/editor labels, routine completion, timer start, no page overflow and single-line/right-aligned routines at desktop 1830×1370, simulated iPad landscape 1366×1024, simulated iPad portrait 1024×1366 and phone 390×844. Representative screenshots inspected; physical Safari/devices remain untested. Fixtures were synthetic and local only. Run with PLANNER_CHROMIUM set to the available Chromium binary: node tests/compact-agenda.mjs.

Deployment uses the existing content-only Worker upload and preserves bindings/data. Rollout evidence is in DEPLOYMENT.md. GitHub publication remains blocked from the prior automatic-review rejection; this follow-up does not approve the public source push.
