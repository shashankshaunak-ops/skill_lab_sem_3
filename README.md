# CampusConnect

CampusConnect is a student collaboration platform for sharing project ideas, presenting student skills, and finding potential teammates. Phase 1 provides the user/profile and project discovery foundation; its data model and documented interfaces are designed for a later team-membership, project-progress, and discussion phase.

## Features

- Register, log in, and log out with JWT authentication and bcrypt password hashing.
- Create and edit a student profile with a biography, skills, and optional avatar URL.
- Browse public student profiles and search students by skill, name, or biography.
- Create persistent project ideas and browse/filter them by title/description, tag, required skill, and status.
- Open project detail pages showing the creator, requirements, team capacity, and status.
- Responsive landing page, dashboard, forms, empty/loading/error states, and authentication-aware navigation.

## Requirements

- Node.js 20 or later and npm 10 or later.
- A running MongoDB instance or MongoDB Atlas connection string.

## Setup

From the repository root in PowerShell:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Update `.env` with a MongoDB connection string and a private, random JWT secret of at least 32 characters. The default local MongoDB URI is `mongodb://127.0.0.1:27017/campusconnect`. The Vite development server runs at `http://localhost:5173`; the API runs at `http://localhost:4000`.

For production builds and local API startup:

```powershell
npm run build
npm run start --workspace=server
```

The frontend build is written to `client/dist`; the compiled API is written to `server/dist`. Serve the built frontend through a static host that forwards `/api` requests to the API server.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection URI. |
| `JWT_SECRET` | Yes | Private signing key, at least 32 characters. |
| `PORT` | No | API port; defaults to `4000`. |
| `CLIENT_ORIGIN` | No | Allowed browser origin; defaults to `http://localhost:5173`. |

Never commit `.env` or real secrets. `.env.example` contains names and safe local defaults only.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the API and Vite development server together. |
| `npm run build` | Compile/type-check the API and build/type-check the frontend. |
| `npm run test` | Run the available TypeScript and frontend build checks. |
| `npm run typecheck --workspace=server` | Type-check the API without emitting files. |
| `npm run build --workspace=client` | Type-check and build the frontend. |

The repository does not yet include a database-backed automated integration-test suite. Main application flows require MongoDB to be available.

## Architecture

- `client/`: React, TypeScript, Vite, React Router, and CSS.
- `server/`: Express, TypeScript, Mongoose models, routes, and authentication middleware.
- `docs/INTEGRATION_CONTRACT.md`: exact Phase 1 schemas, HTTP contract, frontend helpers, and Phase 2 extension rules.
- Root npm workspaces and `.env.example` keep setup simple without extra infrastructure.

See [the integration contract](./docs/INTEGRATION_CONTRACT.md) before implementing Phase 2.
