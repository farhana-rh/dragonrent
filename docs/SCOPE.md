# DragonRent MVP scope

Frozen on Sun 18 Oct 2026, the evening before Day 1. Changes after today go to the Phase 2 list unless they fix a bug.

## Goal

A peer-to-peer rental marketplace for Finland (Hygglo-style), built on Sharetribe Web Template
v12.4.0, live with real payments on Wed 28 Oct 2026.

**Done means:** a renter finds an item by location and dates, sees the real price for their rental
period, sends a booking request, pays by card, messages the owner and leaves a review. An owner
lists an item with three price tiers, sets availability, connects payouts, accepts or declines, and
gets paid. It runs on production hosting.

## Decisions

| Topic | Decision | Decided |
| --- | --- | --- |
| Accounts | One account can both rent and lend (replace the Customer/Provider split in Console) | 18 Oct |
| Listing types | Daily rental only; remove "Hourly rental" in Console | 18 Oct |
| Pricing | Duration pricing: price for 1, 3 and 7 days, calculated on the server | 18 Oct |
| Languages | English and Finnish at launch; Finnish texts reviewed by a native speaker before launch | 18 Oct |
| Currency | EUR only | 8 Oct |
| Booking flow | Sharetribe's default booking process, unchanged: request → owner accepts → card charged | 8 Oct |
| Deposits | Not in MVP | 8 Oct |
| Favourites | Not in MVP (no hearts shown) | 8 Oct |
| Ratings on cards | Not shown; cards show "New" or nothing. Listing page shows a rating from its own reviews | 8 Oct |
| Info and legal pages | Console pages (`/p/...`); legal copy marked for legal review | 8 Oct |
| Analytics | Loaded only after cookie consent | 8 Oct |
| Checkout | No terms checkbox until rental terms and damage policy pages exist; simplified top bar | 17 Oct |
| Commission | Owner pays 15% (minimum €1); renters pay no service fee, so the listed price is the price | 20 Oct |
| Duration pricing cap | A shorter rental never costs more than the next longer package | 21 Oct |
| Location search | Suggestions limited to Finland | 21 Oct |
| Design system | "Arctic Blue + Geist" from `dragonrent-design/docs/DESIGN.md` replaces the orange/Inter design: cobalt #2457C5, Geist via `@fontsource/geist`, plain wording ("Send request", "Owner/Renter", "Messages") | 21 Oct |
| Text keys | New keys stay in `en.json`/`fi.json` (two languages); existing template wording is changed in Console's marketplace texts | 21 Oct |
| Listing card | Distance only after a place search; no rating on cards | 21 Oct |
| Verified badge | Console metadata field (Yes/No) set by the operator after an ID check; the check itself still to be defined | 21 Oct |
| Homepage | Stays code-built, restyled to the Main/HomeDesktop mockups; "Popular near you" hidden until 8+ listings | 21 Oct |

## In scope

Status: ✅ done · 🟡 partly done · ⬜ not started

| Feature | How | Day | Status |
| --- | --- | --- | --- |
| Search by location and dates | Console search settings, restyled homepage search | 2, 5 | 🟡 code done; Console search settings exist |
| Browse categories | Console categories (5 top-level, 3 subcategories each) + homepage category row | 2, 5 | ✅ |
| Popular/newest listings on home | Console "Featured listings" section + restyled section | 2, 5 | 🟡 needs the Console section and listings |
| Duration pricing (1, 3, 7 days) | Two optional price fields, server-side line items, price table on listing page, price range on cards | 6 | ⬜ |
| Booking request, owner accepts | Console listing type, default booking process | 2 | 🟡 listing type exists; no test booking yet |
| Card payment, payouts, commission | Stripe Connect (test mode now), Console commission | 2 | 🟡 Stripe test keys set; commission not set |
| Messaging | Built-in inbox, restyled | 8 | ⬜ restyle |
| Two-way reviews, rating on listing page | Built-in, restyled | 7 | ✅ listing page |
| Approximate location until booked | Fuzzy location setting in the template | 7 | ⬜ |
| Owner dashboard | `/dashboard` (requests waiting, active rentals, listings) | — | ✅ added 17 Oct |
| Restyled checkout | Presentation only | 8 | ✅ |
| Restyled search | Filter chips, cards | 8 | ✅ |
| Listing wizard tweaks | Fewer words, photo tips, pricing step for tiers | 6, 8 | ⬜ |
| Inbox and transaction page restyle | Presentation and status wording | 8 | ⬜ |
| Delivery option | Console listing field "Delivery possible" (yes/no) + note on listing page | 2, 7 | ⬜ |
| Cancellation terms | Console page `/p/cancellation-policy` + short block on listing page | 7, 9 | ⬜ |
| Legal pages | Terms, Privacy, Damage policy, Cancellation policy, FAQ, How it works | 9 | ⬜ |
| Cookie notice + analytics | Analytics after consent; Sentry error logging | 9 | ⬜ |
| Email texts | Console email templates (request, accepted, declined, reminders) | 8 | ⬜ |

