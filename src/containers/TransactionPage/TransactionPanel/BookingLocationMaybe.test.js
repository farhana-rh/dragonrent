import React from 'react';
import '@testing-library/jest-dom';

import { types as sdkTypes } from '../../../util/sdkLoader';
import { createListing } from '../../../util/testData';
import { renderWithProviders as render, testingLibrary } from '../../../util/testHelpers';

import BookingLocationMaybe from './BookingLocationMaybe';

const { screen } = testingLibrary;
const { LatLng } = sdkTypes;

const listingWithArea = createListing('listing-1', {
  geolocation: new LatLng(60.17, 24.93),
  publicData: { location: { area: 'Kallio' } },
});

describe('BookingLocationMaybe', () => {
  it('shows the pick-up address copied into the transaction on accept', () => {
    render(
      <BookingLocationMaybe
        listing={listingWithArea}
        protectedData={{
          pickup: {
            address: 'Fleminginkatu 7, 00530 Helsinki',
            building: 'C 21',
            lat: 60.1868,
            lng: 24.9501,
          },
        }}
        providerName="Maija"
        showBookingLocation={true}
      />
    );

    expect(screen.getByText(/C 21, Fleminginkatu 7, 00530 Helsinki/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'AddressLinkMaybe.viewOnGoogleMaps' })).toHaveAttribute(
      'href',
      'https://maps.google.com/?q=60.1868,24.9501'
    );
  });

  it('asks the renter to get the address in messages when the transaction has none', () => {
    render(
      <BookingLocationMaybe
        listing={listingWithArea}
        protectedData={{}}
        providerName="Maija"
        showBookingLocation={true}
      />
    );

    expect(screen.getByText('TransactionPanel.bookingLocationAskWithArea')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('still shows the address of a listing saved before it became private', () => {
    const legacyListing = createListing('listing-old', {
      geolocation: new LatLng(60.17, 24.93),
      publicData: { location: { address: 'Main Street 123, Helsinki', building: 'A 1' } },
    });
    render(
      <BookingLocationMaybe
        listing={legacyListing}
        protectedData={{}}
        providerName="Maija"
        showBookingLocation={true}
      />
    );

    expect(screen.getByText(/A 1, Main Street 123, Helsinki/)).toBeInTheDocument();
  });

  it('renders nothing before the owner has accepted', () => {
    const { container } = render(
      <BookingLocationMaybe
        listing={listingWithArea}
        protectedData={{ pickup: { address: 'Fleminginkatu 7' } }}
        showBookingLocation={false}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
