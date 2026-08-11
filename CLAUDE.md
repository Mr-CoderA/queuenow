# CLAUDE.md

Guidance for agents and developers working in this repository.

## Working in the repo

- Treat this as an npm-workspaces monorepo. Shared code lives in `packages/shared` (`@queuenow/shared`).
- Prefer extending existing shared types and pure queue helpers over duplicating domain logic.
- Keep package builds emitting to each package’s `dist/`. Do not commit secrets, `.env`, or generated caches.
- Do not invent local database URLs, auth secrets, or fallback credentials. Use names from `.env.example` only.

## Validation

From the repository root:

```bash
npm install
npm run build
```

Optional: `npm test` (runs workspace tests via Turbo; shared package uses Vitest).

`NODE_ENV=production` skips npm `devDependencies`. Build-required tools (Turbo, TypeScript) belong in `dependencies` so the commands above succeed without flipping `NODE_ENV`.

## Security

- `AUTH_SECRET` and `DATABASE_URL` are deployment secrets. Document names in `.env.example`; never commit values.
- `User.password_hash` is internal. Public-facing user shapes use `PublicUser` / omit the hash.
- Do not log or embed credentials, connection strings, or password hashes in source, tests, or docs.
- Avoid live database, OAuth, or other networked integrations in build/test unless explicitly required; prefer pure functions and mocks.

## Privacy

- Tickets carry `customer_name`; users carry `email`. Treat these as personal data: least exposure in logs, errors, and shared samples.
- Prefer synthetic fixtures in unit tests (as in `packages/shared/__tests__`).
- Do not add analytics, third-party trackers, or external data exporters without an explicit product decision.
