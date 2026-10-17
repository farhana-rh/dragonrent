import React, { useEffect } from 'react';

import { useConfiguration } from '../../../context/configurationContext';
import { FormattedMessage } from '../../../util/reactIntl';

import { ErrorMessage, ListingCard, NamedLink } from '../../../components';

import SectionHeader from '../SectionHeader/SectionHeader';

import css from './SectionPopularRentals.module.css';

const MAX_LISTINGS = 4;
const SKELETON_KEYS = ['a', 'b', 'c', 'd'];

// Title depends on how the listings were selected in Console, so the heading stays accurate:
// "newest" shows recently published listings, "queryString" shows a hand-picked selection.
const TITLE_IDS = {
  newest: 'LandingPage.popularRentals.titleNewest',
  queryString: 'LandingPage.popularRentals.titleFeatured',
};

const ListingSkeletons = () => (
  <ul className={css.list} aria-hidden="true">
    {SKELETON_KEYS.map(key => (
      <li key={key} className={css.skeleton}>
        <div className={css.skeletonImage} />
        <div className={css.skeletonLine} />
        <div className={css.skeletonLineShort} />
      </li>
    ))}
  </ul>
);

/**
 * Listings section on the landing page. It is driven by a "Featured listings" section in
 * Console (Content → Pages → landing-page): the listing selection (newest or a search query)
 * is configured there and fetched with the shared featuredListings duck.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @param {('newest'|'queryString')} props.listingSelection
 * @param {Array<Object>} props.allSections all sections on the page (needed by the fetch)
 * @param {Object} props.options contains featuredListings data and fetch function
 * @returns {JSX.Element} listings section
 */
const SectionPopularRentals = props => {
  const { sectionId, listingSelection, allSections, options } = props;
  const config = useConfiguration();
  const { onFetchFeaturedListings, getListingEntitiesById, parentPage, featuredListingData } =
    options?.featuredListings || {};

  const sectionData = featuredListingData?.[sectionId] || {};
  const { listingIds, fetched = false, inProgress, error } = sectionData;
  const listings = (listingIds && getListingEntitiesById
    ? getListingEntitiesById(listingIds)
    : []
  ).slice(0, MAX_LISTINGS);

  useEffect(() => {
    // Same trigger as PageBuilder's SectionListings: fetch once on the client
    if (onFetchFeaturedListings && !fetched && inProgress !== true && !error) {
      onFetchFeaturedListings(sectionId, parentPage, config.layout.listingImage, allSections);
    }
  }, []);

  const titleId = `${sectionId}-title`;
  const isLoading = !fetched && !error;

  return (
    <section
      id={sectionId}
      className={css.root}
      aria-labelledby={titleId}
      aria-busy={isLoading ? 'true' : undefined}
    >
      <div className={css.content}>
        <SectionHeader
          titleId={titleId}
          title={<FormattedMessage id={TITLE_IDS[listingSelection] || TITLE_IDS.queryString} />}
          linkText={<FormattedMessage id="LandingPage.popularRentals.seeAll" />}
          linkProps={{ name: 'SearchPage' }}
        />

        {error ? (
          <div className={css.message} role="alert">
            <p className={css.messageTitle}>
              <FormattedMessage id="LandingPage.popularRentals.errorTitle" />
            </p>
            <ErrorMessage className={css.errorDetails} error={error} />
            <NamedLink className={css.messageLink} name="SearchPage">
              <FormattedMessage id="LandingPage.popularRentals.browseAll" />
            </NamedLink>
          </div>
        ) : isLoading ? (
          <ListingSkeletons />
        ) : listings.length === 0 ? (
          <div className={css.message} role="status">
            <p className={css.messageTitle}>
              <FormattedMessage id="LandingPage.popularRentals.emptyTitle" />
            </p>
            <p className={css.messageText}>
              <FormattedMessage id="LandingPage.popularRentals.emptyText" />
            </p>
            <NamedLink className={css.messageLink} name="NewListingPage">
              <FormattedMessage id="LandingPage.popularRentals.emptyCta" />
            </NamedLink>
          </div>
        ) : (
          <ul className={css.list}>
            {listings.map(listing => (
              <li key={listing.id.uuid}>
                <ListingCard
                  listing={listing}
                  showAuthorInfo={false}
                  renderSizes="(max-width: 767px) 60vw, (max-width: 1120px) 25vw, 260px"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default SectionPopularRentals;
