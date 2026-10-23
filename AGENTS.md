# Project instructions

## Repository index and simplified workflow (2026-10-21)

These owner-approved rules supersede earlier instructions that require a new
branch for every meaningful change. Preserve other project-specific instructions.

- Start with the default-branch README dashboard to find current branches, PR
  dependencies, recent changes and recorded deployments. Read the chosen source
  branch's own guides before editing; default branch and production can differ.
- Keep one permanent default branch; reuse the existing coherent task branch.
  Avoid branch-per-session, branch-per-small-fix and new chains of stacked PRs.
  Use temporary branches for substantial independent changes and experiments.
- Small validated low-risk fixes, documentation and index maintenance may go
  directly to the default branch when its rules permit. Inspect CI/deployment
  triggers first. Do not infer that a short security change is low risk.
- Finish authorized checks, documentation, merges and deployment work without
  redundant confirmations. This index rollout does not authorize unrelated
  application merges or deployments. Preserve unique work and concurrent edits.
- Maintain `.github/repository-index.json` with evidence-backed deployment links.
  The Repository index workflow generates only the marked README panel; do not
  hand-edit that panel. See `.github/REPOSITORY_INDEX.md` for triggers and limits.
- Keep documentation proportional; record meaningful behavior changes in the
  changelog and update affected guides. Use tags/releases for completed versions.
- Check preservation, dependent PRs and authorization before branch cleanup.
  Do not delete historical deployments as part of Git housekeeping.
- Report actual validation and deployment status. Keep secrets, client images,
  gallery passwords, pairing links and personal workspace data out of Git.


## Repository landing-page order — 2026-10-23

Lead README with the app/site/project description and verified UI previews where available, then Changelog, then the generated repository dashboard/index, then setup and detailed guides. Clearly distinguish active task-branch work from the default source baseline and recorded deployments. Preserve existing documentation. Refresh the marked dashboard in place; do not move it ahead of the description. Repository deletion remains manual.
