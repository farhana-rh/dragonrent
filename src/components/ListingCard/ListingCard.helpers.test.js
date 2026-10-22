import { createIntl } from 'react-intl';

import { types as sdkTypes } from '../../util/sdkLoader';
import messages from '../../translations/en.json';

import { getDistanceText, getListingCardTranslations } from './ListingCard.helpers';

const { LatLng, Money } = sdkTypes;

const intl = createIntl({ locale: 'en', messages });

const config = {
  currency: 'EUR',
  listing: {
    listingTypes: [
      {
        listingType: 'daily-rental',
        transactionType: { process: 'default-booking', alias: 'default-booking/release-1' },
        defaultListingFields: { price: true },
      },
    ],
  },
};

const dailyListing = publicDataExtra => ({
  id: { uuid: 'listing1' },
  attributes: {
    title: 'Cordless drill',
    price: new Money(1200, 'EUR'),
    geolocation: new LatLng(60.17, 24.94),
    publicData: {
      listingType: 'daily-rental',
      transactionProcessAlias: 'default-booking/release-1',
      unitType: 'day',
      ...publicDataExtra,
    },
  },
});

describe('getListingCardTranslations', () => {
  it('shows the day price without duration prices', () => {
    const { cardAriaLabel } = getListingCardTranslations(dailyListing({}), config, intl);
    expect(cardAriaLabel).toBe('Cordless drill, €12.00 per day');
  });

  it('shows "From" the lowest daily rate with duration prices', () => {
    // 7-day price €60 → €8.57 a day
    const listing = dailyListing({ price3DaysInSubunits: 3000, price7DaysInSubunits: 6000 });
    const { cardAriaLabel } = getListingCardTranslations(listing, config, intl);
    expect(cardAriaLabel).toBe('Cordless drill, From €8.57 per day');
  });

  it('ignores duration prices that are not cheaper per day', () => {
    const listing = dailyListing({ price3DaysInSubunits: 3600 });
    const { cardAriaLabel } = getListingCardTranslations(listing, config, intl);
    expect(cardAriaLabel).toBe('Cordless drill, €12.00 per day');
  });
});

describe('getDistanceText', () => {
  const listing = dailyListing({});

  it('rounds to whole kilometres', () => {
    // About 3.3 km north of the listing
    expect(getDistanceText(listing, new LatLng(60.2, 24.94), intl)).toBe('3 km away');
  });

  it('says "Under 1 km away" for close items', () => {
    expect(getDistanceText(listing, new LatLng(60.171, 24.941), intl)).toBe('Under 1 km away');
  });

  it('is null without an origin', () => {
    expect(getDistanceText(listing, null, intl)).toBeNull();
  });
});
