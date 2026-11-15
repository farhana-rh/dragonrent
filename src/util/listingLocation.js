import seedrandom from 'seedrandom';

import { destinationPoint } from './maps';

// DragonRent pick-up location (approved plan, 14 Nov 2026).
//
// Everything in a listing's public data and its `geolocation` attribute is public: the
// Marketplace API returns it to anyone with the (public) client ID. The exact pick-up address
// therefore never goes there. The listing stores:
//
// - publicData.location.area: the area name only ("Kallio, Helsinki"), for the item page and cards
// - geolocation: a point OFFSET from the real one by 100–400 m, for search and the area circle
// - privateData.pickup: the exact address, building and coordinates; only the owner's own
//   requests (ownListings.*) can read it
//
// When the owner accepts a request, the client copies privateData.pickup into the transaction's
// protectedData, which both parties can read (TransactionPage.duck.js). The item page's circle
// is 500 m (configMaps.fuzzy.offset) around the stored point, so the real point is always
// inside it.

/** Largest distance between the real point and the stored public point, in meters. */
export const PUBLIC_LOCATION_OFFSET_METERS = 400;
/** Smallest distance, so the stored point never happens to be the real one. */
const MIN_OFFSET_METERS = 100;
const TWO_PI = Math.PI * 2;

/**
 * Area name from a geocoder address such as "Fredrikinkatu 12, 00120 Helsinki, Finland":
 * the first comma-separated part that has no digits, after dropping the country, with a
 * leading postcode removed ("00120 Helsinki" → "Helsinki"). Never a street address.
 *
 * @param {string?} address full address from the geocoder
 * @returns {string|null} area name, or null when there is none
 */
export const areaFromAddress = address => {
  if (typeof address !== 'string') {
    return null;
  }
  const parts = address
    .split(',')
    .map(part => part.trim().replace(/^\d{5}\s+/, ''))
    .filter(part => part.length > 0);
  // The last part is the country
  const candidates = parts.length > 1 ? parts.slice(0, -1) : parts;
  return candidates.find(part => !/\d/.test(part)) || null;
};

/**
 * The public point for a listing: the real point moved 100–400 m in a direction that depends
 * only on the seed (the listing id), so saving the same location twice gives the same point.
 *
 * @param {LatLng} origin exact coordinates
 * @param {string} seed e.g. the listing id
 * @returns {LatLng} offset coordinates
 */
export const offsetPublicLocation = (origin, seed) => {
  const key = String(seed || 'dragonrent');
  const bearing = seedrandom(key)() * TWO_PI;
  const reversedKey = key
    .split('')
    .reverse()
    .join('');
  const distance =
    MIN_OFFSET_METERS +
    seedrandom(reversedKey)() * (PUBLIC_LOCATION_OFFSET_METERS - MIN_OFFSET_METERS);
  return destinationPoint(origin, distance, bearing);
};

/**
 * Area of a listing for display: the saved area, or (for listings saved before the area was
 * stored) one derived from the address string.
 *
 * @param {Object?} publicData listing public data
 * @returns {string|null} area name
 */
export const getPublicArea = publicData => {
  const location = publicData?.location;
  if (!location) {
    return null;
  }
  return typeof location.area === 'string' && location.area.length > 0
    ? location.area
    : areaFromAddress(location.address);
};
