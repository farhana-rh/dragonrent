import React from 'react';
import '@testing-library/jest-dom';

import { types as sdkTypes } from '../../util/sdkLoader';
import {
  createBooking,
  createCurrentUser,
  createListing,
  createOwnListing,
  createTransaction,
  createUser,
} from '../../util/testData';
import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';
import { LISTING_STATE_CLOSED, LISTING_STATE_DRAFT } from '../../util/types';
import { getBookingTimeRange } from '../../util/bookingTimeRange';

import { DashboardPageComponent } from './DashboardPage';
import { getDashboardQueryParams } from './DashboardPage.duck';
import { getGreetingName, getNextRentalEnd } from './DashboardPage.helpers';
import { getListingLinkProps } from './DashboardListingsTable/DashboardListingsTable';

const { screen, within } = testingLibrary;
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

const createRequest = (id, start, end) =>
  createTransaction({
    id,
    processName: 'default-booking',
    total: new Money(4500, 'EUR'),
    commission: new Money(450, 'EUR'),
    lineItems: dayLineItems,
    booking: createBooking(`booking-${id}`, { start, end }),
    listing: createListing(`listing-${id}`, { title: 'Sony A7 III' }),
    customer: createUser(`customer-${id}`),
  });

describe('DashboardPage helpers', () => {
  it('uses the last booked day as the end of day bookings', () => {
    const tx = createRequest(
      'tx1',
      new Date(Date.UTC(2026, 9, 10)),
      new Date(Date.UTC(2026, 9, 13))
    );
    const range = getBookingTimeRange(tx);

    expect(range.start).toEqual(new Date(Date.UTC(2026, 9, 10)));
    // Exclusive end 13 Oct → last booked day 12 Oct
    expect(range.end).toEqual(new Date(Date.UTC(2026, 9, 12)));
    expect(range.timeZone).toEqual('Etc/UTC');
  });

  it('finds the next rental to end, ignoring rentals that have ended', () => {
    const now = new Date(Date.UTC(2026, 9, 15));
    const ended = createRequest(
      'a',
      new Date(Date.UTC(2026, 9, 1)),
      new Date(Date.UTC(2026, 9, 5))
    );
    const later = createRequest(
      'b',
      new Date(Date.UTC(2026, 9, 16)),
      new Date(Date.UTC(2026, 9, 25))
    );
    const sooner = createRequest(
      'c',
      new Date(Date.UTC(2026, 9, 14)),
      new Date(Date.UTC(2026, 9, 18))
    );

    expect(getNextRentalEnd([ended, later, sooner], now).end).toEqual(
      new Date(Date.UTC(2026, 9, 17))
    );
    expect(getNextRentalEnd([ended], now)).toBeNull();
  });

  it('greets the user by first name', () => {
    expect(getGreetingName(createCurrentUser('u1'))).toEqual('u1 first name');
    expect(getGreetingName(null)).toBeNull();
  });

  it('only queries booking requests and accepted bookings for the dashboard', () => {
    const params = getDashboardQueryParams();

    expect(params.requests).toMatchObject({
      only: 'sale',
      processNames: ['default-booking'],
      states: 'state/preauthorized',
    });
    expect(params.activeRentals).toMatchObject({ only: 'sale', states: 'state/accepted' });
    expect(params.publishedListings.states).toEqual(['published']);
  });

  it('links published listings to the listing page and others to the editor', () => {
    const published = createOwnListing('l1', { title: 'Drill' });
    const draft = createOwnListing('l2', { title: 'Tent', state: LISTING_STATE_DRAFT });
    const closed = createOwnListing('l3', { title: 'Bike', state: LISTING_STATE_CLOSED });

    expect(getListingLinkProps(published)).toEqual({
      name: 'ListingPage',
      params: { id: 'l1', slug: 'drill' },
    });
    expect(getListingLinkProps(draft).params).toMatchObject({ type: 'draft', tab: 'details' });
    expect(getListingLinkProps(closed).params).toMatchObject({ type: 'edit', tab: 'details' });
  });
});

describe('DashboardPageComponent', () => {
  const baseProps = {
    currentUser: createCurrentUser('host'),
    requests: [],
    requestCount: 0,
    activeRentals: [],
    activeRentalCount: 0,
    listings: [],
    publishedListingCount: 0,
    fetchInProgress: false,
    fetchError: null,
    scrollingDisabled: false,
  };

  it('shows booking requests with a link to review each one', () => {
    const request = createRequest(
      'tx1',
      new Date(Date.UTC(2026, 9, 10)),
      new Date(Date.UTC(2026, 9, 13))
    );
    render(<DashboardPageComponent {...baseProps} requests={[request]} requestCount={1} />);

    expect(screen.getByText('DashboardPage.greeting')).toBeInTheDocument();

    const reviewLink = screen.getByRole('link', { name: 'DashboardPage.requests.reviewLabel' });
    expect(reviewLink).toHaveAttribute('href', '/sale/tx1');
    expect(screen.getByText('Sony A7 III')).toBeInTheDocument();
    // No accept or decline buttons on the dashboard
    expect(screen.queryByRole('button', { name: /accept|decline/i })).not.toBeInTheDocument();
  });

  it('shows the request count in the stats and the side navigation', () => {
    render(<DashboardPageComponent {...baseProps} requestCount={3} />);

    const nav = screen.getByRole('navigation', { name: 'DashboardPage.nav.label' });
    expect(within(nav).getByRole('link', { current: 'page' })).toHaveAttribute(
      'href',
      '/dashboard'
    );
    expect(within(nav).getByText('DashboardPage.nav.badgeLabel')).toBeInTheDocument();
    expect(screen.getByText('DashboardPage.stats.requests').closest('div')).toHaveTextContent('3');
  });

  it('shows empty states without requests or listings', () => {
    render(<DashboardPageComponent {...baseProps} />);

    expect(screen.getByText('DashboardPage.requests.empty')).toBeInTheDocument();
    expect(screen.getByText('DashboardPage.listings.emptyCta').closest('a')).toHaveAttribute(
      'href',
      '/l/new'
    );
  });

  it('lists own listings with their status', () => {
    const listings = [
      createOwnListing('l1', { title: 'Cordless drill', price: new Money(1200, 'EUR') }),
      createOwnListing('l2', { title: 'Camping tent', state: LISTING_STATE_DRAFT }),
    ];
    render(<DashboardPageComponent {...baseProps} listings={listings} publishedListingCount={1} />);

    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(3);
    expect(
      within(table)
        .getByText('Cordless drill')
        .closest('a')
    ).toHaveAttribute('href', '/l/cordless-drill/l1');
    expect(within(table).getAllByText('DashboardPage.listings.status')).toHaveLength(2);
  });

  it('shows an error when the dashboard data fails to load', () => {
    const fetchError = { type: 'error', name: 'Error', message: 'Failed', status: 500 };
    render(<DashboardPageComponent {...baseProps} fetchError={fetchError} />);

    expect(screen.getByRole('alert')).toHaveTextContent('DashboardPage.loadError');
  });
});
