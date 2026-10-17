# Architecture

## Optional glass materials (3.5)

`control-center.js` allow-lists nine theme IDs as of 3.6. The six glass IDs derive `data-material=glass`, the light/dark `data-tone` and browser chrome color from the encrypted settings record; custom accent contrast continues to set `--on-accent`. The settings picker provides static CSS previews, pressed states and keyboard-focus restoration after selection. Unknown IDs fall back to Dark. Carbon, Black Ice and Amethyst override the body background to pure black, including removal of backdrop gradients, while retaining per-material panel variables and existing accessibility fallbacks.

`themes.css` loads after the shared workspace CSS. All material overrides are scoped to the glass root; the theme picker alone applies in classic modes. System typography belongs to glass modes while existing monospace metadata stays intact. Static gradient backgrounds, scoped standard/WebKit backdrop filters, opaque unsupported-filter shell fallbacks and media preference overrides avoid a rendering loop or graphics dependency. `scripts/build.mjs` embeds the stylesheet and the 3.5 PWA shell precaches it. No API, schema, credential, business logic or sync protocol change is required.

## Funding row visibility (3.6)

The Budget renderer hides task rows with non-positive own costs in integer cents and omits container rows without any positive-cost descendant in scope. Traversal continues through hidden nodes without adding indentation, retaining funded descendants and existing visited-ID/cycle guards. Shared `fundingRollup` and `taskFunding` remain unchanged; displayed cost/income/balance totals retain their previous semantics. The required-budget count filters positive open own costs. No record is deleted, modified or migrated by this presentation filter. PWA shell 3.6 includes the revised renderer and new theme definitions.

## Frontend foundation

The dependency-free frontend in `public/` is embedded into a module Worker at build time. Requests to `/api/vault` use the `DB` D1 binding. The database jurisdiction is EU, with read replication disabled. A synthetic SQLite adapter tests the same SQL statements locally. Control Center 3 adds focused frontend modules without changing the vault authentication or revision protocol.

## Workspace identity and encryption

A workspace key is 32 random bytes encoded as 43 base64url characters. The browser derives an AES-GCM key from SHA-256(`enc:` + workspace key). It derives a distinct bearer token from SHA-256(`auth:` + workspace key). The API hashes this bearer token again for the database lookup ID. The raw workspace key and encryption key are not sent to the API. Each save uses a new random 12-byte IV and an authenticated encrypted snapshot. Knowledge of the bearer token permits ciphertext access and overwrites, but does not yield the encryption key. Protect the workspace key: there is no account-based recovery or key rotation UI yet.

Pairing links carry the key in a URL fragment, which is removed from browser address history on load. Referrer-Policy is no-referrer. Retain a key only in sessionStorage unless the user selects persistent connection. Cache records and merge bases live in localStorage scoped to a derived workspace identifier. This is an encrypted cloud vault with a plaintext device working cache, not whole-device encryption.

## Synchronization

Records are a dictionary keyed by stable IDs. Deletes are tombstones. Pull decrypts the latest snapshot; a three-way merge compares the device's last cloud base, its local working records, and the new remote state. Independent record/field changes merge; same-field divergence keeps the local value and retains the remote alternative in device-local conflict review. The alternate is not synchronized as a separate conflict record.

PUT uses a monotonically increasing revision and conditional SQL update. Concurrent stale writes receive 409 and re-pull/merge. D1 batch transactions apply the update and encrypted history insert together. A mutation counter schedules another save if editing happens while an encryption/upload is in flight. Changes persist locally before network access. Polling is every 20 seconds while visible, with saves after edits and on focus/online events.

## Boundaries

The API accepts only well-formed bearer tokens and encrypted envelopes, checks browser Origin, sets no-store/security headers, and never exposes all workspace IDs. Workspace enrollment is closed: only pre-provisioned database rows can be accessed or updated. Unknown keys cannot create records. There is no account identity directory or key rotation UI. A key holder can overwrite their own vault. Generic API traffic is not protected by a custom application rate limiter. These are limitations of this single-user deployment foundation, not a multi-tenant commercial auth system. Do not expose new data APIs without reviewing authentication and abuse controls.

## External services

