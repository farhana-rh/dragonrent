import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../../util/reactIntl';

import css from './SearchResultsHeading.module.css';

/**
 * Results heading of the Search mockup ("18 items near Helsinki"), the sort order under it and
 * the removable chips of the active filters.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {boolean} props.searchInProgress - Whether a new search is loading
 * @param {string} props.heading - The results heading
 * @param {React.Node} [props.sortByComponent] - The sort menu
 * @param {React.Node} [props.children] - Filter chips
 * @returns {JSX.Element}
 */
const SearchResultsHeading = props => {
  const { className, searchInProgress, heading, sortByComponent, children } = props;

  return (
    <div className={classNames(css.root, className)}>
      <h1 className={css.heading} aria-live="polite">
        {searchInProgress ? <FormattedMessage id="SearchFiltersMobile.loadingResults" /> : heading}
      </h1>
      {sortByComponent ? (
        <div className={css.sortRow}>
          <span className={css.sortLabel}>
            <FormattedMessage id="MainPanelHeader.sortBy" />
          </span>
          {sortByComponent}
        </div>
      ) : null}
      {children}
    </div>
  );
};

export default SearchResultsHeading;
