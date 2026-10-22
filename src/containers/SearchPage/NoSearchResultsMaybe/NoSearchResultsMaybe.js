import React from 'react';
import { FormattedMessage } from '../../../util/reactIntl';
import { NamedLink } from '../../../components';

import css from './NoSearchResultsMaybe.module.css';

/**
 * Empty state of the search results: a plain message, a way to clear the filters and, for those
 * who can lend, a link to add an item.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.listingsAreLoaded - Whether the search has finished
 * @param {number} props.totalItems - Number of results
 * @param {Object} props.location - Router location
 * @param {Function} props.resetAll - Clears all filters
 * @param {boolean} props.showCreateListingsLink - Whether to show the "Lend an item" link
 * @returns {JSX.Element|null}
 */
const NoSearchResultsMaybe = props => {
  const { listingsAreLoaded, totalItems, location, resetAll, showCreateListingsLink } = props;
  const hasNoResult = listingsAreLoaded && totalItems === 0;
  const hasSearchParams = location.search?.length > 0;

  return hasNoResult ? (
    <div className={css.noSearchResults} role="status">
      <h2 className={css.title}>
        <FormattedMessage id="NoSearchResults.title" />
      </h2>
      <p className={css.text}>
        <FormattedMessage id="NoSearchResults.text" />
      </p>
      {hasSearchParams ? (
        <button type="button" className={css.resetAllFiltersButton} onClick={e => resetAll(e)}>
          <FormattedMessage id="NoSearchResults.clearFilters" />
        </button>
      ) : null}
      {showCreateListingsLink ? (
        <p className={css.lendText}>
          <FormattedMessage id="NoSearchResults.lendQuestion" />{' '}
          <NamedLink className={css.createListingLink} name="NewListingPage">
            <FormattedMessage id="NoSearchResults.lendLink" />
          </NamedLink>
        </p>
      ) : null}
    </div>
  ) : null;
};

export default NoSearchResultsMaybe;
