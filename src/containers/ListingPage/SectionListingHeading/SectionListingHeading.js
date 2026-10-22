import React from 'react';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';

import { IconReviewStar, NamedLink } from '../../../components';

import { getListingArea, getReviewsSummary } from '../ListingPage.shared';
import ShareButton from './ShareButton';

import css from './SectionListingHeading.module.css';

const IconPin = () => (
  <svg className={css.icon} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

/**
 * Listing title row (Listing and ListingDesktop mockups): title, rating from the listing's
 * loaded reviews (hidden when there are none), the rough area and a Share button.
 * The exact address and distance are not shown.
 *
 * @component
 * @param {Object} props
 * @param {ReactNode} props.richTitle formatted listing title
 * @param {string} props.title plain listing title (for sharing)
 * @param {Object} props.listing API entity
 * @param {Array<Object>} props.reviews review entities
 * @param {Object} props.reviewsLinkProps NamedLink props for the reviews anchor
 * @returns {JSX.Element} listing heading
 */
const SectionListingHeading = props => {
  const { richTitle, title, listing, reviews, reviewsLinkProps } = props;
  const intl = useIntl();
  const summary = getReviewsSummary(reviews);
  const area = getListingArea(listing.attributes.publicData);

  return (
    <div className={css.root}>
      <div className={css.titleColumn}>
        <h1 className={css.title}>{richTitle}</h1>
        {summary || area ? (
          <div className={css.meta}>
            {summary ? (
              <p className={css.rating}>
                <IconReviewStar className={css.star} isFilled />
                <span className={css.ratingValue}>{intl.formatNumber(summary.average)}</span>
                <span aria-hidden="true">·</span>
                <NamedLink className={css.reviewsLink} {...reviewsLinkProps}>
                  <FormattedMessage
                    id="ListingPage.reviewsCount"
                    values={{ count: summary.count }}
                  />
                </NamedLink>
              </p>
            ) : null}
            {area ? (
              <p className={css.area}>
                <IconPin />
                {area}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      <ShareButton title={title} />
    </div>
  );
};

export default SectionListingHeading;
