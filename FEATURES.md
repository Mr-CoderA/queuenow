# Features

QueueNow is a queue management monorepo with shared domain logic, an Express API package, and a React client.

## Product capabilities (implemented)

- **Domain model** (`@queuenow/shared`): `User`, `Queue`, and `Ticket` interfaces, plus `TicketWithMetrics` (position and estimated wait), `PublicUser` (user without `password_hash`), and `AuthTokenResponse`.
- **Queue ordering**: sort tickets by `joined_at` (stable by `id` on ties); isolate waiting tickets (`serving === false`).
- **Position**: 1-based index among waiting tickets; `0` while serving; `-1` if missing.
- **Wait estimate**: `position × averageServiceMinutes` (default 5); non-positive position or negative average yields `0`.
- **Metrics enrichment**: attach `position` and `estimated_wait_minutes` to each ticket in a snapshot.
- **API** (`@queuenow/server`): Express routes for auth, queues, and tickets; Drizzle schema and query builders over a DAO interface.
- **Web app** (`@queuenow/app`): React + Vite + Tailwind UI for login/register, queue list/create/detail, ticket controls; API client with MSW handlers for local/dev testing.

## Architecture

- **Layout**: npm workspaces under `packages/*`, orchestrated by Turborepo.
- **Packages**: `packages/shared`, `packages/server`, `packages/app`.
- **Tooling**: Node `>=20`, TypeScript, Turbo `build` / `test` pipelines (`turbo.json`).
- **Config surface**: `.env.example` names `DATABASE_URL` (managed PostgreSQL) and `AUTH_SECRET` (session/hashing secret). Values are not stored in the repo.
