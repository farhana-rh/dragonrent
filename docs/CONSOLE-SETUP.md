# Console setup (Day 2)

Status 21 Oct: steps 1–6 done and checked in Dev. Step 7 in progress (drill + 2 test listings to close). Step 8: first test booking (1 day, €12) requested, paid and accepted on 21 Oct; completion, payout and reviews follow after 28 Oct. The logo is a
square placeholder; replace it with a wide (about 5:1) transparent PNG when the final logo exists.

Step-by-step Sharetribe Console settings for DragonRent. Do everything in the **Dev** environment
first (the local site uses Dev), then copy the same settings to Test and Live before launch.

Menu names come from Sharetribe's help centre (October 2026). If a menu has moved, search the help
centre for the step's topic.

## 1. Accounts: everyone can rent and lend (10 min)

Decision: one account that both rents and lends (`SCOPE.md`). Sharetribe says user types aren't
needed for this: without them, every user can be both a customer and a provider.

- [x] Console → **Build → Users → User types**
- [x] Delete the **Customer** and **Provider** user types. Dev has no users yet, so nothing breaks.
  - If Console won't let you delete them, keep one type, rename it "Member", turn on **both** roles
    (Provider and Customer) and the "Post & manage listings" and "Payout details" links, then delete
    the other type.
- [x] Check: http://localhost:3000/signup no longer asks you to choose an account type (refresh the
  page after saving).

## 2. Listing types: daily rental only (5 min)

- [x] Console → **Build → Listings → Listing types**
- [x] Delete **Hourly rental**. Keep **Daily rental** (unit: day, default booking process, EUR).
- [x] Console → **Build → Listings → Listing search**: turn **off** the listing type filter (with one
  type it does nothing).

## 3. Listing fields: delivery (10 min)

Existing fields stay as they are: Item condition (required), Brand, Model, Included accessories.

Add two fields (Console → **Build → Listings → Listing fields → Add**):

| Label | Key | Type | Required | Search filter | Help text |
| --- | --- | --- | --- | --- | --- |
| Delivery possible | `deliveryPossible` | Yes/No (boolean) | No | Yes, secondary | "Can you bring the item to the renter?" |
| Delivery details | `deliveryDetails` | Text | No | No | "Where you deliver and any fee to agree in messages, e.g. 'Helsinki centre, €10'" |

- [x] Both fields apply to the Daily rental listing type and all categories.
- [x] A paid delivery fee is Phase 2. For now the fee is agreed in messages, not charged at checkout.

## 4. Commission (5 min)

- [x] Console → **Monetization → Commission** (Sharetribe's help: "How to set your marketplace
  commission rates")
Decided 20 Oct: the owner pays everything, so renters pay exactly the listed price.

- [x] Provider commission: **15 %** (taken from the owner's payout)
- [x] Provider minimum commission: **100** (entered in **cents**: 100 = €1). The marketplace takes
  whichever is higher, the percentage or the minimum; the minimum covers Stripe's fees on small
  rentals.
- [x] Customer service fee: **0 %**, minimum **0**
- [x] Ask an accountant whether the 15% should include Finnish VAT.

Decide the numbers before this step. Stripe's card fees come out of the marketplace's commission,
so the minimum should cover them on small rentals.

## 5. Branding (10 min)

- [x] Console → **Build → Design → Branding**
- [x] Marketplace colour: **#c2410c** (the orange the redesign is built on; currently purple
  #6938EF in Console, which overrides the code)
- [x] Logo: upload the DragonRent logo (temporary: `src/assets/dragonrent-logo.svg`, exported as PNG
  if Console doesn't accept SVG)
- [x] App icon and social sharing image: upload when the final logo exists

## 6. Pages (20 min)

Console → **Build → Content → Pages**

- [x] **landing-page**: add a section with the **Listings** template ("Featured listings"). Choose
  "newest listings". The homepage code shows it as "New on DragonRent". The homepage's other
  sections are built in code, so other Console sections on this page are not shown.
  - Don't make it the first section (Sharetribe's advice: it loads with a short delay).
- [x] Create placeholder pages, published but short, to be written on Day 9:
  - `how-it-works`: How it works
  - `faq`: FAQ
  - `cancellation-policy`: Cancellation policy
  - `damage-policy`: Damage policy
- [x] Check that **terms-of-service** and **privacy-policy** exist. Mark their text "Draft, needs
  legal review" until a lawyer has checked it.

## 7. Seed listings (2 h, needs photos)

Uses `docs/seed-listings.csv`.

- [ ] Sign up owner A and owner B at http://localhost:3000/signup (Gmail aliases such as
  `you+dragonrent-a@gmail.com`), verify both emails
- [ ] As owner A, create items 1–10 with **List an item**; as owner B, items 11–20
- [ ] On the first listing of each owner, connect payouts with Stripe's **test** data (test mode,
  nothing real is checked or paid)
- [ ] Check http://localhost:3000/s shows 20 listings

## 8. One test booking end to end (30 min)

- [x] Sign up a renter (`you+dragonrent-renter@gmail.com`), verify the email
- [ ] As the renter, book one of owner A's items for 3 days. Pay with Stripe's test card
  **4242 4242 4242 4242** (any future date, any CVC). Try a 3D Secure test card too.
- [x] As owner A, open `/dashboard` → **Review request** → **Accept**
- [ ] The booking completes automatically 2 days after its end date. To finish sooner, the operator
  can complete it from the transaction in Console, if Console offers that action.
- [ ] Both leave a review
- [ ] In Console → **Transactions**, check the total, the commission and the payout

**Done when:** the test booking, its commission and the payout show in Console.

## After Day 2

- [ ] Note what you set (commission numbers, field keys) in this file, so Test and Live get the same.
- [ ] Before launch, copy the Dev settings to the other environments (Sharetribe tutorial: "Copy
  no-code changes from Test to Dev"; the same tool works between other environments).

## 9. Error monitoring: Sentry (Day 9, 20 min)

The template already sends errors to Sentry from the browser and the server; it only needs a key.

- [ ] Create a free account at sentry.io and a project of type **React** (one project is enough
  for both the browser and the server).
- [ ] Copy the project's **DSN** (Settings → Client Keys). It's a public key, not a secret.
- [ ] In the Render dashboard, add to the staging service:
  - `REACT_APP_SENTRY_DSN` = the DSN
  - `REACT_APP_SENTRY_ENVIRONMENT` = `staging`
- [ ] On the live service (Day 10) use the same DSN with `REACT_APP_SENTRY_ENVIRONMENT` = `live`.
- [ ] Redeploy, open the site, and check that Sentry shows the environment. To send a test error,
  open the browser console on the site and run
  `setTimeout(() => { throw new Error('Sentry test'); })`.
- [ ] In Sentry → Alerts, turn on an email alert for new issues.

What Sentry receives: error messages, the page address, the browser, and the signed-in user's id
(a random id, not their name or email). Mention error monitoring in the privacy policy.
