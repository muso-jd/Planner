# Routine block creation and readable typography — 3.6.1

A routine previously required a separate Calendar visit to create its time block. The routine window now offers an inline creation section. Saving links the routine and canonical block in one persistence batch; cancellation and disabling creation leave existing assignments intact. Validation checks the block fields and routine offset before writing either record. Existing Calendar recurrence and encrypted synchronization are reused.

Compact type declarations (7–12 px) in style.css, workspace.css and themes.css increase by 50%, including responsive variants. Headings retain their larger sizes. White subtitles and field captions are scoped to dark themes; light themes retain dark equivalents. Muted body descriptions retain their gray palette. Inputs and mobile navigation gain room for the larger labels.

Validation: build and all 45 unit/API tests passed; JavaScript syntax check passed. Local Chromium installation was unavailable because the network download could not complete. Live browser validation and deployment evidence will be recorded after rollout. No physical iPad/Safari testing is claimed.

Source branch: feature/routine-block-readability, stacked on feature/black-glass-funded-tasks (PR #8). No main merge. Rollback target: Worker version decf4ce3-2c20-4c32-bfaa-ef9518d42f4b (3.6.0). No binding, migration or owner-data change.
