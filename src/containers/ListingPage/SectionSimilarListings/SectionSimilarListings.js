import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import { FormattedMessage } from '../../../util/reactIntl';
import { getListingsById } from '../../../ducks/marketplaceData.duck';

import { Heading, ListingCard } from '../../../components';

import css from './SectionSimilarListings.module.css';

/**
 * "Similar rentals": listings from the same category (or listing type), fetched by
 * ListingPage.duck.js. The section is hidden while loading, on error, and when there are none,
 * since it's supplementary content.
 *
 * @component
 * @returns {JSX.Element|null} similar listings section
 */
const SectionSimilarListings = () => {
  const listings = useSelector(
    state => getListingsById(state, state.ListingPage.similarListingIds || []),
    shallowEqual
  );

  if (listings.length === 0) {
    return null;
  }

  return (
    <section className={css.root} aria-labelledby="similar-listings-title">
      <Heading as="h2" rootClassName={css.title} id="similar-listings-title">
        <FormattedMessage id="ListingPage.similarListingsTitle" />
      </Heading>
      <ul className={css.list}>
        {listings.map(listing => (
          <li key={listing.id.uuid}>
            <ListingCard
              listing={listing}
              showAuthorInfo={false}
              renderSizes="(max-width: 767px) 60vw, (max-width: 1120px) 25vw, 264px"
            />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SectionSimilarListings;
