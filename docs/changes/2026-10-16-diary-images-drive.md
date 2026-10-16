# Diary images and configured Drive destination — 2.2.0

## Behavior

Diary entries now accept multiple image uploads, optimized JPEG previews, a larger viewer and synchronized references. Separate authenticated, client-encrypted image storage avoids inflating every vault snapshot. Full JSON backups include photos; importing a full or encrypted backup can restore attachments.

The user's provided Google Drive folder is stored in encrypted settings, with Drive image copies and daily backup enabled. The folder ID and private configuration scripts are excluded from Git. Following the user's clarification, **Drive image files are ordinary JPEGs**; **planner backups remain encrypted**. Cloudflare retains a separate encrypted copy for device sync. Pending image copies are visible and can be retried. Backup uploads are acknowledged only after success; automatic daily backups require the planner open and Drive authorized.

Google authorization uses narrow `drive.file` plus an explicit Picker folder selection. A Google OAuth client ID, Picker browser API key and Cloud project number are required. No Google OAuth client is configured in the migrated workspace, so **no real Drive image or backup uploads have occurred**. No actual folder permission check is claimed. User authorization/configuration remains necessary before Drive writes can succeed. This is a configured and tested integration, not an active linked Google account.

The Artlook gatekeeper was inspected and its internal service-binding pattern reused. The original Worker has only an API key and read operations; Planner adds an authenticated, fixed-folder metadata proxy without altering Artlook or exposing its secret. This does not supply Google upload permission.

## Validation

- Build passed and 16 automated tests passed, including image API authentication, cross-workspace isolation, encryption at rest, immutable attachment identities and a mocked service-bound gatekeeper test covering workspace auth, folder/query rejection, normalized upstream requests and metadata filtering.
- Chromium browser suite: 63 checks passed at desktop, simulated iPad portrait/landscape and phone widths, with no page errors. Diary image upload and decoding, larger preview, second-context image display and local backup inclusion passed.
- Controlled Google API fixtures verified the request's destination parent, JPEG MIME type and actual JPEG bytes. The backup request carried an encrypted envelope without plaintext diary content. These are mocked API tests, not real-account writes.
- A CSP issue blocking local blob image decoding was found and fixed by allowing `blob:` only in image sources. No external image or script wildcard was introduced.
- Physical iPad/Safari, real OAuth/Picker consent, real folder access, OS notifications, large resumable-upload recovery and long-term daily scheduling are not verified. Daily backups are session-dependent; there is no server-side refresh-token schedule.
- Removing an attachment detaches it; remote files and historical images are retained. Images are optimized up to 1600 px; originals are not retained. API errors preserve the encrypted Cloudflare copy and identify pending Drive saves.

## Deployment

Continues the existing feature branch and PR. See DEPLOYMENT.md for the exact source and production version. The additive image-table migration does not modify existing vault records. The only private configuration update sets the supplied folder and backup preferences through revision-checked encrypted sync; existing user entries are preserved.
