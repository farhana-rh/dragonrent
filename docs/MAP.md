# DragonRent code map

Where the main parts of the site live. Paths are relative to the repo root.

## Pages (`src/containers/`)

| Page | Main file | DragonRent additions |
| --- | --- | --- |
| Home | `LandingPage/LandingPage.js` | Code-based sections `Section*`, `HeroSearchForm`, `CategoryIcon`, `landingPageConfig.js` |
| Search | `SearchPage/SearchPageWithGrid.js` (+ `SearchPageWithMap.js`) | `SearchFilterChips`, primary/secondary filters |
| Listing | `ListingPage/ListingPageCarousel.js` | `Section*` blocks, `ListingBreadcrumbs`, similar listings in `ListingPage.duck.js` |
| Listing wizard | `EditListingPage/EditListingWizard/` | Pricing step: `EditListingPricingPanel/EditListingPricingForm.js` (tiers go here on Day 6) |
| Checkout | `CheckoutPage/CheckoutPageWithPayment.js` | `CheckoutSteps`, `RentalSummary`, restyled `DetailsSideCard` and `StripePaymentForm` |
| Inbox | `InboxPage/InboxPage.js` | — |
| Booking (order/sale) | `TransactionPage/TransactionPage.js` | — |
| Dashboard | `DashboardPage/DashboardPage.js` | New page, read-only data in `DashboardPage.duck.js` |
| Your listings | `ManageListingsPage/ManageListingsPage.js` | — |
| Top bar | `TopbarContainer/Topbar/` | `TopbarDesktop/PrimaryNav`, Dashboard menu link |
| Footer | `FooterContainer/`, `PageBuilder/SectionBuilder/SectionFooter/` | Restyled |
| Console pages (`/p/...`) | `CMSPage/CMSPage.js` → `PageBuilder/` | — |

Each page's data loading is in its `*.duck.js` (`loadData`), registered in
`src/containers/pageDataLoadingAPI.js` and `src/routing/routeConfiguration.js`.

## Shared components (`src/components/`)

- Listing card: `ListingCard/ListingCard.js` (+ `ListingCard.helpers.js`)
- Booking panel on the listing page: `OrderPanel/OrderPanel.js`, date picking in
  `OrderPanel/BookingDatesForm/`
- Price breakdown (listing, checkout, booking pages): `OrderBreakdown/`

## Pricing and payments

- **Price calculation (server):** `server/api-util/lineItems.js` builds the line items for every
  price shown and charged. Helpers in `lineItemHelpers.js`. Duration pricing goes here (Day 6),
  with tests in `lineItems.test.js`.
- **Price API endpoints:** `server/api/transaction-line-items.js` (price preview on the listing
  page), `server/api/initiate-privileged.js` and `transition-privileged.js` (booking request and
  later steps, which use the same line items)
- **Booking process (do not edit):** `ext/transaction-processes/default-booking/process.edn`;
  client-side mirror in `src/transactions/transactionProcessBooking.js`
- **Booking dates for display:** `src/util/bookingTimeRange.js` (dashboard and checkout)

## Configuration

- Local defaults: `src/config/` (`configBranding.js`, `configMaps.js`, `configListing.js`,
  `configSearch.js`, …). Hosted Console settings override most of these; merged in
  `src/util/configHelpers.js`.
- Environment: `.env` (not committed). Template: `.env-template`.
- Global styles and colour variables: `src/styles/marketplaceDefaults.css`; breakpoints in
  `src/styles/customMediaQueries.css`
- Text: `src/translations/en.json`, `fi.json` (new keys only; Console overrides existing ones)

## Server

- Express server and server-side rendering: `server/index.js`, `server/renderer.js`,
  `server/dataLoader.js`
- Own API routes: `server/apiRouter.js`
- Content Security Policy: `server/csp.js`
- robots.txt: `server/resources/robotsTxt.js`

## Project docs

- `CLAUDE.md` + `AGENTS.md`: rules for working in this repo
- `docs/SCOPE.md`: MVP scope and decisions
- `docs/FLOWS.md`: user flows and sitemap
- `docs/seed-listings.csv`: 20 test items for Dev/staging
