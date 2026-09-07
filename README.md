# BR Tours and Travels API

Independent Express 5 + Prisma 7 + MySQL 8.4 backend for the public Next.js site
and the React admin. This folder has its own npm installation and lockfile.

The implemented API includes published public content/catalogue routes, opaque
MySQL admin sessions, CSRF and RBAC enforcement, protected CMS operations,
idempotent enquiry/outbox persistence, safe local raster/PDF media, audit logs,
live administration aggregates and the SMTP retry worker. Package and article
contracts include SEO/related-content support, and package brochures are served
as attachment-only PDFs. The actual route contract is in `docs/openapi.yaml`.

Operational handoff is in `docs/DEPLOYMENT.md`; owner launch inputs/checks are
in `docs/OWNER_INPUTS.md` and `docs/LAUNCH_CHECKLIST.md`. Admin users have a
separate guide in the admin project.

## Local start

1. Copy or review .env.example as .env. The provided .env contains local-only
   development credentials and is ignored by this project.
2. Use the existing XAMPP MariaDB service on 127.0.0.1:3306, or start the
   optional pinned local services:

       docker compose -f infra/docker-compose.services.yml up -d

3. Apply the reviewed migration and seed labelled demo content:

       npm run db:migrate
       npm run db:seed:demo

4. Start the API:

       npm run dev

Health is available at http://localhost:4000/health and readiness at
http://localhost:4000/ready. Mailpit is loopback-only at http://localhost:8025.

The owner-provided XAMPP service was detected and used for the br_tours
development database. The migration, seed, API readiness, integration test and
Next.js SSR stack smoke have all been executed successfully. Docker itself is
not installed on this machine, so Compose/image validation remains pending.

## Commands

- npm install — install API-only dependencies.
- npm run env:check — validate the API environment.
- npm run db:generate — generate the Prisma client.
- npm run db:migrate — create/apply development migrations; review SQL first.
- npm run db:migrate:deploy — apply reviewed migrations in production.
- npm run db:seed:demo — guarded, idempotent non-production demo seed.
- npm run admin:create — interactive Argon2id admin bootstrap.
- npm run notifications:work — durable SMTP outbox worker.
- npm run lint, npm run typecheck, npm test, npm run build — quality gates.
- npm run test:integration — requires the dedicated MySQL test service.

The administration API also provides self-profile/password operations, safe
assignment options, multi-field/date enquiry filters and 14-day dashboard trend
data. Media upload accepts JPEG, PNG, WebP, AVIF and PDF by detected signature;
images are decoded and re-encoded to WebP, while PDFs are sandboxed downloads.

Never run a destructive Prisma reset against an existing database. Production
startup does not apply migrations automatically.

`npm run test:integration` uses the guarded `br_tours_test` schema configured in
the API folder's `.env.test`; it refuses to run against any other database name.
It includes a real Nodemailer connection-refusal case proving the original lead
and outbox row survive and the same event can be sent on retry.
