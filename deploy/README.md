# Deploying Hat Akhrak (one VPS, Docker Compose)

```
Internet → nginx :80/:443 → frontend (Next.js) → backend (NestJS) → Postgres
```

Only **nginx** is published. The backend is reachable from the frontend container
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

Pick one database option in `.env` (see the comments there): Postgres inside the stack
(`--profile local-db`) or a hosted one such as Supabase.

## 3. First start

```bash
docker compose up -d --build                      # hosted database
docker compose --profile local-db up -d --build   # database in this stack
docker compose ps                                 # all "healthy" / migrate "exited (0)"
```

Order is enforced: database → **migrate** (applies the SQL migrations, then exits) →
backend → frontend → nginx. Re-running `up` applies new migrations automatically.

## 4. Create the first admin

There is no public admin sign-up, by design.

1. Sign up as a normal customer on the site.
2. Promote that account in the database:
   `docker compose exec db psql -U hat hat_akhrak -c "update profiles set role='super_admin' where email='you@example.com'"`
   (hosted database: run the same `update` from its SQL console).
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
- [ ] SMTP configured and the sending domain verified (otherwise reset/notification emails are only logged)
- [ ] Database backups scheduled (`pg_dump`, or your host's backups)
- [ ] The Content-Security-Policy is still **report-only**: check `/api/csp-report` logs on the real domain, then enforce it in `next.config.ts`
- [ ] A real payment gateway is wired in (payments are currently recorded as paid immediately)

## Useful commands

```bash
docker compose logs -f backend          # follow logs
docker compose exec backend sh          # shell in the API container
docker compose --profile local-db exec db pg_dump -U hat hat_akhrak > backup.sql
```
