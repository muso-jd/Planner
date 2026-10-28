# Google setup

1. In Google Cloud Console, use a project with Calendar API and Tasks API enabled.
2. Configure OAuth consent and add yourself as a test user if the app is in testing.
3. Create an OAuth client of type Web application. Add `https://planner.jeremydachojd.workers.dev` as an authorized JavaScript origin. Add localhost only when developing locally.
4. Paste the client ID (not a client secret) into Planner → Settings and save it.
5. Connect Google and authorize calendar events, calendar-list read access and Tasks access.
6. List calendars/task lists if needed; enter their IDs. Default values are `primary` and `@default`.
7. Preview imports, review the list, then import. Export uses the selected window for dated records and includes undated tasks. It creates records and subsequently patches records marked as previously exported by Planner.

Google account access is not active until configured. This setup cannot be completed with a ChatGPT Google Calendar connection alone: the deployed web app needs its own Google OAuth client.

Imports overwrite title, notes, due date and status of matching linked records after preview. Exporting a previously imported, never-exported record creates a separate Planner-owned Google record. External deletions are not propagated. OAuth tokens are session-only and need renewal. No background refresh, webhook sync, recurrence-exception editing, remote deletion or Apple integration is implemented.

Sources checked 2026-10-16:

- https://developers.google.com/identity/oauth2/web/guides/use-token-model
- https://developers.google.com/workspace/calendar/api/v3/reference/events/insert
- https://developers.google.com/workspace/tasks/reference/rest/v1/tasks

## Export one task

Use the Google export icon beside a saved task, or Send saved task to Google inside its editor. Choose Google Tasks or Google Calendar, then Send task. Only that saved task is sent; save editor changes first if you want to export them. The destination uses the task-list/calendar IDs saved in Settings; defaults remain `@default` and `primary`. Authorization opens when needed. Calendar requires a date; a task without a time becomes an all-day event. Calendar supports the selected 30-minute, 1-hour or 1-day reminder; Tasks exposes a date-only deadline. Sending again updates the item Planner previously exported to that destination. Tasks and Calendar links are independent. A newly generated recurring task clears inherited export IDs. Importing a Planner-owned task export updates the original task rather than duplicating it; Calendar mirrors of exported tasks are skipped during block imports so they do not convert tasks into blocks.

## Google Health

1. Enable **Google Health API** in the same Cloud project as the web OAuth client. Follow https://developers.google.com/health/get-started and its Google Cloud setup checklist.
2. Add these scopes to your OAuth consent configuration and grant them from **Health → Google Health → Connect Google Health**:
   - `https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly`
   - `https://www.googleapis.com/auth/googlehealth.sleep.readonly`
   - `https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly`
3. If the OAuth app is in testing, add your Google account as a test user. Wider distribution may need Google's scope verification/approval. Keep the exact live site's origin in Authorized JavaScript origins. Never put a client secret in this app.
4. Choose 7, 28, 90 or **Last 365 days** ending on the selected Planner reporting date. Preview Google data, inspect results/errors by data type, then import the readings you retrieved. Empty responses mean no available readings, not zero sleep or weight.

The connector calls Google Health v4 directly from the browser. Sleep uses `dataPoints:reconcile`; exercise, weight, daily HRV, resting heart rate, daily oxygen saturation, daily respiratory rate and body fat use paginated `dataPoints` lists with documented time filters. Access is read-only. The token stays in runtime memory and expires; reconnect manually when necessary. Imported readings are normalized into the encrypted Planner workspace, available across devices and included in full backups. No real Google consent or owner-health read is performed by automated tests.

Stress entries are manual: the documented Google Health data-type list has no direct stress-score type. HRV remains a separately named metric. Workout intensity is self-reported RPE (1–10), alongside device heart-rate zones where returned. Planned rest is an optional 0–168-hour interval set by you after a workout; the countdown does not determine physiological recovery. Imported measurement values remain read-only; local workout notes, RPE and planned rest can be adjusted and survive repeated imports. Manual entries are not replaced by Google imports. No Apple service integration is included.

