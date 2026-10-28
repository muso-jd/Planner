# Today agenda and priorities — 3.7.1

Today previously stopped at three unblocked tasks. It now shows every urgent task, all other open tasks due in the selected calendar week, and scheduled outgoing ledger payments. Urgent work remains visible even when blocked, with existing completion guards. Week selection is Monday–Sunday and crosses month/year boundaries; recurring transfers use the existing ledger engine. Entries are not inferred to be unpaid because the ledger has no settlement state.

Task priority badges use the existing P0 visual language across shared titles and Calendar. Nonurgent badges preserve the saved P1–P10 rating (default P5); higher nonzero values remain more important. Automatic overdue urgency remains P0.

The Today routine panel occupies half the grid, uses one main title column and compact metadata below, and omits the redundant Routine label. Canonical linked-block times, checks, edit and duplication remain available. No migration, binding change or owner-data rewrite.

Validation: build; 52 unit/API tests; JavaScript syntax and diff checks passed. Added tests cover eight urgent tasks, blocked weekly tasks, deduplication, deleted/completed exclusion, month/year boundaries, recurring transfers and priority markup. Local Chromium downloads failed (truncated archive); local responsive browser tests and physical Safari/iPad are unverified. Live browser verification and rollout evidence are recorded separately in DEPLOYMENT.md.

Production verified at 3.7.1; exact source/IDs/rollback are in DEPLOYMENT.md. GitHub publication remains blocked by automatic approval review pending explicit permission to publish the prepared commits to the public Planner repository.
