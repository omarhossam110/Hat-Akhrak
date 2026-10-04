# هات آخرك (Hat Akhrak)

Egyptian group-buying marketplace — merchants list deals with stock, buyers join
72-hour purchasing cycles, and the price drops in tiers as more buyers join
(Pinduoduo-style retroactive pricing).

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (navy + orange design tokens — see `src/app/globals.css`)
- **i18n:** next-intl — full Arabic (default, RTL) / English (LTR) support via `/ar` and `/en` routes
- **Fonts:** Tajawal (Arabic) + Plus Jakarta Sans (Latin), self-hosted via `@fontsource`
- **Database (planned):** PostgreSQL via Supabase
- **Payments (planned):** abstracted payment-gateway provider (TBD)
- **Ad tracking (planned):** Meta Pixel

## Project Structure

```
src/
  app/
    [locale]/         # all routed pages, localized (ar | en)
      layout.tsx       # root HTML, fonts, NextIntlClientProvider
      page.tsx          # homepage
    globals.css         # design tokens (colors, fonts)
  components/           # shared UI components
  i18n/
    routing.ts          # locales, default locale, prefix strategy
    navigation.ts        # localized Link/router/pathname helpers
    request.ts            # server-side message loading
  middleware.ts            # next-intl locale routing middleware
messages/
  ar.json                   # Arabic translation strings
  en.json                   # English translation strings
```

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` — you'll be redirected to `/ar` by default.
Switch language from the navbar.

## Build Spec

The full business logic, data model, and use-case catalog this build follows
live in the project's planning docs (deal/cycle lifecycle, tiered retroactive
pricing, deposits, refunds/disputes, merchant settlement, roles & permissions).
This README will be kept in sync as those are implemented.

## Status

🚧 Early scaffold — Next.js + TypeScript + Tailwind + bilingual i18n routing are
in place. Business logic, database schema, and auth are not yet implemented.
