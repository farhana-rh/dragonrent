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
   only into Railway, never into chat or Git.

## 3. Stripe live (1 h)

1. **You:** in the live Stripe account, finish business verification and Connect settings
   (platform name, branding, payout schedule).
2. Live **secret key** (`sk_live_…`) → Sharetribe Live Console → Payments. Never in Railway, Git
   or chat.
3. Live **publishable key** (`pk_live_…`) → Railway (step 4).

## 4. Production service on Railway (1.5 h)

Production runs on Railway (decided 17 Nov). Staging stays on Render until you decide otherwise.
The app needs no code change for Railway: it listens on the `PORT` Railway gives it, builds with
`yarn build` and starts with `yarn start`.

1. **You:** create a Railway account and take the **Hobby** plan ($5 a month, which includes $5
   of usage). The trial credit runs out after 30 days, so don't run production on it.
2. **You:** New Project → Deploy from GitHub repo → allow Railway's GitHub app to read
   `farhana-rh/dragonrent` → pick the repo. Railway creates a service and starts a first build;
   it fails until the variables below are in, which is fine.
3. Service → Settings:
   - **Source → Branch:** `main` (after the pull request in step 1 is merged). For a test run
     before that, see "Try it first" below.
   - **Build → Custom build command:**
     `yarn install --frozen-lockfile --production=false && yarn build`. Railway's builder
     (Railpack) finds Yarn 1 from `yarn.lock` and installs on its own, but with
     `NODE_ENV=production` set Yarn may skip the dev dependencies, and webpack and Babel are dev
     dependencies. `--production=false` makes sure they're there (checked 17 Nov on a clean
     clone with `NODE_ENV=production`: install and build pass, the server answers on the given
     port).
   - **Deploy → Custom start command:** `yarn start`.
   - **Deploy → Healthcheck path:** `/healthz`. Railway probes it over plain HTTP from
     `healthcheck.railway.app` and needs a 200. Other paths answer that probe with a 301 to HTTPS
     (`REACT_APP_SHARETRIBE_USING_SSL=true` turns the redirect on) or a 401 behind basic auth, so
     the deploy would fail. `/healthz` answers before both (added 17 Nov, `server/index.js`).
   - **Deploy → Region:** EU West (Amsterdam), the closest to Finland.
   - **Serverless / app sleeping:** off. A sleeping site loses the first visitor's request.
4. Service → Variables: add the table below, then deploy. Don't add `PORT`; Railway sets it.
5. Service → Settings → Networking → **Generate Domain** gives a `….up.railway.app` address for a
   first check. While you test on it, `REACT_APP_MARKETPLACE_ROOT_URL` must be that address;
   change it to your own domain in step 5.

Environment variables (Railway → service → Variables, "Raw Editor" takes them all at once):

| Name | Value |
| --- | --- |
| `RAILPACK_NODE_VERSION` | `24` (the version the build and tests were checked with) |
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

`REACT_APP_*` values are built into the site when it builds, so after changing one, deploy again
(Railway offers "Deploy" after a variable change; otherwise Deployments → ⋮ → Redeploy).

The tester preview (section "Tester preview on Railway" at the end) runs in its own Railway
environment with the Dev values; production gets this section's Live values.

## 5. Domain and email (1 h + DNS waiting)

**What dragonrent.com points at (checked 17 Nov):** the domain is registered at GoDaddy, but its
DNS is on **Cloudflare** (nameservers `clayton.ns.cloudflare.com`, `vivienne.ns.cloudflare.com`),
so records are added in Cloudflare, not in GoDaddy. `www.dragonrent.com` already serves another
site, "Dragonrent - Rent Anything" (Next.js on AWS CloudFront), and `dragonrent.com` redirects to
it. **Pointing the domain at Railway replaces that site.** Decide that first, and find out who has
the Cloudflare login. Cloudflare can point the bare domain at Railway (CNAME flattening), so both
`dragonrent.com` and `www` work.

1. **You:** Railway → production service → Settings → Networking → **Custom Domain**: add
   `dragonrent.com` and `www.dragonrent.com`. Railway shows a **CNAME** and a **TXT**
   (`_railway-verify…`) record for each. Copy the exact values from Railway.
2. **You:** Cloudflare → dragonrent.com → DNS → Records: replace the current `www` CNAME (and the
   root record) with Railway's CNAMEs, and add the TXT records. Set the CNAMEs to **DNS only**
   (grey cloud) so Railway can issue the HTTPS certificate. Without the TXT record Railway answers
   404 even when the CNAME works.
