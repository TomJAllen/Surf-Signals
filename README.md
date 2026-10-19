# Surf Signals

Learn and practise Surf Life Saving Australia signals.

- **Identify mode** – see a signal, pick its name from five options.
- **Perform mode** – given a name, perform the signal. Your camera checks arm position and, for signals that involve waving or circling, the movement too (MediaPipe pose detection, runs entirely in the browser). You can also self-assess without a camera.
- **Progress** – sign in to track accuracy over time. Guests can practise without an account; their progress is kept in the browser and moved into their account when they sign up or log in.

See [PROJECT.md](PROJECT.md) for architecture and the signal list.

## Run locally

Requires Node 20.19+ and a Postgres database.

```bash
cp .env.example .env      # then fill in the values
npm install
npm run db:deploy         # apply migrations
npm run db:seed           # load signals + create the admin account
npm run dev
```

Open http://localhost:3000. The admin area is at `/admin`.

If `ADMIN_PASSWORD` isn't set when you seed, a random password is generated and printed once. Re-seeding is safe: it updates signal names, descriptions and categories, but leaves images and pose hints edited in the admin page alone. Note that it **deletes signals that aren't in the seed list** (and their attempts).

## Deploy to Vercel

1. **Import the repo** in Vercel. The framework is detected as Next.js; no build settings needed.
2. **Database:** add a Postgres database from the Vercel Marketplace (Neon has a free tier). This sets `DATABASE_URL` for you.
3. **Image storage:** add a Blob store under *Storage*. This sets `BLOB_READ_WRITE_TOKEN`. Admin image uploads need it, because Vercel's filesystem is read-only.
4. **Environment variables:** set `NEXTAUTH_SECRET` (`openssl rand -base64 32`) and `NEXTAUTH_URL` (your production URL, e.g. `https://surfsignals.example.com`).
5. **Migrate and seed** from your machine, pointed at the production database:
   ```bash
   DATABASE_URL="<production url>" npm run db:deploy
   DATABASE_URL="<production url>" ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... npm run db:seed
   ```
6. **Admin access:** set `ADMIN_EMAILS` to your email. In production the admin area is locked to these emails *and* `role = "admin"` in the database.
7. **Analytics:** enable Web Analytics in the Vercel project (page views). For anonymous event analytics, create a free PostHog project, turn on *Discard client IP data*, and set `NEXT_PUBLIC_POSTHOG_KEY` (and `NEXT_PUBLIC_POSTHOG_REGION` if it's in the EU).
8. **Legal pages:** set `NEXT_PUBLIC_CONTACT_EMAIL` (shown on /privacy and /terms).
9. **Supabase only:** lock down Supabase's auto-generated public API (Row Level Security on, `anon`/`authenticated` privileges revoked), and set `DATABASE_CA_CERT` so the database certificate is verified. See `docs/supabase-hardening.sql`.

See also `SECURITY.md`.

### Moving an existing database

The first migration (`20250101000000_init`) is a baseline of the schema that was originally created with `db push`. On a database that already has the tables, mark it as applied once before running `db:deploy`:

```bash
npx prisma migrate resolve --applied 20250101000000_init
# and if the role/poseHint columns already exist:
npx prisma migrate resolve --applied 20250203000000_add_role_and_pose_hint
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest, watch mode) |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm run db:deploy` | Apply migrations |
| `npm run db:migrate` | Create a new migration (dev) |
| `npm run db:seed` | Seed signals and admin |
| `npm run db:studio` | Prisma Studio |

CI (GitHub Actions) runs typecheck, lint, unit tests and a build on every push and PR.
