import { types as sdkTypes } from '../../util/sdkLoader';
import {
  createBooking,
  createCurrentUser,
  createListing,
  createOwnListing,
  createTransaction,
  createUser,
} from '../../util/testData';
import { LISTING_STATE_CLOSED, LISTING_STATE_DRAFT } from '../../util/types';

import { DashboardPageComponent } from './DashboardPage';

const { Money } = sdkTypes;

const DAY = 24 * 60 * 60 * 1000;
const today = new Date(Date.UTC(2026, 9, 17));
const daysFromToday = days => new Date(today.getTime() + days * DAY);

const user = (id, displayName, abbreviatedName) =>
  createUser(id, {
    banned: false,
    deleted: false,
    profile: { displayName, abbreviatedName },
  });

const bookingTransaction = (id, { title, customer, startDay, endDay, dailyPrice }) => {
  const days = endDay - startDay;
  const total = new Money(dailyPrice * days, 'EUR');
  return createTransaction({
    id,
    processName: 'default-booking',
    total,
    commission: new Money(Math.round(total.amount * 0.1), 'EUR'),
    lineItems: [
      {
        code: 'line-item/day',
        includeFor: ['customer', 'provider'],
        quantity: days,
        unitPrice: new Money(dailyPrice, 'EUR'),
        lineTotal: total,
        reversal: false,
      },
    ],
    booking: createBooking(`booking-${id}`, {
      start: daysFromToday(startDay),
      end: daysFromToday(endDay),
    }),
    listing: createListing(`listing-${id}`, { title }),
    customer,
  });
};

const requests = [
  bookingTransaction('request-1', {
    title: 'Sony A7 III + 28–70mm lens',
    customer: user('c1', 'Nora H.', 'NH'),
    startDay: 3,
    endDay: 6,
    dailyPrice: 3500,
  }),
  bookingTransaction('request-2', {
    title: 'Epson HD projector',
    customer: user('c2', 'Mikko S.', 'MS'),
    startDay: 9,
    endDay: 11,
    dailyPrice: 1800,
  }),
  bookingTransaction('request-3', {
    title: '4-person camping tent',
    customer: user('c3', 'Aino L.', 'AL'),
    startDay: 15,
    endDay: 18,
    dailyPrice: 1200,
  }),
];

const activeRentals = [
  bookingTransaction('active-1', {
    title: 'Cordless drill set',
    customer: user('c4', 'Juho K.', 'JK'),
    startDay: -1,
    endDay: 2,
    dailyPrice: 900,
  }),
];

const listings = [
  createOwnListing('own-1', {
    title: 'Sony A7 III + 28–70mm lens',
    price: new Money(3500, 'EUR'),
    publicData: { unitType: 'day' },
  }),
  createOwnListing('own-2', {
    title: 'Epson HD projector',
    price: new Money(1800, 'EUR'),
    publicData: { unitType: 'day' },
  }),
  createOwnListing('own-3', {
    title: '4-person camping tent',
    price: new Money(1200, 'EUR'),
    publicData: { unitType: 'day' },
    state: LISTING_STATE_CLOSED,
  }),
  createOwnListing('own-4', {
    title: 'Tripod and ring light',
    price: new Money(800, 'EUR'),
    publicData: { unitType: 'day' },
    state: LISTING_STATE_DRAFT,
  }),
];

const baseProps = {
  currentUser: createCurrentUser('host', {
    profile: { firstName: 'Aleksi', lastName: 'Virtanen', displayName: 'Aleksi V.' },
  }),
  fetchInProgress: false,
  fetchError: null,
  scrollingDisabled: false,
};

export const Dashboard = {
  component: DashboardPageComponent,
  props: {
    ...baseProps,
    requests,
    requestCount: 3,
    activeRentals,
    activeRentalCount: 1,
    listings,
    publishedListingCount: 2,
  },
  group: 'page',
};

export const DashboardEmpty = {
  component: DashboardPageComponent,
  props: {
    ...baseProps,
    requests: [],
    requestCount: 0,
    activeRentals: [],
    activeRentalCount: 0,
    listings: [],
    publishedListingCount: 0,
  },
  group: 'page',
};
