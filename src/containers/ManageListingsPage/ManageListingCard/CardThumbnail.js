import React from 'react';
import classNames from 'classnames';

import { useConfiguration } from '../../../context/configurationContext';
import { requireListingImage } from '../../../util/configHelpers';
import {
  LISTING_STATE_DRAFT,
  LISTING_STATE_CLOSED,
  LISTING_STATE_PENDING_APPROVAL,
  LISTING_STATE_PUBLISHED,
} from '../../../util/types';

import {
  AspectRatioWrapper,
  NamedLink,
  ResponsiveImage,
  ListingCardThumbnail,
} from '../../../components';

import css from './CardThumbnail.module.css';

/**
 * Returns whether to show the out-of-stock overlay for a manage listing card.
 *
 * @param {Object} params
 * @param {Object} params.listing - Listing entity (ownListing)
 * @param {boolean} params.isBookable - Whether the listing is bookable
 * @returns {boolean}
 */
export const getShowOutOfStockOverlay = ({ listing, isBookable }) => {
  const state = listing?.attributes?.state;
  const currentStock = listing?.currentStock?.attributes?.quantity;
  return !isBookable && currentStock === 0 && state === LISTING_STATE_PUBLISHED;
};

/**
 * Returns the status of a manage listing card that isn't simply live, or null when it's live.
 * Only one status is active at a time.
 *
 * @param {Object} params
 * @param {string} params.state - Listing state (listing.attributes.state)
 * @param {boolean} params.showOutOfStockOverlay - Whether the listing is out of stock
 * @returns {'draft'|'closed'|'pendingApproval'|'outOfStock'|null}
 */
export const getOverlayType = ({ state, showOutOfStockOverlay }) => {
  if (state === LISTING_STATE_DRAFT) return 'draft';
  if (state === LISTING_STATE_CLOSED) return 'closed';
  if (state === LISTING_STATE_PENDING_APPROVAL) return 'pendingApproval';
  if (showOutOfStockOverlay) return 'outOfStock';
  return null;
};

/**
 * Photo of a manage listing card (DragonRent sticker card). Links to the same page as the
 * card's title. A closed listing's photo is faded; the status and actions are shown below it
 * by ManageListingCard.
 *
 * @param {Object} props
 * @param {Object} props.listing - Own listing entity
 * @param {string} [props.renderSizes] - Render sizes for responsive image
 * @param {Object} props.linkProps - NamedLink props (name, params, ariaLabel)
 * @param {boolean} [props.isDimmed] - Fade the photo (closed listing)
 * @returns {JSX.Element}
 */
const CardThumbnail = props => {
  const config = useConfiguration();
  const { listing, renderSizes, linkProps, isDimmed } = props;

  const title = listing.attributes?.title ?? '';
  const publicData = listing.attributes?.publicData || {};
  const cardStyle = publicData.cardStyle;
  const firstImage = listing.images && listing.images.length > 0 ? listing.images[0] : null;

  const validListingTypes = config.listing?.listingTypes || [];
  const foundListingTypeConfig = validListingTypes.find(
    conf => conf.listingType === publicData.listingType
  );
  const showListingImage = requireListingImage(foundListingTypeConfig);

  const { aspectWidth = 1, aspectHeight = 1, variantPrefix = 'listing-card' } =
    config.layout?.listingImage || {};
  const variants = firstImage
    ? Object.keys(firstImage?.attributes?.variants || {}).filter(k => k.startsWith(variantPrefix))
    : [];

  return (
    <NamedLink className={classNames(css.thumbnailLink, { [css.dimmed]: isDimmed })} {...linkProps}>
      <AspectRatioWrapper width={aspectWidth} height={aspectHeight}>
        {showListingImage ? (
          <ResponsiveImage
            rootClassName={css.rootForImage}
            alt={title}
            image={firstImage}
            variants={variants}
            sizes={renderSizes}
          />
        ) : (
          <ListingCardThumbnail style={cardStyle} width={aspectWidth} height={aspectHeight} />
        )}
      </AspectRatioWrapper>
    </NamedLink>
  );
};

export default CardThumbnail;
