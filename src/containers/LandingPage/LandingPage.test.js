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
import { getPopularCategories } from './SectionHomeHero/SectionHomeHero';
import SectionExploreRentals from './SectionExploreRentals/SectionExploreRentals';
import SectionHostCta from './SectionHostCta/SectionHostCta';
import SectionPopularRentals from './SectionPopularRentals/SectionPopularRentals';
import SectionRentWithConfidence from './SectionRentWithConfidence/SectionRentWithConfidence';
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
        expect(screen.getByText('LandingPage.hero.titleNew')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByText('LandingPage.howItWorks.title')).toBeInTheDocument();
    expect(screen.getByText('LandingPage.trust.titleNew')).toBeInTheDocument();
    expect(screen.getByText('LandingPage.hostCta.titleNew')).toBeInTheDocument();
    // "Browse by use case" is not on the page
    expect(screen.queryByText('LandingPage.useCases.title')).not.toBeInTheDocument();
    // No featured listings section in Console: no listings section
    expect(screen.queryByText('LandingPage.popularRentals.seeAll')).not.toBeInTheDocument();
  });

  it('renders the page even if the hosted landing page failed to load', async () => {
    const error = { type: 'error', name: 'Error', message: 'LandingPage failed', status: 500 };
    render(<LandingPageComponent pageAssetsData={null} inProgress={false} error={error} />);

    // PageBuilder is loaded lazily, which can take longer than the default 1s on a busy machine
    await waitFor(
      () => {
        expect(screen.getByText('LandingPage.hero.titleNew')).toBeInTheDocument();
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
      'homeRentWithConfidence',
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
    // Listings come right after the category tiles
    expect(sections[2].sectionType).toEqual('listings');
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
  it('picks popular categories and use cases only for existing categories', () => {
    const consoleCategories = [
      { id: 'sports-and-outdoor', name: 'Sports & Outdoor' },
      { id: 'home-and-appliances', name: 'Home & Appliances' },
      { id: 'cameras-and-photography', name: 'Cameras & Photography' },
    ];
    // In the order of popularCategoryIds, skipping categories that aren't popular
    expect(getPopularCategories(consoleCategories).map(c => c.id)).toEqual([
      'cameras-and-photography',
      'sports-and-outdoor',
    ]);
    expect(getAvailableUseCases(categories).map(u => u.id)).toEqual([
      'outdoorAdventures',
      'photography',
    ]);
  });

  it('renders category tiles linking to category searches', () => {
    render(<SectionExploreRentals sectionId="explore" categories={categories} />);

    expect(screen.getByText('LandingPage.categories.title')).toBeInTheDocument();
    expect(screen.getByText('Bikes').closest('a')).toHaveAttribute(
      'href',
      '/s?pub_categoryLevel1=bikes'
    );
    expect(screen.getByText('LandingPage.categories.seeAll').closest('a')).toHaveAttribute(
      'href',
      '/s'
    );
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

describe('SectionRentWithConfidence', () => {
  it('shows only items whose feature is live', () => {
    render(<SectionRentWithConfidence sectionId="trust" />);

    expect(screen.getByText('LandingPage.trust.transparentPricing.title')).toBeInTheDocument();
    expect(screen.getByText('LandingPage.trust.reviews.title')).toBeInTheDocument();
    expect(screen.queryByText('LandingPage.trust.securePayments.title')).not.toBeInTheDocument();
    expect(screen.queryByText('LandingPage.trust.support.title')).not.toBeInTheDocument();
  });

  it('hides the trust page link until a trust page is configured', () => {
    render(<SectionRentWithConfidence sectionId="trust" />);

    expect(screen.getByText('LandingPage.trust.titleNew')).toBeInTheDocument();
    expect(screen.queryByText('LandingPage.trust.learnMore')).not.toBeInTheDocument();
  });
});

describe('SectionHostCta', () => {
  it('links to listing creation and to the lender steps', () => {
    render(<SectionHostCta sectionId="list-an-item" />);

    expect(screen.getByText('LandingPage.hostCta.primaryButton').closest('a')).toHaveAttribute(
      'href',
      '/l/new'
    );
    expect(screen.getByText('LandingPage.hostCta.secondaryButton').closest('a')).toHaveAttribute(
      'href',
      '#how-dragonrent-works-tab-lend'
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

  it('fetches listings on mount and shows a busy state while loading', () => {
    const onFetch = jest.fn();
    const { container } = render(<SectionPopularRentals {...sectionProps({}, [], onFetch)} />);

    expect(onFetch).toHaveBeenCalledWith(
      'popular',
      'landing-page',
      expect.any(Object),
      expect.any(Array)
    );
    expect(container.querySelector('section')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('LandingPage.popularRentals.titleNewest')).toBeInTheDocument();
    expect(screen.getByText('LandingPage.popularRentals.subtitleNewest')).toBeInTheDocument();
  });

  it('renders fetched listings', () => {
    const listing = createListing(
      'l1',
      { title: 'Electric cargo bike' },
      { author: createUser('u1') }
    );
    const onFetch = jest.fn();
    render(
      <SectionPopularRentals
        {...sectionProps({ fetched: true, listingIds: [listing.id] }, [listing], onFetch)}
      />
    );

    expect(onFetch).not.toHaveBeenCalled();
    expect(screen.getByText('Electric cargo bike')).toBeInTheDocument();
  });

  it('renders at most 8 listings', () => {
    const listings = [...Array(10).keys()].map(i =>
      createListing(`l${i}`, { title: `Listing ${i}` }, { author: createUser('u1') })
    );
    render(
      <SectionPopularRentals
        {...sectionProps({ fetched: true, listingIds: listings.map(l => l.id) }, listings)}
      />
    );

    expect(screen.getByText('Listing 7')).toBeInTheDocument();
    expect(screen.queryByText('Listing 8')).not.toBeInTheDocument();
  });

  it('renders an empty state', () => {
    render(<SectionPopularRentals {...sectionProps({ fetched: true, listingIds: [] })} />);

    expect(screen.getByRole('status')).toHaveTextContent('LandingPage.popularRentals.emptyTitle');
    expect(screen.getByText('LandingPage.popularRentals.emptyCta').closest('a')).toHaveAttribute(
      'href',
      '/l/new'
    );
  });

  it('renders an error state', () => {
    const error = { type: 'error', name: 'Error', message: 'Request failed', status: 500 };
    render(<SectionPopularRentals {...sectionProps({ fetched: false, error })} />);

    expect(screen.getByRole('alert')).toHaveTextContent('LandingPage.popularRentals.errorTitle');
  });
});
