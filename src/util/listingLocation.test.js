import { types as sdkTypes } from './sdkLoader';
import { distanceInKm } from './maps';
import {
  areaFromAddress,
  getPublicArea,
  offsetPublicLocation,
  PUBLIC_LOCATION_OFFSET_METERS,
} from './listingLocation';

const { LatLng } = sdkTypes;

describe('areaFromAddress', () => {
  it('returns the first named place, without the country', () => {
    expect(areaFromAddress('Kallio, Helsinki, Suomi')).toEqual('Kallio');
    expect(areaFromAddress('Helsinki, Finland')).toEqual('Helsinki');
  });

  it('skips the street address and postal code', () => {
    expect(areaFromAddress('Mannerheimintie 1, 00100 Helsinki, Suomi')).toEqual('Helsinki');
    expect(areaFromAddress('Fredrikinkatu 12 A 3, 00120 Helsinki, Finland')).toEqual('Helsinki');
  });

  it('returns null without a usable address', () => {
    expect(areaFromAddress(null)).toEqual(null);
    expect(areaFromAddress('')).toEqual(null);
    expect(areaFromAddress('12345')).toEqual(null);
  });
});

describe('offsetPublicLocation', () => {
  const exact = new LatLng(60.1699, 24.9384); // Helsinki centre

  it('moves the point between 100 m and the maximum offset', () => {
    ['listing-1', 'listing-2', 'listing-3', 'a9f4c2e1-0000-4000-8000-000000000042'].forEach(
      seed => {
        const moved = offsetPublicLocation(exact, seed);
        const meters = distanceInKm(exact, moved) * 1000;
        expect(meters).toBeGreaterThanOrEqual(99);
        expect(meters).toBeLessThanOrEqual(PUBLIC_LOCATION_OFFSET_METERS + 1);
      }
    );
  });

  it('gives the same point for the same seed, so re-saving does not move it', () => {
    const first = offsetPublicLocation(exact, 'listing-1');
    const second = offsetPublicLocation(exact, 'listing-1');
    expect(second.lat).toEqual(first.lat);
    expect(second.lng).toEqual(first.lng);
  });

  it('gives different points for different listings', () => {
    const a = offsetPublicLocation(exact, 'listing-1');
    const b = offsetPublicLocation(exact, 'listing-2');
    expect(distanceInKm(a, b)).toBeGreaterThan(0);
  });

  it('never returns the exact point', () => {
    const moved = offsetPublicLocation(exact, 'listing-1');
    expect(moved.lat === exact.lat && moved.lng === exact.lng).toBe(false);
  });
});

describe('getPublicArea', () => {
  it('prefers the saved area', () => {
    expect(getPublicArea({ location: { area: 'Kallio' } })).toEqual('Kallio');
  });

  it('derives the area for listings saved with a full address', () => {
    expect(
      getPublicArea({ location: { address: 'Mannerheimintie 1, 00100 Helsinki, Suomi' } })
    ).toEqual('Helsinki');
  });

  it('is null without a location', () => {
    expect(getPublicArea({})).toEqual(null);
    expect(getPublicArea(null)).toEqual(null);
  });
});
