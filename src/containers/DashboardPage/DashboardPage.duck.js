import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { storableError } from '../../util/errors';
import { LISTING_STATE_PUBLISHED } from '../../util/types';
import { BOOKING_PROCESS_NAME } from '../../transactions/transaction';

import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { fetchCurrentUser } from '../../ducks/user.duck';

// Number of booking requests and listings shown on the dashboard. The full lists are on the
// InboxPage and the ManageListingsPage.
const REQUESTS_PAGE_SIZE = 5;
const LISTINGS_PAGE_SIZE = 5;
// Accepted bookings are fetched to find the next one that ends. 100 is the API maximum.
const ACTIVE_RENTALS_PAGE_SIZE = 100;

// Booking process states, as defined in src/transactions/transactionProcessBooking.js
// - preauthorized: the customer has paid and the provider needs to accept or decline
// - accepted: the provider has accepted and the booking has not been completed yet
const STATE_REQUESTED = 'state/preauthorized';
const STATE_ACCEPTED = 'state/accepted';

// ================ Helper functions ================ //

const entityRefs = entities =>
  entities.map(entity => ({
    id: entity.id,
    type: entity.type,
  }));

const totalItems = response => response?.data?.meta?.totalItems ?? 0;

// ================ Slice ================ //

const dashboardPageSlice = createSlice({
  name: 'DashboardPage',
  initialState: {
    fetchInProgress: false,
    fetchError: null,
    requestRefs: [],
    requestCount: 0,
    activeRentalRefs: [],
    activeRentalCount: 0,
    listingRefs: [],
    publishedListingCount: 0,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadDataThunk.pending, state => {
        state.fetchInProgress = true;
        state.fetchError = null;
      })
      .addCase(loadDataThunk.fulfilled, (state, action) => {
        const { requests, activeRentals, listings, publishedListings } = action.payload;
        state.fetchInProgress = false;
        state.requestRefs = entityRefs(requests.data.data);
        state.requestCount = totalItems(requests);
        state.activeRentalRefs = entityRefs(activeRentals.data.data);
        state.activeRentalCount = totalItems(activeRentals);
        state.listingRefs = entityRefs(listings.data.data);
        state.publishedListingCount = totalItems(publishedListings);
      })
      .addCase(loadDataThunk.rejected, (state, action) => {
        console.error(action.payload || action.error);
        state.fetchInProgress = false;
        state.fetchError = action.payload;
      });
  },
});

export default dashboardPageSlice.reducer;

// ================ Load data ================ //

/**
 * Query parameters for the dashboard's read-only API calls. Exported for tests.
 *
 * @returns {Object} { requests, activeRentals, listings, publishedListings } query params
 */
export const getDashboardQueryParams = () => {
  const bookingSales = {
    only: 'sale',
    processNames: [BOOKING_PROCESS_NAME],
  };

  return {
    requests: {
      ...bookingSales,
      states: STATE_REQUESTED,
      include: ['listing', 'customer', 'customer.profileImage', 'booking'],
      'fields.transaction': ['processName', 'lastTransition', 'payoutTotal', 'lineItems'],
      'fields.listing': ['title', 'availabilityPlan'],
      'fields.user': ['profile.displayName', 'profile.abbreviatedName', 'deleted', 'banned'],
      'fields.image': ['variants.square-small', 'variants.square-small2x'],
      page: 1,
      perPage: REQUESTS_PAGE_SIZE,
    },
    activeRentals: {
      ...bookingSales,
      states: STATE_ACCEPTED,
      include: ['listing', 'booking'],
      'fields.transaction': ['processName', 'lineItems'],
      'fields.listing': ['availabilityPlan'],
      page: 1,
      perPage: ACTIVE_RENTALS_PAGE_SIZE,
    },
    listings: {
      include: ['images'],
      'fields.listing': ['title', 'price', 'state', 'publicData.unitType'],
      'fields.image': ['variants.square-small', 'variants.square-small2x'],
      'limit.images': 1,
      page: 1,
      perPage: LISTINGS_PAGE_SIZE,
    },
    // Only the total count is needed
    publishedListings: {
      states: [LISTING_STATE_PUBLISHED],
      'fields.listing': ['state'],
      page: 1,
      perPage: 1,
    },
  };
};

const loadDataPayloadCreator = (_, { dispatch, rejectWithValue, extra: sdk }) => {
  const params = getDashboardQueryParams();

  return Promise.all([
    sdk.transactions.query(params.requests),
    sdk.transactions.query(params.activeRentals),
    sdk.ownListings.query(params.listings),
    sdk.ownListings.query(params.publishedListings),
  ])
    .then(([requests, activeRentals, listings, publishedListings]) => {
      dispatch(addMarketplaceEntities(requests));
      dispatch(addMarketplaceEntities(activeRentals));
      dispatch(addMarketplaceEntities(listings));
      return { requests, activeRentals, listings, publishedListings };
    })
    .catch(e => rejectWithValue(storableError(e)));
};

export const loadDataThunk = createAsyncThunk('DashboardPage/loadData', loadDataPayloadCreator);

/**
 * Load the dashboard data: booking requests waiting for a reply, active rentals and the
 * current user's own listings. All calls are read-only.
 */
export const loadData = () => dispatch => {
  return Promise.all([dispatch(fetchCurrentUser()), dispatch(loadDataThunk())]);
};
