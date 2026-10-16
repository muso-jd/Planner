# Category icon size and glow — 2.2.2

List rows now place category icons in a dedicated rail spanning the entry content height. Icons use white strokes and two colored shadows based on the effective entry color. Title colors and custom icon selection remain available. SVG proportions are retained for long entries; phone rails are narrower and card heading icons are enlarged.

Validation: build, 16 automated tests, and 63 browser checks passed with zero page errors. Browser checks cover desktop, iPad portrait/landscape and phone Chromium layouts, including all 11 tabs for overflow, plus icon height, white stroke and inherited/custom glow color. Desktop and phone screenshots were visually reviewed. No physical Safari/iPad validation is claimed. No data migration or user record edits are involved.

Deploy the built Worker with existing D1, Artlook service and private Drive folder bindings. Deployment identifiers and rollback version are recorded in docs/DEPLOYMENT.md after release.
