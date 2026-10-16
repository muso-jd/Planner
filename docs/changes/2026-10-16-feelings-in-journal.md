# Feelings in Journal — 2.3.1

Mood/feeling records were saved but excluded by Journal’s diary/conscience filter. Journal now includes mood observations in selected-day entries and paginated history, showing the rating, feeling/context and Vienna check-in time. Existing observations appear automatically. Entries edit the same underlying mood record, preserving analytics and sync without duplicate diary entries. New records capture at; legacy update timestamps remain the display fallback and are preserved on first edit.

Validation: build and 16 automated tests passed. Focused browser checks cover existing observations, text-only and rated saves, history, Vienna time, editing without duplication, phone layout and second-device sync. The 42-record Journal pagination/navigation regression also passed. Physical devices remain untested. No owner records or schema are modified during deployment.

The versioned PWA shell is bumped to 2.3.1. Existing installed clients must close all planner windows/tabs and reopen after the new shell downloads. Production IDs and rollback are recorded in docs/DEPLOYMENT.md.
