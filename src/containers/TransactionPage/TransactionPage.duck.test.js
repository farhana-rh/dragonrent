import { types as sdkTypes } from '../../util/sdkLoader';
import { updatedEntities } from '../../util/data';

import { makeTransitionThunk } from './TransactionPage.duck';

const { UUID } = sdkTypes;

// Owner accepts a booking: the exact pick-up address (listing privateData.pickup, readable only
// by the owner) is copied into the transaction's protectedData so the renter can see it.

const txId = new UUID('tx-1');
const listingId = new UUID('listing-1');

const transactionEntity = {
  id: txId,
  type: 'transaction',
  attributes: {
    processName: 'default-booking',
    processVersion: 1,
    lastTransition: 'transition/confirm-payment',
    protectedData: {},
  },
  relationships: { listing: { data: { id: listingId, type: 'listing' } } },
};
const listingEntity = {
  id: listingId,
  type: 'listing',
  attributes: { title: 'Drill', publicData: { location: { area: 'Kallio' } } },
};

const pickup = {
  address: 'Fleminginkatu 7, 00530 Helsinki',
  building: 'C 21',
  lat: 60.1868,
  lng: 24.9501,
};

const stateWith = entities => () => ({
  marketplaceData: { entities },
  TransactionPage: { transitionInProgress: false },
});

const transitionResponse = { data: { data: transactionEntity, included: [] } };

const createSdk = ({ privateData, showError, transitionErrorOnce } = {}) => {
  const transition = jest.fn(() =>
    transitionErrorOnce && transition.mock.calls.length === 1
      ? Promise.reject(Object.assign(new Error('400'), { status: 400 }))
      : Promise.resolve(transitionResponse)
  );
  return {
    ownListings: {
      show: jest.fn(() =>
        showError
          ? Promise.reject(new Error('network'))
          : Promise.resolve({
              data: {
                data: {
                  ...listingEntity,
                  attributes: { ...listingEntity.attributes, privateData },
                },
              },
            })
      ),
    },
    transactions: { transition, show: jest.fn(() => Promise.resolve(transitionResponse)) },
  };
};

const accept = (sdk, transitionName = 'transition/accept') => {
  const entities = updatedEntities({}, { data: transactionEntity, included: [listingEntity] });
  const dispatch = jest.fn();
  return makeTransitionThunk({ txId, transitionName, params: {} })(
    dispatch,
    stateWith(entities),
    sdk
  );
};

describe('makeTransitionThunk: accept copies the pick-up address', () => {
  beforeEach(() => {
    // refreshTransactionEntity schedules delayed re-fetches; they are not part of these tests
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('reads the owner listing and accepts with the pick-up address in protected data', async () => {
    const sdk = createSdk({ privateData: { pickup } });
    await accept(sdk);

    expect(sdk.ownListings.show).toHaveBeenCalledWith({ id: listingId });
    expect(sdk.transactions.transition).toHaveBeenCalledTimes(1);
    expect(sdk.transactions.transition.mock.calls[0][0]).toEqual({
      id: txId,
      transition: 'transition/accept',
      params: { protectedData: { pickup } },
    });
  });

  it('accepts without protected data when the listing has no saved pick-up address', async () => {
    const sdk = createSdk({ privateData: {} });
    await accept(sdk);

    expect(sdk.transactions.transition).toHaveBeenCalledTimes(1);
    expect(sdk.transactions.transition.mock.calls[0][0].params).toEqual({});
  });

  it('still accepts when the listing cannot be read', async () => {
    const sdk = createSdk({ showError: true });
    await accept(sdk);

    expect(sdk.transactions.transition).toHaveBeenCalledTimes(1);
    expect(sdk.transactions.transition.mock.calls[0][0].params).toEqual({});
  });

  it('falls back to a plain accept if the process does not take protected data yet', async () => {
    const sdk = createSdk({ privateData: { pickup }, transitionErrorOnce: true });
    await accept(sdk);

    expect(sdk.transactions.transition).toHaveBeenCalledTimes(2);
    expect(sdk.transactions.transition.mock.calls[0][0].params).toEqual({
      protectedData: { pickup },
    });
    expect(sdk.transactions.transition.mock.calls[1][0].params).toEqual({});
  });

  it('does not read the listing for other transitions', async () => {
    const sdk = createSdk({ privateData: { pickup } });
    await accept(sdk, 'transition/decline');

    expect(sdk.ownListings.show).not.toHaveBeenCalled();
    expect(sdk.transactions.transition.mock.calls[0][0].params).toEqual({});
  });
});
