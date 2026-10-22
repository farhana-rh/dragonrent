import { createIntl } from 'react-intl';

import { types as sdkTypes } from '../../util/sdkLoader';
import messages from '../../translations/en.json';
import fiMessages from '../../translations/fi.json';

import {
  getDistanceOrigin,
  getResultsHeading,
  getSearchParts,
  getSearchSummary,
} from './searchSummary';

const { LatLng, LatLngBounds } = sdkTypes;

const intl = createIntl({ locale: 'en', messages });

const config = {
  categoryConfiguration: {
    categories: [
      {
        id: 'tools',
        name: 'Tools & Equipment',
        subcategories: [{ id: 'drills', name: 'Drills', subcategories: [] }],
      },
    ],
  },
};

const helsinkiBounds = new LatLngBounds(new LatLng(60.3, 25.2), new LatLng(60.1, 24.8));

describe('getSearchParts', () => {
  it('reads keywords, the deepest category, the place name and the dates', () => {
    const parts = getSearchParts(
      {
        keywords: ' drill ',
        pub_categoryLevel1: 'tools',
        pub_categoryLevel2: 'drills',
        address: 'Helsinki, Finland',
        dates: '2026-11-12,2026-11-14',
      },
      config,
      intl
    );
    expect(parts.keywords).toBe('drill');
    expect(parts.categoryName).toBe('Drills');
    expect(parts.place).toBe('Helsinki');
    expect(parts.datesLabel).toMatch(/12/);
    expect(parts.datesLabel).toMatch(/14/);
  });

  it('returns nulls for an empty search', () => {
    expect(getSearchParts({}, config, intl)).toEqual({
      keywords: null,
      categoryName: null,
      place: null,
      datesLabel: null,
    });
  });
});

describe('getResultsHeading', () => {
  const none = { keywords: null, categoryName: null, place: null };

  it('counts items', () => {
    expect(getResultsHeading(none, 1, intl)).toBe('1 item');
    expect(getResultsHeading(none, 18, intl)).toBe('18 items');
    expect(getResultsHeading(none, 0, intl)).toBe('0 items');
  });

  it('names the keywords and the place', () => {
    const parts = { ...none, keywords: 'drill', place: 'Helsinki' };
    expect(getResultsHeading(parts, 18, intl)).toBe('18 items for “drill” near Helsinki');
  });

  it('names the category only without keywords', () => {
    const parts = { ...none, categoryName: 'Tools & Equipment' };
    expect(getResultsHeading(parts, 3, intl)).toBe('3 items in Tools & Equipment');
    expect(getResultsHeading({ ...parts, keywords: 'drill' }, 3, intl)).toBe('3 items for “drill”');
  });

  it('has a Finnish version', () => {
    const fiIntl = createIntl({ locale: 'fi', messages: fiMessages });
    const parts = { ...none, keywords: 'pora', place: 'Helsinki' };
    expect(getResultsHeading(parts, 2, fiIntl)).toBe('2 tuotetta haulla ”pora”, sijainti Helsinki');
  });
});

describe('getSearchSummary', () => {
  it('falls back to "All items", "Anywhere" and "Any dates"', () => {
    const summary = getSearchSummary(getSearchParts({}, config, intl), intl);
    expect(summary.title).toBe('All items');
    expect(summary.subtitle).toBe('Anywhere · Any dates');
    expect(summary.ariaLabel).toBe('Change search: All items, Anywhere · Any dates');
  });

  it('shows the keywords and place', () => {
    const parts = getSearchParts({ keywords: 'Drill', address: 'Helsinki, Finland' }, config, intl);
    const summary = getSearchSummary(parts, intl);
    expect(summary.title).toBe('Drill');
    expect(summary.subtitle).toBe('Helsinki · Any dates');
  });
});

describe('getDistanceOrigin', () => {
  it('uses the center of a small searched area', () => {
    // Kallio, about 2 km across
    const kallioBounds = new LatLngBounds(new LatLng(60.19, 24.96), new LatLng(60.178, 24.94));
    const origin = getDistanceOrigin({ address: 'Kallio, Helsinki', bounds: kallioBounds }, false);
    expect(origin.lat).toBeCloseTo(60.184);
    expect(origin.lng).toBeCloseTo(24.95);
  });

  it('is null for a whole city, whose center can be far from the renter', () => {
    expect(getDistanceOrigin({ address: 'Helsinki', bounds: helsinkiBounds }, false)).toBeNull();
  });

  it('prefers the origin param when there is one', () => {
    const origin = new LatLng(60.17, 24.94);
    expect(getDistanceOrigin({ address: 'Helsinki', bounds: helsinkiBounds, origin }, false)).toBe(
      origin
    );
  });

  it('is null without a place search or after moving the map', () => {
    expect(getDistanceOrigin({ bounds: helsinkiBounds }, false)).toBeNull();
    expect(getDistanceOrigin({ address: 'Helsinki', bounds: helsinkiBounds }, true)).toBeNull();
  });
});
