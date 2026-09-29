# Environment ownership

## API folder

`.env` is local and ignored. It owns `DATABASE_URL`, MySQL bootstrap values, API
port, session settings, media path, SMTP settings and worker
polling. `NODE_ENV` defaults to development locally; `DEMO_MODE` and
`ALLOW_DEMO_SEED` default to false when omitted.

Production requires a secret manager or orchestrator injection for database,
session and SMTP secrets. Do not copy local passwords into production.

## Frontend folder

`.env.local` contains only `INTERNAL_API_BASE_URL`, the server-only API URL ending
in `/api/v1`. Browser calls use the same-origin `/api/v1` path, and the API and
media proxy targets are derived from this URL. No custom `NEXT_PUBLIC_` variable
is needed. Never put database credentials or API secrets in the frontend.

Vercel provides the canonical production domain through its
`VERCEL_PROJECT_PRODUCTION_URL` system variable for metadata, robots and the
sitemap. Local builds use `http://localhost:3000`. Self-hosted production must
provide that public hostname through the same variable.

## Admin folder

`.env.local` contains only `API_PROXY_TARGET`, the local Express origin used by
Vite to proxy `/api/v1` and `/media` during development. The browser API path is
always `/api/v1`. The API supplies its `PUBLIC_SITE_URL` in `/auth/csrf` for
public site links. Keep credentials in server or deployment settings.

## Local ports

| Service                     |                   Port |
| --------------------------- | ---------------------: |
| Next.js                     |                   3000 |
| Express                     |                   4000 |
| Admin Vite                  |                   5173 |
| MySQL                       |                   3306 |

Session TTL, CSRF TTL, reset-token TTL, media URL/size limits and optional SMTP
authentication are API-only values. Local media defaults to
`./storage/media` inside the API folder, preserving the three independent
project boundary. `STAFF_NOTIFICATION_EMAIL` receives staff enquiry notices.

Production examples use same-origin HTTPS. Nginx routes / to Next.js, /admin/ to
the static admin, /api/v1/ to Express and /media/ to controlled API delivery.
