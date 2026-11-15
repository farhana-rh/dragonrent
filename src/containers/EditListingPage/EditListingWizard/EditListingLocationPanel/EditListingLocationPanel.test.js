import { types as sdkTypes } from '../../../../util/sdkLoader';
import { distanceInKm } from '../../../../util/maps';
import { createOwnListing } from '../../../../util/testData';

import { getInitialValues, getLocationUpdateValues } from './EditListingLocationPanel';

const { LatLng, UUID } = sdkTypes;

// What the location form gives us after the owner picks a place
const exact = new LatLng(60.1612, 24.9336);
const formValues = {
  building: 'B 12',
  location: {
    search: 'Fredrikinkatu 12, 00120 Helsinki, Finland',
    selectedPlace: { address: 'Fredrikinkatu 12, 00120 Helsinki, Finland', origin: exact },
  },
};

describe('getLocationUpdateValues (pick-up address privacy)', () => {
  const listing = createOwnListing('listing-1');
  const values = getLocationUpdateValues(formValues, listing);

  it('keeps the exact address and point in private data only', () => {
    expect(values.privateData.pickup).toEqual({
      address: 'Fredrikinkatu 12, 00120 Helsinki, Finland',
      building: 'B 12',
      lat: exact.lat,
      lng: exact.lng,
    });
  });

  it('publishes only the area, and clears any address saved earlier', () => {
    expect(values.publicData.location).toEqual({ area: 'Helsinki', address: null, building: null });
    expect(JSON.stringify(values.publicData)).not.toContain('Fredrikinkatu');
  });

  it('publishes a point 100–400 m away from the real one', () => {
    const meters = distanceInKm(exact, values.geolocation) * 1000;
    expect(meters).toBeGreaterThanOrEqual(99);
    expect(meters).toBeLessThanOrEqual(401);
  });

  it('publishes the same point when the same listing is saved again', () => {
    const again = getLocationUpdateValues(formValues, listing);
    expect(again.geolocation).toEqual(values.geolocation);
  });

  it('seeds the offset with the address when there is no listing id yet', () => {
    const withoutListing = getLocationUpdateValues(formValues, null);
    const meters = distanceInKm(exact, withoutListing.geolocation) * 1000;
    expect(meters).toBeGreaterThanOrEqual(99);
  });
});

describe('getInitialValues', () => {
  it('reads the exact address back from private data', () => {
    const listing = createOwnListing('listing-1', {
      geolocation: new LatLng(60.17, 24.93),
      publicData: { location: { area: 'Helsinki' } },
      privateData: {
        pickup: {
          address: 'Fredrikinkatu 12, 00120 Helsinki, Finland',
          building: 'B 12',
          lat: 60.1612,
          lng: 24.9336,
        },
      },
    });
    const initial = getInitialValues({ listing });

    expect(initial.building).toEqual('B 12');
    expect(initial.location.search).toEqual('Fredrikinkatu 12, 00120 Helsinki, Finland');
    expect(initial.location.selectedPlace.origin).toEqual(new LatLng(60.1612, 24.9336));
  });

  it('falls back to the public address of listings saved before the change', () => {
    const listing = createOwnListing('listing-old', {
      geolocation: new LatLng(60.17, 24.93),
      publicData: { location: { address: 'Main Street 123, Helsinki, Finland', building: 'A 1' } },
    });
    const initial = getInitialValues({ listing });

    expect(initial.building).toEqual('A 1');
    expect(initial.location.selectedPlace.address).toEqual('Main Street 123, Helsinki, Finland');
    expect(initial.location.selectedPlace.origin).toEqual(new LatLng(60.17, 24.93));
  });

  it('starts empty for a new listing', () => {
    const listing = createOwnListing('listing-new', {
      id: new UUID('listing-new'),
      publicData: {},
    });
    expect(getInitialValues({ listing }).location).toEqual(null);
  });
});
