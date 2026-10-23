# PR: Add CampusConnect team collaboration and project tracking

## Base / merge order

Phase 1 must be merged first. There is currently no remote `main`; `master` predates CampusConnect Phase 1. This branch intentionally starts at Phase 1 commit `072301e` with engineer approval. Select the agreed default branch after merging Phase 1; do not merge this PR ahead of Phase 1.

## Changes

- Atomic team join/leave, safe roster and My Teams APIs/view.
- Owner-only project status changes with timestamps and activity history.
- Persistent member-only discussion API and UI.
- Existing project detail/navigation integrated with shared Phase 1 UI, API helper and session context.
- Minimal baseline compile fixes: auth helper export placement and approved User serializer field omission.
- Separate ProjectActivity/DiscussionMessage models; existing Project schema unchanged.
- No new dependencies, manifest rewrites, environment files or generated output.

## Validation

- Full build and existing npm checks passed.
- 27 focused Node tests passed.
- Guest/member browser fixture smoke checks and mobile layout passed; not a database end-to-end test.
- Real MongoDB persistence/concurrency and full Phase 1 regression still require configured `.env` and MongoDB.
- Owner browser check was interrupted; service authorization/status tests passed.

## Limitations

Status/history writes use conditional compensation, not cross-collection transactions; a crash/double failure can leave a history gap. Discussion and activity show the latest 100 records; no history pagination. Existing install reports two moderate dependency vulnerabilities; no forced upgrades.

See `docs/PHASE_2.md` for endpoint contracts and the real-database acceptance checklist.