Google Identity Services obtains a short-lived browser token after a user gesture. Tokens stay in runtime memory. Calendar and Tasks requests go directly to Google; no refresh tokens or Google secrets live on Cloudflare. Imports require review; exports affect selected records and never delete remote entries. Source docs: https://developers.google.com/identity/oauth2/web/guides/use-token-model and https://developers.google.com/workspace/tasks/reference/rest/v1/tasks.

## Entry presentation and completion (2.1.0)

`color` is a validated six-digit hex override; unset tasks inherit their linked project's override. `icon` is an allow-listed SVG icon identifier or `auto` derived from category. Presentation does not change task identity. Urgency is derived from manual priority 0 or an elapsed Vienna deadline and does not rewrite stored importance. Grouped overdue alerts use a per-device timestamp scoped to the workspace cache; frequency is synchronized in settings.

Task completion requires a UI confirmation. The saved record includes `completionNotes` (latest note) and `completionLog` entries `{id, at, notes}`; planning notes remain untouched. Confirming rechecks the latest task and resource blockers. Recurrence is generated only after confirmation and does not copy completion logs. These fields follow the same encrypted snapshot and conflict-review rules as other records.

## Image attachments and Drive (2.2.0)

`images(workspace,id,data,iv,created)` stores encrypted, immutable per-image payloads. `/api/images/:id` requires the same bearer token, verifies a provisioned workspace, and scopes reads/writes to that workspace. Envelopes are bounded to 1.5 MB; client-side optimized JPEG payloads are validated before rendering. The main vault contains image references only. Full backups fetch and include the referenced image payloads.

Drive uses a separate session-only token with `drive.file` scope. Google Picker grants access to the existing destination folder without general Drive scope. Image uploads use multipart JPEG content, not encrypted blobs, per the user's preference. Backup uploads use AES-GCM envelopes. App properties identify previously uploaded images to reduce duplicate copies on retry. Drive status is only acknowledged after the API succeeds. Offline/expired authorization leaves pending copies on Cloudflare, with explicit retry controls. No refresh token or Google client secret is stored. Daily backups are an in-browser condition check after cloud sync, throttled on failure, not an unattended service.

The destination folder is configured privately through a CAS-protected encrypted settings update. Google scopes, consent and upload behavior were checked against the primary documentation linked in GOOGLE.md. OAuth and real-account uploads remain unconfigured/unverified.

## Reused Artlook gatekeeper

Production Artlook's `gatekeeper` Worker was inspected. Its only Google credential is `GOOGLE_API_KEY`; it handles Drive lists and legacy gallery checks, not OAuth uploads. Planner reuses that credential through an `ARTLOOK_GATEKEEPER` service binding, following Artlook's adapter pattern. The source Worker, secret and allowed origins are not changed or copied into Git.

Authenticated `/api/drive/list` normalizes the request to the single server-configured `DRIVE_FOLDER_ID`, rejects arbitrary queries and other folders, bounds pagination, uses internal transport to the existing Artlook origin, and forwards only selected file metadata. `/api/drive/status` reports the read-only capability explicitly. This does not make a private Drive folder public and cannot grant write access. OAuth/Picker remains necessary for JPEG and backup writes.

## Local typography (2.2.3)

Noto Sans Mono is bundled as a variable WOFF font with Latin/extended Latin, general punctuation, euro and arrow coverage. The text-safe base64 source in public/fonts is embedded by scripts/build.mjs; the Worker decodes it into binary at /fonts/noto-sans-mono.woff with the font/woff MIME type. No runtime font service is contacted. The SIL Open Font License is retained alongside the asset. System fallback handles glyphs outside the subset.

## Installable app shell (2.3.0)

manifest.webmanifest declares a stable root identity, clean start URL, standalone display and 192/512 px PNG plus maskable icons. pwa.js handles the browser installation lifecycle separately from workspace code and registers sw.js. Icon artwork is code-native SVG; scripts/generate-icons.mjs exports PNG base64 sources using Playwright.

The service worker atomically precaches an explicit same-origin public asset list under a versioned life-planner-shell cache. Only those GET paths are intercepted. API envelopes, attachments, credentials, Google requests and writes bypass Cache Storage. Existing localStorage workspace persistence continues to hold pending edits and existing sync handles reconnect. No background sync or Web Push is added. Worker updates wait for old clients to close; activation removes only old shell caches and claims clients. Every shell-affecting deployment must bump the cache version in sw.js to match the app version.

