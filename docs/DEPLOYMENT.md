# Production deployment and recovery

The production deployment runs the three npm applications directly on a Linux
host. MySQL and Nginx are host-managed services, while systemd keeps the API,
notification worker and Next.js frontend running.

## Host layout and prerequisites

Install Node.js 24, npm 11, MySQL 8.4, Nginx, Git, `curl`, `gzip` and `tar`.
Keep ports 3000, 4000 and 3306 private; expose only ports 80 and 443 through
Nginx.

Use a dedicated, non-login service account and place the repositories at:

```text
/srv/br-tours/tours_and_travels_fe
/srv/br-tours/tours_and_travels_adminpanel
/srv/br-tours/tours_and_travels_api
```

Store production secrets outside Git. The examples below use:

```text
/etc/br-tours/api.env
/etc/br-tours/web.env
/etc/br-tours/admin.env
```

Make these files readable only by the deployment account. The API environment
must provide the database, session, origin, media and SMTP values validated by
`src/env.ts`. Keep `DEMO_MODE=false` and `ALLOW_DEMO_SEED=false` in production.

## Install, build and migrate

Run the following after pulling the reviewed release:

```sh
cd /srv/br-tours/tours_and_travels_api
npm ci
set -a
. /etc/br-tours/api.env
set +a
npm run env:check
npm run build
npx prisma migrate status
npm run db:migrate:deploy
npm run admin:create

cd /srv/br-tours/tours_and_travels_fe
npm ci
set -a
. /etc/br-tours/web.env
set +a
npm run build

cd /srv/br-tours/tours_and_travels_adminpanel
npm ci
set -a
. /etc/br-tours/admin.env
set +a
npm run build
```

Review every SQL migration and take a backup before `db:migrate:deploy`. Never
run `prisma migrate reset` or the demo seed in production. Create the first
administrator interactively only on a trusted terminal.

`npm start` automatically runs `db:prepare:deploy` first. This regenerates the
Prisma client, applies pending migrations, and runs the production-safe
catalogue seed. The catalogue seed creates missing destinations, categories,
packages and project-owned media without replacing packages that already exist
and may have been edited in the admin panel. The broader idempotent demo seed
runs only when `NODE_ENV` is not `production` and `ALLOW_DEMO_SEED=true`.
Production starts therefore skip demo enquiries and other broad sample data. The
`20260914143000_published_sample_testimonials` migration installs three
explicitly labelled sample review cards; replace them with consented customer
reviews and archive the samples before launch sign-off.

## Dashboard performance rollout

Deploy the API and admin together. The dashboard runs six independent reads
without a transaction, combines status counts, and aggregates the fourteen-day
UTC enquiry trend in MySQL. `20260921070000_enquiry_trend_index` indexes that date
range; the existing `vercel-build` workflow applies the migration. Session
validation is reused within a request only, and `/auth/csrf` includes the safe
user profile to remove the extra `/auth/me` round trip on reload. Dashboard
responses remain private and are not stored in shared caches.

The API's `vercel.json` pins its function to Mumbai (`bom1`) near the current
Mumbai-hosted MySQL database. Revisit this setting if the database moves; leaving
the function in the default US region adds cross-continent latency to every
database round trip.

Run `npm run test:dashboard` for summary, session, CSRF and revocation checks.
The admin Vercel config also maps the logo and favicon before its SPA fallback.

## Catalogue and admin read performance

Apply `20260921100000_admin_list_indexes` through the normal deployment build.
Deploy the API before the admin and public website: the admin uses the optional
`view=summary` package list, and gallery uses the new `/api/v1/package-options`
labels endpoint. Older full package list clients remain supported.

Public package cards fetch one public image and upcoming departure prices, with
no itinerary. Details still include the full public gallery and itinerary. Price
filters first rank lightweight price records and load relations only for the
requested page. Blog, gallery and supporting public queries select only DTO
fields; gallery package filters use a relation predicate without a preliminary
lookup. All admin list and pre-save validation reads run without transactions;
multi-record writes retain their transactions. Admin responses use private,
no-store caching. Existing public CDN cache policies remain unchanged.

The public website also pins rendering to `bom1`, and shares API results between
metadata, layouts and page content within each render. Editors load media/tag
selectors when opened. The API tests cover payloads, pagination, prices,
publication rules and authenticated reads (`test:public-read`, `test:admin-read`).

## Activity log rollout

Apply `20260919090000_activity_log_details` before serving the updated API.
The existing Vercel `vercel-build` / `db:prepare:deploy` workflow includes this
migration. Deploy the API before the admin interface. Existing logs are retained;
new request details are nullable and cannot be reconstructed for historical events.

Activity logs are available only to Super Admins at `/admin/audit`. New events
capture user name/email/role snapshots, IP address, user agent, request method and
path (without query strings). Passwords, session tokens, cookies and full request
bodies are not collected by the context helper. Timestamps are stored in UTC and
displayed/filtered in IST. Protect database backups because these logs contain
personal and operational information.

