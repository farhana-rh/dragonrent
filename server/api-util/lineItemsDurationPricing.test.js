const { types } = require('sharetribe-flex-sdk');
const { Money } = types;
const {
  transactionLineItems,
  calculateDurationPriceInSubunits,
  DURATION_DISCOUNT_CODE,
} = require('./lineItems');
const { calculateTotalForCustomer, calculateTotalForProvider } = require('./lineItemHelpers');

// DragonRent duration pricing (docs/SCOPE.md → "Duration pricing rule"):
// - 1–2 days: daily price × days, capped at the 3-day price
// - 3–6 days: 3-day price ÷ 3 × days, capped at the 7-day price
// - 7+ days: 7-day price ÷ 7 × days
// - a missing tier falls back to the tier below; the total is rounded to whole cents once

const DAY = 24 * 60 * 60 * 1000;
const orderForDays = days => ({
  bookingStart: new Date(Date.UTC(2026, 9, 26)).toISOString(),
  bookingEnd: new Date(Date.UTC(2026, 9, 26) + days * DAY).toISOString(),
});

const dailyListing = (dailyPrice, price3Days, price7Days) => ({
  attributes: {
    price: new Money(dailyPrice, 'EUR'),
    publicData: {
      unitType: 'day',
      ...(price3Days != null ? { price3DaysInSubunits: price3Days } : {}),
      ...(price7Days != null ? { price7DaysInSubunits: price7Days } : {}),
    },
  },
});

describe('calculateDurationPriceInSubunits', () => {
  // The six worked examples in docs/SCOPE.md: daily €12, 3-day €30, 7-day €60
  it.each([
    [1, 1200],
    [2, 2400],
    [3, 3000],
    [6, 6000],
    [7, 6000],
    [10, 8571], // 60 ÷ 7 × 10 = 85.714… → €85.71
  ])('worked example: %i days costs %i cents', (days, expected) => {
    expect(calculateDurationPriceInSubunits(days, 1200, 3000, 6000)).toEqual(expected);
  });

  it('caps 3–6 days at the 7-day price', () => {
    // daily €20, 3-day €54 (€18/day), 7-day €100: 6 days would be €108
    expect(calculateDurationPriceInSubunits(5, 2000, 5400, 10000)).toEqual(9000);
    expect(calculateDurationPriceInSubunits(6, 2000, 5400, 10000)).toEqual(10000);
  });

  it('caps 1–2 days at the 3-day price', () => {
    // daily €20, 3-day €35: 2 days would be €40
    expect(calculateDurationPriceInSubunits(2, 2000, 3500, null)).toEqual(3500);
  });

  it('falls back to the tier below when a tier is missing', () => {
    // No 7-day price: 10 days use the 3-day rate
    expect(calculateDurationPriceInSubunits(10, 1200, 3000, null)).toEqual(10000);
    // No 3-day price: 4 days use the daily price, capped at the 7-day price
    expect(calculateDurationPriceInSubunits(4, 1200, null, 6000)).toEqual(4800);
    expect(calculateDurationPriceInSubunits(6, 1200, null, 6000)).toEqual(6000);
    // No tiers at all: daily price × days
    expect(calculateDurationPriceInSubunits(9, 1200, null, null)).toEqual(10800);
  });

  it('never charges more than the daily price × days', () => {
    // A 3-day price above 3 × daily (the form prevents this) is ignored by the cap
    expect(calculateDurationPriceInSubunits(3, 1000, 4000, null)).toEqual(3000);
  });

  it('rounds the total once, to whole cents', () => {
    // €10 for 3 days → €3.333…/day; 4 days = €13.333… → €13.33 (not €3.33 × 4 = €13.32)
    expect(calculateDurationPriceInSubunits(4, 500, 1000, null)).toEqual(1333);
    // €10 for 3 days; 5 days = €16.666… → €16.67
    expect(calculateDurationPriceInSubunits(5, 500, 1000, null)).toEqual(1667);
  });

  it('ignores tier prices that are not positive whole numbers', () => {
    expect(calculateDurationPriceInSubunits(3, 1200, 0, -5)).toEqual(3600);
    expect(calculateDurationPriceInSubunits(3, 1200, 29.5, '6000')).toEqual(3600);
  });
});

