# Environment ownership

## API folder

.env is local and ignored. It owns DATABASE_URL, MySQL bootstrap values, API
port, allowed origins, session settings, demo guards, media path, SMTP settings
and worker polling. .env.example, .env.test.example and
.env.production.example document safe shapes without real production secrets.
.env.test is a local ignored test configuration.

Production requires a secret manager or orchestrator injection for database,
session and SMTP secrets. Do not copy local passwords into production.

## Frontend folder

.env.local owns INTERNAL_API_BASE_URL, NEXT_PUBLIC_API_BASE_URL,
API_PROXY_TARGET and NEXT_PUBLIC_SITE_URL. Only NEXT_PUBLIC-prefixed values reach
browser bundles; INTERNAL_API_BASE_URL must never include database credentials.

## Admin folder

.env.local owns VITE_API_BASE_URL, VITE_PUBLIC_SITE_URL and the local-only Vite
proxy target. Every VITE-prefixed value is public at build time. Never place a
secret in this file.

## Local ports

| Service                     |                   Port |
| --------------------------- | ---------------------: |
| Next.js                     |                   3000 |
| Express                     |                   4000 |
| Admin Vite                  |                   5173 |
| MySQL                       |                   3306 |
| Mailpit SMTP                |                   1025 |
| Mailpit UI                  |                   8025 |
| Dedicated local test schema | 3306 (`br_tours_test`) |
| Optional Compose test MySQL |                   3307 |

Session TTL, CSRF TTL, reset-token TTL, media URL/size limits and optional SMTP
authentication are API-only values. Local media defaults to
`./storage/media` inside the API folder, preserving the three independent
project boundary. `STAFF_NOTIFICATION_EMAIL` receives staff enquiry notices.

Production examples use same-origin HTTPS. Nginx routes / to Next.js, /admin/ to
the static admin, /api/v1/ to Express and /media/ to controlled API delivery.
