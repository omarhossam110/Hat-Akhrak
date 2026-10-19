# Deploying Hat Akhrak (one VPS, Docker Compose)

```
Internet → nginx :80/:443 → frontend (Next.js) → backend (NestJS) → Postgres (same server)
```

Only **nginx** is published. Postgres is never exposed (no `ports:` on it) and the backend is reachable from the frontend container
only; that is what makes `TRUST_PROXY=1` safe (the backend trusts the frontend's
`X-Forwarded-For`, and nginx overwrites that header with the real visitor IP).

## 1. Prerequisites

- A Linux server with Docker + the Compose plugin.
- Both repos checked out **side by side**:
  `hat-akhrak/` (this repo) and `hat-akhrak-backend/`. If the backend lives elsewhere,
  set `BACKEND_CONTEXT` in `.env`.

## 2. Configure

```bash
cd hat-akhrak/deploy
cp .env.example .env
# fill in every secret; generate each with: openssl rand -base64 48
```

Everything runs on this one server, including PostgreSQL (no external database service). `DB_PASSWORD` is the only database setting: letters and digits only, e.g. `openssl rand -hex 24`.

## 3. First start

```bash
docker compose up -d --build
docker compose ps          # everything "healthy", migrate "exited (0)"
```

Order is enforced: database → **migrate** (applies the SQL migrations, then exits) →
backend → frontend → nginx. Re-running `up` applies new migrations automatically.

## 4. Create the first admin

There is no public admin sign-up, by design.

1. Sign up as a normal customer on the site.
2. Promote that account in the database:
   `docker compose exec db psql -U hat hat_akhrak -c "update profiles set role='super_admin' where email='you@example.com'"`
3. Log in, open `/super-admin/security` and enrol the authenticator app. Save the recovery codes.
4. Only now keep `REQUIRE_ADMIN_2FA=true` (the default here).

Lost your phone *and* recovery codes?
`docker compose exec backend node dist/cli/admin.js reset-2fa you@example.com`

If you set `TAX_ID_ENCRYPTION_KEY` after merchants already signed up:
`docker compose exec backend node dist/cli/admin.js encrypt-tax-ids`

## 5. HTTPS

1. Point your domain's DNS at the server.
2. With nginx **not** running, get a certificate:
   `sudo certbot certonly --standalone -d example.com -d www.example.com`
   then copy/symlink `/etc/letsencrypt` into `deploy/certs` (or mount `/etc/letsencrypt` directly).
3. `cp nginx/tls.conf.example nginx/default.conf` and replace `example.com`.
4. In `docker-compose.yml` uncomment the `443` port and the `./certs` volume.
5. Set `PUBLIC_URL=https://example.com` in `.env`, then `docker compose up -d`.
6. Renewal (cron): `certbot renew --pre-hook "docker compose -f /path/to/deploy/docker-compose.yml stop nginx" --post-hook "docker compose -f /path/to/deploy/docker-compose.yml start nginx"`

Behind Cloudflare or another TLS-terminating proxy you can keep the HTTP config; change
`X-Forwarded-Proto` in `nginx/default.conf` to `$http_x_forwarded_proto`.

## 6. Updating

```bash
git pull                              # in both repos
docker compose up -d --build          # rebuilds, migrates, restarts
```

## 7. Checklist before real customers

- [ ] `PUBLIC_URL` is the real `https://` address
- [ ] All secrets set and **backed up somewhere safe** (losing `TAX_ID_ENCRYPTION_KEY` / `TOTP_ENCRYPTION_KEY` makes that data unreadable)
- [ ] Admin 2FA enrolled, `REQUIRE_ADMIN_2FA=true`
- [ ] SMTP working (a confirmation email really arrives), then `REQUIRE_EMAIL_VERIFICATION=true`
- [ ] SMTP configured and the sending domain verified (otherwise reset/notification emails are only logged)
- [ ] Backups: the `backup` container writes a daily dump to `deploy/backups/` — also **copy that folder off the server** (rsync/rclone to another machine or storage) and do one test restore
- [ ] The Content-Security-Policy is **enforced** (per-request nonce, `src/proxy.ts`). After the first real visits, grep the frontend logs for `[csp-report]` — any line is something the policy blocked (e.g. a new third-party script you added)
- [ ] A real payment gateway is wired in (payments are currently recorded as paid immediately)

## Backups and restore

A daily `pg_dump` (gzip) lands in `deploy/backups/` and the last 14 days are kept
(`BACKUP_KEEP_DAYS` in `.env`). Check it is working: `docker compose logs backup`.

Restore into a **stopped** app (this replaces the current data):

```bash
docker compose stop backend frontend nginx
docker compose exec db psql -U hat -d postgres -c "drop database hat_akhrak" -c "create database hat_akhrak"
gunzip -c backups/hat_akhrak_YYYYMMDD_HHMMSS.sql.gz | docker compose exec -T db psql -U hat hat_akhrak
docker compose up -d
```

Never run `docker compose down -v` on a live system: `-v` deletes the database volume.

## Useful commands

```bash
docker compose logs -f backend          # follow logs
docker compose exec backend sh          # shell in the API container
docker compose exec db psql -U hat hat_akhrak    # SQL prompt
docker compose exec backup sh -c 'ls -lh /backups'   # list backups
```

## Logs and tracing a problem

Logs are capped (5 × 10 MB per container) so they can't fill the disk. Backend lines are JSON; every
request has an id that nginx also returns to the browser as the `X-Request-Id` response header.

    docker compose logs --since 1h backend | grep '"level":"error"'     # server errors
    docker compose logs backend | grep <request-id>                      # one request, from a screenshot / DevTools
    docker compose logs frontend | grep render_error                     # a page that crashed (its `digest` = the "Error ID" on the error page)
