# Deployment

Target: Cloudflare Worker `planner`, production, https://planner.jeremydachojd.workers.dev/.

Binding: `DB` → `planner-vault` (EU jurisdiction). Database schema is in `schema.sql`. No application secrets or Google client secret are required in Worker configuration. Provision workspace rows through an authenticated Cloudflare administration channel, using browser-compatible encrypted records; never embed a workspace key in source.

Build `npm run build`, run `npm test` and targeted browser checks, then upload `dist/worker.mjs` as the module `worker.mjs`, with the D1 binding from `wrangler.jsonc`. Cloudflare API upload was used for this release. For CLI deployments, load current Wrangler guidance and authenticate first; do not place credentials in code.

## Current rollout

Control Center 3 source branch: `feature/planner-control-center`, stacked on `feature/life-workspace-sync`. Deployment metadata is recorded below after the validated source commit is pushed. Neither feature branch automatically deploys through GitHub Actions; no pre-existing CI configuration was present. Source pushes alone do not switch production.

## Rollback

The previous Worker version is `21a03392-08ad-49ff-8719-b855e4165a54` (2026-09-12). Use Cloudflare deployment/version rollback to route traffic to that version; do not delete Workers, assets, databases or versions. This returns the old browser-local planner and cannot display cloud-vault additions. D1 encrypted data remains retained. Export a current JSON backup before a planned rollback, and retain all old `matrix*V4` browser keys.

Restoring code does not downgrade the database schema. The old source contains personal list data, so it is not copied into this public repository.

## Verified production rollout — 2026-10-16

| Field | Observed value |
|---|---|
| Deployed UTC | 2026-10-16T08:23:02.126352Z |
| Application version | 2.0.0 |
| Source commit | `87fbc324baeede46b66303c762578bc72d41b499` |
| Source branch | `feature/life-workspace-sync` |
| Worker/environment | `planner` / production |
| Deployment ID | `55982cc9-c3d6-4ccd-b020-24572c4930ef` |
| Worker version ID | `be7a1306-875d-4668-a635-1ce203196dcc` |
| Traffic | 100% on this version |
| Stable URL | https://planner.jeremydachojd.workers.dev/ |
| Source PR | https://github.com/muso-jd/Planner/pull/1 |

The live `/api/health` returned `ok: true`, version `2.0.0`, and `storage: true`. An authenticated live vault read decrypted successfully: revision 1, 136 records, including 110 original tasks plus five roadmap milestones, 13 routines, two projects and five trackers. No owner records were modified by this verification. The remote cloud browser rendered the live unlock screen. Local browser tests covered the editing and sync flows; direct local Chromium navigation to the external Worker failed through the available network path, so no unlocked live browser session is claimed. The old Worker version remains available as the rollback target above. The feature PR is open; main is not merged.

## Verified production rollout — 2.1.0

- UTC: 2026-10-16T08:47:43.929286Z.
- Source: `bea7b2651468c2472cfd608f44eca2c7f1922e15`, branch `feature/life-workspace-sync`.
- Worker: `planner`, production; URL https://planner.jeremydachojd.workers.dev/.
- Deployment: `d2dce330-a3ce-416a-aab3-e80d5505d4db`; Worker version: `dbeb9628-2d32-430e-8a31-f33218fcd145`; traffic: 100%.
- Verification: health returned `ok:true`, `version:2.1.0`, `storage:true`; live `app.js` SHA-256 matched the tested source (`1130688a08d99ba334edbbc73ca3970721f708833b3175fd75c0029bd4a9802d`). Build, 14 automated tests and 61 browser checks passed.
- Rollback: route traffic to version `be7a1306-875d-4668-a635-1ce203196dcc` (2.0.0); do not delete any Worker or database. Existing vault data and new presentation/completion fields remain retained.

## Verified production rollout — 2.2.0

