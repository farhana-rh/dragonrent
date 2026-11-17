# CLAUDE.md

@AGENTS.md

The general template conventions (architecture, styling, imports, forms, Redux, i18n) are in
AGENTS.md above. This file adds what is specific to DragonRent.

# Project: DragonRent

DragonRent is a rental marketplace MVP for Finland, built on Sharetribe Web Template v12.4.0, on a
10-day build plan. Launch was planned for 28 Oct 2026 but hasn't happened yet (see Status). Scope,
flows and a code map are in `docs/`:

- `docs/SCOPE.md`: frozen MVP scope, decisions and the duration pricing rule. Read it first.
- `docs/FLOWS.md`: renter and owner flows, sitemap
- `docs/MAP.md`: where each page, component and the pricing code live
- `docs/LAUNCH.md`: Day 10 runbook (go/no-go list, Live setup, Render service and variables,
  dragonrent.com domain, tester preview, smoke test)
- `docs/PHASE2.md`: everything cut or found during the build

## Design source of truth

**Before any UI work, read `dragonrent-design/docs/DESIGN.md` and the matching mockup in
`dragonrent-design/docs/design/mockups/`** (HTML files; open them in a browser or read their inline
styles).
If either is missing for the page you're about to change, stop and ask the user instead of designing
from older material. The new mockups replace the earlier `Rental App/` ("dhar") exports and
"DragonRent Mockups.pdf", which are kept only for reference.

**New visual direction (user, 17 Nov):** "Playful in the product, professional in the promise",
neo-brutalist sticker styling; reference `dragonrent-design/docs/design/mockups/HomeSticker.html`,
summary at the top of DESIGN.md. It replaces Arctic Blue page by page, in phases the user approves.
Its concept-only features (guarantee, deposits, ID checks, handoff photos, 48-hour payouts, ratings
on cards, map/swipe views, newsletter) don't exist and must not appear in the app.

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
- **Approximate location (data-level since 15 Nov):** the exact address and point are saved in
  the listing's `privateData.pickup` (owner only); public data holds the area name and the
  `geolocation` attribute is a point 100–400 m off (`src/util/listingLocation.js`, seeded with the
  listing id). The item page draws a 500 m circle around that point. On `transition/accept` the
  owner's client copies `pickup` into the transaction's `protectedData`
  (`TransactionPage.duck.js`), which is what the booking page shows the renter; the process has
  `:action/update-protected-data` on accept (push pending, `docs/LAUNCH.md` 1b). Listings saved
  before this keep a public address until their Location step is saved again (Dev: drill + the
  QA draft).

### Fees and cancellation (decided 7 Nov)

- **Fees: decided (7 Nov).** Owner pays 10% (minimum €1), renter pays nothing; set in Dev
  Console (checked 7 Nov), Live must match. The mockups' renter service fee (€30 → €33) is not
  used. Still never hard-code the percentage or a service-fee line in the UI: show what the line
  items actually contain, and keep fee wording in translation keys so it can change in one place.
- **Cancellation rule: decided (client, 7 Nov).** Free cancellation within 24 hours of sending
  the request; after that no cancellation and no refund, not even in part. Applied by hand: the
  renter emails DragonRent, which uses `operator-decline` (not yet accepted) or `cancel` (accepted,
  always a full refund); after 24 hours it doesn't cancel. The owner cancelling or not handing
  over the item still means a full refund. No transaction process change. The mockup's "free until
  2 days before pick-up" placeholder stays out of the UI. Open: the lawyer must confirm "no
  refund", and whether the window ends at pick-up if that is sooner.

## Status (10 Nov)

- **Not live.** The planned launch (28 Oct) has passed. Stripe live account verified (6 Nov).
  Fees and cancellation rule decided (7 Nov, see above). Pushed to `feature/redesign` on 8 Nov
  (so staging has it): fix for the phone hydration warning React #418 (`SearchPageWithMap.js`
  renders the map only after mount; `Topbar.js` renders as signed out until mounted; tests in
  `SearchPage.test.js` and the new `Topbar.test.js`), plus the 10% and cancellation doc updates.
- **15 Nov (committed on `feature/redesign`, not pushed):** the five audit fixes the user
  approved on 14 Nov: checkout cancellation rule (`7d1916959`), dependency resolutions
  (`7198036fd`, runtime audit clean), availability defaults (`2cea56a81`), email-template guard
  test and process-push steps (`fa826c2cd`), address privacy (`40cb1bf94`). Tests: server 203,
  client 1,237. **Gated on the user:** push to staging, process push (Dev then Live, `docs/LAUNCH.md`
  1b), re-saving the Dev listings' Location step, PR to `main`, Live setup. Audit report:
  https://claude.ai/artifact/PMLcdR5YPDBuT7DcV5F7c7
