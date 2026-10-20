# Routine containers, adaptive typography and duplication — 3.7.0

The routine list previously displayed linked routines flat and offered block creation inside the routine editor. It now uses the same accent-edged card pattern as Projects/Goals, with nested routines, schedule and selected-date completion. Block creation moves beside New routine and reuses the Calendar editor. All/recurrence views prevent linked routines from being categorized by their inactive independent schedule.

Typography is consolidated to five root size tokens with individually adjustable bases. The adaptive slider changes the actual smallest base most in relative terms and the actual largest linearly, interpolating between them. Settings previews immediately and persists on change; reset restores defaults. Captions and mobile dock spacing adapt to the chosen sizes. Dark subtitles stay white and supporting text gray.

Tasks and routines can be duplicated from rows/editors into an unsaved draft. Copies preserve planning, grouping and attachment references while clearing completion history and integration identity. Save creates a new record ID; cancel writes nothing. Child tasks are not recursively cloned.

Validation before rollout: build, all 49 unit/API tests, JavaScript syntax and diff checks passed. New tests cover effective group recurrence, orphan/empty blocks, exactly five font tokens, adaptive scale, malformed settings, separate custom bases, copy isolation, completion/integration removal and retained routine placement. Local Chromium remains unavailable; live browser validation will follow rollout. Phone/iPad emulation and physical Safari remain untested.

Branch feature/routine-groups-adaptive-fonts, stacked on PR #9. No main merge, new bindings, database migration or owner-record rewrite. Rollback is 3.6.1 Worker version ea687dc3-211d-4241-aed3-072731ba4450. Deployment evidence will be recorded after rollout.
