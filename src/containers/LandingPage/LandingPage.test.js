import React from 'react';
import '@testing-library/jest-dom';

import { fakeIntl, createListing, createUser } from '../../util/testData';
import {
  getDefaultConfiguration,
  renderWithProviders as render,
  testingLibrary,
} from '../../util/testHelpers';

import { LandingPageComponent, buildLandingPageData } from './LandingPage';
import { getAvailableSearchFields } from './HeroSearchForm/HeroSearchForm';
import SectionExploreRentals from './SectionExploreRentals/SectionExploreRentals';
import SectionHostCta from './SectionHostCta/SectionHostCta';
import SectionHowItWorks from './SectionHowItWorks/SectionHowItWorks';
import SectionPopularRentals, {
  MIN_LISTINGS_TO_SHOW,
} from './SectionPopularRentals/SectionPopularRentals';
import SectionUseCases, { getAvailableUseCases } from './SectionUseCases/SectionUseCases';

const { screen, waitFor } = testingLibrary;

const categories = [
  { id: 'bikes', name: 'Bikes' },
  { id: 'cameras', name: 'Cameras' },
  { id: 'camping', name: 'Camping' },
];

describe('LandingPage', () => {
  it('renders the code-based homepage even without hosted page data', async () => {
    render(<LandingPageComponent pageAssetsData={null} inProgress={false} error={null} />);

    // PageBuilder is loaded lazily, which can take longer than the default 1s on a busy machine
    await waitFor(
      () => {
        expect(screen.getByText('LandingPage.hero.titleV2')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByText('LandingPage.hero.whatLabel')).toBeInTheDocument();
    expect(screen.getByText('LandingPage.howItWorks.titleV2')).toBeInTheDocument();
    expect(screen.getByText('LandingPage.trustPoints.title')).toBeInTheDocument();
    expect(screen.getByText('LandingPage.lendBanner.title')).toBeInTheDocument();
    // "Browse by use case" is not on the page
    expect(screen.queryByText('LandingPage.useCases.title')).not.toBeInTheDocument();
    // No featured listings section in Console: no listings section
    expect(screen.queryAllByText('LandingPage.popularRentals.seeAllRentals')).toHaveLength(0);
  });

  it('renders the page even if the hosted landing page failed to load', async () => {
    const error = { type: 'error', name: 'Error', message: 'LandingPage failed', status: 500 };
    render(<LandingPageComponent pageAssetsData={null} inProgress={false} error={error} />);

    // PageBuilder is loaded lazily, which can take longer than the default 1s on a busy machine
    await waitFor(
      () => {
        expect(screen.getByText('LandingPage.hero.titleV2')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});

describe('buildLandingPageData', () => {
  const formatMessage = fakeIntl.formatMessage;

  it('uses fallback meta and omits the listings section without hosted data', () => {
    const { sections, meta } = buildLandingPageData(undefined, formatMessage);

    expect(sections.map(s => s.sectionType)).toEqual([
      'homeHero',
      'homeExploreRentals',
      'homeHowItWorks',
      'homeHostCta',
    ]);
    expect(meta.pageTitle.content).toEqual('LandingPage.metaTitle');
  });

  it('uses hosted meta and the first hosted featured listings section', () => {
    const hosted = {
      meta: { pageTitle: { fieldType: 'metaTitle', content: 'Hosted title' } },
      sections: [
        { sectionType: 'hero', sectionId: 'intro' },
        { sectionType: 'listings', listingSelection: 'queryString', listingSearchQuery: { a: 1 } },
        { sectionType: 'listings', listingSelection: 'newest' },
      ],
    };
    const { sections, meta } = buildLandingPageData(hosted, formatMessage);
    const listingsSections = sections.filter(s => s.sectionType === 'listings');

    expect(meta.pageTitle.content).toEqual('Hosted title');
    expect(listingsSections).toEqual([
      {
        sectionType: 'listings',
        sectionId: 'popular-rentals',
        listingSelection: 'queryString',
        listingSearchQuery: { a: 1 },
      },
    ]);
    // Listings come right after the hero, before the category tiles (as in the mockups)
    expect(sections.map(s => s.sectionType)).toEqual([
      'homeHero',
      'listings',
      'homeExploreRentals',
      'homeHowItWorks',
      'homeHostCta',
    ]);
  });
});

describe('getAvailableSearchFields', () => {
  it('shows location only when a map provider token exists', () => {
    const config = getDefaultConfiguration();
    const withoutMap = {
      ...config,
      maps: { ...config.maps, mapProvider: 'mapbox', mapboxAccessToken: '' },
    };
    const withMap = {
      ...config,
      maps: { ...config.maps, mapProvider: 'mapbox', mapboxAccessToken: 'token' },
    };

    expect(getAvailableSearchFields(withoutMap).location).toEqual(false);
    expect(getAvailableSearchFields(withMap).location).toEqual(true);
  });

  it('shows dates only when the dates filter is configured', () => {
    const config = getDefaultConfiguration();
    const noDates = { ...config, search: { ...config.search, defaultFilters: [] } };
    const withDates = {
      ...config,
      search: { ...config.search, defaultFilters: [{ key: 'dates', schemaType: 'dates' }] },
    };

    expect(getAvailableSearchFields(noDates).dates).toEqual(false);
    expect(getAvailableSearchFields(withDates).dates).toEqual(true);
  });
});

describe('Category-driven sections', () => {
  it('picks use cases only for existing categories', () => {
    expect(getAvailableUseCases(categories).map(u => u.id)).toEqual([
      'outdoorAdventures',
      'photography',
    ]);
  });

  it('renders category tiles linking to category searches', () => {
    render(<SectionExploreRentals sectionId="explore" categories={categories} />);

    expect(screen.getByText('LandingPage.categories.titleV2')).toBeInTheDocument();
    expect(screen.getByText('Bikes').closest('a')).toHaveAttribute(
      'href',
      '/s?pub_categoryLevel1=bikes'
    );
    // A text link next to the title (desktop) and a full-width button (phones)
    const seeAll = screen.getAllByText('LandingPage.categories.seeAll');
    expect(seeAll).toHaveLength(2);
    seeAll.forEach(el => expect(el.closest('a')).toHaveAttribute('href', '/s'));
  });

  it('renders a category with no configured icon', () => {
    render(
      <SectionExploreRentals sectionId="explore" categories={[{ id: 'misc', name: 'Misc' }]} />
    );

    expect(
      screen
        .getByText('Misc')
        .closest('a')
        .querySelector('svg')
    ).toBeInTheDocument();
  });

  it('renders nothing when there are no categories', () => {
    const { container } = render(
      <>
        <SectionExploreRentals sectionId="explore" categories={[]} />
        <SectionUseCases sectionId="use-cases" categories={[]} />
      </>
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe('SectionHostCta', () => {
  it('has one secondary button to start lending', () => {
    render(<SectionHostCta sectionId="list-an-item" />);

    expect(screen.getByText('LandingPage.lendBanner.button').closest('a')).toHaveAttribute(
      'href',
      '/l/new'
    );
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });
});

describe('SectionHowItWorks', () => {
  it('shows three numbered steps and the trust points', () => {
    render(<SectionHowItWorks sectionId="how" />);

    const steps = screen.getAllByRole('listitem');
    // 3 steps + 3 trust points
    expect(steps).toHaveLength(6);
    expect(screen.getByText('LandingPage.howItWorks.steps.find.title')).toBeInTheDocument();
    expect(screen.getByText('LandingPage.howItWorks.steps.pickUp.title')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'LandingPage.trustPoints.title' })).toHaveTextContent(
      'LandingPage.trustPoints.identity'
    );
  });
});

describe('SectionPopularRentals', () => {
  const sectionProps = (sectionData, listings = [], onFetch = jest.fn()) => {
    const section = { sectionType: 'listings', sectionId: 'popular', listingSelection: 'newest' };
    return {
      ...section,
      allSections: [section],
      options: {
        featuredListings: {
          parentPage: 'landing-page',
          featuredListingData: { popular: sectionData },
          getListingEntitiesById: () => listings,
          onFetchFeaturedListings: onFetch,
        },
      },
    };
  };

  const createListings = count =>
    [...Array(count).keys()].map(i =>
      createListing(`l${i}`, { title: `Listing ${i}` }, { author: createUser('u1') })
    );

  it('fetches listings on mount and shows nothing while loading', () => {
    const onFetch = jest.fn();
    const { container } = render(<SectionPopularRentals {...sectionProps({}, [], onFetch)} />);

    expect(onFetch).toHaveBeenCalledWith(
      'popular',
      'landing-page',
      expect.any(Object),
      expect.any(Array)
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('stays hidden until there are enough listings', () => {
    const listings = createListings(MIN_LISTINGS_TO_SHOW - 1);
    const { container } = render(
      <SectionPopularRentals
        {...sectionProps({ fetched: true, listingIds: listings.map(l => l.id) }, listings)}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the first 4 listings once there are enough', () => {
    const listings = createListings(10);
    const onFetch = jest.fn();
    render(
      <SectionPopularRentals
        {...sectionProps({ fetched: true, listingIds: listings.map(l => l.id) }, listings, onFetch)}
      />
    );

    expect(onFetch).not.toHaveBeenCalled();
    expect(screen.getByText('LandingPage.popularRentals.titleNewest')).toBeInTheDocument();
    expect(screen.getByText('Listing 3')).toBeInTheDocument();
    expect(screen.queryByText('Listing 4')).not.toBeInTheDocument();
  });

  it('stays hidden when loading fails', () => {
    const error = { type: 'error', name: 'Error', message: 'Request failed', status: 500 };
    const { container } = render(
      <SectionPopularRentals {...sectionProps({ fetched: false, error })} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
