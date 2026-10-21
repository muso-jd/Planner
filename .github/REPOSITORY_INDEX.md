# Repository index and working policy

The default README is the entry point for branches, work in progress, recent changes,
releases, and recorded deployment destinations. Existing application source and
documentation remain in their current locations; this setup does not consolidate
unmerged code or equate the default branch with production.

## Maintenance

- `.github/scripts/update_repository_index.py` reads GitHub repository, branch,
  commit, pull-request, tag and release metadata. It replaces only the marked
  repository dashboard panel in `README.md`, preserving all text outside it.
- `.github/repository-index.json` contains curated deployment links and evidence.
  Keep these records current in the same change that records a real deployment.
  A stable URL may serve newer code than an older branch; do not label each old
  branch as a separate live deployment. Never store keys or pairing URLs here.
- The **Repository index** GitHub Actions workflow refreshes on supported push,
  branch/tag creation/deletion, same-repository PR and release events, manually
  through **Actions → Repository index → Run workflow**, and daily at 05:23 UTC.
- Existing branches may predate the workflow. Their pushes/PR events may not run
  this workflow until they inherit it. The daily default-branch refresh discovers
  those changes, fork PR metadata, and missed events. Scheduled runs can be delayed
  by GitHub, and inactive public repositories may have schedules disabled.
- The workflow checks out only this repository's default branch and runs no PR
  code, application build, deployment, branch merge, or branch deletion. It uses
  the repository-scoped `GITHUB_TOKEN` with contents write and PR read permissions.
  Automated README commits carry `[skip ci]` and do not create an index loop.
- Branch protection, Actions policies or disabled Actions can block updates.
  Inspect the workflow result instead of assuming it ran. Keep the last generated
  index available and resolve the specific policy restriction; do not bypass it.

## Branch policy

1. Keep one permanent default branch. Aim for one coherent active task branch per
   project unless independent work genuinely needs more.
2. Continue related work on its existing branch. Do not create a branch for each
   conversation, small fix, file, or release record. Avoid new chains of stacked
   PRs; finish the existing task or deliberately consolidate it first.
3. Small, validated low-risk fixes, documentation and index maintenance can go
   directly to the default branch when repository rules permit. Use a temporary
   branch/PR for substantial behavior, UI, security, dependency or architecture
   changes. Inspect deployment triggers before pushing.
4. Complete authorized implementation, checks, documentation, merge and deployment
   work without introducing redundant approval pauses. A request for documentation
   or this index alone does not authorize unrelated application merges/deployments.
5. Preserve completed versions with tags/releases. Before removing a task branch,
   confirm its useful work is preserved, dependent PRs are resolved, and removal
   is authorized. Preserve historical deployments; deployment deletion is separate.
6. Keep documentation proportional: clear commits and brief changelog entries for
   small behavior changes; current guides and detailed reports for major changes.
   Record exact source commits and verification limits for real deployments.

## Local preview and validation

Requires Python 3 with only its standard library. For a live metadata preview,
set `GITHUB_REPOSITORY=owner/repository` and provide `GITHUB_TOKEN` through a secure
environment, then run `python3 .github/scripts/update_repository_index.py`.
This updates the local README only. Add `--write` only for an authorized remote
README update. Never print or commit the token.

Snapshot preview: `python3 .github/scripts/update_repository_index.py --snapshot snapshot.json`.
Run generator checks with `python3 .github/scripts/test_repository_index.py`.
Snapshot mode cannot publish. The initial dashboard was rendered and checked from
authenticated repository metadata; tag discovery is completed on the first live
workflow run. Deployment destinations are documentation evidence, not a fresh
HTTP, device, privacy or Cloudflare configuration audit.
