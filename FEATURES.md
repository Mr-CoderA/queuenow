# Features

QueueNow is a queue management monorepo. The implemented surface today is the shared TypeScript package; API and UI packages are not present yet.

## Product capabilities (implemented)

- **Domain model** (`@queuenow/shared`): `User`, `Queue`, and `Ticket` interfaces, plus `TicketWithMetrics` (position and estimated wait), `PublicUser` (user without `password_hash`), and `AuthTokenResponse`.
- **Queue ordering**: sort tickets by `joined_at` (stable by `id` on ties); isolate waiting tickets (`serving === false`).
- **Position**: 1-based index among waiting tickets; `0` while serving; `-1` if missing.
- **Wait estimate**: `position × averageServiceMinutes` (default 5); non-positive position or negative average yields `0`.
- **Metrics enrichment**: attach `position` and `estimated_wait_minutes` to each ticket in a snapshot.

## Architecture

- **Layout**: npm workspaces under `packages/*`, orchestrated by Turborepo.
- **Active package**: `packages/shared` (`@queuenow/shared`) — TypeScript sources in `src/`, Vitest tests in `__tests__/`, build output in `dist/`.
- **Tooling**: Node `>=20`, TypeScript, Turbo `build` / `test` pipelines (`turbo.json`).
- **Config surface**: `.env.example` names `DATABASE_URL` (managed PostgreSQL) and `AUTH_SECRET` (session/hashing secret). Values are not stored in the repo.
