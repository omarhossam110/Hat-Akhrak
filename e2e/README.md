# End-to-end tests

Real browser, real site: these drive a running stack (frontend + backend + Postgres) through the UI.

    # 1. have the site running (e.g. the docker compose stack, or `next build && next start` + the backend)
    # 2. tell the tests where it is and how to run SQL against its database
    BASE_URL=http://localhost \
    E2E_DB_EXEC="docker compose -f deploy/docker-compose.yml exec -T db psql -U hat -d hat_akhrak" \
    npm run test:e2e

SQL is used only for what no screen can do: approving a merchant (a super admin's job) and moving a
cycle's end time into the past so the scheduler closes it.

`lifecycle.spec.ts` waits for the backend scheduler (runs every minute), so the full run takes a few minutes.
The backend limits sign-ups/logins to 10 a minute per IP; the helpers wait and retry when they hit it.

In CI this runs from the **backend** repo (`.github/workflows/full-stack.yml`), against `docker compose up`
of the whole stack behind nginx — the only place both repos exist together.
