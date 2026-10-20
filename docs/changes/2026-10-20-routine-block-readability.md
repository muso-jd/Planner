# Routine block creation and readable typography — 3.6.1

A routine previously required a separate Calendar visit to create its time block. The routine window now offers an inline creation section. Saving links the routine and canonical block in one persistence batch; cancellation and disabling creation leave existing assignments intact. Validation checks the block fields and routine offset before writing either record. Existing Calendar recurrence and encrypted synchronization are reused.

Compact type declarations (7–12 px) in style.css, workspace.css and themes.css increase by 50%, including responsive variants. Headings retain their larger sizes. White subtitles and field captions are scoped to dark themes; light themes retain dark equivalents. Muted body descriptions retain their gray palette. Inputs and mobile navigation gain room for the larger labels.

Validation: build and all 45 unit/API tests passed; JavaScript syntax check passed. Local Chromium installation was unavailable because the network download could not complete. Live Chromium verification passed for inline creation, invalid offset rejection, Calendar containment, cancel preservation, encrypted sync, and computed typography colors/sizes. The tested desktop viewport was 1363×936 with no document horizontal overflow. Phone/iPad emulation and light-theme visual inspection were unavailable. No physical iPad/Safari testing is claimed.

Source branch: feature/routine-block-readability, stacked on feature/black-glass-funded-tasks (PR #8). No main merge. Rollback target: Worker version decf4ce3-2c20-4c32-bfaa-ef9518d42f4b (3.6.0). No binding, migration or owner-data change.


Deployed at 2026-10-20T06:42:17.626697Z from source `50facabb1329418e777117f1cce5b0cec6641e13`. Deployment `f454e879-38db-4b3a-87b6-b207b1c6b46f`; Worker version `ea687dc3-211d-4241-aed3-072731ba4450`, 100% traffic. Health returns version 3.6.1 with storage available. Existing settings and binding values are preserved. See DEPLOYMENT.md for evidence, PWA refresh instructions and rollback.
