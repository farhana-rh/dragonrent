import React from 'react';
import '@testing-library/jest-dom';

import { fakeIntl } from '../../../../util/testData';
import { types as sdkTypes } from '../../../../util/sdkLoader';
import { renderWithProviders as render, testingLibrary } from '../../../../util/testHelpers';

import EditListingPricingForm, {
  validatePrice3Days,
  validatePrice7Days,
} from './EditListingPricingForm';
import {
  getDurationPricesPublicData,
  getInitialValuesForDurationPrices,
} from './EditListingPricingPanel';

const { Money } = sdkTypes;
const { screen } = testingLibrary;

const eur = amount => new Money(amount, 'EUR');
// fakeIntl.formatMessage returns the message id, so validators return ids when they fail
const intl = fakeIntl;

describe('duration price validators', () => {
  it('accepts a 3-day price between the day price and 3 × the day price', () => {
    const validate = validatePrice3Days(intl);
    expect(validate(eur(3000), { price: eur(1200) })).toBeUndefined();
    expect(validate(eur(3600), { price: eur(1200) })).toBeUndefined();
    expect(validate(undefined, { price: eur(1200) })).toBeUndefined();
  });

  it('rejects a 3-day price above 3 days at the day price or below one day', () => {
    const validate = validatePrice3Days(intl);
    expect(validate(eur(3601), { price: eur(1200) })).toEqual(
      'EditListingPricingForm.price3DaysTooHigh'
    );
    expect(validate(eur(1100), { price: eur(1200) })).toEqual(
      'EditListingPricingForm.price3DaysTooLow'
    );
  });

  it('checks the 7-day price against 7 × the day price and the 3-day price', () => {
    const validate = validatePrice7Days(intl);
    const values = { price: eur(1200), price3Days: eur(3000) };
    expect(validate(eur(6000), values)).toBeUndefined();
    expect(validate(eur(8401), values)).toEqual('EditListingPricingForm.price7DaysTooHigh');
    expect(validate(eur(2900), values)).toEqual('EditListingPricingForm.price7DaysTooLow');
    // Without a 3-day price, the day price is the minimum
    expect(validate(eur(1100), { price: eur(1200) })).toEqual(
      'EditListingPricingForm.price7DaysTooLow'
    );
  });
});

describe('duration price values', () => {
  const listing = (publicData, price = eur(1200)) => ({
    attributes: { price, publicData: { unitType: 'day', ...publicData } },
  });

  it('reads saved prices into form values', () => {
    expect(
      getInitialValuesForDurationPrices(
        listing({ price3DaysInSubunits: 3000, price7DaysInSubunits: 6000 })
      )
    ).toEqual({ price3Days: eur(3000), price7Days: eur(6000) });
    expect(getInitialValuesForDurationPrices(listing({}))).toEqual({});
  });

  it('ignores the prices for listings that are not daily', () => {
    const hourly = { attributes: { price: eur(1200), publicData: { unitType: 'hour' } } };
    expect(getInitialValuesForDurationPrices(hourly)).toEqual({});
  });

  it('saves prices in subunits and removes empty ones', () => {
    expect(getDurationPricesPublicData({ price: eur(1200), price3Days: eur(3000) })).toEqual({
      price3DaysInSubunits: 3000,
      price7DaysInSubunits: null,
    });
  });
});

describe('EditListingPricingForm with duration prices', () => {
  it('shows 1-day, 3-day and 7-day price fields for daily bookings', () => {
    render(
      <EditListingPricingForm
        intl={fakeIntl}
        onSubmit={v => v}
        marketplaceCurrency="EUR"
        unitType="day"
        listingTypeConfig={{
          transactionType: { process: 'default-booking', alias: 'default-booking/release-1' },
        }}
        listingMinimumPriceSubUnits={500}
        saveActionMsg="Save"
        updated={false}
        updateInProgress={false}
        disabled={false}
        ready={false}
      />
    );

    expect(screen.getByText('EditListingPricingForm.price1Day')).toBeInTheDocument();
    expect(screen.getByText('EditListingPricingForm.price3Days')).toBeInTheDocument();
    expect(screen.getByText('EditListingPricingForm.price7Days')).toBeInTheDocument();
    expect(screen.getAllByText('EditListingPricingForm.optional')).toHaveLength(2);
    expect(screen.getByText('EditListingPricingForm.price3DaysHint')).toBeInTheDocument();
  });
});
