# Life Planner

A personal workspace for planning, projects, finances, routines, reflection and time tracking, deployed on Cloudflare Workers with encrypted D1 synchronization.

**Live:** https://planner.jeremydachojd.workers.dev/ · **Source:** https://github.com/muso-jd/Planner

Open your private activation link for the migrated workspace, then use **Connect → Copy pairing link** on another device. Keep the workspace key safe. Workspace enrollment is private; use the supplied activation link for the migrated records. Original device-local `matrix*V4` records migrate when that device opens the upgraded site using the same workspace key.

Tasks support **Urgent · Priority 0**, automatic overdue urgency and grouped reminders. In any entry editor, use **Custom title color** to coordinate your workspace; linked tasks can inherit project colors. Area icons appear before entry titles, and task completion asks for an optional note and confirmation.

## Develop

Node.js 24 or newer. Production has no npm dependencies.

```sh
npm run build
npm test
```

`public/` contains the application. `src/worker.mjs` implements its API. The build embeds the public files into `dist/worker.mjs`; generated files are ignored. The API tests use real SQLite through Node's built-in `node:sqlite` with a D1 adapter. Browser checks use Playwright and an available Chromium executable; see the change report for the actual environment used.

## Documentation

- [Capabilities and limits](docs/FEATURES.md)
- [Architecture and data protection](docs/ARCHITECTURE.md)
- [Deployment and rollback](docs/DEPLOYMENT.md)
- [Google connection setup](docs/GOOGLE.md)
- [Upgrade and validation report](docs/changes/2026-10-16-life-workspace.md)
- [Urgency and color update](docs/changes/2026-10-16-urgency-colors.md)
- [Changelog](CHANGELOG.md)

This public repository contains application code and synthetic tests only. Personal list contents, migrated data, workspace keys and OAuth access tokens are excluded.
