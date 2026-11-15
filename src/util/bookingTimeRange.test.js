import { types as sdkTypes } from './sdkLoader';
import { createBooking, createListing, createTransaction, createUser } from './testData';
import { getBookingTimeRange } from './bookingTimeRange';

const { Money } = sdkTypes;

const dayLineItems = [
  {
    code: 'line-item/day',
    includeFor: ['customer', 'provider'],
    quantity: 3,
    unitPrice: new Money(1500, 'EUR'),
    lineTotal: new Money(4500, 'EUR'),
    reversal: false,
  },
];

const createDayBooking = (start, end, listing) =>
  createTransaction({
    id: 'tx-day',
    processName: 'default-booking',
    total: new Money(4500, 'EUR'),
    commission: new Money(450, 'EUR'),
    lineItems: dayLineItems,
    booking: createBooking('booking-day', { start, end }),
    customer: createUser('customer-day'),
    ...(listing ? { listing } : {}),
  });

describe('getBookingTimeRange', () => {
  // Finnish summer time: 00:00 in Helsinki is 21:00 UTC the evening before
  const start = new Date('2026-10-10T21:00:00.000Z'); // 11 Oct 00:00 Helsinki
  const end = new Date('2026-10-13T21:00:00.000Z'); // 14 Oct 00:00 Helsinki (exclusive)

  it('falls back to Finnish time when the listing is not included', () => {
    const range = getBookingTimeRange(createDayBooking(start, end, null));

    expect(range.timeZone).toEqual('Europe/Helsinki');
    expect(range.start).toEqual(start);
    // Exclusive end 14 Oct → last booked day 13 Oct, in Helsinki time
    expect(range.end).toEqual(new Date('2026-10-12T21:00:00.000Z'));
  });

  it("uses the listing's own time zone when it is included", () => {
    const listing = createListing('listing-utc', {
      availabilityPlan: { type: 'availability-plan/time', timezone: 'Etc/UTC' },
    });
    const range = getBookingTimeRange(createDayBooking(start, end, listing));

    expect(range.timeZone).toEqual('Etc/UTC');
  });

  it('returns null without a booking', () => {
    const tx = createTransaction({ id: 'tx-none', processName: 'default-booking' });
    expect(getBookingTimeRange(tx)).toBeNull();
  });
});
