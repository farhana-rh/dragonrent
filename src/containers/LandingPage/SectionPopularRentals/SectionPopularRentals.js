import React, { useEffect } from 'react';

import { useConfiguration } from '../../../context/configurationContext';
import { FormattedMessage } from '../../../util/reactIntl';

import { ListingCard, NamedLink } from '../../../components';

import css from './SectionPopularRentals.module.css';

// DESIGN.md: hide the section until the marketplace has at least 8 real listings,
// then show the first 4 (one row on desktop, 2 × 2 on phones).
export const MIN_LISTINGS_TO_SHOW = 8;
const LISTINGS_SHOWN = 4;

// Title depends on how the listings were selected in Console, so the heading stays accurate:
// "newest" shows recently published listings, "queryString" shows a hand-picked selection.
const TITLE_IDS = {
  newest: 'LandingPage.popularRentals.titleNewest',
  queryString: 'LandingPage.popularRentals.titleFeatured',
};

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M6 3.5L10.5 8 6 12.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Listings section on the landing page, styled after "Popular near you" in the Main and
 * HomeDesktop mockups. It is driven by a "Featured listings" section in Console
 * (Content → Pages → landing-page): the listing selection (newest or a search query) is
 * configured there and fetched with the shared featuredListings duck. Nothing is shown while
 * loading, on errors or with fewer than MIN_LISTINGS_TO_SHOW listings.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @param {('newest'|'queryString')} props.listingSelection
 * @param {Array<Object>} props.allSections all sections on the page (needed by the fetch)
 * @param {Object} props.options contains featuredListings data and fetch function
 * @returns {JSX.Element|null} listings section
 */
const SectionPopularRentals = props => {
  const { sectionId, listingSelection, allSections, options } = props;
  const config = useConfiguration();
  const { onFetchFeaturedListings, getListingEntitiesById, parentPage, featuredListingData } =
    options?.featuredListings || {};

  const sectionData = featuredListingData?.[sectionId] || {};
  const { listingIds, fetched = false, inProgress, error } = sectionData;
  const allListings =
    listingIds && getListingEntitiesById ? getListingEntitiesById(listingIds) : [];

  useEffect(() => {
    // Same trigger as PageBuilder's SectionListings: fetch once on the client
    if (onFetchFeaturedListings && !fetched && inProgress !== true && !error) {
      onFetchFeaturedListings(sectionId, parentPage, config.layout.listingImage, allSections);
    }
  }, []);

  if (!fetched || error || allListings.length < MIN_LISTINGS_TO_SHOW) {
    return null;
  }

  const listings = allListings.slice(0, LISTINGS_SHOWN);
  const titleId = `${sectionId}-title`;

  return (
    <section id={sectionId} className={css.root} aria-labelledby={titleId}>
      <div className={css.content}>
        <div className={css.header}>
          <h2 id={titleId} className={css.title}>
            <FormattedMessage id={TITLE_IDS[listingSelection] || TITLE_IDS.queryString} />
          </h2>
          <NamedLink className={css.link} name="SearchPage">
            <FormattedMessage id="LandingPage.popularRentals.seeAllRentals" />
            <ArrowIcon />
          </NamedLink>
        </div>

        <ul className={css.list}>
          {listings.map(listing => (
            <li key={listing.id.uuid} className={css.item}>
              <ListingCard
                listing={listing}
                showAuthorInfo={false}
                renderSizes="(max-width: 767px) 50vw, (max-width: 1239px) 25vw, 300px"
              />
            </li>
          ))}
        </ul>

        <NamedLink className={css.buttonMobile} name="SearchPage">
          <FormattedMessage id="LandingPage.popularRentals.seeAllRentals" />
          <ArrowIcon />
        </NamedLink>
      </div>
    </section>
  );
};

export default SectionPopularRentals;