## Console setup (Dev, checked 20 Oct)

- Users: one user type "Users" (`users-id`) with both Provider and Customer roles; phone optional
  at sign-up.
- Listing types: Daily rental only (unit day, default booking process). Listing type filter off.
- Categories: Tools & Equipment, Sports & Outdoor, Cameras & Photography, Home & Appliances,
  Furniture & Events, each with 3 subcategories.
- Listing fields: Item condition (required: New, Like new, Good, Fair; filter), Brand, Model,
  Included accessories, Delivery possible (Yes/No; filter), Delivery details (text).
- Search: location as main search; filters for category, dates (full days), price (0–500 €),
  keywords, condition, delivery.
- Commission: owner 15% (minimum €1), renter 0%. Minimum listing price €5.
- Branding: colours #c2410c; temporary square logo.
- Pages: landing-page with a "newest listings" section; how-it-works, faq, cancellation-policy,
  damage-policy (placeholders); terms-of-service and privacy-policy marked "needs legal review".
- Not yet: users and listings (Dev starts empty), test booking.

## Duration pricing rule (draft, to approve before Day 6)

Owners set a required **daily price** and two optional prices: **3-day price** and **7-day price**.

The draft rule from the build plan:

- 1–2 days: daily price × days
- 3–6 days: 3-day price ÷ 3 × days
- 7+ days: 7-day price ÷ 7 × days
- The total is rounded to whole cents once, at the end (not per day)
- A missing tier falls back to the tier below it
- Validation: the 3-day price can't be more than 3 × the daily price, and the 7-day price can't be
  more than 7 × the daily price

Worked examples (daily €12, 3-day €30, 7-day €60):

| Days | Rule | Total |
| --- | --- | --- |
| 1 | 12 × 1 | €12.00 |
| 2 | 12 × 2 | €24.00 |
| 3 | 30 ÷ 3 × 3 | €30.00 |
| 6 | 30 ÷ 3 × 6 | €60.00 |
| 7 | 60 ÷ 7 × 7 | €60.00 |
| 10 | 60 ÷ 7 × 10 = 85.714… | €85.71 |

**Cap (decided 21 Oct):** a rental never costs more than the next longer package. For 3–6 days the
total is the 3-day rate per day, capped at the 7-day price; for 1–2 days it is the daily price per
day, capped at the 3-day price (when one is set). This keeps prices increasing with length whatever
prices owners enter, so renters are never pushed to book extra days for free.

**Technical note for Day 6:** the price is calculated in `server/api-util/lineItems.js`, so the
browser can't change it. The booking process itself is not changed.

## Phase 2 (cut on purpose)

Bank ID login · damage insurance partner · owner response rate and time · mobile apps · security
deposits · paid delivery fee · favourites · business accounts · verified-user badge (until we define
what "verified" means and who checks it) · ratings on listing cards.

## Cut list if behind (cut from the top)

1. Cancellation terms block on the listing page (keep the policy page)
2. Inbox and transaction page restyle (keep the template's look)
3. Delivery option field
4. Price range on listing cards (keep "from €X/day")
5. Duration pricing (daily price only, as a last resort)

**Never cut:** booking and payment end to end, mobile layout, Terms and Privacy, the QA day.
