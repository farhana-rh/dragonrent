import { types as sdkTypes } from '../../util/sdkLoader';
import { getDefaultConfiguration } from '../../util/testHelpers';
import { createListing } from '../../util/testData';

import { getListingArea, getReviewsSummary } from './ListingPage.shared';
import { getSimilarListingsQueryParams, withoutListing } from './ListingPage.duck';
import { splitIncludedItems } from './SectionWhatYouGet/SectionWhatYouGet';

const { UUID } = sdkTypes;

describe('getReviewsSummary', () => {
  it('returns null when there are no rated reviews', () => {
    expect(getReviewsSummary([])).toEqual(null);
    expect(getReviewsSummary(undefined)).toEqual(null);
    expect(getReviewsSummary([{ id: new UUID('r1'), attributes: {} }])).toEqual(null);
  });

  it('averages ratings to one decimal', () => {
    const reviews = [5, 5, 4].map((rating, i) => ({
      id: new UUID(`r${i}`),
      attributes: { rating },
    }));
    expect(getReviewsSummary(reviews)).toEqual({ average: 4.7, count: 3 });
  });
});

describe('getSimilarListingsQueryParams', () => {
  const config = getDefaultConfiguration();

  it('queries the same top-level category when the listing has one', () => {
    const listing = createListing('l1', {
      publicData: { categoryLevel1: 'cameras', listingType: 'daily-rental' },
    });
    const params = getSimilarListingsQueryParams(listing, config);
    expect(params.pub_categoryLevel1).toEqual('cameras');
    expect(params.pub_listingType).toBeUndefined();
    expect(params.perPage).toEqual(5);
  });

  it('falls back to the listing type', () => {
    const listing = createListing('l1', { publicData: { listingType: 'daily-rental' } });
    const params = getSimilarListingsQueryParams(listing, config);
    expect(params.pub_listingType).toEqual('daily-rental');
    expect(params.pub_categoryLevel1).toBeUndefined();
  });

  it('returns null without category or listing type', () => {
    const listing = createListing('l1', { publicData: {} });
    expect(getSimilarListingsQueryParams(listing, config)).toEqual(null);
  });
});

describe('withoutListing', () => {
  const ref = (type, id) => ({ id: new UUID(id), type });
  const listing = {
    id: new UUID('current'),
    author: { id: new UUID('owner') },
  };
  const response = {
    data: {
      data: [
        {
          ...ref('listing', 'current'),
          relationships: { images: { data: [ref('image', 'img1')] } },
        },
        { ...ref('listing', 'other'), relationships: { images: { data: [ref('image', 'img2')] } } },
      ],
      included: [
        ref('image', 'img1'),
        ref('image', 'img2'),
        ref('user', 'owner'),
        ref('user', 'u2'),
      ],
    },
  };

  it("drops the current listing, its images and its owner so they don't overwrite page data", () => {
    const result = withoutListing(response, listing);
    expect(result.data.data.map(l => l.id.uuid)).toEqual(['other']);
    expect(result.data.included.map(e => e.id.uuid)).toEqual(['img2', 'u2']);
  });
});

describe('getListingArea', () => {
  const area = address => getListingArea({ location: { address } });

  it('returns the first named place, without the country', () => {
    expect(area('Kallio, Helsinki, Suomi')).toEqual('Kallio');
    expect(area('Helsinki, Uudenmaan maakunta, Suomi')).toEqual('Helsinki');
  });

  it('skips the street address and postal code', () => {
    expect(area('Mannerheimintie 1, 00100 Helsinki, Suomi')).toEqual('Helsinki');
  });

  it('returns null without an address', () => {
    expect(getListingArea({})).toEqual(null);
    expect(area('Fleminginkatu 1')).toEqual(null);
  });
});

describe('splitIncludedItems', () => {
  it('splits on commas, semicolons and line breaks', () => {
    expect(splitIncludedItems('2 batteries, charger;  carry case\nbits')).toEqual([
      '2 batteries',
      'charger',
      'carry case',
      'bits',
    ]);
  });

  it('returns an empty list for empty values', () => {
    expect(splitIncludedItems('')).toEqual([]);
    expect(splitIncludedItems(undefined)).toEqual([]);
    expect(splitIncludedItems(' , ')).toEqual([]);
  });
});
