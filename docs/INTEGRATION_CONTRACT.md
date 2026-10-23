# CampusConnect Phase 1 Integration Contract

This document is the extension boundary for Phase 2. Extend the current application and models; do not create replacement User or Project models, duplicate API clients, or a second authentication system.

## Data models

Both Mongoose schemas use `{ timestamps: true }`, which supplies `createdAt` and `updatedAt`.

### User

Defined in `server/src/models/User.ts`.

| Field | Type | Rules |
| --- | --- | --- |
| `_id` | ObjectId | Mongoose primary key. |
| `name` | string | Required, trimmed, maximum 80 characters. |
| `email` | string | Required, unique, lowercased, trimmed, maximum 254 characters. |
| `passwordHash` | string | Required bcrypt hash; excluded from normal queries and removed by JSON serialization. |
| `bio` | string | Defaults to `""`, maximum 500 characters. |
| `skills` | string[] | Defaults to `[]`. |
| `avatarUrl` | string | Optional in use; defaults to `""`. |
| `createdAt`, `updatedAt` | Date | Managed by Mongoose timestamps. |

Never expose `passwordHash` in API responses. The JWT contains the user ID as its subject (`sub`), not user-supplied identity data.

### Project

Defined once in `server/src/models/Project.ts`. Phase 2 must extend this schema in place.

| Field | Type | Rules |
| --- | --- | --- |
| `_id` | ObjectId | Mongoose primary key. |
| `title` | string | Required, trimmed, maximum 120 characters. |
| `description` | string | Required, trimmed, maximum 5,000 characters. |
| `tags` | string[] | Defaults to `[]`. |
| `requiredSkills` | string[] | Defaults to `[]`. |
| `ownerId` | ObjectId ref `User` | Required; set from the authenticated principal. |
| `memberIds` | ObjectId ref `User`[] | Defaults to `[]`; creation includes `ownerId`. |
| `maxMembers` | number | Integer from 1–20; defaults to 5. |
| `status` | enum | `idea`, `forming`, `in_progress`, or `completed`; creation sets `idea`. |
| `statusUpdatedAt` | Date | Required; initialized at creation. |
| `createdAt`, `updatedAt` | Date | Managed by Mongoose timestamps. |

The list/detail API populates `ownerId` as a user projection containing the owner's `name` and identifier. `memberIds` remains an array of identifiers. Do not rename any model fields or use a second Project model.

## API conventions

All endpoints use JSON. Errors use `{ "message": "Human-readable error" }`.

| Method | Path | Authentication | Behavior |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Body `{ name, email, password }`; creates the user and returns `{ token, user }`. |
| `POST` | `/api/auth/login` | Public | Body `{ email, password }`; returns `{ token, user }`. |
| `GET` | `/api/auth/me` | Bearer token | Returns `{ user }` for the token subject. |
| `GET` | `/api/users/me` | Bearer token | Returns the current profile as `{ user }`. |
| `PATCH` | `/api/users/me` | Bearer token | Updates only `name`, `bio`, `skills`, and/or `avatarUrl`; returns `{ user }`. |
| `GET` | `/api/users` | Public | Optional `skills` (comma-separated, matches any), `q` (name/bio); returns `{ users }`, capped at 50. |
| `GET` | `/api/users/:id` | Public | Returns `{ user }` or a 404. |
| `GET` | `/api/projects` | Public | Optional `q`, `tag`, `skill`, and `status`; returns `{ projects }`, capped at 100. |
| `POST` | `/api/projects` | Bearer token | Creates an idea; returns `{ project }`. `ownerId` and the initial `memberIds` entry are never accepted from the client. |
| `GET` | `/api/projects/:id` | Public | Returns `{ project }` or a 404. |
| `GET` | `/api/health` | Public | Returns `{ status: "ok" }`. |

Auth success user objects have `id`, `name`, `email`, `bio`, `skills`, and `avatarUrl`. Mongoose profile responses include the corresponding `_id`/`id` identifiers and timestamps. Password hashes are never returned.

Project creation accepts `{ title, description, tags, requiredSkills, maxMembers }`. Project list/detail records include the model fields; populated `ownerId` includes the owner's name. `status` always starts at `idea` in Phase 1. There are intentionally no team-join, discussion, or status-mutation routes yet.

Invalid request data and IDs return 400; duplicate email returns 409; missing/invalid authentication returns 401; missing records return 404; unexpected failures return 500. Backend Zod validation is authoritative.

## Authentication and shared frontend utilities

- The reusable request helper is `client/src/lib/api.ts`. Use `api<T>(path, options)` with paths rooted at `/` under `/api`; it attaches `Authorization: Bearer <token>` from `localStorage` and raises `ApiError` for HTTP/network failures.
- `client/src/contexts/AuthContext.tsx` exports `AuthProvider` and `useAuth()`. It exposes `user`, `loading`, `login`, `register`, `logout`, and `refreshUser`.
- The token is stored under `campusconnect.token`; use the auth context for session state and the API helper for requests.
- Shared response types and identifier normalization are in `client/src/types/index.ts`.
- `client/src/components/Primitives.tsx` provides shared buttons, alerts, loading labels, status badges, and skill chips. Follow these styles for additional UI.

## Frontend extension points

- Router and protected-route behavior: `client/src/App.tsx`.
- Global authenticated navigation/layout: `client/src/components/SiteLayout.tsx`.
- Project detail integration area: `client/src/pages/ProjectsPages.tsx`, `ProjectDetailPage` and its `.phase-two-slot` section. Add membership, status controls, and discussions as sections of this page.
- Project model and routes: `server/src/models/Project.ts` and `server/src/routes/projects.ts`.
- Shared errors and auth: `server/src/middleware/errors.ts` and `server/src/middleware/authenticate.ts`.

## Extension rules

1. Keep the existing User and Project models; add Phase 2 data to the existing project/team domain as needed.
2. Derive acting-user identity only from `authenticate`'s verified JWT subject. Never accept owner/member identity from an untrusted request body.
3. Keep all API calls on the shared `api` helper and all session UI on `useAuth`.
4. Preserve the JSON `{ message }` error shape and validate request input on the server.
5. Keep project detail sections visually consistent with existing cards, forms, and status badges.
6. Keep Phase 1 routes/response fields backward-compatible when adding membership, discussion, or status history.
