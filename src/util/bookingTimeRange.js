import { subtractTime } from './dates';
import {
  DATE_TYPE_DATE,
  DATE_TYPE_DATETIME,
  LINE_ITEM_DAY,
  LINE_ITEM_FIXED,
  LINE_ITEM_HOUR,
  LISTING_UNIT_TYPES,
} from './types';

const DEFAULT_TIME_ZONE = 'Etc/UTC';

/**
 * The line item that carries the booked unit (day, night, hour, …) of a transaction.
 *
 * @param {Object} tx transaction entity
 * @returns {Object|undefined} unit line item
 */
export const getUnitLineItem = tx =>
  tx?.attributes?.lineItems?.find(item => LISTING_UNIT_TYPES.includes(item.code) && !item.reversal);

/**
 * The booked time range of a transaction, in the form it should be shown to users.
 * Same rules as on the InboxPage: day bookings have an exclusive end date, so the last
 * booked day is the day before `end`.
 *
 * @param {Object} tx transaction with booking (and optionally listing) included
 * @param {string?} timeZoneOverride time zone to use instead of the listing's
 * @returns {Object|null} { start, end, dateType, timeZone } or null without a booking
 */
export const getBookingTimeRange = (tx, timeZoneOverride) => {
  const booking = tx?.booking?.attributes;
  if (!booking?.start || !booking?.end) {
    return null;
  }

  const unitType = getUnitLineItem(tx)?.code;
  const timeZone =
    timeZoneOverride || tx.listing?.attributes?.availabilityPlan?.timezone || DEFAULT_TIME_ZONE;

  const start = booking.displayStart || booking.start;
  const endRaw = booking.displayEnd || booking.end;
  const end = unitType === LINE_ITEM_DAY ? subtractTime(endRaw, 1, 'days', timeZone) : endRaw;
  const dateType = [LINE_ITEM_HOUR, LINE_ITEM_FIXED].includes(unitType)
    ? DATE_TYPE_DATETIME
    : DATE_TYPE_DATE;

  return { start, end, dateType, timeZone };
};

/**
 * Booked quantity and unit, e.g. { quantity: 3, unit: 'day' }.
 *
 * @param {Object} tx transaction entity
 * @returns {Object|null} { quantity, unit } or null when there is no unit line item
 */
export const getBookedQuantity = tx => {
  const unitLineItem = getUnitLineItem(tx);
  if (!unitLineItem?.quantity) {
    return null;
  }
  const quantity = Number(unitLineItem.quantity.toString());
  // 'line-item/day' → 'day'
  const unit = unitLineItem.code.replace('line-item/', '');
  return Number.isFinite(quantity) ? { quantity, unit } : null;
};
