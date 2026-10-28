# Huawei Health connection

Huawei Health Service Kit is the direct read-only source for Huawei Health account data, including data synchronized from compatible Huawei watches. Google Health remains a separate connector. Google Fit Takeout records are not automatically available through Huawei, and the uploaded archive was not imported by this change.

## Current implementation (3.8.0)

| Metric | Imported representation | Required read scope |
| --- | --- | --- |
| Sleep stages | Light/REM/deep/awake/nap intervals, start/end and duration; calendar-day chart excludes awake | `https://www.huawei.com/healthkit/sleep.read` |
| Heart rate | Daily sample mean, min, max, count; never relabelled resting HR | `https://www.huawei.com/healthkit/heartrate.read` |
| Resting heart rate | Separate Huawei-provided resting HR samples, daily sample mean/min/max/count | Same heart-rate read scope |
| Device stress | Daily sample mean/min/max/count on Huawei's 1–99 scale, separate from manual stress 1–5 | `https://www.huawei.com/healthkit/stress.read` |
| SpO₂ | Daily sample mean/min/max/count, percentage | `https://www.huawei.com/healthkit/oxygensaturation.read` |
| Weight | Individual timestamped measurements in kg | `https://www.huawei.com/healthkit/heightweight.read` |

API-supported does not mean an account or watch has readings. Availability depends on recording settings, watch/firmware/phone support, synchronization, regional eligibility, approved app scopes and user grants. GT 2 account availability is unverified until real authorization succeeds. Sampled metrics are unweighted averages of the samples returned, not clinical or time-weighted estimates.

Sleep fragments use documented state values 1 light, 2 REM, 3 deep, 4 awake, 5 nap. Intervals are clipped at Vienna calendar-day boundaries, exact duplicates removed, matching overlapping stages united, and conflicting overlaps rejected. This is not a nightly wake-date summary or a reconstructed sleep score. Nightly scores, full sleep summaries and workout/activity imports are not implemented yet. Huawei documents these capabilities, but their current REST mappings still need validation. HRV and respiratory data exist in newer API versions; this implementation neither requests them nor assumes GT 2 availability. No temperature, ECG, glucose or blood-pressure measurements are inferred from this watch.

## App registration and server setup

1. Create/register a web app in Huawei Developers/AppGallery Connect and apply for Health Service Kit cloud-side access. Review current developer eligibility/region requirements and obtain approval for the desired scopes. Registration/agreements and permission approval are external prerequisites, not created by this release.
2. Register exactly this redirect URI for the production app:
   `https://planner.jeremydachojd.workers.dev/integrations/huawei/callback`
3. Configure `HUAWEI_CLIENT_ID` and **secret** `HUAWEI_CLIENT_SECRET` on the existing Planner Worker. Put the secret into Cloudflare's secret storage, never source, browser settings, chat, logs, backups or GitHub. These values are not supplied or fabricated by the implementation.
4. Optional `HUAWEI_HISTORY_SCOPE`: `week`, `month`, or `year`. Set only the history permission Huawei approved. It adds `https://www.huawei.com/healthkit/historydata.open.<value>` to consent requests. Omitting it requests no extra history scope; pre-authorization data may be denied. Do not assume unrestricted historical backfill.
5. In Huawei Health, authorize data sharing with Health Service Kit if required for your account. Synchronize the watch to the account.
6. In Planner → Health → Huawei Health, select metrics, check connection setup and Connect Huawei Health. Only selected metrics' read scopes are requested, plus the configured history scope. Complete Huawei's consent screen. Preview a short period, inspect returned/rejected/duplicate counts and per-type errors, then Import Huawei readings.

## Flow and privacy

The `/api/huawei/*` routes require the existing workspace bearer token, same-origin checks and a real vault row. POST start issues a ten-minute HMAC-signed state bound to workspace hash and origin and stores it in a Secure/HttpOnly/SameSite=Lax `__Host-` cookie. The callback clears the query string and returns the authorization code/state through same-origin postMessage or a state-specific BroadcastChannel (for isolated popup contexts). Exchange validates state signature, workspace, origin, expiry and cookie before contacting Huawei; the cookie is cleared afterward. A user can cancel or let sign-in time out.

The app secret stays on the server. Access/refresh tokens stay only in the active page's memory; no token is saved into the encrypted vault, local/session storage, backups or logs. Reload/lock loses the connection. Disconnect clears it while retaining imported data. This is on-demand preview/import, not unattended background sync.

The gateway sends fixed read operations to Huawei's documented `sampleSet:polymerize` endpoint, with read types allowlisted and bounded six-hour queries. No write/delete endpoint or arbitrary upstream URL is accepted. Requests time out; bodies are bounded; provider errors are sanitized. A regional 403 Location is retried only at the exact same endpoint on Huawei's EU host. Unknown pagination is an explicit error rather than a claim of complete data. No automatic retries or rate-limit bypasses.

Preview is local. Import batches normalized readings into the existing encrypted workspace, retains manual records and notes, avoids reviving tombstones, and upserts stable provider IDs. Corrected sleep segments supersede previous Huawei segments only on dates with newly imported stage data, using recoverable tombstones. A size preflight rejects imports that could exceed the existing vault sync limit. Empty responses remain missing data, not zero readings.

## Validation and remaining prerequisites

Tests use synthetic local fixtures only. Unit/API tests cover configuration, workspace authorization, signed state/cookie/workspace/expiry, code exchange, refresh failures, fixed endpoints, regional routing, unknown pagination, duplicate normalization, scale separation and sleep overlaps. Browser checks mock Huawei OAuth and responses; verify six metrics, explicit preview/import, reimport, runtime-only tokens, disconnect, and desktop/simulated iPad/phone layouts. No real Huawei ID, vendor approval, owner-health query or device session is claimed. See DEPLOYMENT.md for actual release evidence.

## Primary references checked 2026-10-28

- Platform/access: https://developer.huawei.com/consumer/en/hms/huaweihealth/
- Permission application: https://developer.huawei.com/consumer/en/doc/HMS-Plugin-Guides-V1/applying-for-health-kit-0000001073886087-V1
- OAuth server exchange: https://developer.huawei.com/consumer/en/codelab/HMSAccounts/index.html
- Scopes/history permissions: https://developer.huawei.com/consumer/jp/doc/HMSCore-References/scopes-0000001050092713
- REST regional routing/history FAQ: https://developer.huawei.com/consumer/fr/doc/hmscore-guides/faq-0000001476980529
- Heart/resting heart rate: https://developer.huawei.com/consumer/cn/doc/HMScore-Guides/heart-rate-0000001131417172
- Stress: https://developer.huawei.com/consumer/cn/doc/HMScore-Guides/stress-0000001177423529
- SpO₂: https://developer.huawei.com/consumer/fr/doc/hmscore-guides/blood-oxygen-0000001131264010
- Sleep fragments: https://developer.huawei.com/consumer/cn/doc/HMSCore-Guides-V5/write-sleep-scene-0000001055045352-V5
- Sleep stage enum: https://developer.huawei.com/consumer/jp/doc/HMSCore-References-V5/sleepfragmentcategory-0000001055067754-V5
- Current API capabilities: https://developer.huawei.com/consumer/de/doc/HMSCore-Guides/version-change-history-0000001233272401

Some provider pages are dynamically rendered; retrieved official documentation excerpts informed implementation. Real provider response compatibility still requires approved credentials and live verification.