Installation references: https://web.dev/learn/pwa/installation and https://web.dev/learn/pwa/web-app-manifest.

## Journal mood observations (2.3.1)

Journal renders mood records alongside diary/conscience records rather than creating parallel diary copies. New quick check-ins carry an immutable at timestamp; existing records fall back to updated for display, preserved into at on first edit. Rating value remains numeric for analytics. Journal formatting provides a fallback title, context/notes and a Europe/Vienna time label. No stored record migration is required. The app-shell cache version is bumped with this frontend change.

## Control Center 3 modules

- `planning.js`: pure month expansion, scope accounting, task funding, payment timing, routine scheduling, tracker paging and sorting. Recurring ledger occurrences are derived, not inserted as duplicate records. Month-end anchors are preserved by the shared recurrence predicate. Amounts are summed as integer cents.
- `control-center.js`: shared editor adapters and coordinated views. Existing editor field names and submit logic remain compatible; visible switches/palettes update the retained form values. Floating labels keep accessible names. Advanced task fields are progressively disclosed. Themes/accent and saved task tabs are settings fields and participate in existing field-level merges.
- `attachments.js`: files up to 20 MiB are uploaded sequentially in 384 KiB encrypted chunks through the existing authenticated `/api/images/:id` blob transport. Each chunk payload is `{kind:'attachment-chunk',data:<base64>}`. The vault stores only attachment metadata and UUID part references. Downloads are forced to files with an octet-stream Blob, not rendered as active HTML. No API/D1 migration or public file URL is added.

Full JSON/Drive backups now use data version 3 with a `files` map of decrypted chunk payloads. Drive still encrypts the whole backup using the established envelope. Import validates chunk kind/size/base64/UUID then re-encrypts to the current workspace key before adding record references. Old version-2 image backups remain accepted. Cancelled imports/uploads can leave retained encrypted chunks; no automatic deletion is performed.

New Journal archive actions set `archived:true`, hiding records from active Journal/Capture but retaining them in descriptive mood/diary analytics. The archive also exposes legacy deleted Journal records for explicit restoration. No other record types are restored implicitly. Existing routine dose text is retained in records but omitted from the new editor.

The version-3 PWA shell precaches the new modules and iOS icon. File/image payloads and credentials remain outside Cache Storage. iOS support is Home Screen branding only, not Apple service integration.

## Calendar, Health and Insights (3.1)

Phone navigation is a view-level adaptation at 600 CSS pixels, with Notes/Diary/Feeling/Time routes and a More dialog for the remaining sections. It reuses the same note, mood and session records, not a separate phone database. A media-query change refreshes navigation when rotating/resizing across the breakpoint. The phone Time view re-renders its timer controls after starting a session.

`calendar.js` derives Monday-first month/week grids and uses existing task/block recurrence plus the shared routine scheduler. Its grid scrolls horizontally instead of collapsing into a list. `solid-icons.js` supplies filled SVG paths; navigation inherits its tab colour while content silhouettes remain white. `workspace.css` styles these new views after the existing Control Center stylesheet.

`insights.js` derives daily reporting series and renders accessible SVG trends, category bars and expandable data tables. Missing mood/sleep/stress/weight/HRV readings remain null/gaps. Finished sessions and dated task completions are aggregated in Vienna reporting dates. Current project/task inventory is labelled separately from historical activity. Monthly budget charts use the established recurring ledger projection; task funding stays separate.

`health-data.js` constructs Google Health v4 filters, normalizes documented units and validates manual records. `health.js` obtains a separate session-only token with three read-only scopes, calls `health.googleapis.com` directly and previews paginated results before writing normalized `health` records into the existing encrypted vault. Stable IDs use a SHA-256 digest of Google source identities (or type/time identity where unavailable); raw source data is not bundled into code. Import errors remain per-type and visible. Reimports retain manual entries and local workout annotations; archived records are not restored. No server API, schema, refresh token, webhook or Health write permission is added. CSP permits connections to the Health API; the PWA cache still excludes all external/API traffic.

`google-export.js` builds task/calendar payloads, including valid reminder offsets and Vienna timing. The app sends a single saved task only after its export form is submitted. Independent flat destination/id fields track Planner-owned Tasks and Calendar exports, retaining compatibility with prior bulk-export links. New recurring task instances clear all export IDs. In-flight requests preserve newer local fields when recording export metadata.

