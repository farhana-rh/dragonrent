import { displayPrice, isPriceVariationsEnabled } from '../../util/configHelpers';
import { formatMoney } from '../../util/currency';
import { getLowestDailyPrice } from '../../util/durationPricing';
import { distanceInKm } from '../../util/maps';
import { richText } from '../../util/richText';
import { isBookingProcessAlias } from '../../transactions/transaction';

import css from './ListingCard.module.css';

const MIN_LENGTH_FOR_LONG_WORDS = 10;

const priceData = (price, currency, intl) => {
  if (price && price.currency === currency) {
    const formattedPrice = formatMoney(intl, price);
    return { formattedPrice, priceTooltip: formattedPrice };
  } else if (price) {
    return {
      formattedPrice: intl.formatMessage(
        { id: 'ListingCard.unsupportedPrice' },
        { currency: price.currency }
      ),
      priceTooltip: intl.formatMessage(
        { id: 'ListingCard.unsupportedPriceTitle' },
        { currency: price.currency }
      ),
    };
  }
  return {};
};

/**
 * "Under 1 km away" or "3 km away" from the searched place to the listing. Whole kilometres
 * only: the listing location is approximate on the item page, so the card doesn't get more
 * precise than that.
 *
 * @param {Object} listing API entity with attributes.geolocation
 * @param {LatLng?} origin center of the searched place
 * @param {Object} intl
 * @returns {string|null} distance text, or null without an origin or listing location
 */
export const getDistanceText = (listing, origin, intl) => {
  const km = distanceInKm(origin, listing?.attributes?.geolocation);
  if (km == null) {
    return null;
  }
  return km < 1
    ? intl.formatMessage({ id: 'ListingCard.distanceUnderOneKm' })
    : intl.formatMessage({ id: 'ListingCard.distanceKm' }, { km: Math.round(km) });
};

/**
 * Returns all translated and formatted strings for ListingCard so the
 * presentational component can stay simple and aria-labels use the same copy.
 *
 * @param {Object} listing - API entity: listing or ownListing
 * @param {Object} config - app configuration (e.g. from useConfiguration())
 * @param {Object} intl - React Intl instance (e.g. from useIntl())
 * @returns {Object} translations and derived values:
 *   - titlePlain: raw title string (for aria/alt)
 *   - titleFormatted: React nodes from richText(title) for display
 *   - showPrice: whether to show the price block
 *   - priceTooltip: string for the price element's title attribute (tooltip on hover)
 *   - priceMessage: React nodes for the price block content (styled amount + per-unit)
 *   - cardAriaLabel: ready-to-use aria-label for the card link (listing title + plain price line when shown)
 *   - authorName: "ListingCard.author" string containing author's display name
 */
export const getListingCardTranslations = (listing, config, intl) => {
  const { title = '', price, publicData } = listing?.attributes || {};

  const authorDisplayName = listing?.author?.attributes?.profile?.displayName;
  const authorName = intl.formatMessage(
    { id: 'ListingCard.author' },
    { authorName: authorDisplayName }
  );

  const validListingTypes = config.listing.listingTypes || [];
  const { listingType } = publicData || {};
  const listingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);

  const showPrice = displayPrice(listingTypeConfig);
  // Daily listings with 3- or 7-day prices show their lowest daily rate: "From €8 / day"
  const lowestDailyPrice = getLowestDailyPrice(price, publicData);
  const hasLowerDurationPrice = !!price && lowestDailyPrice.amount < price.amount;
  const { formattedPrice: shownPrice, priceTooltip } = priceData(
    lowestDailyPrice,
    config.currency,
    intl
  );
  const formattedPrice =
    hasLowerDurationPrice && shownPrice != null
      ? intl.formatMessage({ id: 'ListingCard.fromPrice' }, { price: shownPrice })
      : shownPrice;

  const isPriceVariationsInUse = isPriceVariationsEnabled(publicData, listingTypeConfig);
  const hasMultiplePriceVariants = isPriceVariationsInUse && publicData?.priceVariants?.length > 1;
  const isBookable = isBookingProcessAlias(publicData?.transactionProcessAlias);

  const priceMessageId =
    hasMultiplePriceVariants && !hasLowerDurationPrice
      ? 'ListingCard.priceStartingFrom'
      : 'ListingCard.price';

  const perUnitString = isBookable
    ? intl.formatMessage({ id: 'ListingCard.perUnit' }, { unitType: publicData?.unitType })
    : '';
  // Compact unit for the visible price, e.g. "€28 / day". Screen readers get "per day".
  const perUnitShortString = isBookable
    ? intl.formatMessage({ id: 'ListingCard.perUnitShort' }, { unitType: publicData?.unitType })
    : '';

  // Visible price block uses JSX spans for styling; aria-label needs a plain string.
  const priceValue = <span className={css.priceValue}>{formattedPrice}</span>;
  const pricePerUnit = isBookable ? <span className={css.perUnit}>{perUnitShortString}</span> : '';
  const priceMessage =
    showPrice && formattedPrice != null
      ? intl.formatMessage({ id: priceMessageId }, { priceValue, pricePerUnit })
      : '';

  const priceMessagePlain =
    showPrice && formattedPrice != null
      ? intl.formatMessage(
          { id: priceMessageId },
          { priceValue: formattedPrice, pricePerUnit: perUnitString }
        )
      : '';

  const cardAriaLabel =
    priceMessagePlain.length > 0
      ? intl.formatMessage(
          { id: 'ListingCard.screenreader.label' },
          { listingTitle: title, formattedPrice: priceMessagePlain }
        )
      : title;

  return {
    titlePlain: title,
    titleFormatted: richText(title, {
      longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS,
      longWordClass: css.longWord,
    }),
    authorName,
    showPrice,
    priceTooltip,
    priceMessage,
    cardAriaLabel,
  };
};
