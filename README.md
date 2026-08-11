# queuenow

Monorepo for a queue management app (shared types/utilities, Express API, React client).

## Setup

```bash
npm install
npm run build
```

Required environment variables (see `.env.example`):

- `DATABASE_URL` — managed PostgreSQL connection string
- `AUTH_SECRET` — secret for session signing / password hashing
