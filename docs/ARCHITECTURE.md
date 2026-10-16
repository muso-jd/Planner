# Architecture

The dependency-free frontend in `public/` is embedded into a module Worker at build time. Requests to `/api/vault` use the `DB` D1 binding. The database jurisdiction is EU, with read replication disabled. A synthetic SQLite adapter tests the same SQL statements locally.

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
