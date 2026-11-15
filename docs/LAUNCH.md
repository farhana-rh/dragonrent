# Launch runbook (Day 10)

Step by step from the Dev setup to DragonRent live with real payments. The steps marked **You**
need your accounts, money or a decision; nobody else can do them. Allow about 6 hours, plus
waiting for Stripe and DNS.

## 0. Go / no-go: before you start

Don't switch to Live until all of these are ticked. Each one is also listed in `CLAUDE.md` under
"Waiting for the user".

- [ ] **Signed-in test run done (Day 9).** Renter and owner flows on phone and desktop: sign-up,
  lend an item, payouts, booking with a 3-D Secure test card, accept, decline, expiry, messages,
  reviews. Needs `.env.test-accounts`.
- [ ] **Legal pages reviewed by a lawyer** and pasted into Console (`docs/legal/README.md`).
- [x] **Fees decided:** owner 10% (minimum €1), renter 0%, set in Dev Console (7 Nov). Set the
  same in Live.
- [x] **Cancellation rule decided** (7 Nov): free within 24 hours of the request, no refund
  after; written in the Cancellation policy draft. Lawyer to confirm "no refund".
- [ ] **Booking email discount line:** the templates in the repo have the row (approved 25 Oct,
  guarded by `server/api-util/emailTemplates.test.js`), but Sharetribe still runs the old
  version. Push the process (section 1b) so emails stop showing "€45 … Total €30".
- [x] **Stripe live account verified** for the company (done, reported 6 Nov).
- [ ] **Console list done in Dev** (branding colour, image 4:3, footer, texts, emails), so it can be
  copied to Live.

## 1. Code: put the release on `main` (30 min)

All work is on the branch `feature/redesign`, pushed to GitHub (8 Nov) and running on staging.
`main` is still the original template.

