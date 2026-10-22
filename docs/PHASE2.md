# Phase 2 backlog

Everything cut from the 10-day MVP or found during the build, roughly in order of value. Items cut
on purpose in `docs/SCOPE.md` are marked "scope".

## Money and trust

- **Booking emails show the duration discount line.** Needs a transaction process template change
  (approval, then push with the Sharetribe CLI). Until then discounted rentals show "€45 … Total
  €30" in emails. *Do before launch if possible.*
- **Fees:** renter service fee or not; the "What you earn" box on the Prices step once decided
  (needs the commission from the server).
- **Cancellation by renters and owners in the app** (today only the operator can cancel). Needs a
  transaction process change.
- **Security deposits** (scope) and **damage insurance partner** (scope).
- **Bank ID login** (scope).
- **Paid delivery fee** (scope).

## Search and listings

- **Price filter and sort by the "From €X / day" price.** They use the 1-day price today; needs
  the lowest daily rate stored where the API can filter on it.
- **Distance for city-wide searches:** pass the searched point (not only the area) through the
  search URL.
- **Area name on cards** ("Kallio"): store the neighbourhood with the listing location.
- **"Delivery possible" badge on cards:** one more field in the search request.
- **Calendar opens on the first month with free days** instead of the current month.
- **Ratings on listing cards** (scope).
- **Favourites** (scope).

## Pages and polish

- **Messages rows with the item photo** (needs item images in the inbox request).
- **Profile page restyle:** Verified badge, "Member since", owner's rating, "Items" wording
  (DESIGN.md §6).
- **Settings pages restyle:** one column, one card per group (DESIGN.md §6).
- **Lend an item, Photos first** as in the mockup (needs photos held until the draft exists).
- **Item page total card** repeats the booking dates already shown in the Pick up / Return tiles.
- **Search page hydration warning on phones** (React #418): the server and the first browser
  render differ by the map check; React repairs it, but it should be removed.
- **Finnish legal pages** and native-speaker review of all Finnish texts.
- **Owner response rate and time** (scope).
- **Mobile apps** (scope) and **business accounts** (scope).
