# Implementation plan and evidence

## Phase 1 — foundation and vertical slice

- [x] Three independent npm projects requested by owner; scoped lockfiles/envs.
- [x] Pinned stable framework/runtime decisions documented.
- [x] Complete initial MySQL Prisma model for auth, content, packages, media,
      blog, homepage, settings, enquiries, audit and outbox concepts.
- [x] Reviewed initial SQL migration generated without resetting a database.
- [x] Guarded idempotent demo seed: 12 packages, 8 destinations, 5 categories,
      6 articles, 3 empty albums, FAQs, unapproved testimonial and demo enquiries.
- [x] Express health/readiness and real Prisma package list/detail queries.
- [x] Next.js home, list/detail SSR, 404, empty and outage distinction.
- [x] Original responsive identity and owner logo crop.
- [x] Vite /admin/ shell with correct basename and direct-refresh Nginx fallback.
- [x] Durable SMTP outbox worker command and interactive Argon2id admin bootstrap.
- [x] Lint, type checks, unit tests and all three production builds.
- [x] Apply reviewed migration and idempotent seed to the empty local br_tours
      XAMPP MariaDB/MySQL-compatible database.
- [x] Exercise MariaDB -> Prisma -> Express -> built Next.js SSR stack.
- [x] Run the read-only real-database integration readiness test.

## Phase 2 — secure backend

- [x] Opaque MySQL sessions, Argon2id login, rotation/revocation and safe cookies.
- [x] Pre-auth and session-bound CSRF with origin checks.
- [x] MySQL-backed login, public-form and media-upload rate limits.
- [x] Super Admin, Content Editor and Sales Agent authorization in Express.
- [x] Last-active-Super-Admin protection and expiring single-use reset tokens.
- [x] Public content/catalogue/blog/gallery/settings/FAQ/testimonial APIs.
- [x] Protected package, taxonomy, page, blog, homepage, gallery, FAQ,
      testimonial, navigation, settings and user operations.
- [x] Transactional idempotent enquiries, notes, assignment, audited status
      transitions, safe CSV export and redacted outbox state/retry.
- [x] Local raster media validation, re-encoding, private/public delivery and
      in-use deletion protection.
- [x] Server rich-text sanitization and safe-link enforcement.
- [x] Real-MySQL security, publication, enquiry and media integration tests.
- [x] OpenAPI 3.1 document aligned to implemented routes and structurally valid.

## Phase 3 — authenticated administration

- [x] Session restore/login/logout/reset, self-profile/password and expired-session handling.
- [x] Role-gated responsive shell, nested-route refresh and noindex metadata.
- [x] Live dashboard aggregates, enquiry trend/status views and notification state.
- [x] Package CRUD, duplication, protected preview, publish/unpublish, nested
      itinerary/departure ordering, image gallery, SEO and PDF brochure assignment.
- [x] Destination/category, media, gallery, blog, pages, homepage, navigation,
      settings, FAQs and testimonials administration.
- [x] Blog public-author fields, SEO, tags, related tours/articles and protected preview.
- [x] Enquiry search/filter/detail, assignment, status, private notes/history and CSV export.
- [x] Super Admin user/audit operations and role-safe API boundaries.
- [x] Loading/error/empty states, toast feedback, destructive confirmation and
      unsaved-change protection.
- [x] Unit, type, lint, production-build and guarded Playwright verification.

## Phase 4 â€” public website

- [x] All requested public templates and supporting policy/error/loading states.
- [x] URL-restorable backend search, filters, sorting and pagination.
- [x] Package/gallery/blog detail, media, SEO and related-content workflows.
- [x] Contact and package enquiry forms with honest persisted receipts.
- [x] CMS-driven homepage, business details, navigation and footer.
- [x] Tailwind build with all theme colours centralized in `globals.css`.

## Phase 5 â€” end-to-end acceptance

- [x] Public Playwright coverage for browsing, CMS propagation, gallery,
      enquiry/outbox uniqueness, keyboard interaction and 390 px overflow.
- [x] Real Nodemailer SMTP refusal preserves the enquiry/outbox and retry sends
      the same database row.
- [x] API schema/generation, unit, real-MySQL integration and production build.
- [x] Frontend/admin type, lint, unit, Playwright and production builds.
- [x] OpenAPI structural validation and production Lighthouse measurement.

## Phase 6 â€” deployment handoff

- [x] Three scoped Dockerfiles and build-context exclusions.
- [x] Production Compose topology with private MySQL, API, worker, frontend,
      admin, TLS reverse proxy, health checks and persistent storage.
- [x] Explicit forward migration, secure bootstrap, backup/restore and recovery
      guidance plus admin/owner/launch checklists.
- [ ] Build and start Docker images on a Docker-enabled deployment host.
- [ ] Complete owner inputs, real TLS/domain, production SMTP receipt, staging
      restore drill and human assistive-technology review before launch.
