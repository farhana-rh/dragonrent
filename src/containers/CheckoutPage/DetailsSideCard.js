import React from 'react';

import { FormattedMessage } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { createSlug } from '../../util/urlHelpers';
import { formatMoney } from '../../util/currency';

import { H4, H6, NamedLink, ResponsiveImage } from '../../components';

import css from './CheckoutPage.module.css';

/**
 * A card that displays the listing and booking details on the checkout page.
 *
 * @component
 * @param {Object} props
 * @param {propTypes.listing} props.listing - The listing
 * @param {string} props.listingTitle - The listing title
 * @param {propTypes.user} props.author - The author
 * @param {propTypes.image} props.firstImage - The first image
 * @param {Object} props.layoutListingImageConfig - The layout listing image config
 * @param {ReactNode} props.speculateTransactionErrorMessage - The speculate transaction error message
 * @param {boolean} props.showPrice - Whether to show the price
 * @param {string} props.processName - The process name
 * @param {ReactNode} props.breakdown - The breakdown
 * @param {intlShape} props.intl - The intl object
 */
const DetailsSideCard = props => {
  const {
    listing,
    listingTitle,
    priceVariantName,
    author,
    firstImage,
    layoutListingImageConfig,
    speculateTransactionErrorMessage,
    showPrice,
    breakdown,
    showListingImage,
    intl,
  } = props;

  const { price, publicData } = listing?.attributes || {};
  const unitType = publicData.unitType || 'unknown';

  const { variantPrefix = 'listing-card' } = layoutListingImageConfig || {};
  const variants = firstImage
    ? Object.keys(firstImage?.attributes?.variants).filter(k => k.startsWith(variantPrefix))
    : [];

  const authorName = author?.attributes?.profile?.displayName;

  return (
    <div className={css.detailsContainerDesktop} role="complementary">
      <div className={css.listingSummary}>
        {showListingImage ? (
          <div className={css.summaryImage}>
            <ResponsiveImage
              rootClassName={css.summaryImageImg}
              alt={listingTitle}
              image={firstImage}
              variants={variants}
              sizes="96px"
            />
          </div>
        ) : null}
        <div className={css.summaryText}>
          <H4 as="h2" className={css.summaryTitle}>
            <NamedLink
              className={css.summaryTitleLink}
              name="ListingPage"
              params={{ id: listing?.id?.uuid, slug: createSlug(listingTitle) }}
            >
              {listingTitle}
            </NamedLink>
          </H4>
          {authorName ? (
            <p className={css.summaryAuthor}>
              <FormattedMessage id="CheckoutPage.lentBy" values={{ name: authorName }} />
            </p>
          ) : null}
          {showPrice ? (
            <div className={css.priceContainer}>
              <p className={css.price}>{formatMoney(intl, price)}</p>
              <div className={css.perUnit}>
                <FormattedMessage
                  id="CheckoutPageWithInquiryProcess.perUnit"
                  values={{ unitType }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {speculateTransactionErrorMessage}

      {!!breakdown ? (
        <div className={css.orderBreakdownHeader}>
          {priceVariantName ? (
            <div className={css.bookingPriceVariant}>
              <p>{priceVariantName}</p>
            </div>
          ) : null}

          <H6 as="h3" className={css.orderBreakdownTitle}>
            <FormattedMessage id="CheckoutPage.priceDetails" />
          </H6>
        </div>
      ) : null}
      {breakdown}
    </div>
  );
};

export default DetailsSideCard;
