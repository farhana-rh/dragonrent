import React from 'react';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { isBookingProcessAlias } from '../../../transactions/transaction';

import { AvatarMedium, IconReviewStar, NamedLink } from '../../../components';

import { getReviewsSummary, priceData } from '../ListingPage.shared';

import css from './SectionListingHeading.module.css';

/**
 * Listing title with rating summary, price (mobile) and host row.
 * The rating is the average of the listing's reviews loaded on the page; it's hidden when
 * there are no reviews.
 *
 * @component
 * @param {Object} props
 * @param {ReactNode} props.richTitle formatted listing title
 * @param {Object} props.listing API entity
 * @param {Array<Object>} props.reviews review entities
 * @param {string} props.authorDisplayName
 * @param {string} props.marketplaceCurrency
 * @param {boolean} props.showPrice whether the listing type shows a price
 * @param {Object} props.reviewsLinkProps NamedLink props for the reviews anchor
 * @returns {JSX.Element} listing heading
 */
const SectionListingHeading = props => {
  const {
    richTitle,
    listing,
    reviews,
    authorDisplayName,
    marketplaceCurrency,
    showPrice,
    reviewsLinkProps,
  } = props;
  const intl = useIntl();
  const { price, publicData } = listing.attributes;
  const author = listing.author;
  const summary = getReviewsSummary(reviews);

  const { formattedPrice } = priceData(price, marketplaceCurrency, intl);
  const isBookable = isBookingProcessAlias(publicData?.transactionProcessAlias);
  const hostSince = author?.attributes?.createdAt
    ? intl.formatDate(author.attributes.createdAt, { year: 'numeric' })
    : null;

  return (
    <div className={css.root}>
      <h1 className={css.title}>{richTitle}</h1>

      {summary ? (
        <p className={css.meta}>
          <IconReviewStar className={css.star} isFilled />
          <span className={css.rating}>{intl.formatNumber(summary.average)}</span>
          <NamedLink className={css.reviewsLink} {...reviewsLinkProps}>
            <FormattedMessage id="ListingPage.reviewsCount" values={{ count: summary.count }} />
          </NamedLink>
        </p>
      ) : null}

      {showPrice && formattedPrice ? (
        <p className={css.price}>
          <span className={css.priceValue}>{formattedPrice}</span>
          {isBookable ? (
            <span className={css.perUnit}>
              {' '}
              <FormattedMessage
                id="ListingCard.perUnitShort"
                values={{ unitType: publicData?.unitType }}
              />
            </span>
          ) : null}
        </p>
      ) : null}

      {author ? (
        <div className={css.host}>
          <AvatarMedium className={css.avatar} user={author} disableProfileLink />
          <div className={css.hostText}>
            <span className={css.hostName}>
              <FormattedMessage id="ListingPage.hostedBy" values={{ name: authorDisplayName }} />
            </span>
            {hostSince ? (
              <span className={css.hostSince}>
                <FormattedMessage id="ListingPage.hostSince" values={{ year: hostSince }} />
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SectionListingHeading;
