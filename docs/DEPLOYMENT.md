# Production deployment and recovery

The production topology uses the three independent npm applications. The
Compose file lives under the API project because the API owns operational
configuration; it builds the sibling frontend and admin folders without
creating a package or application at the workspace root.

## Before the first launch

1. Install Docker Engine with Compose v2 on a Linux host. Keep ports 3306,
   4000 and 3000 private; only 80 and 443 are published.
2. Copy `.env.production.example` to `.env.production` in the API folder.
   Inject unique database, session and SMTP secrets from the host secret
   manager. Never commit this file.
3. Replace `br.example.com` in `infra/nginx/br-tours.conf` and
   `infra/compose.production.yml` with the confirmed domain. Set the same
   HTTPS origin in `PUBLIC_SITE_URL` and `CORS_ALLOWED_ORIGINS`.
4. Provision a valid certificate before starting the proxy. Mount the host
   directory containing `live/<domain>/fullchain.pem` and `privkey.pem` through
   `BR_TLS_CERTS_DIR`. The Nginx configuration redirects all HTTP traffic to
   HTTPS; it contains no reference-site downgrade behavior.
5. Complete `docs/OWNER_INPUTS.md`. Keep `DEMO_MODE=false` and
   `ALLOW_DEMO_SEED=false` in production.

## Review, build, migrate and start

Run commands from `tours_and_travels_api`:

```sh
docker compose -f infra/compose.production.yml config
docker compose -f infra/compose.production.yml build --pull
docker compose -f infra/compose.production.yml up -d mysql
docker compose -f infra/compose.production.yml --profile operations run --rm migrate npx prisma migrate status
docker compose -f infra/compose.production.yml --profile operations run --rm migrate
docker compose -f infra/compose.production.yml --profile operations run --rm migrate npm run admin:create
docker compose -f infra/compose.production.yml up -d api worker web admin proxy
docker compose -f infra/compose.production.yml ps
```

The migration service is an explicit one-off operation. Neither API nor worker
startup runs migrations or destructive resets. Review every new SQL migration,
take a backup, run `prisma migrate status`, and use `prisma migrate deploy`.
Roll application images back when necessary; correct database mistakes with a
new forward migration instead of deleting applied migration history.

Verify from outside the host:

```sh
curl -fsS https://br.example.com/api/v1/health
curl -fsS https://br.example.com/api/v1/ready
curl -I https://br.example.com/
curl -I https://br.example.com/admin/
curl -I http://br.example.com/
```

The final HTTP request must redirect to HTTPS. Confirm nested admin URLs refresh,
an authenticated admin can upload media, the worker can reach SMTP, and the
public site can read a newly published edit before enabling traffic.

## Database and media backups

Choose an encrypted backup directory outside the repository. A consistent
full backup is simplest during a short maintenance window:

```sh
export BR_BACKUP_DIR=/srv/backups/br-tours
export BR_BACKUP_STAMP=$(date -u +%Y%m%dT%H%M%SZ)
mkdir -p "$BR_BACKUP_DIR"
docker compose -f infra/compose.production.yml stop api worker
docker compose -f infra/compose.production.yml exec -T mysql sh -c 'exec mysqldump --single-transaction --routines --triggers --set-gtid-purged=OFF -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' | gzip > "$BR_BACKUP_DIR/database-$BR_BACKUP_STAMP.sql.gz"
docker run --rm -v br_tours_media:/source:ro -v "$BR_BACKUP_DIR":/backup alpine:3.22 tar -C /source -czf "/backup/media-$BR_BACKUP_STAMP.tar.gz" .
docker compose -f infra/compose.production.yml start api worker
sha256sum "$BR_BACKUP_DIR/database-$BR_BACKUP_STAMP.sql.gz" "$BR_BACKUP_DIR/media-$BR_BACKUP_STAMP.tar.gz" > "$BR_BACKUP_DIR/checksums-$BR_BACKUP_STAMP.txt"
```

Encrypt and copy both artifacts and their checksums off-host. Define retention,
monitor backup age/size, and perform a staging restore drill regularly. A
database dump without the matching media archive is not a complete backup.

## Restore drill

Restores replace business data and require an approved maintenance window.
Verify filenames, checksums and the target host first. Prefer restoring to a
new staging database and a new named media volume, validating the application,
then switching traffic.

```sh
sha256sum -c /srv/backups/br-tours/checksums-<stamp>.txt
docker volume create br_tours_media_restore_<stamp>
docker run --rm -v br_tours_media_restore_<stamp>:/target -v /srv/backups/br-tours:/backup:ro alpine:3.22 tar -C /target -xzf /backup/media-<stamp>.tar.gz
gunzip -c /srv/backups/br-tours/database-<stamp>.sql.gz | docker compose -f infra/compose.production.yml exec -T mysql sh -c 'exec mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"'
```

Do not overwrite `br_tours_media` until the restored volume has been inspected.
After a database restore, run migration status/deploy, start API and worker,
verify readiness, media delivery, admin login and a non-production enquiry,
then document the recovery point and outcome.

## Operations

- Monitor `/api/v1/ready`, container restarts, MySQL capacity, disk space,
  certificate expiry and notification rows remaining FAILED/CANCELLED.
- Compose bounds each container's JSON logs to five 10 MB files. Keep API log
  redaction enabled and ship/retain production logs according to the approved
  incident and privacy policy.
- Rotate the session secret by revoking sessions and requiring staff to sign in
  again. Rotate database/SMTP credentials through the secret manager.
- Keep media storage persistent. The current adapter is local filesystem storage;
  moving to object storage requires implementing the documented provider boundary,
  not exposing a public bucket of private assets.
- Update with pinned images, reviewed migrations, complete tests and a fresh
  backup. Never run `prisma migrate reset` or demo seed in production.

Docker is not installed in the current Windows development environment, so the
Compose configuration and Docker image builds are supplied but not claimed as
executed here. Local npm builds and real-XAMPP MySQL tests are reported in
`docs/TEST_REPORT.md`.
