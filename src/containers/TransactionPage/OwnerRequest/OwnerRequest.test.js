import React from 'react';
import '@testing-library/jest-dom';
import Decimal from 'decimal.js';

import { types as sdkTypes } from '../../../util/sdkLoader';
import { createBooking, createListing, createTransaction } from '../../../util/testData';
import { renderWithProviders as render, testingLibrary } from '../../../util/testHelpers';

import OwnerRequest from './OwnerRequest';

const { screen } = testingLibrary;
const { Money } = sdkTypes;

const transaction = {
  ...createTransaction({
    id: 'tx1',
    processName: 'default-booking',
    total: new Money(3000, 'EUR'),
    booking: createBooking('booking1', {
      start: new Date(Date.UTC(2026, 9, 23)),
      end: new Date(Date.UTC(2026, 9, 26)),
    }),
    lineItems: [
      {
        code: 'line-item/day',
        includeFor: ['customer', 'provider'],
        quantity: new Decimal(3),
        unitPrice: new Money(1000, 'EUR'),
        lineTotal: new Money(3000, 'EUR'),
        reversal: false,
      },
    ],
  }),
};
transaction.attributes = { ...transaction.attributes, payoutTotal: new Money(2550, 'EUR') };

const renderRequest = status =>
  render(
    <OwnerRequest
      status={status}
      transaction={transaction}
      listing={createListing('listing1', { title: 'Cordless drill' })}
      customerName="Mikko"
      timeZone="Europe/Helsinki"
    />
  );

describe('OwnerRequest', () => {
  it('shows a waiting request with the dates and what the owner gets', () => {
    renderRequest('waiting');
    expect(screen.getByText('OwnerRequest.status.waiting')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'OwnerRequest.heading.waiting' })
    ).toBeInTheDocument();
    expect(screen.getByText('Cordless drill')).toBeInTheDocument();
    expect(screen.getByText('BookingDatesForm.pickUpTitle')).toBeInTheDocument();
    expect(screen.getByText('OwnerRequest.youGet')).toBeInTheDocument();
    expect(screen.getByText('OwnerRequest.expiryNote')).toBeInTheDocument();
  });

  it('tells the owner what happened after declining', () => {
    renderRequest('declined');
    expect(screen.getByText('OwnerRequest.status.declined')).toBeInTheDocument();
    expect(screen.getByText('OwnerRequest.outcomeTitle.declined')).toBeInTheDocument();
    expect(screen.queryByText('OwnerRequest.expiryNote')).not.toBeInTheDocument();
  });
});
