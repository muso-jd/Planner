# Life Planner workspace upgrade — 2026-10-16

## Problem and result

The previous Operational Matrix used only four browser-local `matrix*V4` keys and the deployed Worker had no data bindings. Editing on an iPad could not synchronize with a computer or phone. The new application adds a client-encrypted D1 workspace, stable record identities, revision protection, device pairing and explicit conflict review, plus a broader personal/business planning workspace styled after PIMP/HOE's dark glass panels.

The private migration preserves 110 source tasks, 13 routine placeholders and two roadmaps, with five roadmap milestones converted to linked tasks. Existing device-local logs are merged when that device opens the upgraded origin with the same key. Dates, completion and edited details existing only on a user's device cannot be read remotely; they migrate on first use. Original browser keys remain intact. Starter abstinence/time-since trackers have no assumed start dates. No personal list entries, keys or activation links are included in Git.

## Scope

Implemented: Today, quick capture, week planning, recurring task generation, recurring block views, categorized actions, due date/time and reminder offsets, editable routines and medication instructions, 04:00/23:00 reflection defaults, mood/feelings, diary, values/conscience check-ins, projects/goals, milestones, parent tasks, acyclic task prerequisites, allocated budget/time gates, interactive dependency graph, timestamp timer/manual sessions, EUR ledger, monthly budget, abstinence/time-since logs, 28-day descriptive insights, JSON/ICS/CSV exchange, Google OAuth and on-demand Calendar/Tasks exchange UI. Apple integration is excluded.

Configured: EU D1 and private migrated workspace. Google OAuth client configuration is not supplied by the task and remains a user setup step. Google account authorization and actual Calendar/Tasks writes are unverified. Closed-browser reminders require Calendar delivery; Planner does not implement background push. See FEATURES.md for file-format and analytics limits.

## Validation

- `npm run build`: passed. The bundler uses a replacement callback so JavaScript dollar-sign expressions remain intact in embedded assets; browser testing found and resolved the initial replacement-string issue.
- `npm test`: 11 tests passed, covering AES-GCM/wrong key rejection; Vienna date boundary; field/record merges; same-field conflict preservation; tombstones; recurrence/month ends; dependency cycles; legacy task/log/roadmap migration; ICS alarms/title roundtrip; recurring blocks; and a real SQLite API test exercising origin/auth isolation, CAS conflicts and version history.
- Playwright with existing Chromium 153: 56 checks passed, no page errors. Tested desktop 1512×982, simulated iPad portrait 1024×1366, simulated iPad landscape 1366×1024 and phone 390×844. All 11 tabs checked for page overflow at each viewport. Four screenshots captured privately and visually inspected; no personal screenshots are published.
- Two independent browser contexts shared one synthetic workspace. A task note edited on the second context synchronized back to the first. Completing monthly bookkeeping dated October 31 generated November 30. Routine/project/transaction/conscience/tracker editors saved. A tracker event remained linked to its tracker. Notes and mood were entered, and a running timer survived reload before stopping.
- Physical iPad, native Safari/WebKit and Google account consent/write behavior were not tested. Browser-test environment settings are `PLANNER_PLAYWRIGHT_MODULE` (optional module path) and `PLANNER_CHROMIUM` (optional executable path); default uses installed Playwright. No production dependencies.

## Deployment state

Deployed to the existing production Worker at 2026-10-16T08:23:02.126352Z from commit `87fbc324baeede46b66303c762578bc72d41b499`. Deployment `55982cc9-c3d6-4ccd-b020-24572c4930ef` routes 100% to Worker version `be7a1306-875d-4668-a635-1ce203196dcc`. Live health and authenticated decryption of all 136 migrated records passed. The cloud browser rendered the live unlock screen; the local headless browser could not reach the external deployment, so unlocked UI testing used the local Worker/SQLite harness. GitHub PR #1 is open; main is not merged. Google remains unconfigured. See DEPLOYMENT.md for the full record and rollback.
