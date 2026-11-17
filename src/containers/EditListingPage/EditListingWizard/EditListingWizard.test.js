import { types as sdkTypes } from '../../../util/sdkLoader';

import { tabCompleted } from './EditListingWizard';
import { LOCATION } from './EditListingWizardTab';

const { LatLng } = sdkTypes;

const config = { listing: { listingTypes: [] } };
const listingWith = attributes => ({ attributes: { publicData: {}, ...attributes }, images: [] });
const point = new LatLng(60.17, 24.94);

describe('tabCompleted: Location', () => {
  it('counts a location saved with the private pick-up address (address privacy)', () => {
    const listing = listingWith({
      geolocation: point,
      publicData: { location: { area: 'Turkhauta', address: null, building: null } },
      privateData: {
        pickup: { address: '12350, Turkhauta, Kanta-Häme, Finland', lat: 60, lng: 24 },
      },
    });
    expect(tabCompleted(LOCATION, listing, config)).toBe(true);
  });

  it('counts a listing saved before the change, with the public address', () => {
    const listing = listingWith({
      geolocation: point,
      publicData: { location: { address: 'Mannerheimintie 10, 00120 Helsinki, Finland' } },
    });
    expect(tabCompleted(LOCATION, listing, config)).toBe(true);
  });

  it('is not complete without a saved location', () => {
    expect(tabCompleted(LOCATION, listingWith({}), config)).toBe(false);
    expect(
      tabCompleted(LOCATION, listingWith({ publicData: { location: { area: 'Kallio' } } }), config)
    ).toBe(false);
  });
});