3. Set `REACT_APP_MARKETPLACE_ROOT_URL` to `https://www.dragonrent.com` (or the bare domain if you
   prefer it as the main address), deploy again, and put the same address in Sharetribe Live
   Console → Marketplace URL. The three must match, or email links and sign-in break.
4. When the domain works, check `https://<domain>/robots.txt` lists
   `Sitemap: https://<domain>/sitemap-index.xml`.
5. **You:** Sharetribe Live Console → Email settings: sender name "DragonRent" and a sender address
   on your domain; add the DNS records it shows (SPF/DKIM) where your DNS is, so emails don't land
   in spam.
6. Mapbox: restrict the production token to `https://<domain>/*`.

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

- Site shows an error page: Railway → service → Deployments → View logs, and Sentry → Issues.
- Build fails: the build log in the same place. "Missing key assets" or a blank page usually
  means a wrong client ID or secret.
- A deploy broke the site: Railway → Deployments → an earlier deploy → ⋮ → Rollback.
- Payments failing: Stripe dashboard → Developers → Logs (live mode).

## Tester preview on Railway (Dev marketplace, test payments)

For the client and invited testers before Live (added 17 Nov). It uses the Sharetribe **Dev**
marketplace and Stripe **test** mode, so nobody can pay real money: Stripe refuses real cards in
test mode. It doesn't touch `www.dragonrent.com`, Live, or `main`.

1. **You:** Railway (Hobby plan, section 4 step 1) → New Project → Deploy from GitHub repo →
   `farhana-rh/dragonrent`. Rename the service `preview`.
2. Service → Settings:
   - **Branch:** `feature/redesign`.
   - **Custom build command:** `yarn install --frozen-lockfile --production=false && yarn build`
   - **Custom start command:** `yarn start`
   - **Healthcheck path:** `/healthz`, once the commit that adds it is on GitHub. Before that,
     leave it empty (the deploy then goes live as soon as the server starts).
   - **Region:** EU West. **App sleeping:** off.
3. Service → Variables (Raw Editor). The Dev values are the ones in your local `.env`; copy them
   from there, never into chat or Git:

   | Name | Value | Notes |
   | --- | --- | --- |
   | `RAILPACK_NODE_VERSION` | `24` | |
   | `NODE_ENV` | `production` | |
   | `REACT_APP_ENV` | `production` | `development` would switch off basic auth |
   | `REACT_APP_SHARETRIBE_SDK_CLIENT_ID` | Dev client ID | public, built into the site |
   | `SHARETRIBE_SDK_CLIENT_SECRET` | Dev client secret | **secret**, server only |
   | `REACT_APP_STRIPE_PUBLISHABLE_KEY` | `pk_test_…` | public; must start with `pk_test_` |
   | `REACT_APP_MAPBOX_ACCESS_TOKEN` | Mapbox token | public |
   | `REACT_APP_MARKETPLACE_ROOT_URL` | `https://<preview address>` | no trailing slash |
   | `REACT_APP_MARKETPLACE_NAME` | `DragonRent` | |
   | `REACT_APP_SHARETRIBE_USING_SSL` | `true` | |
   | `SERVER_SHARETRIBE_TRUST_PROXY` | `true` | |
   | `REACT_APP_CSP` | `block` | checked 17 Nov: no blocked content on any tester page |
   | `BASIC_AUTH_USERNAME`, `BASIC_AUTH_PASSWORD` | a shared tester login | recommended: keeps search engines and strangers off the test data |
   | `REACT_APP_SENTRY_DSN`, `REACT_APP_SENTRY_ENVIRONMENT` | optional, environment `preview` | |

   Every `REACT_APP_*` value is public once built into the site. The only secrets are the client
   secret and the basic-auth password. No volume, database or other service is needed.
4. Service → Settings → Networking → **Generate Domain** gives `https://<name>.up.railway.app`.
   Put that address in `REACT_APP_MARKETPLACE_ROOT_URL` and deploy again. To use
   `preview.dragonrent.com` instead: Networking → Custom Domain → `preview.dragonrent.com`, then
   add Railway's CNAME and TXT records in **Cloudflare** (DNS only), set the root URL to it and
   deploy again. That adds one record and leaves `www` alone.
5. **You:** Sharetribe **Dev** Console → Marketplace URL (Build → Advanced): the preview address,
   so verification and password-reset emails link to it instead of the old address.
6. Check: `https://<preview address>/healthz` shows `{"status":"ok"}`; the homepage, sign-up, log
   in, search, an item page and checkout open.

**For testers:** card `4242 4242 4242 4242`, any future expiry date, any CVC. Owners who publish
must connect payouts in Stripe's test mode: use Stripe's test values
(https://docs.stripe.com/connect/testing), never real ID or bank details.
