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
