# Legal and help pages: drafts

**All of these are drafts and need review by a lawyer before launch.** They describe how
DragonRent actually works in the code and in the Sharetribe booking process as of 22 Oct 2026, so
the lawyer can check the facts as well as the wording. Text in [square brackets] must be filled in.

| File | Console page id (Console → Content → Pages) | Title on the site | Link in |
| --- | --- | --- | --- |
| `terms-of-service.md` | `terms-of-service` | Terms and conditions | Footer, sign-up, checkout |
| `privacy-policy.md` | `privacy-policy` | Privacy policy | Footer, sign-up |
| `cancellation-policy.md` | `cancellation-policy` | Cancellation and refund policy | Footer, checkout |
| `console/cookie-policy.md` | `cookie-policy` (**new page, create it**) | Cookie policy | Footer, cookie banner |
| `damage-policy.md` | `damage-policy` | Damage policy | Footer |
| `faq.md` | `faq` | FAQ | Footer |

**Ready to paste (17 Nov):** `console/` holds the public text of Terms, Privacy, Cancellation and
refund, and Cookie policy, without the notes for the lawyer. Each file says which Console fields
to fill (Title, Description, one Markdown text block). Send the lawyer the drafts in this folder
(with the notes); paste the `console/` versions into Console.

**Layout (17 Nov):** these pages and FAQ use one layout built in code
(`src/containers/CMSPage/LegalPage/`): a "Legal" label (FAQ: "Help"), the title, the text's first
line when it starts with "Last updated", a "Draft, needs legal review" tag, an "On this page" list
made from the `##` headings (when there are three or more), and links to the other policies. The
draft tag comes from `underReview` in `legalPages.js`: set it to `false` for a page once the
lawyer has approved it. The site doesn't render Markdown tables: use lists.

How to use them:

1. Send the four legal drafts to the lawyer together with `docs/SCOPE.md` (it lists what the
   service does and doesn't do).
2. Paste the reviewed text into each Console page, keeping the page ids above: the site links to
   those exact ids.
3. The "Draft, needs legal review" tag is shown by the code (`underReview` in
   `src/containers/CMSPage/LegalPage/legalPages.js`) until the lawyer has approved a page; the
   Console text doesn't need that line.
4. Console pages hold one language. Ask the lawyer whether the Finnish versions must be on the site
   at launch; if so, they need their own pages (for example `kayttoehdot`) and links.

Facts the drafts rely on (check if anything changes):

- Booking process: Sharetribe's default booking process, unchanged. The renter's card is held when
  the request is sent and charged only when the owner accepts. The owner has 6 days to answer, and
  no longer than one day after the pick-up day starts or until the return day, whichever comes
  first. Otherwise the request ends and the hold is released.
- Only DragonRent (the operator) can cancel an accepted booking; a cancellation refunds the renter
  in full. Owners and renters can't cancel in the app.
- Owners are paid through Stripe two days after the return day (Stripe then needs a few working
  days to reach the bank account).
- Commission: the owner pays 10% of the rental price (at least €1); renters pay no service fee
  (decided 7 Nov).
- Both sides can review each other for 7 days after the return day.
- No deposits, no insurance, no delivery fee in this version.

## Compared with Hygglo and Airbnb (23 Oct)

The client asked for terms like Hygglo's and Airbnb's. `terms-of-service.md` now covers the same
topics as both (Hygglo's Finnish terms have 17 sections; Airbnb's European terms split the same
ground into the main terms plus separate policies), written in DragonRent's own words: their text
is copyrighted, and it describes services DragonRent doesn't offer. Where the services differ, the
terms say what DragonRent really does and mark a **[Decision]**:

| Topic | Hygglo | Airbnb | DragonRent today | Decision needed |
| --- | --- | --- | --- | --- |
| Who the rental is between | Renter and owner; Hygglo is an intermediary | Host and guest; Airbnb isn't a party | Same: renter and owner | No |
| When the renter pays | Charged at booking, held until the rental ends | Charged at booking | Card held at request, charged when the owner accepts | No |
| Fees | 20% from owners + a booking fee from renters | Service fees for guests and hosts | 10% from owners, none from renters | No (decided 7 Nov) |
| Cancellation | Each listing has its own policy; users cancel themselves | Each host picks a policy; guests cancel in the app | Free within 24 h of the request, no refund after; DragonRent cancels by hand | Lawyer: is "no refund" allowed? Self-service needs a booking-system change |
| Damage | Insurance in many categories; renter pays a deductible | Host damage protection | No insurance, no deposit | Yes: who pays accidental damage |
| Late return | A day's rent per late day, charged automatically | Handled through the Resolution Centre | Agreed between renter and owner, with DragonRent's help | Yes: rule and how it's collected |
| Item not returned | Deposit up to the item's value charged to the card | Damage claim process | Details shared with the owner and police | Yes |
| Right of withdrawal | Waived for a rental starting on a set date | (separate EU rules) | Same approach as Hygglo, for the lawyer to confirm | Lawyer |
| Disputes and law | Finnish law, Consumer Disputes Board, Helsinki District Court | Local consumer law, EU dispute platform | Same as Hygglo | Lawyer |

Sources: [Hygglo terms](https://www.hygglo.fi/tos) and [Airbnb Terms of Service for European
users](https://www.airbnb.com/help/article/2908), both read 23 Oct 2026.