- UTC: 2026-10-16T09:02:09.898485Z.
- Source: `3a33d5cb510b0cbfda9a6cea299253767e70f9ab`, branch `feature/life-workspace-sync`.
- Worker/environment: `planner` / production, https://planner.jeremydachojd.workers.dev/.
- Deployment ID: `ee37c5d5-653f-4eda-b666-b511eca7d37d`; Worker version ID: `127d5237-bfc5-4096-a6c8-4c6f7a133b53`; traffic: 100%.
- Bindings: existing `DB`; `ARTLOOK_GATEKEEPER` service → existing `gatekeeper` production; `DRIVE_FOLDER_ID` plain-text environment value configured privately. Preserve this folder binding on future deployments; it is intentionally not embedded in Git configuration.
- Additive migration: `images` table from schema.sql created before deployment. Existing entries remain in their vault.
- Live health: `ok:true`, `version:2.2.0`, `storage:true`. Served app.js matched local SHA-256 `e5f089eb8f31ca1ccd1de8ae13bd9798bae9b49c04853c84465bed4d442607aa`.
- Authenticated live gatekeeper status confirmed the service and folder binding, explicitly `mode:read-only`. The fixed-folder list returned HTTP success with zero files. This verifies transport, not Google write permission or proof of access to non-public folder contents.
- Build, 16 automated tests and 63 browser checks passed. Real Google uploads remain unconfigured; no uploaded Drive files or backups are claimed.
- Rollback: route traffic to Worker version `dbeb9628-2d32-430e-8a31-f33218fcd145` (2.1.0), retaining all D1 tables and image rows. The older UI does not expose diary attachments. No deployment, source gatekeeper, secret or Drive file was deleted.

## Verified production rollout — 2.2.1 (Journal history)

- UTC: 2026-10-16T09:12:31.766809Z.
- Source: `fa260b27692b20a073d2e6ef643fed871c9447be`, branch `feature/life-workspace-sync`.
- Worker/environment: `planner` / production; https://planner.jeremydachojd.workers.dev/.
- Deployment: `993524fc-509c-46bb-96a7-76dfeda35377`; Worker version: `4d159ba9-7dfb-45c1-83ef-799e08fab116`; traffic: 100%.
- Health confirmed `ok:true`, `version:2.2.1`, `storage:true`. Live app.js matched tested source SHA-256 `730318e787cc050997a48d31e4c0f6bd89e09ace5500f7074436f69c85cc6501`.
- Validation: build, 16 automated tests and the focused 42-record Journal browser regression passed. No physical Safari/iPad validation is claimed.
- Existing D1, Artlook service and private folder bindings retained; no data migration or user-entry writes.
- Rollback: route to version `127d5237-bfc5-4096-a6c8-4c6f7a133b53` (2.2.0), retaining all data and bindings.

## Verified production rollout — 2.2.2 (Category icon glow)

- UTC: 2026-10-16T09:21:49.850463Z.
- Source: `a93ffceb737dffb7052e276705e4f24901ca0f3c`, branch `feature/life-workspace-sync`.
- Worker/environment: `planner` / production; https://planner.jeremydachojd.workers.dev/.
- Deployment: `9611a8c9-1da8-407e-8443-6b0cc875496a`; Worker version: `dbf41e96-7d10-488f-a469-786ebf3fc665`; traffic: 100%.
- Health confirmed `ok:true`, `version:2.2.2`, `storage:true`. Live app.js matched tested source SHA-256 `9d63256f90d84bc8a063f084c12503852614635e5ecaedf945ca5e9b52d52dd5`.
- Validation: build, 16 automated tests and 63 browser checks passed; desktop and phone screenshots reviewed. Chromium covered desktop, simulated iPad portrait/landscape and phone. No physical Safari/iPad validation is claimed.
- Existing D1, Artlook service and private folder bindings retained; no data migration or user-entry writes.
- Rollback: route to version `4d159ba9-7dfb-45c1-83ef-799e08fab116` (2.2.1), retaining all data and bindings.

## Verified production rollout — 2.2.3 (Compact icons and typography)

