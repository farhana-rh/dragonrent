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
- `docs/LAUNCH.md`: Day 10 runbook (go/no-go list, Live setup, Render variables, smoke test)
- `docs/PHASE2.md`: everything cut or found during the build

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

## Design decisions on the mockups (21 Oct)

Where the mockups promise data or behaviour DragonRent doesn't have:

- **Ratings:** show an owner's or renter's average rating only on the profile and booking
  (transaction) pages, where their reviews are loaded anyway. Not on listing cards or the item
  page's owner card.
- **"Verified" badge:** means the owner's identity was checked by Stripe for payouts. Publishing
  requires a verified Stripe account, so every published listing's owner qualifies; label it
  accordingly (e.g. "Verified by Stripe"), never as a manual or ID check DragonRent does itself.
- **Search sorting:** newest first, with keyword search. No "Closest first": Sharetribe can't sort
  by distance and search by keyword at the same time.
- **Distance ("1.2 km away"):** not on the item page; only on search results after a place search.
- **Approximate location:** fuzzy location is on (`src/config/configMaps.js`). The item page shows
  only the area and a circle on the map; the address is shown on the booking page after the owner
  accepts. This is UI-level only: the address is in listing public data.

### Open (revisit before launch; don't build a final version yet)

- **Fees.** The mockups show a renter service fee (€30 → €33) and "after our 10% fee" for owners
  (€30 → you get €27). Console is currently owner 15% (min €1), renter 0%. Until decided, never
  hard-code a fee percentage or a service-fee line in the UI: show what the line items actually
  contain, and keep fee wording in translation keys so it can change in one place.
- **Cancellation rule.** The item page mockup has a placeholder ("free until 2 days before
  pick-up"). The default booking process only lets the operator cancel, and transaction processes
  must not change, so the final text must describe what really happens. Keep the placeholder out
  of the live UI until the user decides.

## Status (23 Oct)

- **Days 0–9 code done**, all on `feature/redesign`, pushed to GitHub 23 Oct (not merged to `main`;
  production deploys from `main`, so merge by pull request after the signed-in test run, with the
  user's approval).
- **Staging (25 Oct):** https://dragonrent.onrender.com, Render service "dragonrent" (Free
  instance: sleeps when idle, first load up to a minute). Deploys from `feature/redesign`, so a
  push to that branch updates what the client sees. Uses the Dev marketplace and Stripe test keys.
- **Day 9:** 9a cookie banner, 9b Sentry, 9c legal drafts done. 9d test run: signed-out pages done
  (no overflow, Geist everywhere; fixed 36px phone inputs → 48px and added a Show/Hide password
  button in `FieldTextInput`). **Signed-in flows not tested yet**: waiting for
  `.env.test-accounts`. Do this first when it exists.
- **Day 10:** prep only (`docs/LAUNCH.md`, `docs/PHASE2.md`, server-rendering fix). Live plan,
  live Stripe, production Render service, domain and the real-card smoke test are the user's.
  DragonRent is not live.

## Day 8 decisions (22 Oct)

- **Search runs the map variant** (hosted layout says `map`), so the live page is
  `SearchPageWithMap.js`; `SearchPageWithGrid.js` isn't used.
- **Cards show "From €X / day"**: the search request fetches `price3DaysInSubunits` and
  `price7DaysInSubunits`. Price filter and price sort still use the 1-day price (known limitation).
- **Distance on cards** only after a place search whose area is under 10 km across (street,
  postcode, area); a city's bounds centre is too far off. No area name: listings don't store one.
- **Lend-an-item order:** Details → Photos → Prices → Location → Availability (Details first: the
  draft needs a title). Availability publishes. Step frame only for the booking process.
- **No "What you earn" box** on the Prices step until fees are decided (commission is server-only).
- **Booking calendar** is inline (`FieldDateRangeController`) with 44px cells (48px doesn't fit the
  392px panel); "Continue" goes to checkout, "Send request" is only on checkout.
- **"Request sent!"** (renter, preauthorized) and the owner's request view (waiting/accepted/
  declined, "You get" = `payoutTotal`) replace `PanelHeading` via display flags in
  `TransactionPage.stateDataBooking.js`. Decline asks for confirmation (`confirm` on the button
  props); transitions are unchanged.
- **Messages rows** keep the other person's avatar. Item photos need `listing.images` in the inbox
  query: explain and get approval first.

### Waiting for the user before launch (go/no-go list in `docs/LAUNCH.md`)

