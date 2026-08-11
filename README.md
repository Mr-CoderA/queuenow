# queuenow

Monorepo for a queue management app (shared types/utilities, Express API, React client).

## Setup

```bash
npm install
npm run build
```

Packages:

- `packages/shared` — domain types and queue calculation utilities
- `packages/server` — Express API, schema, and query builders
- `packages/app` — React (Vite + Tailwind) client

Required environment variables (see `.env.example`):

- `DATABASE_URL` — managed PostgreSQL connection string
- `AUTH_SECRET` — secret for session signing / password hashing
