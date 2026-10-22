import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../../util/reactIntl';
import { formatCurrencyMajorUnit } from '../../../util/currency';
import { parseDateFromISO8601 } from '../../../util/dates';

import css from './SearchFilterChips.module.css';

const CATEGORY_PARAMS = ['pub_categoryLevel1', 'pub_categoryLevel2', 'pub_categoryLevel3'];

// Find the name of the deepest selected category (e.g. "Bikes" or "Bikes › Cargo bikes")
export const getCategoryName = (categories, params) => {
  let options = categories;
  let name = null;
  for (const param of CATEGORY_PARAMS) {
    const found = (options || []).find(c => c.id === params[param]);
    if (!found) break;
    name = found.name;
    options = found.subcategories;
  }
  return name;
};

/**
 * Build chip data for the active built-in filters (category, price, dates, listing type).
 * Each chip lists the query params that removing it clears.
 *
 * @param {Object} params valid query params from the URL
 * @param {Object} config app configuration
 * @param {Object} intl
 * @returns {Array<{ key: string, label: string, paramNames: Array<string> }>}
 */
export const getFilterChips = (params, config, intl) => {
  const chips = [];
  const categories = config.categoryConfiguration?.categories || [];

  const categoryName = params.pub_categoryLevel1 ? getCategoryName(categories, params) : null;
  if (categoryName) {
    chips.push({ key: 'category', label: categoryName, paramNames: CATEGORY_PARAMS });
  }

  const listingTypeId = params.pub_listingType;
  const listingTypeConfig = (config.listing?.listingTypes || []).find(
    lt => lt.listingType === listingTypeId
  );
  if (listingTypeConfig) {
    chips.push({
      key: 'listingType',
      label: listingTypeConfig.label || listingTypeId,
      paramNames: ['pub_listingType'],
    });
  }

  if (params.price) {
    const [min, max] = `${params.price}`.split(',').map(v => Number.parseInt(v, 10));
    if (Number.isFinite(min) && Number.isFinite(max)) {
      const currency = config.currency;
      chips.push({
        key: 'price',
        label: intl.formatMessage(
          { id: 'SearchFilterChips.priceRange' },
          {
            minPrice: formatCurrencyMajorUnit(intl, currency, min),
            maxPrice: formatCurrencyMajorUnit(intl, currency, max),
          }
        ),
        paramNames: ['price'],
      });
    }
  }

  if (params.dates) {
    const [start, end] = `${params.dates}`.split(',').map(v => parseDateFromISO8601(v));
    if (start && end) {
      chips.push({
        key: 'dates',
        label: intl.formatDateTimeRange(start, end, { day: 'numeric', month: 'short' }),
        paramNames: ['dates'],
      });
    }
  }

  return chips;
};

const IconRemove = () => (
  <svg
    className={css.removeIcon}
    width="10"
    height="10"
    viewBox="0 0 10 10"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/**
 * Removable chips for active search filters, plus a "Clear all" button.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to component's own css.root
 * @param {Object} props.urlQueryParams valid query params from the URL
 * @param {Object} props.config app configuration
 * @param {Object} props.intl
 * @param {Function} props.onRemove called with an object of params to clear, e.g. { price: null }
 * @param {Function} props.onClearAll resets all filters
 * @returns {JSX.Element|null} filter chips
 */
const SearchFilterChips = props => {
  const { className, urlQueryParams, config, intl, onRemove, onClearAll } = props;
  const chips = getFilterChips(urlQueryParams, config, intl);

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className={classNames(css.root, className)}>
      <ul
        className={css.list}
        aria-label={intl.formatMessage({ id: 'SearchFilterChips.activeFilters' })}
      >
        {chips.map(chip => (
          <li key={chip.key}>
            <button
              type="button"
              className={css.chip}
              onClick={() =>
                onRemove(chip.paramNames.reduce((acc, name) => ({ ...acc, [name]: null }), {}))
              }
              aria-label={intl.formatMessage(
                { id: 'SearchFilterChips.removeFilter' },
                { filter: chip.label }
              )}
            >
              <span>{chip.label}</span>
              <IconRemove />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className={css.clearAll} onClick={onClearAll}>
        <FormattedMessage id="SearchFilterChips.clearAll" />
      </button>
    </div>
  );
};

export default SearchFilterChips;
