# Deployment

Target: Cloudflare Worker `planner`, production, https://planner.jeremydachojd.workers.dev/.

Binding: `DB` → `planner-vault` (EU jurisdiction). Database schema is in `schema.sql`. No application secrets or Google client secret are required in Worker configuration. Provision workspace rows through an authenticated Cloudflare administration channel, using browser-compatible encrypted records; never embed a workspace key in source.

Build `npm run build`, run `npm test` and targeted browser checks, then upload `dist/worker.mjs` as the module `worker.mjs`, with the D1 binding from `wrangler.jsonc`. Cloudflare API upload was used for this release. For CLI deployments, load current Wrangler guidance and authenticate first; do not place credentials in code.

## Current rollout

Source branch: `feature/life-workspace-sync`. Deployment metadata is recorded below after the validated source commit is pushed. The feature branch does not automatically deploy through GitHub Actions; no pre-existing CI configuration was present.

## Rollback

The previous Worker version is `21a03392-08ad-49ff-8719-b855e4165a54` (2026-09-12). Use Cloudflare deployment/version rollback to route traffic to that version; do not delete Workers, assets, databases or versions. This returns the old browser-local planner and cannot display cloud-vault additions. D1 encrypted data remains retained. Export a current JSON backup before a planned rollback, and retain all old `matrix*V4` browser keys.

Restoring code does not downgrade the database schema. The old source contains personal list data, so it is not copied into this public repository.
