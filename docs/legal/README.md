# Legal and help pages: drafts

**All of these are drafts and need review by a lawyer before launch.** They describe how
DragonRent actually works in the code and in the Sharetribe booking process as of 22 Oct 2026, so
the lawyer can check the facts as well as the wording. Text in [square brackets] must be filled in.

| File | Console page id (Console → Content → Pages) | Link in |
| --- | --- | --- |
| `terms-of-service.md` | `terms-of-service` | Footer, sign-up, checkout |
| `privacy-policy.md` | `privacy-policy` | Footer, sign-up, cookie banner |
| `cancellation-policy.md` | `cancellation-policy` | Footer, checkout |
| `damage-policy.md` | `damage-policy` | Footer |
| `faq.md` | `faq` | Footer |

How to use them:

1. Send the four legal drafts to the lawyer together with `docs/SCOPE.md` (it lists what the
   service does and doesn't do).
2. Paste the reviewed text into each Console page, keeping the page ids above: the site links to
   those exact ids.
3. Keep the line "Draft, needs legal review" at the top of each page until the lawyer has approved
   it.
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
- Commission: the owner pays 15% of the rental price (at least €1); renters pay no service fee.
  Fees are still an open decision (docs/SCOPE.md), so the drafts point to the price shown at
  checkout instead of naming a percentage where possible.
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
| Fees | 20% from owners + a booking fee from renters | Service fees for guests and hosts | 15% from owners, none from renters | Yes: fee level |
| Cancellation | Each listing has its own policy; users cancel themselves | Each host picks a policy; guests cancel in the app | Only DragonRent can cancel, with a full refund | Yes: rule now; self-service needs a booking-system change |
| Damage | Insurance in many categories; renter pays a deductible | Host damage protection | No insurance, no deposit | Yes: who pays accidental damage |
| Late return | A day's rent per late day, charged automatically | Handled through the Resolution Centre | Agreed between renter and owner, with DragonRent's help | Yes: rule and how it's collected |
| Item not returned | Deposit up to the item's value charged to the card | Damage claim process | Details shared with the owner and police | Yes |
| Right of withdrawal | Waived for a rental starting on a set date | (separate EU rules) | Same approach as Hygglo, for the lawyer to confirm | Lawyer |
| Disputes and law | Finnish law, Consumer Disputes Board, Helsinki District Court | Local consumer law, EU dispute platform | Same as Hygglo | Lawyer |

Sources: [Hygglo terms](https://www.hygglo.fi/tos) and [Airbnb Terms of Service for European
users](https://www.airbnb.com/help/article/2908), both read 23 Oct 2026.
