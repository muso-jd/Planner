# Compact category icons and Noto Sans Mono — 2.2.3

The entry-height icons dominated list rows, while title-button padding indented titles relative to category text. Icons now use a compact 28 px outline (24 px on phones), rounded joins/caps, lighter strokes and a preserved white/color glow. More space separates icons from the text column. Title-button horizontal padding is removed so category/metadata and entry titles share a left edge. Titles are larger: 17 px desktop/tablet, 16 px phone, and 20/18 px card headings. Common document, briefcase, monitor and clipboard icons have simpler rounded paths.

Noto Sans Mono is served from the planner origin, including graph labels, with its SIL license and provenance included. The variable WOFF is stored as base64 source, bundled at build time and decoded into a binary font response. No external font request or personal data change is involved.

Validation: npm run build, all 16 automated tests, and all 63 Chromium browser checks passed with zero page errors. Checks assert 28 px icons, white strokes, matching glow, added icon spacing, aligned title/metadata, larger title size and successful Noto font loading. Eleven tabs were checked for overflow at desktop, iPad portrait/landscape and phone sizes; desktop and phone screenshots were inspected. Physical Safari/iPad remains unverified.

Deployment identifiers, exact source commit and rollback are recorded in docs/DEPLOYMENT.md after rollout.
