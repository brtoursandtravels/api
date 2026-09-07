# Phase 1–6 verification report

Run on Windows with Node 24.14.0 and npm 11.6.4 on 31 August 2026.

Passed:

- API npm run env:check after scoped-variable correction.
- Prisma client generation 7.10.0.
- Prisma schema validation.
- Initial MySQL migration generation (26,380 bytes).
- API, frontend and admin npm run typecheck.
- API, frontend and admin npm run lint.
- API unit tests: 2 files, 4 tests passed.
- API TypeScript production build.
- Next.js 16.3.3 production build; dynamic /, /packages, /packages/[slug].
- Vite 8.2.2 admin production build under /admin/.
- Tailwind CSS 4.3.3 compiled through PostCSS in frontend and the Vite plugin in admin.

Additional local database evidence is appended after migration execution.

Verified after the owner identified the phpMyAdmin service:

- XAMPP MariaDB 10.4.32 listening on 127.0.0.1:3306.
- br_tours confirmed empty before migration (zero tables).
- prisma migrate deploy applied 20260831170000_initial_foundation.
- Guarded demo seed completed.
- Real-database integration test: 1 file, 1 test passed.
- Built-stack smoke passed: MariaDB -> Prisma -> Express -> Next.js SSR.
- Frontend and admin production dependency audits reported zero vulnerabilities.
- The Prisma adapter's transitive MariaDB driver was overridden from vulnerable
  3.4.5 to 3.5.3 and the live stack was rechecked.

Phase 2 verification:

- Applied forward migration `20260831180000_secure_backend` to development and
  dedicated `br_tours_test` databases without resetting either database.
- API unit tests: 3 files, 7 tests passed.
- Real-MySQL integration tests: 3 files, 16 tests passed.
- Verified CSRF rejection, opaque session cookies, RBAC and last-Super-Admin guard.
- Verified draft privacy, publish/update/unpublish without rebuild, filters and redirects.
- Verified idempotent enquiry/outbox creation, changed-payload conflict, private
  field exclusion and audited status transitions.
- Verified stored rich-text sanitization, SVG rejection, WebP re-encoding,
  private/public media delivery and safe deletion.
- Verified validated two-level navigation relationships without silently
  flattening child links.
- API typecheck, lint and production build passed after phase 2.
- OpenAPI 3.1 validated structurally with Redocly CLI 2.49.0 minimal ruleset;
  recommended-style operation ID/summary warnings remain documentation polish.

Phase 3 administration verification:

- Applied forward migration `20260831190000_admin_content_completeness` to
  `br_tours` and `br_tours_test` without resetting either database.
- API unit tests: 3 files, 7 tests passed.
- Real-MySQL integration tests: 3 files, 19 tests passed.
- Verified PDF signature acceptance, attachment-only protected/public delivery,
  package brochure references, public SEO DTOs and in-use deletion protection.
- Verified self-profile and password changes, safe assignee DTOs, expanded
  enquiry filtering, live enquiry status counts and 14-day dashboard trend.
- Admin unit tests: 1 file, 2 tests passed.
- Admin Playwright: 3 Chrome workflows passed against guarded `br_tours_test`:
  publication lifecycle, role/UI/API boundaries, nested refresh, keyboard
  navigation and a 390 px mobile viewport.
- Admin typecheck, zero-warning lint and production build passed. Route modules
  are lazy-loaded and the production build has no large-chunk warning.

Phase 4 public and final acceptance verification:

- Public frontend typecheck, zero-warning lint, 1 unit test and normal Next.js
  production build passed after all public routes and submission flows were completed.
- The public discovery form submits destination, trip type, maximum duration,
  budget and month into the real URL/API filters. Public CSP, frame and
  permissions headers were observed locally, and all browser workflows pass
  under the development CSP variant.
- Public Playwright: 3 Chrome workflows passed against guarded `br_tours_test`:
  URL-restorable search/filter/pagination, CMS/blog/gallery/contact propagation,
  keyboard lightbox, exactly one enquiry/outbox event, and 390 px menu/overflow.
- The browser suite exposed and verified fixes for nested gallery media BigInt
  serialization and absent optional contact-form controls.
- Real-MySQL integration remains 3 files and 19 tests passed. The notification
  case now uses a real Nodemailer connection refusal on the actual enquiry event,
  verifies the lead plus FAILED outbox row remain, and sends that same row on retry.
- OpenAPI 3.1 is structurally valid with Redocly CLI 2.49.0. Minimal validation
  reports 193 non-structural documentation-style warnings, primarily missing
  operation IDs/summaries on compact administrative operations.
- Two successful Lighthouse 13 mobile production-build measurements were taken
  on the local Windows/XAMPP host. Before contrast/favicon fixes: Performance 78,
  Accessibility 96, Best Practices 96, SEO 100, FCP 1.0 s, LCP 1.1 s, TBT 630 ms,
  CLS 0. After fixes: Performance 58, Accessibility 100, Best Practices 100,
  SEO 100, FCP 0.9 s, LCP 4.5 s, TBT 1,110 ms, CLS 0. Performance is reported as
  the observed 58–78 range; dynamic homepage response/main-thread work remains
  an optimization opportunity. Automated results are not a compliance claim.
- Frontend and admin runtime npm audits reported zero vulnerabilities. API npm
  audit continues to report three high findings in Prisma CLI's optional peer
  `deepmerge-ts`; the offered fix is a breaking Prisma 6 downgrade. The runtime
  does not accept merge graphs, and its container prunes development/peer tooling.
- Production Compose, TLS proxy, explicit migration/worker services, persistent
  media/MySQL volumes, Docker build exclusions and backup/restore guidance supplied.

Not yet verified on this machine:

- Docker image builds and Compose startup because Docker is unavailable.
- Receipt through a real production SMTP account/Mailpit UI and production TLS/domain.
- Staging restore drill and human screen-reader/zoom/assistive-technology review.
- Owner-supplied production facts, legal text, licensed media and launch approval.

Docker is unavailable, so Compose and Docker images remain unverified.

Known tooling audit item: Prisma 7.10's optional CLI peer brings
deepmerge-ts 7.1.5 into the development install and npm reports its recursive
merge stack-exhaustion advisory. npm's offered fix is a breaking downgrade to
Prisma 6.12, so it was not applied. The API does not accept configuration merge
graphs from requests, and the runtime image prunes development and peer packages.
