import { getBookingTimeRange } from '../../util/bookingTimeRange';

/**
 * Find the active rental that ends next: the earliest booking end that is still in the future.
 *
 * @param {Array<Object>} transactions accepted transactions with booking and listing included
 * @param {Date} now current time
 * @returns {Object|null} booking time range of the next rental to end, or null if none
 */
export const getNextRentalEnd = (transactions, now = new Date()) => {
  return transactions
    .filter(tx => {
      const endRaw = tx?.booking?.attributes?.displayEnd || tx?.booking?.attributes?.end;
      return endRaw && endRaw > now;
    })
    .map(tx => getBookingTimeRange(tx))
    .filter(Boolean)
    .reduce((earliest, range) => (!earliest || range.end < earliest.end ? range : earliest), null);
};

/**
 * Greeting name: the first name, falling back to the display name.
 *
 * @param {Object} currentUser
 * @returns {string|null} name or null when the user is not loaded
 */
export const getGreetingName = currentUser => {
  const profile = currentUser?.attributes?.profile;
  return profile?.firstName || profile?.displayName || null;
};
