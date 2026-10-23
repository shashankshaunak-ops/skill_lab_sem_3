# CampusConnect Phase 2

## Integration and baseline

- Branch: `feature/campusconnect-phase2`, based on Phase 1 commit `072301e`.
- After fetching origin, no `main` branch existed. `origin/master` was an ancestor of the Phase 1 branch, but did not contain Phase 1. The engineer approved using the baseline containing all Phase 1 commits, so Phase 2 branches directly from `feature/campusconnect-phase1`. No branches were reset or merged automatically. Merge Phase 1 first before opening the Phase 2 PR against the chosen default branch.
- Existing Project schema, database configuration, HTTP helper, authentication context and response formats are reused unchanged. No dependencies added or manifests changed.
- Baseline defect: `authenticatedUserId` was incorrectly exported inside `authenticate`; moved to module scope, with existing JWT behavior retained and malformed subject IDs rejected.
- Baseline compile defect: inferred required User properties could not be deleted in strict TypeScript. With explicit engineer approval, the JSON transform now omits `passwordHash` and `__v` via destructuring. No User schema fields changed.
- The old integration document suggested extending the Project schema; Phase 2 does not need schema changes and follows the explicit no-model-change requirement instead.

## API contract

All paths below start with `/api`. Existing `{ message: string }` errors remain unchanged. Mutation identity always comes from the verified JWT, never request-body user IDs.

| Method | Path | Access | Response |
| --- | --- | --- | --- |
| POST | `/teams/:projectId/join` | Authenticated | `{ project, message }` |
| DELETE | `/teams/:projectId/leave` | Authenticated member, not owner | `{ project, message }` |
| GET | `/teams/:projectId/members` | Public, like project detail | `{ members, ownerId, memberCount, maxMembers }` |
| GET | `/teams/mine` | Authenticated | `{ projects }` |
| PATCH | `/teams/:projectId/status` | Owner | `{ project, message }`; body `{ status }` |
| GET | `/teams/:projectId/activity` | Public, like project detail | `{ activities, status, statusUpdatedAt }` |
| GET | `/projects/:projectId/messages` | Authenticated member | `{ messages }` |
| POST | `/projects/:projectId/messages` | Authenticated member | 201 `{ message: DiscussionMessage }`; body `{ content }` |

Project responses retain populated `ownerId: { _id, name }` and identifier-only `memberIds`, preserving Phase 1 callers. Public member/actor/author projections include only `_id`, `name`, `bio`, `skills`, `avatarUrl`; no email or password hash.

Validation errors return 400, unauthenticated requests 401, forbidden actions 403, missing projects 404, and membership/status conflicts 409. Unknown server/database failures use the existing generic 500 response.

## Membership and progress

- Join is a single conditional MongoDB write with `$addToSet`: not already a member, not owner, not completed, and current array length below capacity. It prevents duplicate joins and overfilling across concurrent requests.
- Leave is an atomic `$pull` with membership and non-owner predicates.
- Status accepts `idea`, `forming`, `in_progress`, `completed`. Redundant updates and reopening completed projects return 409. Other transitions are allowed. Compare-and-set rejects competing updates; timestamp advances on every change. Missing stored status timestamps in legacy projects are handled without a migration.
- `ProjectActivity` is a separate model. It records actual status transitions only. Older and newly created ideas with no transitions show a clear empty timeline plus the existing current-status timestamp; no invented historical records are inserted.
- Status persistence and activity creation are separate writes to support standalone MongoDB. Normal activity-write failures attempt a conditional rollback of status; this never intentionally overwrites a newer transition. A process crash or double database failure between writes can leave a history gap. Strict cross-collection atomicity would require replica-set transactions and is not claimed.

## Discussions and interface

- `DiscussionMessage` persists trimmed 1–2,000-character content, project/author references, and timestamps. Every read/post checks current membership server-side.
- GET returns the latest 100 messages, displayed oldest first, using deterministic `createdAt`/`_id` ordering. Older history pagination is not implemented. Activity likewise returns the latest 100 transitions.
- Manual refresh is deliberate; no sockets or polling required. Messages remain in MongoDB across reloads.
- The existing project detail article is retained. Only its Phase 2 placeholder is replaced by team, progress/activity, and discussion cards. `/teams` uses the existing protected-route wrapper, navigation, and ProjectCard.
- Reused UI: Button, Alert, Loading, StatusBadge, ProjectCard and existing card/form/layout classes and CSS tokens. SkillList remains in existing project information. No matching indexed components were available. No new icon/image dependencies or assets were needed.

## Run and checks

Run from the `skill_lab_sem_3` repository root:

```powershell
npm install
Copy-Item .env.example .env
# Set MONGODB_URI and JWT_SECRET in .env, then:
npm run dev
npm run build
npm run test
node --import tsx --test server/tests/*.test.ts
```

The focused suite uses Node's existing test runner plus the installed `tsx`, without new packages. Service tests mock database calls; HTTP smoke tests use the actual Express app and real JWT middleware without connecting MongoDB. They do not prove database persistence or concurrent MongoDB execution.

## Real-database acceptance checklist

Use a disposable development database and three real student accounts (owner, member, outsider). No real database was available in the implementation environment; these checks must not be interpreted as passed until run there.

- Register/login each account; edit profile and search by the saved skill.
- Owner creates an idea of capacity 2; owner appears as first member.
- Student joins; reload detail and My Teams, verify persisted count and membership.
- Duplicate join returns 409; a different student cannot join the full team.
- Owner leave returns 403; member leaves successfully; outsider leave returns 409.
- Race two students for the final slot: exactly one joins; race duplicate joins: one entry only.
- Non-owner status update returns 403. Owner changes status; refresh verifies status/timestamp and activity actor/transition.
- Mark completed; join/reopen attempts return 409.
- Members post/read messages, reload and verify persisted content, name and timestamp.
- Nonmembers cannot GET or POST discussion (403), missing tokens return 401. Whitespace/oversize messages return 400.
- Recheck existing registration/login, profile edit, project create/list/detail, skill discovery and logout.

## Verification results

Actual checks on 2026-10-23:

- `npm run build`: passed (backend TypeScript compile and frontend TypeScript/Vite production build).
- `npm run test`: passed (backend no-emit typecheck and frontend production build).
- `node --import tsx --test server/tests/*.test.ts`: 27 tests passed, zero failed. Covers authentication gates, safe serialization/projections, membership predicates/conflicts, owner-only changes, history recording/rollback, legacy timestamp handling, message validation and member-only access.
- `git diff --check`: passed; Git only emitted local LF/CRLF conversion warnings.
- Browser fixture smoke checks passed: guest restrictions, joining/leaving UI, member composer/posting, reload, My Teams, discussion restriction after leaving, and 390px mobile layout. These used isolated intercepted API responses, not MongoDB. No fixture data is included in application code.
- Owner browser follow-up was interrupted by browser/context navigation closing; not claimed as verified. Owner behavior is covered by service tests and code review, not a completed browser check.
- Existing external Google Fonts requests failed intermittently and the existing favicon is missing (404); neither was changed.

No `.env` or MongoDB listener on `127.0.0.1:27017` was available. Database persistence, actual concurrent MongoDB joins, and full Phase 1/2 real-database acceptance workflows were not verified. Phase 1 routes, forms, API formats and visual styles were preserved; full runtime regression is not claimed.

The repository initially had no lockfile; dependency manifests were intentionally preserved. Installation reported two moderate vulnerabilities; `npm audit --omit=dev` could not run because no lockfile exists (`ENOLOCK`). No forced fixes or breaking dependency upgrades were applied.