Health sources checked 2026-10-16:

- https://developers.google.com/health/get-started
- https://developers.google.com/health/data-types
- https://developers.google.com/health/filters
- https://developers.google.com/health/reference/rest/v4/users.dataTypes.dataPoints
- https://developers.google.com/health/reference/rest/v4/users.dataTypes.dataPoints/list
- https://developers.google.com/health/reference/rest/v4/users.dataTypes.dataPoints/reconcile

## Drive images and backups

Enable Drive API and Google Picker API in the same Google Cloud project. The existing OAuth web client ID is reused, but Drive has a separate `drive.file` authorization button.

In Planner → Connect → Google Drive, enter:

- The destination folder ID (the user's supplied folder is already configured privately).
- A Google Picker browser API key, restricted appropriately for this application; follow the current Picker guide's referrer/API restrictions, including its `docs.google.com` iframe requirement.
- The Google Cloud **project number** used as the Picker app ID.

Save settings, choose **Connect Google Drive**, then **Select / authorize folder** and choose the intended existing folder. This selection is necessary for narrow file-level access; a pasted folder link alone does not grant Drive access. Use **Save pending images to Drive** for existing diary photos and **Save backup now** for an immediate backup.

Drive photos are ordinary JPEGs. Backups remain encrypted and require the workspace key for restoration. Daily backups run only with the app open and an active token. Nothing is claimed uploaded to the real folder until authorization and an actual successful API response occur.

Additional primary sources checked 2026-10-16:

- https://developers.google.com/workspace/drive/api/guides/api-specific-auth
- https://developers.google.com/workspace/drive/picker/guides/web-picker
- https://developers.google.com/workspace/drive/picker/reference/picker.docsview.setselectfolderenabled
- https://developers.google.com/workspace/drive/api/guides/manage-uploads

## Artlook gatekeeper reuse

The existing `gatekeeper` is now reused through a service binding for allow-listed folder reads. It stores a Google API key, not a Google user OAuth refresh token; API keys cannot authorize private Drive uploads. The planner's **Check Artlook gatekeeper** button tests the server read path, separately from the Drive write connection. Do not make the planner folder public to compensate for missing authorization.

`ARTLOOK_GATEKEEPER` points to the existing `gatekeeper` service. `DRIVE_FOLDER_ID` is the privately configured folder allowlist value. The source Artlook Worker and its origins/secret stay unchanged.

### Annual history and availability

Select **Health → Google Health → Last 365 days → Preview Google data**. The end date is the selected Planner reporting date; choose today for the latest year. The app reads adjacent windows of up to 28 days, following all returned page tokens. Review counts and any per-type access/pagination errors, then select **Import readings**. **Stop reading** retains partial results for review, with unchecked types explicitly marked. Importing again updates matching source records without duplication and retains manual readings/local workout annotations. It does not revive archived records.

**Available data** reports returned versus importable readings and their coverage, alongside empty results and errors. The last report synchronizes privately as encrypted settings. It checks eight supported metrics, not every enabled API. Enabling APIs or adding OAuth consent-screen scopes is separate from granting the browser token those scopes and having actual data in Google Health. The existing three read-only scope groups cover the additional oxygen/respiratory/body-fat metrics. No additional scopes are requested. Actual personal account readings remain unverified in this release because the agent browser has no unlocked workspace or session token.

Schema and pagination references rechecked 2026-10-16: https://developers.google.com/health/data-types and https://developers.google.com/health/reference/rest/v4/users.dataTypes.dataPoints/list and https://developers.google.com/health/reference/rest/v4/users.dataTypes.dataPoints .


## Huawei watches and legacy Fit data
Google Health is not assumed to expose Huawei-origin Google Fit Takeout records. Direct ongoing Huawei account access is now a separate connector documented in [HUAWEI.md](HUAWEI.md). Fit archive backfill is a separate future importer. Task row export icons were removed in 3.7.2; Send saved task to Google remains in the saved task editor.
