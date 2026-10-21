import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';

// Contexts
import { useConfiguration } from '../../context/configurationContext';

// Utils
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { DATE_TYPE_DATETIME, propTypes } from '../../util/types';
import { showCreateListingLinkForUser } from '../../util/userHelpers';

// Global ducks (for Redux actions and thunks)
import { getMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { isScrollingDisabled } from '../../ducks/ui.duck';

// Shared components
import { ErrorMessage, IconSpinner, LayoutSingleColumn, NamedLink, Page } from '../../components';

// Related components
import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';

// Modules from the same directory
import DashboardSideNav from './DashboardSideNav/DashboardSideNav';
import StatCard, { linkClassName as statLinkClassName } from './StatCard/StatCard';
import BookingRequestRow from './BookingRequestRow/BookingRequestRow';
import DashboardListingsTable from './DashboardListingsTable/DashboardListingsTable';
import { getGreetingName, getNextRentalEnd } from './DashboardPage.helpers';

import css from './DashboardPage.module.css';

const SectionHeading = props => {
  const { id, titleId, linkText, linkProps } = props;
  return (
    <div className={css.sectionHeader}>
      <h2 id={id} className={css.sectionTitle}>
        <FormattedMessage id={titleId} />
      </h2>
      {linkText ? (
        <NamedLink className={css.sectionLink} {...linkProps}>
          {linkText}
        </NamedLink>
      ) : null}
    </div>
  );
};

const EmptyState = props => {
  const { textId, ctaId, ctaLinkProps } = props;
  return (
    <div className={css.empty}>
      <p className={css.emptyText}>
        <FormattedMessage id={textId} />
      </p>
      {ctaId ? (
        <NamedLink className={css.emptyCta} {...ctaLinkProps}>
          <FormattedMessage id={ctaId} />
        </NamedLink>
      ) : null}
    </div>
  );
};

// "Tue 13 Oct", plus the time for hourly bookings
const formatRentalEnd = (intl, range) => {
  const timeFormat =
    range.dateType === DATE_TYPE_DATETIME ? { hour: 'numeric', minute: 'numeric' } : {};
  return intl.formatDate(range.end, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: range.timeZone,
    ...timeFormat,
  });
};

/**
 * Dashboard for hosts and renters: booking requests waiting for a reply, active rentals and
 * the user's latest listings. Accepting and declining requests happens on the sale details
 * page; this page only links there.
 *
 * @component
 * @param {Object} props
 * @param {propTypes.currentUser?} props.currentUser
 * @param {Array<propTypes.transaction>} props.requests booking requests waiting for a reply
 * @param {number} props.requestCount total number of booking requests waiting for a reply
 * @param {Array<propTypes.transaction>} props.activeRentals accepted bookings
 * @param {number} props.activeRentalCount total number of accepted bookings
 * @param {Array<propTypes.ownListing>} props.listings latest own listings
 * @param {number} props.publishedListingCount total number of published own listings
 * @param {boolean} props.fetchInProgress
 * @param {propTypes.error?} props.fetchError
 * @param {boolean} props.scrollingDisabled
 * @returns {JSX.Element} dashboard page
 */
