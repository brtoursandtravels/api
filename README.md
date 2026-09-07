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

1. Review the local `.env`. It contains local-only development configuration
   and is ignored by this project.
2. Start the local XAMPP MariaDB service on `127.0.0.1:3306` and configure the
   SMTP connection referenced by `.env`.

3. Apply the reviewed migration and seed labelled demo content:

       npm run db:migrate
       npm run db:seed:demo

4. Start the API:

       npm run dev

Health is available at http://localhost:4000/health and readiness at
http://localhost:4000/ready.

The owner-provided XAMPP service was detected and used for the `br_tours`
development database. The migration, seed and API readiness checks have been
executed successfully. Production deployment uses native Node.js services,
host-managed MySQL and Nginx as documented in `docs/DEPLOYMENT.md`.

## Commands

- npm install — install API-only dependencies.
- npm run env:check — validate the API environment.
- npm run db:generate — generate the Prisma client.
- npm run db:migrate — create/apply development migrations; review SQL first.
- npm run db:migrate:deploy — apply reviewed migrations in production.
- npm run db:seed:demo — guarded, idempotent non-production demo seed.
- npm run admin:create — interactive Argon2id admin bootstrap.
- npm run notifications:work — durable SMTP outbox worker.
- npm run lint, npm run typecheck and npm run build — quality gates.

The administration API also provides self-profile/password operations, safe
assignment options, multi-field/date enquiry filters and 14-day dashboard trend
data. Media upload accepts JPEG, PNG, WebP, AVIF and PDF by detected signature;
images are decoded and re-encoded to WebP, while PDFs are sandboxed downloads.

Never run a destructive Prisma reset against an existing database. Production
startup does not apply migrations automatically.
