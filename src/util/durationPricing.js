import { types as sdkTypes } from './sdkLoader';

const { Money } = sdkTypes;

// DragonRent duration pricing on the client: the price tiles and "From €X a day" shown to
// renters. The booking total itself is calculated on the server
// (server/api-util/lineItems.js), which is the source of truth.

const isPositiveInteger = value => Number.isInteger(value) && value > 0;

/**
 * Price tiles for a daily listing: 1 day, plus the 3-day and 7-day prices the owner has set
 * (publicData.price3DaysInSubunits and price7DaysInSubunits). The totals follow the duration
 * pricing rule in server/api-util/lineItems.js: a tier never costs more than the day price
 * times its days. The tile with the lowest price per day is marked as the best price when
 * there's more than one tile.
 *
 * @param {Money} price listing's day price
 * @param {Object} publicData listing's public data
 * @returns {Array<Object>} [{ days, total: Money, perDay: Money, isBestPrice }], empty if the
 * listing isn't priced per day
 */
export const getDurationPriceTiles = (price, publicData) => {
  if (!price || publicData?.unitType !== 'day' || !isPositiveInteger(price.amount)) {
    return [];
  }
  const daily = price.amount;
  const { price3DaysInSubunits: p3, price7DaysInSubunits: p7 } = publicData;

  const tiers = [{ days: 1, total: daily }];
  if (isPositiveInteger(p3)) {
    tiers.push({ days: 3, total: Math.min(p3, daily * 3) });
  }
  if (isPositiveInteger(p7)) {
    tiers.push({ days: 7, total: Math.min(p7, daily * 7) });
  }

  const perDayAmounts = tiers.map(t => Math.round(t.total / t.days));
  const lowest = Math.min(...perDayAmounts);
  const bestIndex = tiers.length > 1 && lowest < daily ? perDayAmounts.indexOf(lowest) : -1;

  return tiers.map((t, i) => ({
    days: t.days,
    total: new Money(t.total, price.currency),
    perDay: new Money(perDayAmounts[i], price.currency),
    isBestPrice: i === bestIndex,
  }));
};

/**
 * Lowest price per day of a daily listing ("From €8 a day"), or the listing price otherwise.
 *
 * @param {Money} price listing's price
 * @param {Object} publicData listing's public data
 * @returns {Money} lowest price per day
 */
export const getLowestDailyPrice = (price, publicData) => {
  const tiles = getDurationPriceTiles(price, publicData);
  return tiles.length > 0
    ? tiles.reduce((lowest, t) => (t.perDay.amount < lowest.amount ? t.perDay : lowest), price)
    : price;
};
