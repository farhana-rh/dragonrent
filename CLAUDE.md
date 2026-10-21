# CLAUDE.md

@AGENTS.md

The general template conventions (architecture, styling, imports, forms, Redux, i18n) are in
AGENTS.md above. This file adds what is specific to DragonRent.

# Project: DragonRent

DragonRent is a rental marketplace MVP for Finland, built on Sharetribe Web Template v12.4.0, on a
10-day build plan ending with launch on 28 Oct 2026. Scope, flows and a code map are in `docs/`:

- `docs/SCOPE.md`: frozen MVP scope, decisions and the duration pricing rule. Read it first.
- `docs/FLOWS.md`: renter and owner flows, sitemap
- `docs/MAP.md`: where each page, component and the pricing code live

## Design source of truth

**Before any UI work, read `dragonrent-design/docs/DESIGN.md` and the matching mockup in
`dragonrent-design/docs/design/mockups/`** (HTML files; open them in a browser or read their inline
styles).
If either is missing for the page you're about to change, stop and ask the user instead of designing
from older material. The new mockups replace the earlier `Rental App/` ("dhar") exports and
"DragonRent Mockups.pdf", which are kept only for reference.

## Commands

```shell
yarn install          # also runs patch-package
yarn dev              # frontend (dev server) + backend API server on port 3500
yarn dev-server       # production-like SSR build served on http://localhost:4000
yarn build            # build-web + build-server into build/
yarn test             # Jest (client), interactive watch mode
yarn test-ci          # server + client tests, non-interactive
yarn test-server      # server tests only
yarn format           # Prettier
yarn config-check     # verify .env setup
```

Run a single test file with `yarn test --watchAll=false src/path/to/File.test.js`. Update snapshots
with `-u` only when the UI change is intended.

## Redesign rules (user-approved)

The work is done in phases, and the user approves each phase before the next starts. After each
phase, stop and report build and test results.

- Preserve all Sharetribe functionality: booking, Stripe checkout, transitions, auth, messaging,
  reviews, profiles, SSR. No unrelated architectural changes.
- **Never modify transaction processes** (`ext/transaction-processes`, `src/transactions`) or
  backend transaction logic. Deposits are out of scope.
  - **One approved exception (18 Oct):** duration pricing in `server/api-util/lineItems.js` (and its
    tests). Plan first, get the worked examples in `docs/SCOPE.md` approved, cover them with unit
    tests, and don't touch the transaction process.
- Explain any change to search data logic or transaction behaviour BEFORE implementing it.
- Accounts: one account can both rent and lend. Listing type: daily rental only.
- Languages: English (primary) and Finnish only, both at launch. Add new strings to `en.json` and
  `fi.json`. Do NOT add strings to de/es/fr or the other locale files. DESIGN.md says to put wording
  in Console; agreed exception (21 Oct): new keys go in the JSON files (Console holds one language),
  existing template wording is changed in Console.
- Currency: EUR only.
- No favourites/wishlist hearts and no fake data. Listing cards show "New" or omit the rating. The
  listing page may compute a rating from the reviews it loads.
- Listing detail rows must come from listing fields configured in Console, never hardcoded content.
  Tell the user exactly which Console listing fields to create before building rows that need them.
- No multi-category search.
- Info and legal pages are Console pages (`/p/...`). Legal copy must be marked as needing legal
  review.
- Cookie consent: analytics load only after consent.

## Hosted Console assets override local code

- Hosted `translations.json` contains every template key, so **editing an existing key in
  `src/translations/*.json` has no runtime effect**. Use NEW keys for changed copy, e.g.
  `"LandingPage.heroTitle"`.
- Hosted branding (colour, logo) overrides `src/config/configBranding.js`. The brand colour is cobalt
  `#2457C5` (DESIGN.md, 21 Oct); Console → Branding must be set to it for the design to show.
- Current Console state (Dev, checked 20 Oct) is summarised in `docs/SCOPE.md` and the setup steps
  in `docs/CONSOLE-SETUP.md`: one user type with both roles, daily rental only, delivery fields,
  15% owner commission, orange branding, placeholder policy pages.
- The local `.env` points at the **Dev** environment ("DragonRent.com Dev"), which starts without
  users or listings.

## Where the redesign lives

- Homepage: custom sections in `src/containers/LandingPage/` (`Section*`, `HomeTile`, `HomeMedia`,
  `HeroSearchForm`, `landingPageConfig.js`). "Popular rentals" uses the existing featured-listings
  logic.
- Search: `src/containers/SearchPage/` (`SearchFilterChips`, primary/secondary filters in
  `SearchPageWithGrid.js`).
- Listing page: `src/containers/ListingPage/` (`Section*`, `ListingBreadcrumbs`). Similar listings
  are fetched by `fetchSimilarListingsThunk` in `ListingPage.duck.js`.
- Topbar: `src/containers/TopbarContainer/Topbar/` (`TopbarDesktop/PrimaryNav`).
- Dashboard: `src/containers/DashboardPage/` (`/dashboard`, read-only data).
- Checkout: presentation only in `src/containers/CheckoutPage/` (`CheckoutSteps`, `RentalSummary`).
  Never change its payment logic.
- Global styles and colour variables: `src/styles/marketplaceDefaults.css`.

## Environment notes

- Windows dev machine. Git warns about LF/CRLF line endings, which is harmless.
- `.env` has a Stripe **test** publishable key and a Mapbox token. Never paste Stripe secret keys or
  the Sharetribe client secret into chat; they go in `.env`/Console/Render only.
- Staging runs on Render; its environment variables are set in the Render dashboard.
- `build/` is generated output. Rebuild it rather than editing it.
