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

    await waitFor(() => {
      expect(screen.getByText('LandingPage.hero.title')).toBeInTheDocument();
    });
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByText('LandingPage.howItWorks.title')).toBeInTheDocument();
    expect(screen.getByText('LandingPage.trust.title')).toBeInTheDocument();
    expect(screen.getByText('LandingPage.hostCta.title')).toBeInTheDocument();
    // No featured listings section in Console: no listings section
    expect(screen.queryByText('LandingPage.popularRentals.seeAll')).not.toBeInTheDocument();
  });

  it('renders the page even if the hosted landing page failed to load', async () => {
    const error = { type: 'error', name: 'Error', message: 'LandingPage failed', status: 500 };
    render(<LandingPageComponent pageAssetsData={null} inProgress={false} error={error} />);

    await waitFor(() => {
      expect(screen.getByText('LandingPage.hero.title')).toBeInTheDocument();
    });
  });
});

describe('buildLandingPageData', () => {
  const formatMessage = fakeIntl.formatMessage;

  it('uses fallback meta and omits the listings section without hosted data', () => {
    const { sections, meta } = buildLandingPageData(undefined, formatMessage);

    expect(sections.map(s => s.sectionType)).toEqual([
      'homeHero',
      'homeExploreRentals',
      'homeUseCases',
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
    expect(getPopularCategories(categories).map(c => c.id)).toEqual([
      'bikes',
      'cameras',
      'camping',
    ]);
    expect(getAvailableUseCases(categories).map(u => u.id)).toEqual([
      'outdoorAdventures',
      'photography',
    ]);
  });

  it('renders category tiles linking to category searches', () => {
    render(<SectionExploreRentals sectionId="explore" categories={categories} />);

    expect(screen.getByText('Bikes').closest('a')).toHaveAttribute(
      'href',
      '/s?pub_categoryLevel1=bikes'
    );
    expect(screen.getByText('LandingPage.exploreRentals.viewAll').closest('a')).toHaveAttribute(
      'href',
      '/s'
    );
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
