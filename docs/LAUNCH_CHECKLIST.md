# Launch checklist

Do not launch until each applicable item has an owner and evidence.

## Business and content

- [ ] Confirm the public domain, organization description and service regions.
- [ ] Replace demo packages/prices/departures with reviewed offers; keep
      `DEMO_MODE=false` and `ALLOW_DEMO_SEED=false`.
- [ ] Publish only licensed media with accurate alt text, captions and rights
      records. Obtain testimonial wording and consent before approval.
- [ ] Have privacy, terms, cancellation, retention and booking language reviewed.
- [ ] Enter only confirmed phone, email, WhatsApp, address, hours, map and social
      links; absent facts remain hidden.

## Infrastructure and secrets

- [ ] Provision MySQL 8.4, encrypted backups, persistent media storage and disk
      monitoring. Keep MySQL off public interfaces.
- [ ] Inject unique database, session and SMTP credentials through a secret
      manager. Confirm `.env.production` is not committed.
- [ ] Install a valid certificate, verify HTTP-to-HTTPS redirect and monitor
      certificate expiry.
- [ ] Review and deploy migrations with `prisma migrate status/deploy`; never
      run reset or demo seed in production.
- [ ] Complete a database plus media backup and staging restore drill.

## Accounts, mail and security

- [ ] Create the first Super Admin interactively, create named staff with minimum
      roles, and verify the last-Super-Admin guard.
- [ ] Confirm production cookie Secure/HttpOnly behavior, allowed origins, CSP,
      login/upload/enquiry rate limits and admin noindex headers.
- [ ] Send a test enquiry and password reset through the production SMTP worker;
      verify queued, delivered, failed and retry states without duplicate leads.
- [ ] Configure alerting for readiness, worker failures, database/storage
      capacity, certificate expiry and stale backups.

## Acceptance

- [ ] Run API unit/integration, frontend/admin unit and Playwright suites plus all
      three production builds against the release candidate.
- [ ] Verify every public route, sitemap, robots, old-slug redirect, 404 and
      outage state on the production routing topology.
- [ ] Refresh nested admin URLs, publish/edit/unpublish content, upload media,
      and verify public updates without rebuilding.
- [ ] Perform human keyboard, screen-reader and zoom review at 360, 390, 768,
      1024 and 1440 px. Automated Lighthouse results are supporting evidence only.
- [ ] Record release version, migration, backup point, approver and rollback plan.