1. Check staging (https://dragonrent.onrender.com) after the last push.
2. Open a pull request from `feature/redesign` to `main`, check the staging deploy, then merge.
3. Production deploys from `main`. Tag the release after the smoke test (step 7).

## 1b. Push the transaction process (30 min, needs your Sharetribe login)

The repo's `ext/transaction-processes/default-booking` differs from what Sharetribe runs: the
three booking emails have a "Longer rental discount" row (and, once the address-privacy work
lands, `transition/accept` carries `:action/update-protected-data`). Nothing in the app changes
until the process is pushed. **Do this in Dev first, test a booking, then repeat in Live.** Pushing
is not reversible by itself, but the alias can be moved back to the previous version.

1. Install the CLI once: `yarn global add flex-cli` (or `npm i -g flex-cli`), then
   `flex-cli login` with your Sharetribe account.
2. See what Sharetribe has and compare it with the repo (`-m` is the marketplace ID from Console →
   Build → General; Dev and Live have different IDs):

   ```shell
   flex-cli process list -m <marketplace-id>
   flex-cli process pull --process default-booking --alias release-1 --path tmp/default-booking-live -m <marketplace-id>
   git diff --no-index tmp/default-booking-live ext/transaction-processes/default-booking
   ```

   Expected differences: only the three `*-html.html` templates (and `process.edn` after the
   address-privacy change). Anything else means Console was edited by hand; stop and check.
3. Push and move the alias (the CLI validates the templates and refuses a broken one):

   ```shell
   flex-cli process push --process default-booking --path ext/transaction-processes/default-booking -m <marketplace-id>
   flex-cli process list --process default-booking -m <marketplace-id>   # note the new version number
   flex-cli process update-alias --process default-booking --alias release-1 --version <new> -m <marketplace-id>
   ```

   Transactions that already exist stay on their old version; new bookings use the new one.
4. Email wording: the templates fall back to English ("Longer rental discount"). If the
   marketplace emails are in Finnish, add `BookingNewRequest.DurationDiscountLabel`,
   `BookingAcceptedRequest.DurationDiscountLabel` and `BookingMoneyPaid.DurationDiscountLabel`
   in Console → Build → Content → Email texts (one language per marketplace, like the pages).
5. Check: book 3 days with the test card as a renter; the "new request" email shows
   "€15.00 × 3 days", "Longer rental discount −€15.00" and the right total.

## 2. Sharetribe Live (1 h)

1. **You:** subscribe to Sharetribe's Live plan (Console → Plan).
2. Copy the Dev setup to Live with Console's copy tool ("Copy no-code changes"): listing types,
   listing fields, categories, search settings, user types, pages, footer, branding, marketplace
   texts and email texts.
3. Check in Live Console:
   - **Transaction process:** the default booking process, unchanged (same alias as Dev).
   - **Commission:** the decided owner and renter fees.
   - **Localization:** locale and currency EUR.
   - **Marketplace URL** (Build → Advanced): `https://<your domain>`. Email links use it.
4. Note the Live **client ID** and **client secret** (Advanced → Applications). The secret goes
   only into Render, never into chat or Git.

## 3. Stripe live (1 h)

1. **You:** in the live Stripe account, finish business verification and Connect settings
   (platform name, branding, payout schedule).
2. Live **secret key** (`sk_live_…`) → Sharetribe Live Console → Payments. Never in Render, Git or
   chat.
3. Live **publishable key** (`pk_live_…`) → Render (step 4).

## 4. Production service on Render (1.5 h)

Create a new web service (don't reuse staging) from the GitHub repo, branch `main`.

- **Build command:** `yarn install --frozen-lockfile && yarn build`
- **Start command:** `yarn start`
- **Node version:** 22 or 24 (`package.json` engines), e.g. environment variable
  `NODE_VERSION=22.22.0`

Environment variables (Render → Environment):

| Name | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `REACT_APP_ENV` | `production` |
| `REACT_APP_SHARETRIBE_SDK_CLIENT_ID` | Live client ID |
| `SHARETRIBE_SDK_CLIENT_SECRET` | Live client secret |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | `pk_live_…` |
| `REACT_APP_MAPBOX_ACCESS_TOKEN` | Mapbox token (make a production token restricted to your domain) |
| `REACT_APP_MARKETPLACE_ROOT_URL` | `https://<your domain>` (no trailing slash) |
| `REACT_APP_MARKETPLACE_NAME` | `DragonRent` |
| `REACT_APP_SHARETRIBE_USING_SSL` | `true` |
| `SERVER_SHARETRIBE_TRUST_PROXY` | `true` |
| `REACT_APP_CSP` | `block` |
| `REACT_APP_SENTRY_DSN` | Sentry DSN (`docs/CONSOLE-SETUP.md` section 9) |
| `REACT_APP_SENTRY_ENVIRONMENT` | `live` |

Not on production: `BASIC_AUTH_USERNAME` / `BASIC_AUTH_PASSWORD` (they put a password on the site).
Analytics (`REACT_APP_GOOGLE_ANALYTICS_ID` or Plausible) only if you decided to use it; it loads
after cookie consent either way.

`REACT_APP_*` values are built into the site, so after changing one, redeploy (Render → Manual
deploy → Clear build cache & deploy).

## 5. Domain and email (1 h + DNS waiting)

1. **You:** Render → the production service → Settings → Custom domains: add `dragonrent.fi` (and
   `www`). Add the DNS records Render shows at your domain registrar. HTTPS is set up by Render.
2. When the domain works, check `https://<domain>/robots.txt` lists
   `Sitemap: https://<domain>/sitemap-index.xml`.
3. **You:** Sharetribe Live Console → Email settings: sender name "DragonRent" and a sender address
   on your domain; add the DNS records it shows (SPF/DKIM) so emails don't land in spam.
4. Mapbox: restrict the production token to `https://<domain>/*`.

## 6. Clean data

- Live starts empty: no test users or listings. Create the first real listings (or invite
  owners).
- Don't copy Dev's test listings ("aaa", "aaaa", the drill) to Live.

## 7. Smoke test on Live (1 h)

Use real cards and small amounts.

1. Open the site on a phone: homepage, search, an item page. The cookie banner appears; the font
   is Geist; the brand colour is cobalt.
2. Owner account: lend a real item with 1-, 3- and 7-day prices; connect live Stripe payouts;
   publish.
3. Renter account (a different email): book 3 days with your own card. Check the total, then
   "Request sent!" and the email.
4. Owner: accept. The card is charged; both get emails.
5. Live Console → Transactions: check the total, commission and payout; then **cancel** the
   booking to refund the card.
6. Sentry: the environment `live` appears (send the test error from `docs/CONSOLE-SETUP.md`).
7. Tag the release: `git tag v1.0 && git push origin v1.0`.

## If something goes wrong

- Site shows an error page: Render → Logs, and Sentry → Issues.
- A deploy broke the site: Render → Deploys → roll back to the previous deploy.
- Payments failing: Stripe dashboard → Developers → Logs (live mode).