- UTC: 2026-10-16T09:31:42.366496Z.
- Source: `e8ae24fb8394fce096d844b144aa183812bf4826`, branch `feature/life-workspace-sync`.
- Worker/environment: `planner` / production; https://planner.jeremydachojd.workers.dev/.
- Deployment: `aa2d6efe-942f-4d80-bf84-9ec48ddab09a`; Worker version: `341a100f-a17f-4620-91e6-6370c8af94b8`; traffic: 100%.
- Health confirmed `ok:true`, `version:2.2.3`, `storage:true`.
- Live stylesheet matched tested source SHA-256 `c0be81bf11fdc5f2733bb921ea1ccc0a4db4bae1fa8a26cef17855cae5f856dd`. Live binary font matched SHA-256 `0d12790e1978021a68d0485b5234681eeb5e2edb47bc7bb2e5254c21fb5cc76c`.
- Validation: build, 16 automated tests and 63 browser checks passed; desktop/phone screenshots reviewed. Chromium covered desktop, simulated iPad portrait/landscape and phone; physical Safari/iPad remains unverified.
- Existing D1, Artlook service and private folder bindings retained; no data migration or user-entry writes.
- Rollback: route to version `dbf41e96-7d10-488f-a469-786ebf3fc665` (2.2.2), retaining all data and bindings.

## Android PWA deployment procedure (2.3.0 onward)

Keep the cache version in public/sw.js in step with every app-shell release. Rebuild and upload the complete asset bundle together. A waiting service worker activates after all existing app windows/tabs close; no forced reload discards in-progress UI state. The initial online load must finish caching before offline launch is available. API, image and Google responses are never placed in Cache Storage.

When rolling back to a version before 2.3.0, already-controlled clients can retain the 2.3.0 shell. Synchronize pending edits first, then unregister only this origin's service worker and remove only life-planner-shell caches using browser developer tools before reopening. Do not clear site storage/localStorage or uninstall while unsynced records remain. Prefer a forward corrective PWA release with a new shell version for normal updates.

## Verified production rollout — 2.3.0 (Android installation)

- UTC: 2026-10-16T09:41:19.195397Z.
- Source: `c90b654ddd629f0aaaf055eef75ee688ac1e7c8a`, branch `feature/life-workspace-sync`.
- Worker/environment: `planner` / production; https://planner.jeremydachojd.workers.dev/.
- Deployment: `49048ba4-007e-46ff-aa41-27b1676c28db`; Worker version: `a3e4cf9f-2fdb-4594-aa52-d3ae2c575ade`; traffic: 100%.
- Health confirmed `ok:true`, `version:2.3.0`, `storage:true`. Live HTML, manifest, pwa.js, sw.js and all three PNG icons matched the tested local bytes. Manifest SHA-256: `472c818d0385fe03dd7cd137c96e31484ca415548279b933f468abb79de62d6f`; service worker: `8c0a6f880d56e18bda2c57a346f385f615e0cbd0bce922717a4444e8ceb161eb`.
- Validation: build, 16 automated tests, 63 responsive Chromium checks and focused PWA tests passed. Chromium reported zero installability errors. Offline note creation survived reload and synchronized on reconnect. Install dialog screenshot inspected at phone width. Physical Android installation/OS packaging and physical Safari/iPad remain unverified.
- The first live check through Python urllib returned a transport 403. Repeating with the working curl transport verified the production assets above.
- Existing D1, Artlook service and private folder bindings retained; no data migration or user-entry writes.
- Rollback server target: Worker version `341a100f-a17f-4620-91e6-6370c8af94b8` (2.2.3). Follow the pre-PWA rollback procedure above for clients retaining a cached shell; preserve local edits, D1 and all bindings.

## Verified production rollout — 2.3.1 (Feelings in Journal)

