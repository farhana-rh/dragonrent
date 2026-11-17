# DragonRent design handoff

Read this before changing any UI. The visual reference for each mocked page is in `docs/design/mockups/*.html`. Open them in a browser or read their inline styles. Ignore `{{…}}` placeholders and `<sc-if>` / `<sc-for>` tags; they come from the design tool.

Identity: Arctic Blue + Geist + clean Nordic layouts + clear, simple booking that works for ages 8 to 80.

> **New direction, confirmed 17 Nov 2026: "Playful in the product, professional in the promise."**
> Neo-brutalist sticker styling for discovery (cream `#FAF8F5` paper, ink `#111111` 2px borders,
> hard `4px 4px 0` shadows, rounded-xl/2xl, collectible item cards, accents Coral `#FF5733`,
> Marigold `#FFC300`, Mint `#00C896`, Electric Blue `#2457C5`), and calm, plain zones for money,
> safety and trust (white, 1px light borders, line icons, no jokes). Font: Plus Jakarta Sans;
> secondary text never below 13px. Reference: `docs/design/mockups/HomeSticker.html`.
> It replaces Arctic Blue page by page as each page is rebuilt; until a page is rebuilt, the
> sections below still describe it. Cobalt `#2457C5` carries over as Electric Blue. The mockup's
> concept-only features (€2,500 guarantee, deposits, borrower ID checks, handoff photos, 48-hour
> payouts, ratings on cards, map/swipe views, newsletter) don't exist and stay out of the app.

## 1. Tokens

Map these onto the template's existing variables in `src/styles/marketplaceDefaults.css` (font family, marketplace colors, greys, success / fail / attention colors, border radius, shadows). Only add a new variable when no existing one fits. Never hard-code a hex value in a component.

```css
:root {
  /* Arctic Blue */
  --dr-snow: #F7FAFC;          /* page background */
  --dr-ice: #DCE8FA;           /* subtle surfaces, icon tiles, selected days, step numbers */
  --dr-cobalt: #2457C5;        /* brand, primary buttons, links, selected filters */
  --dr-cobalt-dark: #1B46A3;   /* hover / pressed */
  --dr-navy: #172B4D;          /* headings and main text */
  --dr-slate: #4A5B78;         /* secondary text (6.5:1 on Snow) */
  --dr-mist: #E7EBF0;          /* borders, dividers */
  --dr-white: #FFFFFF;         /* cards, inputs */

  /* Semantic */
  --dr-success: #108981;       /* icons only; white text on it is too faint (4.3:1) */
  --dr-success-tint: #DDF3F1;
  --dr-success-text: #0B6B65;  /* text on success tint */
  --dr-warning: #F59E0B;       /* stars, icons; never as text */
  --dr-warning-tint: #FEF3C7;  /* with Navy text */
  --dr-warning-dark: #B45309;  /* star outline, warning icons */
  --dr-error: #EF4444;         /* field borders and icons; error message text stays Navy */

  /* Shape */
  --dr-radius-chip: 8px;
  --dr-radius-control: 10px;   /* buttons, inputs */
  --dr-radius-card: 12px;
  --dr-shadow-card: 0 4px 14px rgba(23, 43, 77, 0.06);     /* clickable cards only */
  --dr-shadow-raised: 0 14px 40px rgba(23, 43, 77, 0.08);  /* search box, booking panel */
  --dr-focus-ring: 0 0 0 3px #2457C5;

  --dr-font: 'Geist', system-ui, sans-serif;
}
```

Also set the marketplace color and primary button color to `#2457C5` in Console → Branding, so emails and hosted pages match.

### Font

The `geist` npm package is built for Next.js's font loader, so don't use it here.

1. `yarn add @fontsource/geist`
2. In `src/index.js`, import `@fontsource/geist/400.css`, `500.css`, `600.css` and `700.css`.
3. Point the template's font variable at `var(--dr-font)`.
4. Remove the template's old font link.

## 2. Type scale (Geist only)

| Role | Size | Weight | Line height |
| --- | --- | --- | --- |
| Hero heading | 48–56px desktop, 40px phone | 700 | 1.1 |
| Page heading | 32px | 700 | 1.2 |
| Section heading | 24px (22px inside cards) | 600 | 1.2 |
| Listing title | 18px (16px in 2-column phone grids) | 600 | 1.3 |
| Price | 20–24px | 700 | 1.2 |
| Body | 16px | 400 | 1.5 |
| Field label | 15px | 600 | 1.4 |
| Navigation | 15px | 500 | — |
| Button | 16px (15px small) | 600 | — |
| Caption / metadata | 13px | 400–500 | 1.4 |

Nothing smaller than 13px.

## 3. Components

- **Primary button:** Cobalt background, white text, 16px/600, 48px tall (52px for the main action of a screen), 10px corners. Full width on phones. One per screen.
- **Secondary button:** white background, 1.5px Navy border, Navy text.
- **Text link:** Cobalt, 600.
- **Input:** white, 1px Mist border, 10px corners, 48–52px tall.
  - The label sits above the field (15px/600), the hint below it (13px Slate).
  - Focus shows the 3px Cobalt ring.
  - Error state is an Error border plus an icon, with the message text in Navy.
