# DragonRent user flows and sitemap

How renters and owners move through the site, which page each step happens on, and who sends what
email. Pages are the template's routes; "Console" means Sharetribe Console settings, not code.

Everyone has one account and can both rent and lend (see `SCOPE.md`).

## Renter flow

| # | Step | Page | Notes |
| --- | --- | --- | --- |
| 1 | Search by what, where and when | Home `/` | Hero search; Where needs the Mapbox token |
| 2 | Browse and filter results | Search `/s` | Filters: category, dates, price, condition, keywords |
| 3 | Open an item | Listing `/l/:slug/:id` | Photos, details, price tiers (Day 6), owner, reviews, map. The map shows the exact location until fuzzy location is turned on (Day 7) |
| 4 | Ask a question (optional) | Listing → inquiry form | Starts a conversation without booking |
| 5 | Pick dates, see the price for the period | Listing → booking panel | Price comes from the server (duration pricing) |
| 6 | Sign up or log in, if needed | `/signup`, `/login` | Email verification link |
| 7 | Request to book and enter card | Checkout `/l/:slug/:id/checkout` | Card is held, not charged yet |
| 8 | Wait for the owner | Inbox `/inbox/orders` → order `/order/:id` | Owner has up to 6 days, or until 1 day after the start if sooner, before the request expires |
| 9 | Request accepted, card charged | Order page + email | If declined or expired, the hold is released |
| 10 | Agree pickup in messages | Order page messages | With fuzzy location on, the exact address is shared here |
| 11 | Pick up, use, return | — (offline) | |
| 12 | Rental completes | Automatic, 2 days after the booking ends | The owner's payout is created at the same moment |
| 13 | Leave a review | Order page | Both sides review; 7-day review window |

## Owner flow

| # | Step | Page | Notes |
| --- | --- | --- | --- |
| 1 | Sign up and verify email | `/signup` | Same account type as renters |
| 2 | List an item | Wizard `/l/new` | Details → location → pricing (daily + 3/7-day) → availability → photos |
| 3 | Connect payouts | Wizard payout step, or `/account/payments` | Stripe Connect onboarding; needed before publishing |
| 4 | Publish | Wizard | Listing appears in search |
| 5 | Get a booking request | Email + Dashboard `/dashboard` | "Requests waiting" card and list |
| 6 | Review the request | Sale page `/sale/:id` | Full price breakdown and messages |
| 7 | Accept or decline | Sale page | Accept charges the renter's card |
| 8 | Agree handover in messages | Sale page messages | |
| 9 | Hand over, get the item back | — (offline) | |
| 10 | Get paid | Automatic after completion | Payout to the owner's bank account, minus commission |
| 11 | Leave a review | Sale page | |
| 12 | Manage listings and availability | `/listings`, wizard | Close, reopen, edit prices and calendar |

## Emails (Console → Email texts)

Booking request received (owner) · request accepted / declined / expired (renter) · booking reminder ·
review reminder · new message · email verification · password reset. Wording is edited in Console
on Day 8.

## Sitemap

**Public**
- `/` Home
- `/s` Search (list and map)
- `/l/:slug/:id` Listing
- `/u/:id` Public profile
- `/p/:pageId` Console pages: about, how-it-works, faq, terms, privacy, cancellation-policy,
  damage-policy (to create on Day 9)
- `/login`, `/signup`, `/recover-password`, `/reset-password`, `/verify-email`

**Logged in**
- `/dashboard` Dashboard (DragonRent addition)
- `/inbox/orders`, `/inbox/sales` Inbox
- `/order/:id` Booking as renter · `/sale/:id` Booking as owner
- `/l/:slug/:id/checkout` Checkout
- `/l/new`, `/l/:slug/:id/:type/:tab` Listing wizard
- `/listings` Your listings
- `/profile-settings` Profile
- `/account/contact-details`, `/account/change-password`, `/account/payments` (payouts),
  `/account/payment-methods`, `/account/manage` (delete account)

**Not public**
- `/styleguide` Component previews (development)
- `/preview` Console page previews