Planned recovery is explicitly a user-defined rest interval counted from workout end, never an inferred physiological score. Stress is a manual entry; HRV is not relabelled as stress. Health records participate in the existing sync, conflict handling and backup envelope without changing those protocols.

## Dependency model and annual Health import (3.2)

`dependencies.js` indexes task/goal/project records per revision and memoizes effective state. Explicit `deps`, task `parent` links and project/goal `project` membership form required-work edges. `all()` exposes effective completion to UI consumers without rewriting stored task confirmations, completion logs or legacy manual progress. Model invalidation follows local save generation or replacement of the record map during sync. Editors check the proposed candidate against both prerequisite and containment edges before saving. Project/goal `accentColor` is independent of the optional title `color`, and inheritance follows containing work with a cycle guard. No new database schema or owner-record migration occurs.

The dependency explorer renders graph, outline, board or table from the same requirements/state model. Filters retain their selected values during rerenders; highlights traverse either direction without changing records. Project filters follow ancestor project/parent links.

`healthWindows` splits 365 reporting days into adjacent, half-open windows, including the selected day. Health requests run serially by type/window/page with AbortController, progress, repeated-token detection and per-type partial-result errors. Each normalized reading is deduplicated by stable source ID; extra daily fields are mapped using current Google Health v4 schemas. `putMany` applies a reviewed import and timestamp in one local persistence operation and schedules the existing encrypted CAS sync. No refresh token, Health writes, new server credential or changed API authorization boundary is introduced.

Health connection disclosure and Google Calendar/Tasks import preview are reconstructed from session UI state so background sync does not clear their review controls. Last Health availability metadata belongs to the encrypted settings record; raw provider responses/tokens are excluded.

## Reflection / Calendar / Focus revision (3.3)

`reflectionStamp` formats stored timestamps explicitly in Europe/Vienna and labels legacy update-only provenance. New diary saves assign `at` once; edits leave it unchanged. Today derives recent period-specific reflection status; Journal uses the shared label in active/history/archive views.

`calendarEntries` derives visible occurrences with `routineFrequency` and `routineOccursOn`. Settings `calendarWeeklyRoutines` and `calendarMonthlyRoutines` are separate booleans and use existing encrypted settings sync. Routine check state is date-specific; daily routines are always excluded. No schema, external calendar action or record migration is introduced.

Focus is presentation-only state inside `dependencies.js`: selected item, collapsed outline branches and filter disclosure. It reuses `requirements`, containment edges and the memoized work model; completion and cycle rules are unchanged. Mobile selection scrolls the inspector into view. Alternate dependency layouts remain available.

## Budget/routine model (3.4)

Pure helpers in `planning.js` derive transfer-date ledger occurrences, unique-ID funding rollups, calendar reporting windows, integer-cent allowance partitions, reminder candidates and linked-routine scheduling. `spendingBudget` records hold name, amount, weekly/monthly period, scope, active-from date and color. `transaction.budgetAllocation` references one budget; `transferDate`, `paymentReminderDays` and `paymentReminderTime` are optional backward-compatible fields. Full encrypted backup/import recognizes the new type; no D1 schema or API route change is required.

`budget-envelopes.js` owns the budget dialog, reporting-mode state and category-budget cards, mounted by Control Center. New expenses use the existing ledger editor with the budget/scope/category preselected. Finance summaries never write derived totals into source records. Funding traverses containment only (not arbitrary prerequisites), with visited-ID guards; confirmed tasks remain in total cost but leave open requirements. Containers' manual legacy budget fields remain untouched in storage.

`routine.blockId` is the canonical relationship. `blockOffset` is a minute offset. Block editor routine assignments resolve to routine-record changes and save atomically with the block through `putMany`. Own routine time/schedule remains stored; display derives effective time. Calendar renders routine controls as siblings below the block button, avoiding nested interactive buttons. Today, reminders and Insights use the same linked schedule.

Payment reminder candidates derive from transfer occurrences across month/year boundaries and Vienna instants. A throttled open-app check deduplicates toasts/optional notifications by source occurrence and reminder offset in sessionStorage. Tokens, bank credentials and production personal records are not involved. PWA shell 3.4.0 includes the new module, excluding external/API data as before.