- **Card:** white, 1px Mist border, 12px corners. The card shadow only goes on cards you can click.
- **Filter chip:** 44px tall. Unselected is white with a Mist border; selected is Cobalt with white text and a check icon.
- **Status tag:** always an icon plus a word, 8px corners, 13px/600.
  - Waiting: Warning tint with Navy text.
  - Accepted: Success tint with Success-text.
  - Declined: Mist.
- **Price tiles:** 1 day, 3 days, 7 days, each showing the total and the per-day price. The cheapest per day gets a Cobalt border and a "Best price" tag in Success tint.
- **Listing card:**
  - 4:3 photo, then the title (18px/600).
  - "From €X / day": price 20px/700, the unit in 13px Slate.
  - Then distance · rating in 13px.
  - Optional "Free this weekend" line in Success-text. This is custom and costs API calls, so cut it first.
- **Step numbers:** Ice circle with a Cobalt number.
- **Icons:** Lucide-style, 2px stroke, always next to a word. Stars use Warning fill with a Warning-dark outline.
- **Tap targets:** at least 44px.

## 4. Rules every page must follow

1. One main button per screen; everything else is quieter.
2. Every tap area is at least 44px; main buttons are 48–52px.
3. Every icon has a word next to it. The menu button says "Menu".
4. Plain words, in short sentences a 9-year-old understands.
5. The full total, fees included, shows before any button that costs money.
6. Long tasks are split into steps marked "Step 2 of 5".
7. There is a Back button on every step, a check screen before sending, and a confirm before anything final.
8. A visible 3px Cobalt focus ring. Status is never shown by color alone.

## 5. Words we use

Change these in Console → Marketplace texts, not in the translation JSON.

| Say | Not |
| --- | --- |
| Send request | Request to book |
| Pick up · Return | Start date · End date |
| Lend an item | Create a listing |
| Owner · Renter | Provider · Customer |
| Messages | Inbox |
| Your card is only charged if they say yes | Payment is captured on acceptance |
| Something went wrong. Please try again. | Error 500: request failed |

## 6. Pages

### Mocked: match the mockup

| Page | Template container | Mockup file | Notes |
| --- | --- | --- | --- |
| Home | LandingPage (Console Pages) | Main, HomeDesktop | Hero plus search bar from Console Pages. "Popular near you" is a Featured listings section; hide it until there are 8+ real listings. Category tiles are a custom section. |
| Search | SearchPage | Search | On phones the list shows first, with a labelled "Map" button and filters in a full-screen sheet. Results heading reads "18 drills near Helsinki". |
| Item page | ListingPage | Listing, ListingDesktop | Price tiles, owner card with Verified badge (from a metadata field), approximate map. On phones, a fixed bottom bar with "Choose dates". |
| Pick dates | OrderPanel date picker | Dates | Day cells at least 44px, "Pick up" / "Return" labels, a live total, and "Your card is only charged if … says yes". |
| Check and send | CheckoutPage | Checkout | Summary, optional message, card, total, "Send request". |
| Request sent | TransactionPage (renter, right after checkout) | Sent | "What happens next" in 3 numbered steps at the top. |
| New request (owner) | TransactionPage (owner) | OwnerRequest | Accept / Decline, plus a confirm step before declining (custom). |
| Lend an item | EditListingPage wizard | ListPhotos, ListPrices | Tab order Photos → Details → Prices → Location → Availability. "Step X of 5" plus a progress bar. Back and Next in a bottom bar. The pricing step has the 1/3/7-day fields. |

### Not mocked: apply the system, keep the template's layout

| Page | Container | Notes |
| --- | --- | --- |
| Log in, Sign up | AuthenticationPage | One column, max width 440px, labels above fields, a show-password toggle, social logins as secondary buttons. |
| Password recovery and reset, email verification | PasswordRecoveryPage, PasswordResetPage, EmailVerificationPage | One message, one field, one button. |
| Messages | InboxPage | Rename to "Messages". Each row shows a photo, the title, the other person, the dates, a status tag and an unread dot. |
| Profile | ProfilePage | Avatar, name, Verified badge, "Member since", reviews, and their items in a card grid. |
| Settings | ProfileSettingsPage, ContactDetailsPage, PasswordChangePage, StripePayoutPage, PaymentMethodsPage, ManageAccountPage | One column, max width 640px, one card per group, a primary "Save" button. |
| Your items | ManageListingsPage | Listing cards with Edit / Close as secondary buttons. |
| Static pages | CMSPage via Console Pages | Text column max width 720px, body 16px. Covers About, Terms, Privacy, FAQ, Damage policy. |
| Not found | NotFoundPage | Friendly message, a search box and a link home. |

## 7. Don'ts

- Don't edit the transaction process.
- Don't hard-code colors, fonts or sizes. Use the tokens.
- Don't put UI wording in the translation JSON. Use Console's marketplace texts.
- Don't add new colors. If one seems needed, ask.

## 8. Check every page before calling it done

- [ ] DevTools → Computed → Rendered fonts says Geist.
- [ ] It looks right at 375px and 1440px, with no sideways scrolling.
- [ ] Only colors from section 1 are used.
- [ ] Tabbing through shows a focus ring on every control.
- [ ] Each screen has exactly one primary button.
