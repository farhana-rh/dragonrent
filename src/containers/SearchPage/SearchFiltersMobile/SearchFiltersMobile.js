import React, { Component } from 'react';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';

import { useRouteConfiguration } from '../../../context/routeConfigurationContext';
import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { createResourceLocatorString } from '../../../util/routes';
import { getSearchPageResourceLocatorStringParams } from '../SearchPage.shared';

import { ModalInMobile, Button } from '../../../components';

import css from './SearchFiltersMobile.module.css';

// Lucide-style icons for the Search mockup's header; each sits next to a word.
const Icon = ({ className, children }) => (
  <svg
    className={classNames(css.icon, className)}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);
const IconSearch = () => (
  <Icon className={css.searchIcon}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </Icon>
);
const IconFilters = () => (
  <Icon>
    <path d="M3 6h18" />
    <path d="M7 12h10" />
    <path d="M10 18h4" />
  </Icon>
);
const IconCalendar = () => (
  <Icon>
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
  </Icon>
);
const IconMap = () => (
  <Icon>
    <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
    <path d="M15 5.764v15" />
    <path d="M9 3.236v15" />
  </Icon>
);
const IconCheck = () => (
  <Icon>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
);

class SearchFiltersMobileComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { isFiltersOpenOnMobile: false, initialQueryParams: null };

    this.openFilters = this.openFilters.bind(this);
    this.openDates = this.openDates.bind(this);
    this.cancelFilters = this.cancelFilters.bind(this);
    this.closeFilters = this.closeFilters.bind(this);
    this.resetAll = this.resetAll.bind(this);
  }

  // Open filters modal, set the initial parameters to current ones
  openFilters() {
    const { onOpenModal, urlQueryParams } = this.props;
    onOpenModal();
    this.setState({ isFiltersOpenOnMobile: true, initialQueryParams: urlQueryParams });
  }

  // "Dates" opens the same filter sheet, scrolled to the dates filter
  openDates() {
    const { datesFilterToggleId } = this.props;
    this.openFilters();
    window.requestAnimationFrame(() => {
      const datesToggle = document.getElementById(datesFilterToggleId);
      if (datesToggle) {
        datesToggle.scrollIntoView({ block: 'start' });
        datesToggle.focus({ preventScroll: true });
      }
    });
  }

  // Close the filters by clicking cancel, revert to the initial params
  cancelFilters() {
    const { history, onCloseModal, location, routeConfiguration } = this.props;

    const { routeName, pathParams } = getSearchPageResourceLocatorStringParams(
      routeConfiguration,
      location
    );

    history.push(
      createResourceLocatorString(
        routeName,
        routeConfiguration,
        pathParams,
        this.state.initialQueryParams
      )
    );
    onCloseModal();
    this.setState({ isFiltersOpenOnMobile: false, initialQueryParams: null });
  }

  // Close the filter modal
  closeFilters() {
    this.props.onCloseModal();
    this.setState({ isFiltersOpenOnMobile: false });
  }

  // Reset all filter query parameters
  resetAll(e) {
    this.props.resetAll(e);

    // blur event target if event is passed
    if (e && e.currentTarget) {
      e.currentTarget.blur();
    }
  }

  render() {
    const {
      rootClassName,
      className,
      children,
      sortByComponent,
      resultsCount,
      showAsModalMaxWidth,
      onMapIconClick = () => {},
      onManageDisableScrolling,
      selectedFiltersCount = 0,
      noResultsInfo,
      intl,
      isMapVariant = true,
      searchSummary,
      onOpenSearch,
      datesFilterToggleId,
      selectedDatesLabel,
    } = this.props;

    const classes = classNames(rootClassName || css.root, className);

    const filtersHeading = intl.formatMessage({ id: 'SearchFiltersMobile.heading' });
    const modalCloseButtonMessage = intl.formatMessage({
      id: 'SearchFiltersMobile.cancelFilters',
    });

    const showListingsLabel = intl.formatMessage(
      { id: 'SearchFiltersMobile.showListings' },
      { count: resultsCount }
    );

    const hasSelectedFilters = selectedFiltersCount > 0;

    return (
      <div className={classes}>
        {searchSummary && onOpenSearch ? (
          <button
            type="button"
            className={css.searchSummary}
            onClick={onOpenSearch}
            aria-label={searchSummary.ariaLabel}
          >
            <IconSearch />
            <span className={css.searchSummaryText}>
              <span className={css.searchSummaryTitle}>{searchSummary.title}</span>
              <span className={css.searchSummarySubtitle}>{searchSummary.subtitle}</span>
            </span>
          </button>
        ) : null}

        <div className={css.buttons}>
          <button
            type="button"
            className={hasSelectedFilters ? css.buttonSelected : css.button}
            onClick={this.openFilters}
          >
            {hasSelectedFilters ? <IconCheck /> : <IconFilters />}
            <FormattedMessage id="SearchFiltersMobile.filtersButtonLabel" />
            {hasSelectedFilters ? (
              <span className={css.count}>
                <FormattedMessage
                  id="SearchFiltersMobile.selectedCount"
                  values={{ count: selectedFiltersCount }}
                />
              </span>
            ) : null}
          </button>

          {datesFilterToggleId ? (
            <button
              type="button"
              className={selectedDatesLabel ? css.buttonSelected : css.button}
              onClick={this.openDates}
            >
              {selectedDatesLabel ? <IconCheck /> : <IconCalendar />}
              <span className={css.buttonLabel}>
                {selectedDatesLabel || <FormattedMessage id="SearchFiltersMobile.datesButton" />}
              </span>
            </button>
          ) : null}

          {sortByComponent}
          {isMapVariant ? (
            <button type="button" className={css.button} onClick={onMapIconClick}>
              <IconMap />
              <FormattedMessage id="SearchFiltersMobile.openMapView" />
            </button>
          ) : null}
        </div>

        {noResultsInfo ? noResultsInfo : null}

        <ModalInMobile
          id="SearchFiltersMobile.filters"
          isModalOpenOnMobile={this.state.isFiltersOpenOnMobile}
          onClose={this.cancelFilters}
          showAsModalMaxWidth={showAsModalMaxWidth}
          onManageDisableScrolling={onManageDisableScrolling}
          containerClassName={css.modalContainer}
          closeButtonMessage={modalCloseButtonMessage}
        >
          <div className={css.modalHeadingWrapper}>
            <h2 className={css.modalHeading}>{filtersHeading}</h2>
            <button type="button" className={css.resetAllButton} onClick={e => this.resetAll(e)}>
              <FormattedMessage id="SearchFiltersMobile.clearAll" />
            </button>
          </div>
          {this.state.isFiltersOpenOnMobile ? (
            <div className={css.filtersWrapper}>{children}</div>
          ) : null}

          <div className={css.showListingsContainer}>
            <Button className={css.showListingsButton} onClick={this.closeFilters}>
              {showListingsLabel}
            </Button>
          </div>
        </ModalInMobile>
      </div>
    );
  }
}

