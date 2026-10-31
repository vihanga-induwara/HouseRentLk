# HouseRentLk

Rental listings marketplace for Sri Lanka: owners and brokers post properties, renters search,
message owners and book viewings, and admins moderate listings, users and identity verification.

| Part | Stack | Hosting |
|---|---|---|
| `Frontend/` | React 19, Vite 7, Tailwind 4, React Router 7 | Cloudflare (static assets, SPA fallback) |
| `Backend/` | Node 20+, Express 5, Mongoose 9 (MongoDB Atlas) | Railway (Docker) |
| `Backend/utils/ai`, `Backend/utils/scrapers` | Python 3.11 scripts called by the API | Same container as the API |
| Media | Cloudinary (public listing images, private ID documents) | — |
| Email / SMS | SMTP (nodemailer), Twilio | — |

## Repository layout

```
Backend/
  app.js            Express app (middleware, routes, error handling) — no side effects
  server.js         Env validation, DB connection, HTTP server, scheduler, graceful shutdown
  config/           env validation, MongoDB connection
  controllers/      route handlers
  routes/           Express routers (validation + auth per route)
  middleware/       auth (protect / optionalAuth / authorize), sanitisation, validation, errors
  models/           Mongoose schemas
  services/         AI script runner, email, SMS
  jobs/scheduler.js hourly jobs: expire listings, expiry warnings, scheduled scrapes
  validations/      zod request schemas
  utils/ai/         rule-based analysers (pricing, spam, sentiment, ...) — Python
  utils/scrapers/   external listing scrapers — Python
  scripts/          seed data, index sync, load test
  tests/            Jest unit tests; tests/integration = node:test + in-memory MongoDB
Frontend/
  src/pages/        route pages (lazy-loaded)
  src/components/   shared and feature components
  src/context/      auth and theme providers
  src/utils/        API client, constants, formatting, validation
docs/               SRS, launch checklist
```

## Local development

Prerequisites: Node 20+, a MongoDB connection string (Atlas or local), Python 3.11+ for the AI
features (optional — the app works without it, AI panels just show no data).

```bash
cd Backend
cp .env.example .env        # fill in MONGO_URI, JWT_SECRET, Cloudinary keys
npm install
npm run dev                 # http://localhost:5000
```

```bash
cd Frontend
cp .env.example .env.local  # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # http://localhost:5173
```

Without `SMTP_HOST` / Twilio credentials, verification emails and SMS codes are printed to the
backend console in development so you can click/enter them.

Python dependencies for the scrapers (the AI scripts use only the standard library):

```bash
pip install -r Backend/utils/ai/requirements.txt
```

### Useful scripts (Backend)

| Command | What it does |
|---|---|
| `npm run seed:admin` | Creates the first admin from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (admins cannot sign up) |
| `npm run seed:demo` | **Development only** — deletes all listings and loads demo listings |
| `npm run db:sync-indexes` | Creates/drops MongoDB indexes to match the schemas. Run after deploying schema changes |
| `npm test` | Unit tests (Jest) then integration tests (node:test, in-memory MongoDB) |

## Testing

```bash
cd Backend && npm test                       # 19 unit + 35 integration tests
cd Backend && python -m unittest discover -s tests -p "test_*.py" -t .
cd Frontend && npm run lint && npx vitest run && npm run build
```

CI (`.github/workflows/ci.yml`) runs all of the above plus a Docker build and `npm audit`
(high severity fails the build) on every push and pull request.

## Deployment

### API (Railway)

1. Create a Railway service from this repo with **Root Directory = `Backend`**. Railway uses
   `Backend/railway.json` → builds `Backend/Dockerfile` (Node + Python) and health-checks `/ready`.
2. Set the environment variables from `Backend/.env.example` (at minimum `NODE_ENV=production`,
   `MONGO_URI`, `JWT_SECRET` (32+ chars), `FRONTEND_URL`, `CLOUDINARY_*`, `SMTP_*`, `EMAIL_FROM`,
   `TWILIO_*`, `SENTRY_DSN`). The server refuses to start if required values are missing.
3. After the first deploy: `npm run db:sync-indexes` and `npm run seed:admin` (Railway shell).

### Frontend (Cloudflare)

`wrangler.toml` builds `Frontend/` and serves `Frontend/dist` with an SPA fallback. Set
`VITE_API_URL=https://<api-domain>/api` in the build environment.

### Domains and cookies

Auth uses an httpOnly cookie. Serve the frontend and API from the **same site** (e.g.
`houserent.lk` and `api.houserent.lk`) with `COOKIE_SAMESITE=lax` (default). Only use
`COOKIE_SAMESITE=none` if they must live on unrelated domains; the API's CSRF guard
(origin allow-list + `X-Requested-With`) protects that setup too.

## Operations

- Liveness `GET /health`, readiness (database) `GET /ready`.
- Production logs are JSON lines with a `requestId` (also returned in the `x-request-id` header).
- Unhandled errors go to Sentry when `SENTRY_DSN` is set.
- The hourly scheduler runs in the API process; with more than one replica set
  `ENABLE_SCHEDULER=false` on all but one.

Before launch, work through [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md).
