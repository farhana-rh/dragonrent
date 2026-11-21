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
import SectionTrustStrip from './SectionTrustStrip/SectionTrustStrip';
import SectionExploreRentals from './SectionExploreRentals/SectionExploreRentals';
import SectionHowItWorks from './SectionHowItWorks/SectionHowItWorks';
import SectionHostCta from './SectionHostCta/SectionHostCta';
import { HOW_IT_WORKS_SECTION_ID, TRUST_SECTION_ID } from './landingPageConfig';

const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

// The landing page sections are implemented in code. They are rendered through PageBuilder
// as custom section types, so the page keeps PageBuilder's layout, SEO metadata handling and
// featured listings data flow.
const sectionComponents = {
  homeHero: { component: SectionHomeHero },
  homeTrustStrip: { component: SectionTrustStrip },
  homeExploreRentals: { component: SectionExploreRentals },
  homeHowItWorks: { component: SectionHowItWorks },
  homeHostCta: { component: SectionHostCta },
};

/**
 * Build the landing page sections. Content comes from code, except the SEO metadata
 * (Console → Content → Pages → landing-page → Meta).
 *
 * The listings section ("New on DragonRent", SectionPopularRentals) is not on the page (user,
 * 21 Nov). To bring it back, add `listings: { component: SectionPopularRentals }` to
 * sectionComponents (the featuredListings duck identifies listing sections by that type) and a
 * section built from the first "Featured listings" section of the Console landing page:
 * { sectionType: 'listings', sectionId: 'popular-rentals', listingSelection, listingSearchQuery }
 *
 * @param {Object} hostedPageData landing-page asset data from Console (may be undefined)
 * @param {Function} formatMessage intl.formatMessage
 * @returns {Object} page data in page asset format: { sections, meta }
 */
export const buildLandingPageData = (hostedPageData, formatMessage) => {
  const sections = [
    { sectionType: 'homeHero', sectionId: 'hero' },
    { sectionType: 'homeExploreRentals', sectionId: 'explore-rentals' },
    // The payments trust strip sits under the categories (user, 21 Nov)
    { sectionType: 'homeTrustStrip', sectionId: 'how-paying-works' },
    // "Browse by use case" (SectionUseCases) is not on the page at the moment. To bring it back,
    // add it to sectionComponents and here: { sectionType: 'homeUseCases', sectionId: 'use-cases' }
    // How it works also shows the trust points ("Safe and simple")
    { sectionType: 'homeHowItWorks', sectionId: HOW_IT_WORKS_SECTION_ID },
    // "What if something breaks?" for lenders; the top bar's "Trust & Safety" links here
    { sectionType: 'homeHostCta', sectionId: TRUST_SECTION_ID },
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
