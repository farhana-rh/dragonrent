import React from 'react';
import loadable from '@loadable/component';

import { bool, object } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { useIntl } from '../../util/reactIntl';
import { camelize } from '../../util/string';
import { propTypes } from '../../util/types';

import { ASSET_NAME } from './LandingPage.duck';
import { fetchFeaturedListings } from '../../ducks/featuredListings.duck';
import { getListingsById } from '../../ducks/marketplaceData.duck';
import { getFeaturedListingsProps } from '../../util/data';

import SectionHomeHero from './SectionHomeHero/SectionHomeHero';
import SectionExploreRentals from './SectionExploreRentals/SectionExploreRentals';
import SectionPopularRentals from './SectionPopularRentals/SectionPopularRentals';
import SectionHowItWorks from './SectionHowItWorks/SectionHowItWorks';
import SectionRentWithConfidence from './SectionRentWithConfidence/SectionRentWithConfidence';
import SectionHostCta from './SectionHostCta/SectionHostCta';
import { HOW_IT_WORKS_SECTION_ID } from './landingPageConfig';

const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

// The landing page sections are implemented in code. They are rendered through PageBuilder
// as custom section types, so the page keeps PageBuilder's layout, SEO metadata handling and
// featured listings data flow.
const sectionComponents = {
  homeHero: { component: SectionHomeHero },
  homeExploreRentals: { component: SectionExploreRentals },
  // Keeps the 'listings' section type: the featuredListings duck identifies listing sections
  // by this type when it stores fetched listings.
  listings: { component: SectionPopularRentals },
  homeHowItWorks: { component: SectionHowItWorks },
  homeRentWithConfidence: { component: SectionRentWithConfidence },
  homeHostCta: { component: SectionHostCta },
};

const POPULAR_RENTALS_SECTION_ID = 'popular-rentals';

/**
 * Build the landing page sections. Content comes from code, except:
 * - SEO metadata (Console → Content → Pages → landing-page → Meta)
 * - the listing selection for the listings section, which uses the first
 *   "Featured listings" section of the Console landing page. Without one, that section is omitted.
 *
 * @param {Object} hostedPageData landing-page asset data from Console (may be undefined)
 * @param {Function} formatMessage intl.formatMessage
 * @returns {Object} page data in page asset format: { sections, meta }
 */
export const buildLandingPageData = (hostedPageData, formatMessage) => {
  const hostedSections = hostedPageData?.sections || [];
  const featuredListingsSection = hostedSections.find(s => s.sectionType === 'listings');

  const popularRentalsMaybe = featuredListingsSection
    ? [
        {
          sectionType: 'listings',
          sectionId: POPULAR_RENTALS_SECTION_ID,
          listingSelection: featuredListingsSection.listingSelection,
          listingSearchQuery: featuredListingsSection.listingSearchQuery,
        },
      ]
    : [];

  const sections = [
    { sectionType: 'homeHero', sectionId: 'hero' },
    { sectionType: 'homeExploreRentals', sectionId: 'explore-rentals' },
    ...popularRentalsMaybe,
    // "Browse by use case" (SectionUseCases) is not on the page at the moment. To bring it back,
    // add it to sectionComponents and here: { sectionType: 'homeUseCases', sectionId: 'use-cases' }
    { sectionType: 'homeHowItWorks', sectionId: HOW_IT_WORKS_SECTION_ID },
    { sectionType: 'homeRentWithConfidence', sectionId: 'rent-with-confidence' },
    { sectionType: 'homeHostCta', sectionId: 'list-an-item' },
  ];

  // Use Console metadata when it exists; otherwise fall back to local translations
  const fallbackMeta = {
    pageTitle: { fieldType: 'metaTitle', content: formatMessage({ id: 'LandingPage.metaTitle' }) },
    pageDescription: {
      fieldType: 'metaDescription',
      content: formatMessage({ id: 'LandingPage.metaDescription' }),
    },
  };
  const meta = hostedPageData?.meta?.pageTitle ? hostedPageData.meta : fallbackMeta;

  return { sections, meta };
};

export const LandingPageComponent = props => {
  const { pageAssetsData, inProgress, error } = props;
  const intl = useIntl();
  const hostedPageData = pageAssetsData?.[camelize(ASSET_NAME)]?.data;

  return (
    <PageBuilder
      pageAssetsData={buildLandingPageData(hostedPageData, intl.formatMessage)}
      inProgress={inProgress}
      error={error}
      options={{ sectionComponents }}
      featuredListings={getFeaturedListingsProps(camelize(ASSET_NAME), props)}
    />
  );
};

LandingPageComponent.propTypes = {
  pageAssetsData: object,
  inProgress: bool,
  error: propTypes.error,
};

const mapStateToProps = state => {
  const { pageAssetsData, inProgress, error } = state.hostedAssets || {};
  const featuredListingData = state.featuredListings || {};

  const getListingEntitiesById = listingIds => getListingsById(state, listingIds);

  return { pageAssetsData, featuredListingData, getListingEntitiesById, inProgress, error };
};

const mapDispatchToProps = dispatch => ({
  onFetchFeaturedListings: (sectionId, parentPage, listingImageConfig, allSections) =>
    dispatch(fetchFeaturedListings({ sectionId, parentPage, listingImageConfig, allSections })),
});

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
//
// See: https://github.com/ReactTraining/react-router/issues/4671
const LandingPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(LandingPageComponent);

export default LandingPage;
