import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../../util/reactIntl';
import { propTypes } from '../../../util/types';
import { ListingCard, PaginationLinks } from '../../../components';

import css from './SearchResultsPanel.module.css';

/**
 * SearchResultsPanel component
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that extends the default class for the root element
 * @param {Array<propTypes.listing>} props.listings - The listings
 * @param {propTypes.pagination} props.pagination - The pagination
 * @param {Object} props.search - The search
 * @param {Function} props.setActiveListing - The function to handle the active listing
 * @param {boolean} [props.isMapVariant] - Whether the map variant is enabled
 * @returns {JSX.Element}
 */
const SearchResultsPanel = props => {
  const {
    className,
    rootClassName,
    listings = [],
    pagination,
    search,
    setActiveListing,
    isMapVariant = true,
    listingTypeParam,
    intl,
  } = props;
  const classes = classNames(rootClassName || css.root, className);
  const pageName = listingTypeParam ? 'SearchPageWithListingType' : 'SearchPage';

  const paginationLinks =
    pagination && pagination.totalPages > 1 ? (
      <PaginationLinks
        className={css.pagination}
        pageName={pageName}
        pagePathParams={{ listingType: listingTypeParam }}
        pageSearchParams={search}
        pagination={pagination}
        aria-label={intl.formatMessage({ id: 'SearchResultsPanel.screenreader.pagination' })}
      />
    ) : null;

  const cardRenderSizes = isMapVariant => {
    if (isMapVariant) {
      // Panel width relative to the viewport
      const panelMediumWidth = 50;
      const panelLargeWidth = 62.5;
      return [
        '(max-width: 767px) 100vw',
        `(max-width: 1023px) ${panelMediumWidth}vw`,
        `(max-width: 1920px) ${panelLargeWidth / 2}vw`,
        `${panelLargeWidth / 3}vw`,
      ].join(', ');
    } else {
      // Panel width relative to the viewport
      const panelMediumWidth = 50;
      const panelLargeWidth = 62.5;
      return [
        '(max-width: 549px) 100vw',
        '(max-width: 767px) 50vw',
        '(max-width: 1023px) 33vw',
        '(max-width: 1120px) 25vw',
        '264px',
      ].join(', ');
    }
  };

  return (
    <div className={classes}>
      <ul className={isMapVariant ? css.listingCardsMapVariant : css.listingCards}>
        {listings.map(l => (
          <li key={l.id.uuid} className={css.resultItem}>
            <ListingCard
              className={css.listingCard}
              listing={l}
              renderSizes={cardRenderSizes(isMapVariant)}
              setActiveListing={setActiveListing}
            />
          </li>
        ))}
        {props.children}
      </ul>
      {pagination?.totalItems > 0 && listings.length > 0 ? (
        <div className={css.paginationArea}>
          <p className={css.resultsSummary}>
            <FormattedMessage
              id="SearchResultsPanel.showingResults"
              values={{
                start: (pagination.page - 1) * pagination.perPage + 1,
                end: (pagination.page - 1) * pagination.perPage + listings.length,
                total: pagination.totalItems,
              }}
            />
          </p>
          {paginationLinks}
        </div>
      ) : (
        paginationLinks
      )}
    </div>
  );
};

export default SearchResultsPanel;