/**
 * SearchFiltersMobile component
 *
 * @component
 * @param {Object} props
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {Object} props.urlQueryParams - The URL query params
 * @param {React.Node} props.sortByComponent - The sort by component
 * @param {boolean} props.listingsAreLoaded - Whether the listings are loaded
 * @param {number} props.resultsCount - The number of results
 * @param {boolean} props.searchInProgress - Whether the search is in progress
 * @param {number} props.showAsModalMaxWidth - The maximum width of the modal
 * @param {Function} props.onMapIconClick - The function to click the map icon
 * @param {Function} props.onManageDisableScrolling - The function to manage disable scrolling
 * @param {Function} props.onOpenModal - The function to open the modal
 * @param {Function} props.onCloseModal - The function to close the modal
 * @param {Function} props.resetAll - The function to reset all
 * @param {number} props.selectedFiltersCount - The number of selected filters
 * @param {boolean} props.isMapVariant - Whether the map variant is enabled
 * @param {Object} [props.searchSummary] - { title, subtitle, ariaLabel } of the current search
 * @param {Function} [props.onOpenSearch] - Opens the search form ("Change search")
 * @param {string} [props.datesFilterToggleId] - DOM id of the dates filter in the filter sheet;
 *   when given, a "Dates" button opens the sheet at that filter
 * @param {string} [props.selectedDatesLabel] - The selected dates, e.g. "12–14 Nov"
 * @returns {JSX.Element}
 */
const SearchFiltersMobile = props => {
  const routeConfiguration = useRouteConfiguration();
  const intl = useIntl();
  const history = useHistory();

  return (
    <SearchFiltersMobileComponent
      routeConfiguration={routeConfiguration}
      intl={intl}
      history={history}
      {...props}
    />
  );
};

export default SearchFiltersMobile;
