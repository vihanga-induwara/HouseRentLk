# Launch checklist

Items that cannot be done in code. Tick each one before opening the site to the public.

## 1. Secrets (blocking)

- [ ] Rotate every credential that was ever committed in `Backend/.env`: MongoDB user password,
      `JWT_SECRET` (logs everyone out), Cloudinary API secret, Twilio auth token.
- [ ] If the production database was ever seeded with the old `seedAdmin.js`, change the password
      of `admin@houserentlk.com` (it was `adminpassword123`, public on GitHub) or delete that account
      and create a new admin with `npm run seed:admin`.
- [ ] Optional but recommended: purge `Backend/.env` and `Backend/uploads/` (personal photos) from
      git history with `git filter-repo`, then force-push and re-clone everywhere.

## 2. Infrastructure

- [ ] Railway service from `Backend/` (Dockerfile build succeeds, `/ready` returns 200).
- [ ] All variables from `Backend/.env.example` set; `NODE_ENV=production`; startup log shows no
      `[env] ... is not set` warnings.
- [ ] `npm run db:sync-indexes` run once against production (replaces the old booking index).
- [ ] Frontend and API on the same site (e.g. `houserent.lk` / `api.houserent.lk`), HTTPS only;
      `FRONTEND_URL` lists every production origin.
- [ ] Cloudflare build has `VITE_API_URL`; deep link such as `/listings/<id>` loads after refresh.
- [ ] MongoDB Atlas: backups enabled (daily snapshots, 7+ days), IP access list limited to Railway,
      database user has access to this database only.
- [ ] Sentry project created and `SENTRY_DSN` set; alert on new issues.
- [ ] Uptime monitor on `https://<api>/ready` and the frontend home page.

## 3. Email and SMS

- [ ] SMTP provider configured (e.g. Amazon SES, Postmark, Brevo) with SPF, DKIM and DMARC for the
      sending domain; `EMAIL_FROM` uses that domain.
- [ ] Send yourself a verification email and a password-reset email from production.
- [ ] Twilio: sender approved for Sri Lankan numbers (alphanumeric sender ID or local number);
      verify a real +94 mobile end-to-end. Set a Twilio spend limit.

## 4. Content and settings

- [ ] Admin → Settings: real contact email, phone, address, office hours and social links
      (older databases still contain the previous placeholder values — overwrite them).
- [ ] Review Terms, Privacy Policy, FAQ and Safety pages (Admin → Pages) for accuracy.
- [ ] Privacy Policy describes what is actually collected: account data, phone, ID documents
      (stored privately, viewed by admins only), login sessions (IP, device), search and listing
      activity, contact messages. Align with Sri Lanka's Personal Data Protection Act No. 9 of 2022
      (purpose, retention, user rights, contact point).
- [ ] Decide a retention period for ID documents after review and for session/activity logs.

## 5. Legal

- [ ] Scraping: confirm the terms of ikman.lk, hitad.lk, house.lk, lankapropertyweb and
      ceylonproperty.lk allow it, or keep scraping disabled. New sources are created disabled and
      scheduled runs are off by default; check existing sources in Admin → Scraping, since sources
      created before this change may already be enabled. Scraped listings must always link back to
      the source.
- [ ] Marketing copy describes the "AI" features accurately: they are rule-based analysers
      (keywords, statistics), not machine-learning models.

## 6. Verification before go-live

Manual pass on a phone and a desktop browser against staging:

- [ ] Register as renter, owner and broker; verify email; verify phone.
- [ ] Owner posts a listing with photos → admin approves → it appears in Browse and the owner is
      notified.
- [ ] Renter sends an inquiry, the owner replies (Inbox); renter requests a viewing, owner confirms.
- [ ] Forgot password → reset → old session is logged out.
- [ ] Report a listing → admin sees it; submit ID verification → admin approves.
- [ ] Contact form message reaches the support inbox.
- [ ] Load test (below) passes against staging.

## 7. Load test

`Backend/scripts/loadtest/smoke.k6.js` exercises the public read paths. With [k6](https://k6.io)
installed:

```bash
k6 run -e BASE_URL=https://staging-api.example.com Backend/scripts/loadtest/smoke.k6.js
```

Targets: p95 < 800 ms and < 1% errors at 50 concurrent users. Raise `RATE_LIMIT_MAX` for the test
or run it from several IPs, otherwise the per-IP limiter (1000 requests / 15 min) will answer 429.

## Known limitations (accepted for launch, track as follow-ups)

- AI features (pricing, titles, spam, sentiment, safety) are heuristic and Python-process based;
  each call starts a process (max `AI_MAX_CONCURRENCY` at once). Move to a long-running service if
  traffic grows.
- Scheduled scraping supports `daily` and `weekly`; `custom` cron expressions run daily.
- Admin lists are capped at 500 rows per request; the dashboard does not page beyond that yet.
- Six React hook-dependency lint warnings remain (behaviour reviewed, no known bug).
- Accessibility has not been audited (keyboard navigation, contrast, screen readers).