export const DashboardPageComponent = props => {
  const {
    currentUser,
    requests = [],
    requestCount = 0,
    activeRentals = [],
    activeRentalCount = 0,
    listings = [],
    publishedListingCount = 0,
    fetchInProgress,
    fetchError,
    scrollingDisabled,
  } = props;
  const config = useConfiguration();
  const intl = useIntl();

  const name = getGreetingName(currentUser);
  const canPostListings = !!showCreateListingLinkForUser(config, currentUser);
  const nextRentalEnd = getNextRentalEnd(activeRentals);
  const isLoading = fetchInProgress && requests.length === 0 && listings.length === 0;

  const salesInboxLink = { name: 'InboxPage', params: { tab: 'sales' } };

  return (
    <Page
      title={intl.formatMessage({ id: 'DashboardPage.title' })}
      scrollingDisabled={scrollingDisabled}
    >
      <LayoutSingleColumn topbar={<TopbarContainer />} footer={<FooterContainer />}>
        <div className={css.root}>
          <DashboardSideNav
            className={css.nav}
            requestCount={requestCount}
            showListingsLink={canPostListings}
          />

          <div className={css.main}>
            <header className={css.header}>
              <div className={css.headerText}>
                <h1 className={css.title}>
                  {name ? (
                    <FormattedMessage id="DashboardPage.greeting" values={{ name }} />
                  ) : (
                    <FormattedMessage id="DashboardPage.heading" />
                  )}
                </h1>
                <p className={css.subtitle}>
                  <FormattedMessage
                    id="DashboardPage.requestsWaiting"
                    values={{ count: requestCount }}
                  />
                </p>
              </div>
              {canPostListings ? (
                <NamedLink className={css.newListingButton} name="NewListingPage">
                  <span aria-hidden="true">+</span>
                  <FormattedMessage id="DashboardPage.newListing" />
                </NamedLink>
              ) : null}
            </header>

            {fetchError ? (
              <div className={css.error} role="alert">
                <p className={css.errorTitle}>
                  <FormattedMessage id="DashboardPage.loadError" />
                </p>
                <ErrorMessage error={fetchError} />
              </div>
            ) : null}

            {isLoading ? (
              <div className={css.loading} role="status">
                <IconSpinner />
                <span className={css.visuallyHidden}>
                  <FormattedMessage id="DashboardPage.loading" />
                </span>
              </div>
            ) : (
              <>
                <dl className={css.stats}>
                  <StatCard
                    highlight
                    label={<FormattedMessage id="DashboardPage.stats.requests" />}
                    value={requestCount}
                    detail={
                      <NamedLink className={statLinkClassName} {...salesInboxLink}>
                        <FormattedMessage id="DashboardPage.stats.requestsLink" />
                      </NamedLink>
                    }
                  />
                  <StatCard
                    label={<FormattedMessage id="DashboardPage.stats.activeRentals" />}
                    value={activeRentalCount}
                    detail={
                      nextRentalEnd ? (
                        <FormattedMessage
                          id="DashboardPage.stats.nextRentalEnds"
                          values={{ date: formatRentalEnd(intl, nextRentalEnd) }}
                        />
                      ) : (
                        <FormattedMessage id="DashboardPage.stats.noActiveRentals" />
                      )
                    }
                  />
                  {canPostListings ? (
                    <StatCard
                      label={<FormattedMessage id="DashboardPage.stats.publishedListings" />}
                      value={publishedListingCount}
                      detail={
                        <NamedLink className={statLinkClassName} name="ManageListingsPage">
                          <FormattedMessage id="DashboardPage.stats.manageListings" />
                        </NamedLink>
                      }
                    />
                  ) : null}
                </dl>

                <section className={css.section} aria-labelledby="dashboard-requests">
                  <SectionHeading
                    id="dashboard-requests"
                    titleId="DashboardPage.requests.title"
                    linkText={
                      requestCount > requests.length ? (
                        <FormattedMessage id="DashboardPage.requests.viewAll" />
                      ) : null
                    }
                    linkProps={salesInboxLink}
                  />
                  {requests.length > 0 ? (
                    <ul className={css.requestList}>
                      {requests.map(tx => (
                        <li key={tx.id.uuid} className={css.requestItem}>
                          <BookingRequestRow transaction={tx} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState textId="DashboardPage.requests.empty" />
                  )}
                </section>

                {canPostListings ? (
                  <section className={css.section} aria-labelledby="dashboard-listings">
                    <SectionHeading
                      id="dashboard-listings"
                      titleId="DashboardPage.listings.title"
                      linkText={<FormattedMessage id="DashboardPage.listings.manageAll" />}
                      linkProps={{ name: 'ManageListingsPage' }}
                    />
                    {listings.length > 0 ? (
                      <DashboardListingsTable listings={listings} />
                    ) : (
                      <EmptyState
                        textId="DashboardPage.listings.empty"
                        ctaId="DashboardPage.listings.emptyCta"
                        ctaLinkProps={{ name: 'NewListingPage' }}
                      />
                    )}
                  </section>
                ) : null}
              </>
            )}
          </div>
        </div>
      </LayoutSingleColumn>
    </Page>
  );
};

const mapStateToProps = state => {
  const { currentUser } = state.user;
  const {
    fetchInProgress,
    fetchError,
    requestRefs,
    requestCount,
    activeRentalRefs,
    activeRentalCount,
    listingRefs,
    publishedListingCount,
  } = state.DashboardPage;

  return {
    currentUser,
    requests: getMarketplaceEntities(state, requestRefs),
    requestCount,
    activeRentals: getMarketplaceEntities(state, activeRentalRefs),
    activeRentalCount,
    listings: getMarketplaceEntities(state, listingRefs),
    publishedListingCount,
    fetchInProgress,
    fetchError,
    scrollingDisabled: isScrollingDisabled(state),
  };
};

const DashboardPage = compose(connect(mapStateToProps))(DashboardPageComponent);

export default DashboardPage;
