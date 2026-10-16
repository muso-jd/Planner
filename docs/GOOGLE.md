# Google setup

1. In Google Cloud Console, use a project with Calendar API and Tasks API enabled.
2. Configure OAuth consent and add yourself as a test user if the app is in testing.
3. Create an OAuth client of type Web application. Add `https://planner.jeremydachojd.workers.dev` as an authorized JavaScript origin. Add localhost only when developing locally.
4. Paste the client ID (not a client secret) into Planner → Connect and save it.
5. Connect Google and authorize calendar events, calendar-list read access and Tasks access.
6. List calendars/task lists if needed; enter their IDs. Default values are `primary` and `@default`.
7. Preview imports, review the list, then import. Export uses the selected window for dated records and includes undated tasks. It creates records and subsequently patches records marked as previously exported by Planner.

Google account access is not active until configured. This setup cannot be completed with a ChatGPT Google Calendar connection alone: the deployed web app needs its own Google OAuth client.

Imports overwrite title, notes, due date and status of matching linked records after preview. Exporting a previously imported, never-exported record creates a separate Planner-owned Google record. External deletions are not propagated. OAuth tokens are session-only and need renewal. No background refresh, webhook sync, recurrence-exception editing, remote deletion or Apple integration is implemented.

Sources checked 2026-10-16:

- https://developers.google.com/identity/oauth2/web/guides/use-token-model
- https://developers.google.com/workspace/calendar/api/v3/reference/events/insert
- https://developers.google.com/workspace/tasks/reference/rest/v1/tasks

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
