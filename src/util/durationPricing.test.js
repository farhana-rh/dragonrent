import { types as sdkTypes } from './sdkLoader';
import { getDurationPriceTiles, getLowestDailyPrice } from './durationPricing';

const { Money } = sdkTypes;
const eur = amount => new Money(amount, 'EUR');
const daily = (price3DaysInSubunits, price7DaysInSubunits) => ({
  unitType: 'day',
  price3DaysInSubunits,
  price7DaysInSubunits,
});

describe('getDurationPriceTiles', () => {
  it('shows 1, 3 and 7 days with the price per day and marks the best price', () => {
    // Worked example in docs/SCOPE.md: €12 a day, €30 for 3 days, €60 for 7 days
    const tiles = getDurationPriceTiles(eur(1200), daily(3000, 6000));
    expect(tiles.map(t => [t.days, t.total.amount, t.perDay.amount, t.isBestPrice])).toEqual([
      [1, 1200, 1200, false],
      [3, 3000, 1000, false],
      [7, 6000, 857, true],
    ]);
  });

  it('shows only the day price when no longer-rental prices are set', () => {
    const tiles = getDurationPriceTiles(eur(1200), daily());
    expect(tiles).toHaveLength(1);
    expect(tiles[0].isBestPrice).toEqual(false);
  });

  it('caps a tier at the day price times its days, like the server', () => {
    const tiles = getDurationPriceTiles(eur(1000), daily(4000));
    expect(tiles[1].total.amount).toEqual(3000);
    // Same price per day as 1 day: no best price
    expect(tiles.some(t => t.isBestPrice)).toEqual(false);
  });

  it('ignores invalid tier prices and listings not priced per day', () => {
    expect(getDurationPriceTiles(eur(1200), daily(0, '6000'))).toHaveLength(1);
    expect(getDurationPriceTiles(eur(1200), { unitType: 'hour' })).toEqual([]);
    expect(getDurationPriceTiles(null, daily(3000))).toEqual([]);
  });
});

describe('getLowestDailyPrice', () => {
  it('returns the lowest price per day', () => {
    expect(getLowestDailyPrice(eur(1200), daily(3000, 6000)).amount).toEqual(857);
  });

  it('returns the listing price without longer-rental prices', () => {
    expect(getLowestDailyPrice(eur(1200), daily()).amount).toEqual(1200);
    expect(getLowestDailyPrice(eur(1200), { unitType: 'hour' }).amount).toEqual(1200);
  });
});
