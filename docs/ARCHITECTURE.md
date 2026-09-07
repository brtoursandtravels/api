# Architecture decisions

Verified and recorded 31 August 2026.

## Project boundaries

The owner explicitly requested three independent npm projects instead of the
prompt pack's pnpm monorepo:

- tours_and_travels_fe: Next.js public SSR application.
- tours_and_travels_api: Express API, Prisma, MySQL model, operations and worker.
- tours_and_travels_adminpanel: React/Vite SPA served under /admin/.

Each project owns package.json, package-lock.json, node_modules, .npmrc, runtime
pin and environment examples. No files or install are required at workspace root.

Browsers call relative /api/v1 routes. Next.js SSR uses its server-only
INTERNAL_API_BASE_URL. Database access and secrets exist only in the API project
and its operational migration/seed/bootstrap scripts.

## Pinned versions

- Node 24.18.0 LTS is the deployment pin; local verification used Node 24.14.0.
- npm 11.6.4.
- Next.js 16.3.3 Active LTS security release; React 19.2.8.
- Vite 8.2.2.
- Tailwind CSS 4.3.3: PostCSS integration in frontend and Vite integration in admin.
- Express 5.2.1.
- Prisma 7.10.0 with @prisma/adapter-mariadb 7.10.0.
- MySQL 8.4.11 LTS.
- Nginx 1.30.4 stable.

Prisma 8 was not selected: the registry exposed a release candidate and official
Prisma 8 documentation did not yet list MySQL as a first-class supported target.
Prisma 7 remains supported, requires an ESM client output and a driver adapter,
and officially supports MySQL 8.4 and Node 24.

The owner's existing XAMPP development service was later detected as MariaDB
10.4.32 on 127.0.0.1:3306 with an empty br_tours database. Prisma's mysql
connector and the selected MariaDB driver adapter support this local
MySQL-compatible service. Production remains pinned to MySQL 8.4.11 LTS.

Primary sources checked:

- https://nodejs.org/en/about/previous-releases
- https://nextjs.org/blog
- https://react.dev/versions
- https://www.prisma.io/docs/orm/v7
- https://www.prisma.io/docs/orm/reference/system-requirements
- https://www.prisma.io/docs/orm/reference/supported-databases
- https://dev.mysql.com/doc/refman/8.4/en/mysql-releases.html
- https://dev.mysql.com/doc/refman/8.4/en/installing.html
- https://nginx.org/en/download.html

## API and publication rules

Successful list responses use data plus bounded page metadata. Errors use code,
message and requestId. Public package selectors require PUBLISHED status and a
publication date not later than the current request time. Demo rows are visible
only when API DEMO_MODE is explicitly true and never when NODE_ENV is production.

Package money uses MySQL DECIMAL(12,2). The public starting price is the lowest
of the configured package base price and future scheduled departure prices; it
is serialized as a decimal string. ON_REQUEST never fabricates a number.
Departures use MySQL DATE for date-only calendar semantics; timestamps use UTC.

An enquiry or booking request is a lead, not payment, issued inventory,
guaranteed availability or a confirmed reservation. CONFIRMED is a staff status.

## Role intent

- SUPER_ADMIN: all content, sales and staff administration.
- CONTENT_EDITOR: content/media operations, not users or sales notes.
- SALES_AGENT: enquiries and internal sales work, not content or users.

These roles are enforced in Express. Super Admin owns users/audit and all
business operations; Content Editor owns catalogue/content/media but cannot
read sales leads; Sales Agent owns lead workflows but cannot publish content or
manage users. The last active Super Admin cannot be disabled or demoted.

## Session, CSRF and reset design

Admin authentication uses a random opaque cookie whose SHA-256 HMAC is stored
in MySQL. Cookies are HttpOnly, SameSite=Lax and host scoped; production uses
Secure and the configured `__Host-` name with Path=/. Login rotates any current
session. Logout, password reset, disabling a user and role changes revoke the
affected sessions.

CSRF tokens are HMAC-authenticated. A short-lived pre-auth token protects login
and reset requests; authenticated mutations require a token bound to the server
session ID. Allowed-origin validation is additional protection. Durable rate
limit buckets live in MySQL so counters are shared across API instances.

Reset tokens are random, HMAC-hashed at rest, expiring and single use. Forgot
password always returns the same response and queues mail through the outbox.

## Enquiries and media

The public enquiry endpoint requires an idempotency key. Normalized payloads
are hashed; identical retries return the original receipt while changed payloads
conflict. The lead, initial status history and notification event are committed
in one transaction. Staff delivery state is redacted and SMTP failure never
rolls back the lead.

Local uploads use memory-bounded multipart handling, byte-signature detection,
Sharp decoding with a pixel limit, orientation normalization and WebP
re-encoding. Uploaded SVG/HTML/active content is rejected. Files use random
server keys inside the API folder. Public delivery always verifies PUBLIC
visibility by asset ID; private assets require an authorized admin session.