- **Decisions still open:** fees, cancellation rule (see "Open" above), booking-email discount
  line (below), and whether to use analytics at all (if not, remove the cookie banner's "count
  visits" line).

- **Booking emails don't show the duration discount.** `ext/transaction-processes/default-booking/
  templates` (new-request, accepted-request, money-paid) only render known line items, so a
  discounted rental shows "€15 × 3 days = €45" then "Total €30". Fix = add a
  `line-item/duration-discount` row to those templates, which is a transaction process change: needs
  the user's approval, then a push with the Sharetribe CLI. Not approved yet.
- **Console list** (handed over 22 Oct; status from the user 25 Oct). Done in Dev: branding colour
  #2457C5, listing thumbnail aspect 4:3 (Design → Layout), localization locale English, marketplace
  texts (Inbox → Messages, "Post a new listing" → "Lend an item", Owner/Renter keys). Confirmed:
  the "Included accessories" field id is `includedAccessories`. Still to do:
  - **Sign-up phone "(optional)":** the phone isn't a user field (User fields is empty); it's a
    built-in field set under User types. Change its label with the marketplace texts
    `SignupForm.phoneNumberLabel` and `ConfirmSignupForm.phoneNumberLabel`.
  - **Pages (not confirmed yet):** legal and help texts aren't approved, so they aren't pasted;
    first section title of each `/p/…` page as H1 when they are.
  - **Later:** footer links (Cancellation policy, Damage policy, FAQ) and booking email texts
    (Owner/Renter wording).
- **Test data** (in the app as the owner): close "aaa"/"aaaa"; drill 3-day €30 / 7-day €60; drill
  availability time zone is `Asia/Dhaka` and only Mondays are open: set Europe/Helsinki and open
  more days.
- **Legal pages (9c, 22 Oct):** drafts for Terms, Privacy, Cancellation policy, Damage policy and
  FAQ are in `docs/legal/` (all "Draft, needs legal review"), written from the real booking
  process. The user pastes the lawyer-reviewed text into the Console pages with the same ids and
  adds Cancellation policy, Damage policy and FAQ to the footer links. Checkout shows "By sending a
  request, you agree to the Terms of Service and the Cancellation policy" (no checkbox).
- **Sentry:** built in; needs `REACT_APP_SENTRY_DSN` and `REACT_APP_SENTRY_ENVIRONMENT` in Render
  (`docs/CONSOLE-SETUP.md` section 9). Analytics loads only after cookie consent
  (`src/util/cookieConsent.js`); no analytics ID is set yet.
- **Test logins** for headless screenshots go in `.env.test-accounts` (git-ignored):
  `RENTER_EMAIL`, `RENTER_PASSWORD`, `OWNER_EMAIL`, `OWNER_PASSWORD`. Not created yet; the wizard,
  checkout, booking and Messages pages haven't been checked in a browser.

## Console and hosted assets

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
- Search: `src/containers/SearchPage/SearchPageWithMap.js` (phone header in
  `SearchFiltersMobile`, `SearchResultsHeading`, `SearchFilterChips`, heading and summary text in
  `searchSummary.js`, empty state in `NoSearchResultsMaybe`). Cards: `src/components/ListingCard/`.
- Lend an item: `src/containers/EditListingPage/EditListingWizard/` (`StepFrame` for the header and
  Back/Next bar; forms' submit buttons compose `stepSubmit`).
- Booking dates: `src/components/OrderPanel/BookingDatesForm/`; calendar size and colours in
  `src/components/DatePicker/DatePickers/` (`cellSize` prop).
- Booking pages: `src/containers/TransactionPage/` (`RequestSent`, `OwnerRequest`,
  `ActionButtons` confirm). Messages: `src/containers/InboxPage/InboxPage.js` (`InboxItem`).
- Listing page: `src/containers/ListingPage/` (`ListingPageCarousel.js`: `ListingBreadcrumbs`,
  `SectionListingHeading`, galleries, `SectionPriceTiles`, `SectionOwner`, `SectionAboutRental`,
  `SectionWhatYouGet`, Details, `SectionMapMaybe` "Pick-up and return", `SectionReviews`). Price
  tiles and "From €X a day" use `src/util/durationPricing.js`. Similar listings are fetched by
  `fetchSimilarListingsThunk` in `ListingPage.duck.js`.
- Topbar: `src/containers/TopbarContainer/Topbar/` (`TopbarDesktop/PrimaryNav`).
- Dashboard: `src/containers/DashboardPage/` (`/dashboard`, read-only data).
- Checkout: presentation only in `src/containers/CheckoutPage/` ("Step 2 of 2", `RentalSummary`).
  Never change its payment logic.
- Cookie banner: `src/components/CookieConsent/`, choice stored by `src/util/cookieConsent.js`;
  analytics scripts are gated in `src/util/includeScripts.js` (`analyticsConsent`), wired in
  `src/app.js`. "Cookie settings" is in `SectionFooter`.
- Password Show/Hide: `src/components/FieldTextInput/` (any `type="password"` field).
- Global styles and colour variables: `src/styles/marketplaceDefaults.css` (form fields are 48px
  on every screen).

## Environment notes

- Windows dev machine. Git warns about LF/CRLF line endings, which is harmless.
- `.env` has a Stripe **test** publishable key and a Mapbox token. Never paste Stripe secret keys or
  the Sharetribe client secret into chat; they go in `.env`/Console/Render only.
- Staging runs on Render; its environment variables are set in the Render dashboard.
- `build/` is generated output. Rebuild it rather than editing it.
- Check server-side rendering after adding packages: `yarn build`, then
  `NODE_ENV=production PORT=4000 REACT_APP_MARKETPLACE_ROOT_URL=http://localhost:4000 node
  server/index.js`. The server build bundles CSS from node_modules
  (`config/sharetribeWebpackConfig.js`); without that, the Geist font import made every page a
  500 (fixed 23 Oct, so staging was broken from 21 Oct until that fix is deployed).
- Tests: `CI=true yarn test-ci` for everything (without `CI=true` it hangs in watch mode). Run
  Prettier only on files you edited.
- Stopping `yarn dev` can leave `scripts/start.js` and `server/apiServer.js` holding ports 3000 and
  3500; stop those node processes before starting it again. Don't build while dev is running.
- Screenshots: headless Chrome with `--remote-debugging-port=9333`, driven over CDP; capture the
  viewport, not the full page, for fixed bars. The map loads late.
- Never `git add` whole folders without checking `git status`: the user keeps untracked files in
  the repo (e.g. `src/assets/1 · Eye Key@2x.png`, the design zips).
