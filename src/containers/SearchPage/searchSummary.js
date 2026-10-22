import { boundsCenter, distanceInKm } from '../../util/maps';
import { parseDateFromISO8601 } from '../../util/dates';

import { getCategoryName } from './SearchFilterChips/SearchFilterChips';

// ICU select value for a part of the heading that isn't in the search
const NONE = 'none';

// "Helsinki, Finland" → "Helsinki"
const placeName = address => (address ? `${address}`.split(',')[0].trim() : null);

/**
 * The parts of the current search the Search mockup shows: what, where and when.
 *
 * @param {Object} params valid query params from the URL
 * @param {Object} config app configuration
 * @param {Object} intl
 * @returns {{ keywords: string|null, categoryName: string|null, place: string|null, datesLabel: string|null }}
 */
export const getSearchParts = (params, config, intl) => {
  const categories = config.categoryConfiguration?.categories || [];
  const categoryName = params.pub_categoryLevel1 ? getCategoryName(categories, params) : null;

  const [start, end] = params.dates
    ? `${params.dates}`.split(',').map(v => parseDateFromISO8601(v))
    : [];
  const datesLabel =
    start && end ? intl.formatDateTimeRange(start, end, { day: 'numeric', month: 'short' }) : null;

  return {
    keywords: params.keywords ? `${params.keywords}`.trim() || null : null,
    categoryName,
    place: placeName(params.address),
    datesLabel,
  };
};

/**
 * Results heading, e.g. "18 items for “drill” near Helsinki".
 *
 * @param {Object} parts from getSearchParts
 * @param {number} count total number of results
 * @param {Object} intl
 * @returns {string} heading
 */
export const getResultsHeading = (parts, count, intl) => {
  const { keywords, categoryName, place } = parts;
  return intl.formatMessage(
    { id: 'SearchPage.resultsHeading' },
    {
      count,
      keywords: keywords || NONE,
      // Keywords are more specific than the category, so the heading names only one of them
      category: !keywords && categoryName ? categoryName : NONE,
      place: place || NONE,
    }
  );
};

/**
 * Summary of the current search for the phone search bar: "Drill" and "Helsinki · Any dates".
 *
 * @param {Object} parts from getSearchParts
 * @param {Object} intl
 * @returns {{ title: string, subtitle: string, ariaLabel: string }}
 */
export const getSearchSummary = (parts, intl) => {
  const { keywords, categoryName, place, datesLabel } = parts;
  const title =
    keywords || categoryName || intl.formatMessage({ id: 'SearchPage.summaryAllItems' });
  const subtitle = intl.formatMessage(
    { id: 'SearchPage.summaryWhereWhen' },
    {
      place: place || intl.formatMessage({ id: 'SearchPage.summaryAnyPlace' }),
      dates: datesLabel || intl.formatMessage({ id: 'SearchPage.summaryAnyDates' }),
    }
  );
  const ariaLabel = intl.formatMessage(
    { id: 'SearchPage.changeSearch' },
    { summary: `${title}, ${subtitle}` }
  );
  return { title, subtitle, ariaLabel };
};

// The center of a bigger area (a whole city, often with sea in its bounds) is too far from
// where the renter is to measure "3 km away" from it
const MAX_AREA_DIAGONAL_KM = 10;

/**
 * Where to measure card distances from: the searched place, but only after a place search.
 * Once the renter moves the map, the results are no longer "near" the searched place.
 * Without an exact origin, the center of the searched area is used when the area is small
 * (a street, postcode or neighbourhood).
 *
 * @param {Object} params search params from the URL (address, bounds, origin)
 * @param {boolean} isMapSearch whether the results come from moving the map
 * @returns {LatLng|null} origin for distances
 */
export const getDistanceOrigin = (params, isMapSearch) => {
  if (!params.address || isMapSearch) {
    return null;
  }
  if (params.origin) {
    return params.origin;
  }
  const { bounds } = params;
  const isSmallArea = !!bounds && distanceInKm(bounds.ne, bounds.sw) <= MAX_AREA_DIAGONAL_KM;
  return isSmallArea ? boundsCenter(bounds) : null;
};