- UTC: 2026-10-16T09:50:18.393178Z.
- Source: `da4ed88d7227e992704b81cb1d27f4fb30e691f2`, branch `feature/life-workspace-sync`.
- Worker/environment: `planner` / production; https://planner.jeremydachojd.workers.dev/.
- Deployment: `420972a1-822e-46e8-bc77-bfd40ff0d5b5`; Worker version: `9a285055-4456-4595-bf61-6cd70f9966fd`; traffic: 100%.
- Health: `ok:true`, `version:2.3.1`, `storage:true`. Live app.js matched tested SHA-256 `8de2fd3e12c3bc1c9ff50caa5a7d75be6abcd76141f2ba4683983d3e2f9765b1`; live sw.js matched `e4a0ea3e2c72fa7192604c561d5c3ed8e393e65d1644c5822eedc2ec0d75aac3`.
- Validation: build and 16 automated tests passed. Focused mood/Journal browser checks covered existing/new observations, editing, phone layout, Vienna times and second-device sync. The 42-record history regression passed. Phone screenshot inspected; physical devices unverified.
- Existing D1, Artlook and private folder bindings preserved. No migration or production owner-record writes.
- PWA shell version: 2.3.1. Existing clients must let the update download, close all planner windows/tabs, then reopen to activate.
- Rollback: route to Worker version `a3e4cf9f-2fdb-4594-aa52-d3ae2c575ade` (2.3.0), retaining all records/bindings. Cached clients follow the existing shell activation rules; a forward fix is preferable to downgrading installed shells.

## Verified production rollout — 2.3.2 (Urgent alarm red)

- UTC: 2026-10-16T10:37:47.621495Z.
- Source: `cf7ccee9c2cc9f12143b152a7cc09a90da2d6966`, branch `feature/life-workspace-sync`.
- Worker/environment: `planner` / production; https://planner.jeremydachojd.workers.dev/.
- Deployment: `290464dd-b260-4e21-9db0-e33c17cddee4`; Worker version: `d754b8c3-f765-444a-ac9d-60e28b370b89`; traffic: 100%.
- Health: `ok:true`, `version:2.3.2`, `storage:true`. Live stylesheet matched SHA-256 `a1a37afc84eb54af10f7a6e34fb51c0e5ccd4fe684010031e129f4cf40a8016a`; live sw.js matched `24b54830899fa0df7fef4d0374ce99851bdfd2a7bad35d8f0388877899273915`.
- Validation: build, 16 automated tests and 63 Chromium browser checks passed; desktop and phone screenshots inspected. Simulated desktop/iPad/phone layouts only; physical devices remain unverified. The temporary browser executable was restored after the first launch failed; the standard Playwright download returned a truncated archive, so the available packaged Chromium binary was used successfully.
- Existing bindings and user records retained. Only urgency presentation changed; Google authorization was not tested or modified.
- PWA shell version: 2.3.2; downloaded updates activate after all old app windows/tabs close.
- Rollback: route to Worker version `9a285055-4456-4595-bf61-6cd70f9966fd` (2.3.1), retaining records and bindings. Existing clients follow shell activation rules; prefer forward corrective releases.

## Verified production rollout — 2.3.3 (Remove task due date)

- UTC: 2026-10-16T10:43:59.4913Z.
- Source: `0fbe9c6010865604654c9a47fa128623423207c3`, branch `feature/life-workspace-sync`.
- Worker/environment: `planner` / production; https://planner.jeremydachojd.workers.dev/.
- Deployment: `f83e1273-75dd-47f9-90ac-23ea59c4613f`; Worker version: `23c3034d-6525-433d-9b98-52d5a9d1ea4e`; traffic: 100%.
- Health: `ok:true`, `version:2.3.3`, `storage:true`. Live app.js matched tested SHA-256 `c2e8655db3f303d7ba5561079b994ba84a699d494b9b30e0c5fe62984a436012`; live sw.js matched `bafd1043c1f729aeb26b067860f2058e08544782d327ce29e8dcf1e04f88e4c7`.
- Validation: build and 16 automated tests passed. Focused browser regression covered explicit/manual clearing, cancellation, time/reminder cleanup, existing undated tasks, reopen persistence, overdue urgency removal, manual P0 retention and second-device sync. Phone editor screenshot inspected; physical devices unverified.
- Existing bindings/data preserved; no migration or production owner-record writes. Google authorization was not changed or exercised.
- PWA shell: 2.3.3; downloaded updates activate after all old app windows/tabs close.
- Rollback: route to Worker version `d754b8c3-f765-444a-ac9d-60e28b370b89` (2.3.2), preserving all records and bindings. Older editors may substitute today for an undated task; prefer a forward fix and follow shell activation rules.
