import React from 'react';
import '@testing-library/jest-dom';
import Decimal from 'decimal.js';

import { types as sdkTypes } from '../../../util/sdkLoader';
import { getBookedQuantity, getBookingTimeRange } from '../../../util/bookingTimeRange';
import { createBooking, createTransaction } from '../../../util/testData';
import { renderWithProviders as render, testingLibrary } from '../../../util/testHelpers';

import RentalSummary from './RentalSummary';

const { screen, within } = testingLibrary;
const { Money } = sdkTypes;

const bookingTx = (unitCode, start, end, quantity) =>
  createTransaction({
    id: 'tx1',
    processName: 'default-booking',
    total: new Money(4500, 'EUR'),
    booking: createBooking('booking1', { start, end }),
    lineItems: [
      {
        code: unitCode,
        includeFor: ['customer', 'provider'],
        quantity: new Decimal(quantity),
        unitPrice: new Money(1500, 'EUR'),
        lineTotal: new Money(4500, 'EUR'),
        reversal: false,
      },
    ],
  });

const listingLinkProps = { name: 'ListingPage', params: { id: 'listing1', slug: 'camera' } };

describe('bookingTimeRange util', () => {
  it('shows the last booked day for day bookings and the quantity booked', () => {
    const tx = bookingTx(
      'line-item/day',
      new Date(Date.UTC(2026, 9, 10)),
      new Date(Date.UTC(2026, 9, 13)),
      3
    );

    expect(getBookingTimeRange(tx).end).toEqual(new Date(Date.UTC(2026, 9, 12)));
    expect(getBookedQuantity(tx)).toEqual({ quantity: 3, unit: 'day' });
  });

  it('keeps the end time for hourly bookings', () => {
    const end = new Date(Date.UTC(2026, 9, 10, 14));
    const tx = bookingTx('line-item/hour', new Date(Date.UTC(2026, 9, 10, 10)), end, 4);

    expect(getBookingTimeRange(tx).end).toEqual(end);
    expect(getBookingTimeRange(tx).dateType).toEqual('datetime');
  });
});

describe('RentalSummary', () => {
  it('shows the booked dates, duration and a link to change them', () => {
    const tx = bookingTx(
      'line-item/day',
      new Date(Date.UTC(2026, 9, 10)),
      new Date(Date.UTC(2026, 9, 13)),
      3
    );
    render(
      <RentalSummary transaction={tx} timeZone="Etc/UTC" listingLinkProps={listingLinkProps} />
    );

    expect(screen.getByRole('heading', { name: 'CheckoutPage.rental.title' })).toBeInTheDocument();
    expect(screen.getByText('CheckoutPage.rental.durationValue')).toBeInTheDocument();
    expect(screen.getByText('CheckoutPage.rental.changeDates').closest('a')).toHaveAttribute(
      'href',
      '/l/camera/listing1'
    );
  });

  it('renders nothing without a booking', () => {
    const tx = createTransaction({ id: 'tx2', processName: 'default-purchase' });
    const { container } = render(
      <RentalSummary transaction={tx} listingLinkProps={listingLinkProps} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
