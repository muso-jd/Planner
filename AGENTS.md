# Planner code workflow

- Use focused branches for meaningful changes; preserve unrelated work. Tiny documentation corrections may go directly to main.
- Keep README, CHANGELOG, docs/FEATURES.md, docs/ARCHITECTURE.md and docs/DEPLOYMENT.md current alongside code. Record substantial changes under docs/changes/.
- Run `npm run build` before `npm test`, then targeted browser checks. Do not claim physical iPad/Safari testing from Chromium emulation.
- Never commit personal records, exports, workspace keys, Google tokens, or private activation links. This repository is public. Fixtures must be synthetic.
- Push a feature branch and prepare a PR. Merge only when authorized. Record exact source commit, deployment ID, UTC time, verified URL and rollback procedure for deployments.
- Jeremy's standing Planner release instruction (2026-10-17): requested Planner changes include deployment to the existing production Worker after required validation. Continue through source publication, deployment, verification and release documentation without stopping for a separate deployment confirmation. Respect an explicit request to keep work as a preview/draft, permission failures and material new authority boundaries. This does not authorize merging main, deleting deployments or changing unrelated projects.
- Preserve existing deployed versions. Deployment deletion requires separate explicit confirmation.
- Cloud data is encrypted client-side. Preserve CAS revision checks, tombstones, field-level merge and conflict review when modifying sync.
- Google integrations are explicit user actions; no Apple Calendar/Reminders/Tasks integration. iOS Home Screen icon/installation metadata is explicitly requested and allowed.