describe('transactionLineItems with duration pricing', () => {
  const providerCommission = { percentage: 15, minimum_amount: 100 };
  const customerCommission = { percentage: 0, minimum_amount: 0 };

  it('adds a discount line so the total matches the duration price', () => {
    const lineItems = transactionLineItems(
      dailyListing(1200, 3000, 6000),
      orderForDays(7),
      providerCommission,
      customerCommission
    );

    expect(lineItems[0]).toEqual({
      code: 'line-item/day',
      unitPrice: new Money(1200, 'EUR'),
      quantity: 7,
      includeFor: ['customer', 'provider'],
    });
    expect(lineItems[1]).toEqual({
      code: DURATION_DISCOUNT_CODE,
      unitPrice: new Money(2400, 'EUR'),
      quantity: -1,
      includeFor: ['customer', 'provider'],
    });
    // The renter pays the duration price: €84 − €24 = €60
    expect(calculateTotalForCustomer(lineItems).amount).toEqual(6000);
  });

  it('calculates the owner commission on the discounted total', () => {
    const lineItems = transactionLineItems(
      dailyListing(1200, 3000, 6000),
      orderForDays(7),
      providerCommission,
      customerCommission
    );
    const commission = lineItems.find(li => li.code === 'line-item/provider-commission');

    // 15% of €60, not of €84
    expect(commission.unitPrice).toEqual(new Money(6000, 'EUR'));
    expect(commission.percentage).toEqual(-15);
    expect(calculateTotalForProvider(lineItems).amount).toEqual(5100);
  });

  it('uses the minimum commission against the discounted total', () => {
    // 3 days at €3 (€1/day): 15% = €0.45, so the €1 minimum applies
    const lineItems = transactionLineItems(
      dailyListing(500, 300, null),
      orderForDays(3),
      providerCommission,
      customerCommission
    );

    expect(calculateTotalForCustomer(lineItems).amount).toEqual(300);
    expect(calculateTotalForProvider(lineItems).amount).toEqual(200);
  });

  it('adds no discount line when the duration price equals the full price', () => {
    const lineItems = transactionLineItems(
      dailyListing(1200, 3000, 6000),
      orderForDays(2),
      providerCommission,
      customerCommission
    );

    // A 0% renter fee adds no customer commission line (as configured in Console)
    expect(lineItems.map(li => li.code)).toEqual([
      'line-item/day',
      'line-item/provider-commission',
    ]);
  });

  it('keeps listings without tier prices exactly as before', () => {
    const lineItems = transactionLineItems(
      dailyListing(1200),
      orderForDays(7),
      providerCommission,
      customerCommission
    );

    // A 0% renter fee adds no customer commission line (as configured in Console)
    expect(lineItems.map(li => li.code)).toEqual([
      'line-item/day',
      'line-item/provider-commission',
    ]);
    expect(calculateTotalForCustomer(lineItems).amount).toEqual(8400);
    expect(lineItems[1].unitPrice).toEqual(new Money(8400, 'EUR'));
  });

  it('applies only to daily listings without seats', () => {
    const nightly = {
      attributes: {
        price: new Money(1200, 'EUR'),
        publicData: { unitType: 'night', price3DaysInSubunits: 3000 },
      },
    };
    const withSeats = { ...orderForDays(3), seats: 2 };

    const nightLineItems = transactionLineItems(nightly, orderForDays(3), null, null);
    const seatLineItems = transactionLineItems(dailyListing(1200, 3000), withSeats, null, null);

    expect(nightLineItems.map(li => li.code)).toEqual(['line-item/night']);
    expect(seatLineItems.map(li => li.code)).toEqual(['line-item/day']);
  });
});
