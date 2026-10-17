import React, { useState } from 'react';
import { FormattedMessage, useIntl } from '../../util/reactIntl';

import { Heading, IconReviewStar, Reviews } from '../../components';

import { getReviewsSummary } from './ListingPage.shared';

import css from './ListingPage.module.css';

const INITIAL_REVIEW_COUNT = 4;

/**
 * Reviews section. The heading shows the average of the listing's loaded reviews.
 *
 * @component
 * @param {Object} props
 * @param {Array<propTypes.review>} props.reviews - The reviews
 * @param {propTypes.error} props.fetchReviewsError - The fetch reviews error
 * @returns {JSX.Element} reviews section
 */
const SectionReviews = props => {
  const { reviews = [], fetchReviewsError } = props;
  const intl = useIntl();
  const [showAll, setShowAll] = useState(false);
  const summary = getReviewsSummary(reviews);
  const visibleReviews = showAll ? reviews : reviews.slice(0, INITIAL_REVIEW_COUNT);
  const hiddenCount = reviews.length - visibleReviews.length;

  return (
    <section id="reviews" className={css.sectionReviews}>
      <Heading as="h2" rootClassName={css.reviewsHeading}>
        {summary ? (
          <>
            <IconReviewStar className={css.reviewsHeadingStar} isFilled />
            <FormattedMessage
              id="ListingPage.reviewsSummary"
              values={{ rating: intl.formatNumber(summary.average), count: summary.count }}
            />
          </>
        ) : (
          <FormattedMessage id="ListingPage.reviewsHeading" />
        )}
      </Heading>
      {fetchReviewsError ? (
        <p className={css.errorText} role="alert">
          <FormattedMessage id="ListingPage.reviewsError" />
        </p>
      ) : null}
      {!fetchReviewsError && reviews.length === 0 ? (
        <p className={css.noReviews}>
          <FormattedMessage id="ListingPage.noReviews" />
        </p>
      ) : null}
      <Reviews className={css.reviewsList} reviews={visibleReviews} />
      {hiddenCount > 0 || showAll ? (
        <button
          type="button"
          className={css.showAllReviewsButton}
          aria-expanded={showAll}
          onClick={() => setShowAll(value => !value)}
        >
          {showAll ? (
            <FormattedMessage id="ListingPage.showFewerReviews" />
          ) : (
            <FormattedMessage id="ListingPage.showAllReviews" values={{ count: reviews.length }} />
          )}
        </button>
      ) : null}
    </section>
  );
};

export default SectionReviews;