- **Hosting: Render (user, 17 Nov).** The client has Render Pro; Railway was considered the same
  day and dropped. Tester preview = the existing staging service "dragonrent" with Dev keys
  (`docs/LAUNCH.md`, last section); production = a new Render service from `main` (section 4).
  Build command `yarn install --frozen-lockfile --production=false && yarn build`, start
  `yarn start`, `NODE_VERSION=24` (engines `>=24.0.0` is open-ended). Health check path `/healthz`
  (17 Nov, `server/index.js`) answers before the HTTPS redirect and basic auth. Staging checked
  from outside 17 Nov: Free instance (27 s cold start), `http://` root URL, sign-in cookie not
  Secure, no CSP; the variables to fix that are in the runbook.
- **Domain (checked 17 Nov):** `dragonrent.com`, registered at GoDaddy, DNS on **Cloudflare**.
  `www.dragonrent.com` already serves another site ("Dragonrent - Rent Anything", Next.js on AWS
  CloudFront); pointing the domain at Render replaces it, so that needs the user's decision. The
  tester preview stays on `dragonrent.onrender.com`. Dev Console holds 178 listing categories (court rooms, patents, "Erotic"…), all
  shown in the Lend-an-item step and the search filter: a Console decision for the user.
- **Sticker redesign, Phase 1 (17 Nov, committed locally, not pushed):** homepage, shared top bar
  and footer, Plus Jakarta Sans via `@fontsource/plus-jakarta-sans` (Geist removed), sticker tokens
  in `marketplaceDefaults.css` (`--colorCream`, `--colorInk`, `--shadowHard`…). Homepage adds
  `SectionTrustStrip` (real payment facts + `<dialog>`), "Spin the block" (random loaded listing),
  rotating search prompts, and `SectionHostCta` became "What if something breaks?" (id
  `trust-and-safety`, the top bar's "Trust & Safety"). Phase 2 = search, cards, item page; Phase 3
  = booking, checkout, wizard, account. Other pages keep Arctic Blue until rebuilt.
- **Sticker redesign, Phase 2 (17 Nov, committed locally):** search page, ListingCard (sticker
  card with a marigold price tag, used everywhere) and the item page. Both pages put the global
  class `dr-sticker-page` on `<Page>`, which remaps the Arctic neutrals to ink/cream for every
  shared component inside; sticker shapes are added per component (filter pills, chips, map
  price labels, empty state, photo tiles, price tiles). The booking panel stays calm (money zone).
  A "New" sticker on cards needs `createdAt` in the search query: a search-data change, ask first.
- **Remaining work** (estimate 9 Nov): about 7–11 h of code and testing, 9–12 h of Console, Live
  and hosting setup by the user, plus waiting for the lawyer, the Finnish review and DNS.
- **Days 0–9 code done**, all on `feature/redesign`, pushed to GitHub 23 Oct (not merged to `main`;
  production deploys from `main`, so merge by pull request after the signed-in test run, with the
  user's approval).
- **Staging (25 Oct):** https://dragonrent.onrender.com, Render service "dragonrent" (Free
  instance: sleeps when idle, first load up to a minute). Deploys from `feature/redesign`, so a
  push to that branch updates what the client sees. Uses the Dev marketplace and Stripe test keys.
- **Day 9:** 9a cookie banner, 9b Sentry, 9c legal drafts done. 9d test run: signed-out pages done
  (no overflow, Geist everywhere; fixed 36px phone inputs → 48px and added a Show/Hide password
  button in `FieldTextInput`). **Signed-in run (25 Oct, local, headless Chrome):** all pages load
  at 375 and 1280 px with no overflow or console errors. Passed: dashboard, listings, Messages,
  account pages; Lend an item steps 1–5 (price validation and hints, Finland-only address, schedule)
  up to Publish, which asks for payouts (the +owner account has no Stripe yet; a draft "TEST – Bosch
  hammer drill" is left on it); renter books the drill (dates → checkout → 4242 card → "Request
  sent!" → message), order `6addcc38`, waiting for farhana04 to answer. Not yet tested: Stripe
  payout onboarding, accept/decline screens, 3-D Secure card, reviews, a 3+ day booking (discount).
  Found: availability schedule defaulted to the browser time zone with no days ticked (cause of the
  drill's Asia/Dhaka/Mondays; fixed 15 Nov: new schedules start in Europe/Helsinki, no day is
  pre-ticked, and Save/Publish wait until at least one day is ticked); Messages tab titles in
  Console hold both texts ("As a renter /
  Messages: As a renter"); footer placeholder slogan and "© Your marketplace"; logo PNG has a
  checkerboard baked in.
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
- **No "What you earn" box** on the Prices step (commission is server-only). Fees are now
  decided (7 Nov), so it can be built if the user asks.
- **Booking calendar** is inline (`FieldDateRangeController`) with 44px cells (48px doesn't fit the
  392px panel); "Continue" goes to checkout, "Send request" is only on checkout.
- **"Request sent!"** (renter, preauthorized) and the owner's request view (waiting/accepted/
  declined, "You get" = `payoutTotal`) replace `PanelHeading` via display flags in
  `TransactionPage.stateDataBooking.js`. Decline asks for confirmation (`confirm` on the button
  props); transitions are unchanged.
- **Messages rows** keep the other person's avatar. Item photos need `listing.images` in the inbox
  query: explain and get approval first.

### Waiting for the user before launch (go/no-go list in `docs/LAUNCH.md`)

- **Decisions still open:**
  - Analytics tool (Plausible or Google Analytics), below.
  - Legal **[Decision]** notes in `docs/legal/terms-of-service.md`: 3.5 banned items list, 5.4
    late return (can't be charged automatically), 8.4 who bears accidental damage (no insurance or
    deposit), 8.5 item not returned (no deposit to charge). Matching `[Rule to decide]` and
    `[Lawyer: …]` notes in `damage-policy.md`; summary table in `docs/legal/README.md`.
  - Cancellation: does the 24-hour window end at pick-up if that is sooner
    (`cancellation-policy.md`); lawyer to confirm "no refund".
  - Finnish legal pages at launch: ask the lawyer (`docs/legal/README.md` step 4). Console pages
    hold one language, so Finnish versions need their own page ids and links.
  - Cancellation rule on the item page (the Listing mockup has a slot for it): not built. At
    checkout it's done (10 Nov): `StripePaymentForm.cancellationRule` (en/fi) under the "only
    charged if … says yes" note. If the window changes (e.g. ends at pick-up), update that key.

- **Booking emails don't show the duration discount.** `ext/transaction-processes/default-booking/
  templates` (new-request, accepted-request, money-paid) only render known line items, so a
  discounted rental shows "€15 × 3 days = €45" then "Total €30". Fix = add a
  `line-item/duration-discount` row to those templates, which is a transaction process change.
  **Approved 25 Oct; rows added** ("Longer rental discount", keys `*.DurationDiscountLabel`);
  `server/api-util/emailTemplates.test.js` (15 Nov) fails if the server emits a booking line item
  the emails don't show. Still to do: push the process with the Sharetribe CLI and move the
  `release-1` alias, Dev first, then Live (`docs/LAUNCH.md` section 1b). Needs the user's
  approval and login; not done yet.
- **Analytics (25 Oct): yes**, tool to pick (Plausible or Google Analytics; both supported by env
  variables). Commission: 10% owner (minimum €1), renter 0%, set in Dev Console (7 Nov).
- **Console list** (handed over 22 Oct; Dev's hosted assets read 7 Nov). Done in Dev: branding
  colour #2457C5, listing image 4:3, search layout `map`, EUR, commission 10% owner (min €1) /
  0% renter, minimum listing price €5, only the `daily-rental` listing type
  (`default-booking/release-1`), one user type with both roles, phone shown at sign-up but not
  required, marketplace texts (Inbox → Messages, "Lend an item"). Still to do (7 Nov):
  - **Sign-up phone "(optional)":** `SignupForm.phoneNumberLabel` and
    `ConfirmSignupForm.phoneNumberLabel` still say "Phone number".
  - **Messages tab titles:** `InboxPage.ordersTabTitle`/`ordersTitle` and
    `salesTabTitle`/`salesTitle` hold both texts ("As a renter / Messages: As a renter").
  - **Footer:** placeholder slogan, "© 2026 Your marketplace", Sharetribe's own social links; only
    Terms and Privacy linked (add Cancellation policy, Damage policy, FAQ).
  - **Pages:** all five legal/help pages exist with short placeholders; paste the reviewed texts
    (first section title as H1). `/p/about` still has the template's text (not linked).
  - **Locale** is `en-US` (US dates); `en-GB` suits Finland better. Optional.
  - **Not readable from code:** logo (checkerboard in the PNG?), booking email texts
    (Owner/Renter wording), Live environment.
  - How to check: read the hosted assets with the SDK and the `.env` keys
    (`sdk.assetByAlias`, alias `latest`); `transactions/commission.json` needs the client
    secret (`assetsByAlias` after `exchangeToken`, as in `server/api-util/sdk.js`).
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
  `RENTER_EMAIL`, `RENTER_PASSWORD`, `OWNER_EMAIL`, `OWNER_PASSWORD`. Created 25 Oct and used
  for the signed-in run that day (see Status).

## Console and hosted assets

- Hosted `translations.json` contains every template key, so **editing an existing key in
  `src/translations/*.json` has no runtime effect**. Use NEW keys for changed copy, e.g.
  `"LandingPage.heroTitle"`.
- Hosted branding (colour, logo) overrides `src/config/configBranding.js`. The brand colour is cobalt
  `#2457C5` (DESIGN.md, 21 Oct); Console → Branding must be set to it for the design to show.
- Current Console state (Dev, checked 7 Nov) is in "Console list" above; the setup steps are in
  `docs/CONSOLE-SETUP.md`.
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
