import { types as sdkTypes } from '../../util/sdkLoader';
import { getDefaultConfiguration } from '../../util/testHelpers';
import { createListing } from '../../util/testData';

import { getReviewsSummary } from './ListingPage.shared';
import { getSimilarListingsQueryParams } from './ListingPage.duck';
import { getMonthWeeks } from './SectionAvailability/SectionAvailability';

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

describe('getMonthWeeks', () => {
  it('lays out a month starting on Monday', () => {
    // October 2026 starts on a Thursday
    const weeks = getMonthWeeks('2026-10', 'Europe/Helsinki', 1);
    expect(weeks).toHaveLength(5);
    expect(weeks[0].slice(0, 3)).toEqual([null, null, null]);
    expect(weeks[0][3]).toBeInstanceOf(Date);
    // 31 days in total
    expect(weeks.flat().filter(Boolean)).toHaveLength(31);
    weeks.forEach(week => expect(week).toHaveLength(7));
  });

  it('lays out a month starting on Sunday', () => {
    const weeks = getMonthWeeks('2026-10', 'Europe/Helsinki', 0);
    expect(weeks[0].slice(0, 4)).toEqual([null, null, null, null]);
  });
});
