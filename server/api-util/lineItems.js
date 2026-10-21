const {
  calculateQuantityFromDates,
  calculateQuantityFromHours,
  calculateShippingFee,
  getProviderCommissionMaybe,
  getCustomerCommissionMaybe,
} = require('./lineItemHelpers');
const { types } = require('sharetribe-flex-sdk');
const Decimal = require('decimal.js');
const { Money } = types;

/**
 * DragonRent duration pricing (docs/SCOPE.md → "Duration pricing rule").
 *
 * Owners of daily listings can set two optional prices next to the daily price, saved in the
 * listing's public data in subunits (cents): price3DaysInSubunits and price7DaysInSubunits.
 * They are read from the listing on the server, never from the request.
 */
exports.DURATION_DISCOUNT_CODE = 'line-item/duration-discount';

const isTierPrice = value => Number.isInteger(value) && value > 0;

/**
 * Total price in subunits for a daily rental of the given length.
 *
 * - 1–2 days: daily price × days, capped at the 3-day price
 * - 3–6 days: 3-day price ÷ 3 × days, capped at the 7-day price
 * - 7+ days: 7-day price ÷ 7 × days
 * - A missing tier falls back to the tier below it.
 * - A rental never costs more than the next longer package, nor more than daily price × days.
 * - The total is rounded to whole subunits once, at the end.
 *
 * @param {number} days number of booked days
 * @param {number} dailyPriceInSubunits listing price for one day
 * @param {number?} price3DaysInSubunits optional price for 3 days
 * @param {number?} price7DaysInSubunits optional price for 7 days
 * @returns {number} total price in subunits
 */
exports.calculateDurationPriceInSubunits = (
  days,
  dailyPriceInSubunits,
  price3DaysInSubunits,
  price7DaysInSubunits
) => {
  const has3Days = isTierPrice(price3DaysInSubunits);
  const has7Days = isTierPrice(price7DaysInSubunits);
  const fullPrice = new Decimal(dailyPriceInSubunits).times(days);

  // Per-day rate for this length of rental; a missing tier falls back to the tier below
  const dailyRate =
    days >= 7 && has7Days
      ? new Decimal(price7DaysInSubunits).dividedBy(7)
      : days >= 3 && has3Days
      ? new Decimal(price3DaysInSubunits).dividedBy(3)
      : new Decimal(dailyPriceInSubunits);

  let total = dailyRate.times(days);
  // Never more than the next longer package
  if (days < 3 && has3Days) {
    total = Decimal.min(total, price3DaysInSubunits);
  }
  if (days < 7 && has7Days) {
    total = Decimal.min(total, price7DaysInSubunits);
  }
  // Never more than the daily price (protects against tier prices above daily price × days)
  total = Decimal.min(total, fullPrice);

  return total.toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber();
};

/**
 * Discount line item that brings a daily booking's total down to its duration price,
 * or null when there is no discount. Uses a negative quantity, like the provider commission.
 *
 * @param {Object} order the base line item (daily price × days)
 * @param {Object} publicData listing public data with optional tier prices
 * @returns {Object|null} { discountLineItem, discountedTotal } or null
 */
const getDurationDiscountMaybe = (order, publicData) => {
  const { price3DaysInSubunits, price7DaysInSubunits } = publicData || {};
  const { unitPrice, quantity } = order;
  if (!(unitPrice instanceof Money) || !Number.isInteger(quantity) || quantity < 1) {
    return null;
  }

  const fullPrice = unitPrice.amount * quantity;
  const durationPrice = exports.calculateDurationPriceInSubunits(
    quantity,
    unitPrice.amount,
    price3DaysInSubunits,
    price7DaysInSubunits
  );
  const discount = fullPrice - durationPrice;
  if (discount <= 0) {
    return null;
  }

  return {
    discountLineItem: {
      code: exports.DURATION_DISCOUNT_CODE,
      unitPrice: new Money(discount, unitPrice.currency),
      quantity: -1,
      includeFor: ['customer', 'provider'],
    },
    discountedTotal: new Money(durationPrice, unitPrice.currency),
  };
};

/**
 * Get quantity and add extra line-items that are related to delivery method
 *
 * @param {Object} orderData should contain stockReservationQuantity and deliveryMethod
 * @param {*} publicData should contain shipping prices
 * @param {*} currency should point to the currency of listing's price.
 */
