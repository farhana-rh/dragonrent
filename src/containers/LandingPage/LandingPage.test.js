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
import SectionAllCategories from './SectionAllCategories/SectionAllCategories';
import SectionHostCta from './SectionHostCta/SectionHostCta';
import SectionHowItWorks from './SectionHowItWorks/SectionHowItWorks';
import SectionTrustStrip from './SectionTrustStrip/SectionTrustStrip';
import HeroSearchForm from './HeroSearchForm/HeroSearchForm';
import SectionPopularRentals, {
  MIN_LISTINGS_TO_SHOW,
  getScrollEdges,
} from './SectionPopularRentals/SectionPopularRentals';
import SectionUseCases, { getAvailableUseCases } from './SectionUseCases/SectionUseCases';

const { screen, waitFor, fireEvent } = testingLibrary;

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
        expect(screen.getByText('LandingPage.hero.titleSticker')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByText('LandingPage.trustStrip.title')).toBeInTheDocument();
    expect(screen.getByText('LandingPage.hero.whatLabel')).toBeInTheDocument();
    expect(screen.getByText('LandingPage.howItWorks.titleV2')).toBeInTheDocument();
    expect(screen.getByText('LandingPage.trustPoints.title')).toBeInTheDocument();
    expect(screen.getByText('LandingPage.lenderPath.title')).toBeInTheDocument();
    // "Trust & Safety" in the top bar links to the lender section
    expect(document.getElementById('trust-and-safety')).toBeInTheDocument();
    // "Browse by use case" is not on the page
    expect(screen.queryByText('LandingPage.useCases.title')).not.toBeInTheDocument();
    // No featured listings section in Console: no listings carousel
    expect(screen.queryAllByText('LandingPage.popularRentals.seeAllRentals')).toHaveLength(0);
    // The default test configuration has no categories, so no "All categories" button
    expect(screen.queryByText('LandingPage.allCategories.button')).not.toBeInTheDocument();
  });

  it('renders the page even if the hosted landing page failed to load', async () => {
    const error = { type: 'error', name: 'Error', message: 'LandingPage failed', status: 500 };
    render(<LandingPageComponent pageAssetsData={null} inProgress={false} error={error} />);

    // PageBuilder is loaded lazily, which can take longer than the default 1s on a busy machine
    await waitFor(
      () => {
        expect(screen.getByText('LandingPage.hero.titleSticker')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});

describe('buildLandingPageData', () => {
  const formatMessage = fakeIntl.formatMessage;

  it('uses fallback meta and omits the listings carousel without hosted data', () => {
    const { sections, meta } = buildLandingPageData(undefined, formatMessage);

    expect(sections.map(s => s.sectionType)).toEqual([
      'homeHero',
      'homeAllCategories',
      'homeTrustStrip',
      'homeHowItWorks',
      'homeHostCta',
    ]);
    expect(meta.pageTitle.content).toEqual('LandingPage.metaTitle');
  });

  it('uses hosted meta and the first hosted featured listings section for the carousel', () => {
    const hosted = {
      meta: { pageTitle: { fieldType: 'metaTitle', content: 'Hosted title' } },
      sections: [
        { sectionType: 'hero', sectionId: 'intro' },
        { sectionType: 'listings', listingSelection: 'queryString', listingSearchQuery: { a: 1 } },
        { sectionType: 'listings', listingSelection: 'newest' },
      ],
    };
    const { sections, meta } = buildLandingPageData(hosted, formatMessage);

    expect(meta.pageTitle.content).toEqual('Hosted title');
    expect(sections.filter(s => s.sectionType === 'listings')).toEqual([
      {
        sectionType: 'listings',
        sectionId: 'popular-rentals',
        listingSelection: 'queryString',
        listingSearchQuery: { a: 1 },
      },
    ]);
    // Carousel right under the hero, then the "All categories" button, then the payments card
    expect(sections.map(s => s.sectionType)).toEqual([
      'homeHero',
      'listings',
      'homeAllCategories',
      'homeTrustStrip',
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

  it('renders nothing when there are no categories', () => {
    const { container } = render(
      <>
        <SectionAllCategories sectionId="all-categories" categories={[]} />
        <SectionUseCases sectionId="use-cases" categories={[]} />
      </>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('links the "All categories" button to the categories page', () => {
    render(<SectionAllCategories sectionId="all-categories" categories={categories} />);

    expect(screen.getByText('LandingPage.allCategories.button').closest('a')).toHaveAttribute(
      'href',
      '/categories'
    );
  });
});

describe('SectionHostCta', () => {
  it('has one call to action to start lending and links the damage policy', () => {
    render(<SectionHostCta sectionId="trust-and-safety" />);

    expect(screen.getByText('LandingPage.lenderPath.button').closest('a')).toHaveAttribute(
      'href',
      '/l/new'
    );
    // The damage policy link sits inside a translated message, which the test intl renders as
    // its id only, so the call to action is the one link here
    expect(screen.getAllByRole('link')).toHaveLength(1);
    // The four lender points, each a real behaviour of the marketplace
    ['choose', 'paid', 'address', 'breaks'].forEach(id =>
      expect(screen.getByText(`LandingPage.lenderPath.${id}.title`)).toBeInTheDocument()
    );
    expect(screen.getByText('LandingPage.lenderPath.feeNote')).toBeInTheDocument();
  });
});

describe('SectionTrustStrip', () => {
  it('opens and closes the payments dialog', () => {
    render(<SectionTrustStrip sectionId="how-paying-works" />);

    expect(screen.getByText('LandingPage.trustStrip.title')).toBeInTheDocument();
    const dialog = document.querySelector('dialog');
    expect(dialog).not.toHaveAttribute('open');

    fireEvent.click(screen.getByText('LandingPage.trustStrip.button'));
    expect(dialog).toHaveAttribute('open');
    ['request', 'accept', 'decline', 'cancel', 'stripe', 'lenders'].forEach(id =>
      expect(screen.getByText(`LandingPage.trustStrip.fact.${id}`)).toBeInTheDocument()
    );

    // The "Close" button at the bottom of the dialog
    fireEvent.click(screen.getByText('LandingPage.trustStrip.close'));
    expect(dialog).not.toHaveAttribute('open');
  });
});

describe('HeroSearchForm', () => {
  it('shows the first example search as the keyword placeholder', () => {
    render(<HeroSearchForm />);

    expect(screen.getByPlaceholderText('LandingPage.hero.prompt.1')).toBeInTheDocument();
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

  it('stays hidden without listings', () => {
    const listings = createListings(MIN_LISTINGS_TO_SHOW - 1);
    const { container } = render(
      <SectionPopularRentals
        {...sectionProps({ fetched: true, listingIds: listings.map(l => l.id) }, listings)}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows every fetched listing in one carousel', () => {
    const listings = createListings(10);
    const onFetch = jest.fn();
    render(
      <SectionPopularRentals
        {...sectionProps({ fetched: true, listingIds: listings.map(l => l.id) }, listings, onFetch)}
      />
    );

    expect(onFetch).not.toHaveBeenCalled();
    expect(screen.getByText('LandingPage.popularRentals.titleNewest')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(10);
    expect(screen.getByText('Listing 9')).toBeInTheDocument();
    // No "Explore" label above the title
    expect(screen.queryByText('LandingPage.popularRentals.eyebrow')).not.toBeInTheDocument();
    expect(
      screen.getByText('LandingPage.popularRentals.seeAllRentals').closest('a')
    ).toHaveAttribute('href', '/s');
  });

  it('scrolls the row with the arrow buttons', () => {
    const listings = createListings(10);
    render(
      <SectionPopularRentals
        {...sectionProps({ fetched: true, listingIds: listings.map(l => l.id) }, listings)}
      />
    );

    // jsdom has no layout, so every card "fits" and the arrows start hidden
    const previous = screen.getByRole('button', {
      name: 'LandingPage.popularRentals.previous',
      hidden: true,
    });
    const next = screen.getByRole('button', {
      name: 'LandingPage.popularRentals.next',
      hidden: true,
    });
    expect(next.parentElement).toHaveAttribute('hidden');

    // Give the row a width wider than its view, then report a scroll: arrows show, at the start
    const list = screen.getAllByRole('list')[0];
    Object.defineProperty(list, 'scrollWidth', { configurable: true, value: 2000 });
    Object.defineProperty(list, 'clientWidth', { configurable: true, value: 800 });
    fireEvent.scroll(list);
    expect(next.parentElement).not.toHaveAttribute('hidden');
    expect(previous).toBeDisabled();
    expect(next).toBeEnabled();

    list.scrollBy = jest.fn();
    fireEvent.click(next);
    expect(list.scrollBy).toHaveBeenCalledWith(
      expect.objectContaining({ left: expect.any(Number) })
    );
  });

  it('stays hidden when loading fails', () => {
    const error = { type: 'error', name: 'Error', message: 'Request failed', status: 500 };
    const { container } = render(
      <SectionPopularRentals {...sectionProps({ fetched: false, error })} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});

describe('getScrollEdges', () => {
  const el = (scrollLeft, scrollWidth = 1000, clientWidth = 400) => ({
    scrollLeft,
    scrollWidth,
    clientWidth,
  });

  it('tells whether the carousel is at its start or end', () => {
    expect(getScrollEdges(null)).toEqual({ atStart: true, atEnd: false });
    expect(getScrollEdges(el(0))).toEqual({ atStart: true, atEnd: false });
    expect(getScrollEdges(el(300))).toEqual({ atStart: false, atEnd: false });
    expect(getScrollEdges(el(600))).toEqual({ atStart: false, atEnd: true });
    // Everything fits: both arrows off
    expect(getScrollEdges(el(0, 400, 400))).toEqual({ atStart: true, atEnd: true });
  });
});
