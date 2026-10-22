import React from 'react';
import '@testing-library/jest-dom';
import Decimal from 'decimal.js';

import { types as sdkTypes } from '../../../util/sdkLoader';
import { createBooking, createListing, createTransaction } from '../../../util/testData';
import { renderWithProviders as render, testingLibrary } from '../../../util/testHelpers';

import RequestSent from './RequestSent';

const { screen, within } = testingLibrary;
const { Money } = sdkTypes;

const transaction = createTransaction({
  id: 'tx1',
  processName: 'default-booking',
  total: new Money(3300, 'EUR'),
  booking: createBooking('booking1', {
    start: new Date(Date.UTC(2026, 9, 23)),
    end: new Date(Date.UTC(2026, 9, 26)),
  }),
  lineItems: [
    {
      code: 'line-item/day',
      includeFor: ['customer', 'provider'],
      quantity: new Decimal(3),
      unitPrice: new Money(1100, 'EUR'),
      lineTotal: new Money(3300, 'EUR'),
      reversal: false,
    },
  ],
});

describe('RequestSent', () => {
  it('shows what happens next in three steps', () => {
    render(
      <RequestSent
        transaction={transaction}
        listing={createListing('listing1', { title: 'Cordless drill' })}
        providerName="Anna"
        timeZone="Europe/Helsinki"
        messageInputId="message"
      />
    );

    expect(screen.getByRole('heading', { name: 'RequestSent.heading' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cordless drill' })).toBeInTheDocument();
    const steps = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(steps).toHaveLength(3);
    expect(steps[0]).toHaveTextContent('RequestSent.stepAccept');
    expect(screen.getByRole('button', { name: 'RequestSent.message' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'RequestSent.backToHome' })).toBeInTheDocument();
  });

  it('leaves out "Message" when messaging is not possible', () => {
    render(
      <RequestSent
        transaction={transaction}
        listing={createListing('listing1')}
        providerName="Anna"
        timeZone="Europe/Helsinki"
      />
    );
    expect(screen.queryByRole('button', { name: 'RequestSent.message' })).not.toBeInTheDocument();
  });
});