const getItemQuantityAndLineItems = (orderData, publicData, currency) => {
  // Check delivery method and shipping prices
  const quantity = orderData ? orderData.stockReservationQuantity : null;
  const deliveryMethod = orderData && orderData.deliveryMethod;
  const isShipping = deliveryMethod === 'shipping';
  const isPickup = deliveryMethod === 'pickup';
  const { shippingPriceInSubunitsOneItem, shippingPriceInSubunitsAdditionalItems } =
    publicData || {};

  // Calculate shipping fee if applicable
  const shippingFee = isShipping
    ? calculateShippingFee(
        shippingPriceInSubunitsOneItem,
        shippingPriceInSubunitsAdditionalItems,
        currency,
        quantity
      )
    : null;

  // Add line-item for given delivery method.
  // Note: by default, pickup considered as free and, therefore, we don't add pickup fee line-item
  const deliveryLineItem = !!shippingFee
    ? [
        {
          code: 'line-item/shipping-fee',
          unitPrice: shippingFee,
          quantity: 1,
          includeFor: ['customer', 'provider'],
        },
      ]
    : [];

  return { quantity, extraLineItems: deliveryLineItem };
};

const getOfferQuantityAndLineItems = orderData => {
  return { quantity: 1, extraLineItems: [] };
};

/**
 * Get quantity for digital items. The quantity is always 1, you can't have multiples of digital files.
 * @param {Object} orderData
 */
const getDigitalItemQuantityAndLineItems = orderData => {
  return { quantity: 1, extraLineItems: [] };
};

/**
 * Get quantity for fixed bookings with seats.
 * @param {Object} orderData
 * @param {number} [orderData.seats]
 */
const getFixedQuantityAndLineItems = orderData => {
  const { seats } = orderData || {};
  const hasSeats = !!seats;
  // If there are seats, the quantity is split to factors: units and seats.
  // E.g. 1 session x 2 seats (aka unit price is multiplied by 2)
  return hasSeats ? { units: 1, seats, extraLineItems: [] } : { quantity: 1, extraLineItems: [] };
};

/**
 * Get quantity for arbitrary units for time-based bookings.
 *
 * @param {Object} orderData
 * @param {string} orderData.bookingStart
 * @param {string} orderData.bookingEnd
 * @param {number} [orderData.seats]
 */
const getHourQuantityAndLineItems = orderData => {
  const { bookingStart, bookingEnd, seats } = orderData || {};
  const hasSeats = !!seats;
  const units =
    bookingStart && bookingEnd ? calculateQuantityFromHours(bookingStart, bookingEnd) : null;

  // If there are seats, the quantity is split to factors: units and seats.
  // E.g. 3 hours x 2 seats (aka unit price is multiplied by 6)
  return hasSeats ? { units, seats, extraLineItems: [] } : { quantity: units, extraLineItems: [] };
};

/**
 * Calculate quantity based on days or nights between given bookingDates.
 *
 * @param {Object} orderData
 * @param {string} orderData.bookingStart
 * @param {string} orderData.bookingEnd
 * @param {number} [orderData.seats]
 * @param {'line-item/day' | 'line-item/night'} code
 */
const getDateRangeQuantityAndLineItems = (orderData, code) => {
  const { bookingStart, bookingEnd, seats } = orderData;
  const hasSeats = !!seats;
  const units =
    bookingStart && bookingEnd ? calculateQuantityFromDates(bookingStart, bookingEnd, code) : null;

  // If there are seats, the quantity is split to factors: units and seats.
  // E.g. 3 nights x 4 seats (aka unit price is multiplied by 12)
  return hasSeats ? { units, seats, extraLineItems: [] } : { quantity: units, extraLineItems: [] };
};

/**
 * Returns collection of lineItems (max 50)
 *
 * All the line-items dedicated to _customer_ define the "payin total".
 * Similarly, the sum of all the line-items included for _provider_ create "payout total".
 * Platform gets the commission, which is the difference between payin and payout totals.
 *
 * Each line items has following fields:
 * - `code`: string, mandatory, indentifies line item type (e.g. \"line-item/cleaning-fee\"), maximum length 64 characters.
 * - `unitPrice`: money, mandatory
 * - `lineTotal`: money
 * - `quantity`: number
 * - `percentage`: number (e.g. 15.5 for 15.5%)
 * - `seats`: number
 * - `units`: number
 * - `includeFor`: array containing strings \"customer\" or \"provider\", default [\":customer\"  \":provider\" ]
 *
 * Line item must have either `quantity` or `percentage` or both `seats` and `units`.
 *
 * `includeFor` defines commissions. Customer commission is added by defining `includeFor` array `["customer"]` and provider commission by `["provider"]`.
 *
 * @param {Object} listing
 * @param {Object} orderData
 * @param {string} [orderData.priceVariantName] - The name of the price variant (potentially used with bookable unit types)
 * @param {Money} [orderData.offer] - The offer for the offer (if transition intent is "make-offer")
 * @param {Object} providerCommission
 * @param {Object} customerCommission
 * @returns {Array} lineItems
 */