IP collection uses Express `req.ip` and the existing `TRUST_PROXY_HOPS` setting.
Keep it `0` for direct local requests; configure it to match the actual trusted
reverse-proxy topology in production. Do not blindly enable trust for arbitrary
forwarded headers. See the [Express proxy guidance](https://expressjs.com/en/guide/behind-proxies/).

## systemd services

Create `/etc/systemd/system/br-tours-api.service`:

```ini
[Unit]
Description=BR Tours API
After=network-online.target mysql.service
Wants=network-online.target

[Service]
Type=simple
User=brtours
Group=brtours
WorkingDirectory=/srv/br-tours/tours_and_travels_api
EnvironmentFile=/etc/br-tours/api.env
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Create `/etc/systemd/system/br-tours-worker.service` with the same settings,
then change the description and start command to:

```ini
Description=BR Tours notification worker
ExecStart=/usr/bin/node dist/worker.js
```

Create `/etc/systemd/system/br-tours-web.service`:

```ini
[Unit]
Description=BR Tours public website
After=network-online.target br-tours-api.service
Wants=network-online.target

[Service]
Type=simple
User=brtours
Group=brtours
WorkingDirectory=/srv/br-tours/tours_and_travels_fe
EnvironmentFile=/etc/br-tours/web.env
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Confirm the absolute paths returned by `command -v node` and `command -v npm`
and adjust `ExecStart` if necessary. Then enable the services:

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now br-tours-api br-tours-worker br-tours-web
sudo systemctl status br-tours-api br-tours-worker br-tours-web
```

## Nginx and TLS

Update the domain and static admin path in `infra/nginx/br-tours.conf`, copy it
to `/etc/nginx/conf.d/br-tours.conf`, and provision the referenced TLS
certificate. Validate and reload Nginx:

```sh
sudo nginx -t
sudo systemctl reload nginx
```

Verify from outside the host:

```sh
curl -fsS https://br.example.com/api/v1/health
curl -fsS https://br.example.com/api/v1/ready
curl -I https://br.example.com/
curl -I https://br.example.com/admin/
curl -I http://br.example.com/
```

The final request must redirect to HTTPS. Confirm nested admin URLs refresh, an
authenticated administrator can upload media, the worker can reach SMTP, and
the public site can read newly published content before enabling traffic.

## Database and media backups

Use an encrypted backup directory outside the repository. During a short
maintenance window:

```sh
export BR_BACKUP_DIR=/srv/backups/br-tours
export BR_BACKUP_STAMP=$(date -u +%Y%m%dT%H%M%SZ)
sudo install -d -m 0700 "$BR_BACKUP_DIR"
sudo systemctl stop br-tours-api br-tours-worker
mysqldump --single-transaction --routines --triggers br_tours | gzip > "$BR_BACKUP_DIR/database-$BR_BACKUP_STAMP.sql.gz"
tar -C /srv/br-tours/tours_and_travels_api/storage -czf "$BR_BACKUP_DIR/media-$BR_BACKUP_STAMP.tar.gz" media
sudo systemctl start br-tours-api br-tours-worker
sha256sum "$BR_BACKUP_DIR/database-$BR_BACKUP_STAMP.sql.gz" "$BR_BACKUP_DIR/media-$BR_BACKUP_STAMP.tar.gz" > "$BR_BACKUP_DIR/checksums-$BR_BACKUP_STAMP.txt"
```

Use a protected MySQL option file or an interactive password prompt; do not put
database passwords in shell history. Encrypt and copy the database, media and
checksum files off-host. Test restoration regularly against a separate staging
database and media directory.

## Restore drill

Restores replace business data and require an approved maintenance window.
Verify filenames, checksums and the target database first:

```sh
sha256sum -c /srv/backups/br-tours/checksums-<stamp>.txt
install -d -m 0750 /srv/br-tours/restore/media
tar -C /srv/br-tours/restore -xzf /srv/backups/br-tours/media-<stamp>.tar.gz
gunzip -c /srv/backups/br-tours/database-<stamp>.sql.gz | mysql br_tours_restore
```

Inspect the restored data before switching the application to it. Then run
migration status/deploy, restart the services, and verify readiness, media
delivery, administrator login and a non-production enquiry.

## Operations and updates

- Monitor `/api/v1/ready`, systemd restart counts, MySQL capacity, disk space,
  certificate expiry and failed notification rows.
- Read service logs with `journalctl -u br-tours-api`,
  `journalctl -u br-tours-worker` and `journalctl -u br-tours-web`.
- Keep API log redaction enabled and configure journald retention according to
  the approved incident and privacy policy.
- Rotate session, database and SMTP secrets through the host secret manager.
- Keep `storage/media` persistent and include it with every database backup.
- For updates, pull the reviewed revision, run `npm ci` and production builds,
  deploy migrations, then restart the three services with `systemctl restart`.