exports.transactionLineItems = (listing, orderData, providerCommission, customerCommission) => {
  const publicData = listing.attributes.publicData;
  // Note: the unitType needs to be one of the following:
  // day, night, hour, fixed, or item (these are related to payment processes)
  const { unitType, priceVariants, priceVariationsEnabled } = publicData;

  const isBookable = ['day', 'night', 'hour', 'fixed'].includes(unitType);
  const isNegotiationUnitType = ['offer', 'request'].includes(unitType);
  const priceAttribute = listing.attributes.price;
  const currency = priceAttribute?.currency || orderData.currency;

  const { priceVariantName, offer } = orderData || {};
  const priceVariantConfig = priceVariants
    ? priceVariants.find(pv => pv.name === priceVariantName)
    : null;
  const { priceInSubunits } = priceVariantConfig || {};
  const isPriceInSubunitsValid = Number.isInteger(priceInSubunits) && priceInSubunits >= 0;

  const unitPrice =
    isBookable && priceVariationsEnabled && isPriceInSubunitsValid
      ? new Money(priceInSubunits, currency)
      : offer instanceof Money && isNegotiationUnitType
      ? offer
      : priceAttribute;

  /**
   * Pricing starts with order's base price:
   * Listing's price is related to a single unit. It needs to be multiplied by quantity
   *
   * Initial line-item needs therefore:
   * - code (based on unitType)
   * - unitPrice
   * - quantity
   * - includedFor
   */

  const code = `line-item/${unitType}`;

  // Here "extra line-items" means line-items that are tied to unit type
  // E.g. by default, "shipping-fee" is tied to 'item' aka buying products.
  const quantityAndExtraLineItems =
    unitType === 'item'
      ? getItemQuantityAndLineItems(orderData, publicData, currency)
      : unitType === 'file'
      ? getDigitalItemQuantityAndLineItems(orderData)
      : unitType === 'fixed'
      ? getFixedQuantityAndLineItems(orderData)
      : unitType === 'hour'
      ? getHourQuantityAndLineItems(orderData)
      : ['day', 'night'].includes(unitType)
      ? getDateRangeQuantityAndLineItems(orderData, code)
      : isNegotiationUnitType
      ? getOfferQuantityAndLineItems(orderData)
      : {};

  const { quantity, units, seats, extraLineItems } = quantityAndExtraLineItems;

  // Throw error if there is no quantity information given
  if (!quantity && !(units && seats)) {
    const missingFields = [];

    if (!quantity) missingFields.push('quantity');
    if (!units) missingFields.push('units');
    if (!seats) missingFields.push('seats');

    const message = `Error: orderData is missing the following information: ${missingFields.join(
      ', '
    )}. Quantity or either units & seats is required.`;

    const error = new Error(message);
    error.status = 400;
    error.statusText = message;
    error.data = {};
    throw error;
  }

  /**
   * If you want to use pre-defined component and translations for printing the lineItems base price for order,
   * you should use one of the codes:
   * line-item/night, line-item/day, line-item/hour or line-item/item.
   *
   * Pre-definded commission components expects line item code to be one of the following:
   * 'line-item/provider-commission', 'line-item/customer-commission'
   *
   * By default OrderBreakdown prints line items inside LineItemUnknownItemsMaybe if the lineItem code is not recognized. */

  const quantityOrSeats = !!units && !!seats ? { units, seats } : { quantity };
  const order = {
    code,
    unitPrice,
    ...quantityOrSeats,
    includeFor: ['customer', 'provider'],
  };

  // DragonRent duration pricing: daily listings (without seats or price variants) can have
  // cheaper 3-day and 7-day prices. The difference is a discount line item.
  const usesListingPrice = unitPrice === priceAttribute;
  const durationDiscount =
    unitType === 'day' && !seats && usesListingPrice
      ? getDurationDiscountMaybe(order, publicData)
      : null;
  const discountLineItems = durationDiscount ? [durationDiscount.discountLineItem] : [];

  // Commissions are calculated from the price the renter actually pays for the rental, i.e.
  // after the duration discount.
  const commissionBase = durationDiscount
    ? {
        code,
        unitPrice: durationDiscount.discountedTotal,
        quantity: 1,
        includeFor: ['customer', 'provider'],
      }
    : order;

  // Let's keep the base price (order) as first line item and provider and customer commissions as last.
  // Note: the order matters only if OrderBreakdown component doesn't recognize line-item.
  const lineItems = [
    order,
    ...discountLineItems,
    ...extraLineItems,
    ...getProviderCommissionMaybe(providerCommission, commissionBase, currency),
    ...getCustomerCommissionMaybe(customerCommission, commissionBase, currency),
  ];

  return lineItems;
};
