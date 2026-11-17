import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { pathByRouteName } from '../../util/routes';
import { hasPermissionToPostListings, showCreateListingLinkForUser } from '../../util/userHelpers';
import { NO_ACCESS_PAGE_POST_LISTINGS } from '../../util/urlHelpers';
import { propTypes } from '../../util/types';
import { isErrorNoPermissionToPostListings } from '../../util/errors';
import { isScrollingDisabled, manageDisableScrolling } from '../../ducks/ui.duck';

import {
  H3,
  Page,
  PaginationLinks,
  UserNav,
  LayoutSingleColumn,
  NamedLink,
  Modal,
} from '../../components';

import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';

import ManageListingCard from './ManageListingCard/ManageListingCard';

import {
  closeListing,
  openListing,
  getOwnListingsById,
  discardDraft,
} from './ManageListingsPage.duck';
import css from './ManageListingsPage.module.css';
import DiscardDraftModal from './DiscardDraftModal/DiscardDraftModal';

const LendAnItemLink = () => (
  <NamedLink className={css.lendAnItemLink} name="NewListingPage">
    <svg
      className={css.plusIcon}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
    <FormattedMessage id="ManageListingsPage.lendAnItem" />
  </NamedLink>
);

/**
 * "Your items" heading with the item count and the page's one main button, "Lend an item".
 * With no items, an empty-state card with the same button.
 */
const Heading = props => {
  const { listingsAreLoaded, pagination, showCreateListingLink } = props;
  const hasResults = listingsAreLoaded && pagination.totalItems > 0;
  const hasNoResults = listingsAreLoaded && pagination.totalItems === 0;

  return hasResults ? (
    <header className={css.header}>
      <div className={css.headerText}>
        <H3 as="h1" className={css.heading}>
          <FormattedMessage id="ManageListingsPage.heading" />
        </H3>
        <p className={css.itemCount}>
          <FormattedMessage
            id="ManageListingsPage.itemCount"
            values={{ count: pagination.totalItems }}
          />
        </p>
      </div>
      {showCreateListingLink ? <LendAnItemLink /> : null}
    </header>
  ) : hasNoResults ? (
    <div className={css.noResultsContainer}>
      <H3 as="h1" className={css.heading}>
        <FormattedMessage id="ManageListingsPage.heading" />
      </H3>
      <p className={css.noResultsText}>
        <FormattedMessage id="ManageListingsPage.emptyText" />
      </p>
      {showCreateListingLink ? <LendAnItemLink /> : null}
    </div>
  ) : null;
};

const PaginationLinksMaybe = props => {
  const { listingsAreLoaded, pagination, page } = props;
  return listingsAreLoaded && pagination && pagination.totalPages > 1 ? (
    <PaginationLinks
      className={css.pagination}
      pageName="ManageListingsPage"
      pageSearchParams={{ page }}
      pagination={pagination}
    />
  ) : null;
};

/**
 * The ManageListingsPage component.
 *
 * @component
 * @param {Object} props
 * @param {propTypes.currentUser} props.currentUser - The current user
 * @param {propTypes.uuid} props.closingListing - The closing listing
 * @param {Object} props.closingListingError - The closing listing error
 * @param {propTypes.error} props.closingListingError.listingId - The closing listing id
 * @param {propTypes.error} props.closingListingError.error - The closing listing error
 * @param {propTypes.ownListing[]} props.listings - The listings
 * @param {function} props.onCloseListing - The onCloseListing function
 * @param {function} props.onDiscardDraft - The onDiscardDraft function
 * @param {function} props.onOpenListing - The onOpenListing function
 * @param {Object} props.openingListing - The opening listing
 * @param {propTypes.uuid} props.openingListing.uuid - The opening listing uuid
 * @param {Object} props.openingListingError - The opening listing error
 * @param {propTypes.uuid} props.openingListingError.listingId - The opening listing id
 * @param {propTypes.error} props.openingListingError.error - The opening listing error
 * @param {propTypes.pagination} props.pagination - The pagination
 * @param {boolean} props.queryInProgress - Whether the query is in progress
 * @param {propTypes.error} props.queryListingsError - The query listings error
 * @param {Object} props.queryParams - The query params
 * @param {boolean} props.scrollingDisabled - Whether the scrolling is disabled
 * @param {function} props.onManageDisableScrolling - The onManageDisableScrolling function
 * @returns {JSX.Element} manage listings page component
 */
export const ManageListingsPageComponent = props => {
  const [discardDraftModalOpen, setDiscardDraftModalOpen] = useState(null);
  const [discardDraftModalId, setDiscardDraftModalId] = useState(null);
  const history = useHistory();
  const routeConfiguration = useRouteConfiguration();
  const config = useConfiguration();
  const intl = useIntl();

  const {
    currentUser,
    closingListing,
    closingListingError,
    discardingDraft,
    discardingDraftError,
    listings = [],
    onCloseListing,
    onDiscardDraft,
    onOpenListing,
    openingListing,
    openingListingError,
    pagination,
    queryInProgress,
    queryListingsError,
    queryParams,
    scrollingDisabled,
    onManageDisableScrolling,
  } = props;

  useEffect(() => {
    if (isErrorNoPermissionToPostListings(openingListingError?.error)) {
      const noAccessPagePath = pathByRouteName('NoAccessPage', routeConfiguration, {
        missingAccessRight: NO_ACCESS_PAGE_POST_LISTINGS,
      });
      history.push(noAccessPagePath);
    }
  }, [openingListingError]);

  const handleOpenListing = listingId => {
    const hasPostingRights = hasPermissionToPostListings(currentUser);

    if (!hasPostingRights) {
      const noAccessPagePath = pathByRouteName('NoAccessPage', routeConfiguration, {
        missingAccessRight: NO_ACCESS_PAGE_POST_LISTINGS,
      });
      history.push(noAccessPagePath);
    } else {
      onOpenListing(listingId);
    }
  };

  const openDiscardDraftModal = listingId => {
    setDiscardDraftModalId(listingId);
    setDiscardDraftModalOpen(true);
  };

  const handleDiscardDraft = () => {
    onDiscardDraft(discardDraftModalId);
    setDiscardDraftModalOpen(false);
    setDiscardDraftModalId(null);
  };

  const hasPaginationInfo = !!pagination && pagination.totalItems != null;
  const listingsAreLoaded = !queryInProgress && hasPaginationInfo;

  const loadingResults = (
    <div className={css.messagePanel}>
      <H3 as="h2" className={css.heading}>
        <FormattedMessage id="ManageListingsPage.loadingOwnListings" />
      </H3>
    </div>
  );

  const queryError = (
    <div className={css.messagePanel}>
      <H3 as="h2" className={css.heading}>
        <FormattedMessage id="ManageListingsPage.queryError" />
      </H3>
    </div>
  );

  const closingErrorListingId = !!closingListingError && closingListingError.listingId;
  const openingErrorListingId = !!openingListingError && openingListingError.listingId;
  const discardingErrorListingId = !!discardingDraftError && discardingDraft.listingId;

  // Render hints for responsive image: one column on phones, two from 550px, three from 1024px
  const renderSizes = [`(max-width: 549px) 100vw`, `(max-width: 1023px) 50vw`, `400px`].join(', ');

  const showManageListingsLink = showCreateListingLinkForUser(config, currentUser);

  return (
    <Page
      title={intl.formatMessage({ id: 'ManageListingsPage.title' })}
      scrollingDisabled={scrollingDisabled}
    >
      <LayoutSingleColumn
        topbar={
          <>
            <TopbarContainer />
            <UserNav
              currentPage="ManageListingsPage"
              showManageListingsLink={showManageListingsLink}
            />
          </>
        }
        footer={<FooterContainer />}
      >
        {queryInProgress ? loadingResults : null}
        {queryListingsError ? queryError : null}

        <div className={css.listingPanel}>
          <Heading
            listingsAreLoaded={listingsAreLoaded}
            pagination={pagination}
            showCreateListingLink={showManageListingsLink}
          />

          <ul className={css.listingCards}>
            {listings.map(l => (
              <li key={l.id.uuid} className={css.listingCard}>
                <ManageListingCard
                  listing={l}
                  actionsInProgressListingId={openingListing || closingListing || discardingDraft}
                  onCloseListing={onCloseListing}
                  onOpenListing={handleOpenListing}
                  onDiscardDraft={openDiscardDraftModal}
                  hasOpeningError={openingErrorListingId.uuid === l.id.uuid}
                  hasClosingError={closingErrorListingId.uuid === l.id.uuid}
                  hasDiscardingError={discardingErrorListingId.uuid === l.id.uuid}
                  renderSizes={renderSizes}
                />
              </li>
            ))}
          </ul>
          {onManageDisableScrolling && discardDraftModalOpen ? (
            <DiscardDraftModal
              id="ManageListingsPage"
              isOpen={discardDraftModalOpen}
              onManageDisableScrolling={onManageDisableScrolling}
              onCloseModal={() => setDiscardDraftModalOpen(false)}
              onDiscardDraft={handleDiscardDraft}
              focusElementId={
                discardDraftModalId ? `discardButton_${discardDraftModalId.uuid}` : null
              }
            />
          ) : null}

          <PaginationLinksMaybe
            listingsAreLoaded={listingsAreLoaded}
            pagination={pagination}
            page={queryParams ? queryParams.page : 1}
          />
        </div>
      </LayoutSingleColumn>
    </Page>
  );
};

const mapStateToProps = state => {
  const { currentUser } = state.user;
  const {
    currentPageResultIds,
    pagination,
    queryInProgress,
    queryListingsError,
    queryParams,
    openingListing,
    openingListingError,
    closingListing,
    closingListingError,
    discardingDraft,
    discardingDraftError,
  } = state.ManageListingsPage;
  const listings = getOwnListingsById(state, currentPageResultIds);
  return {
    currentUser,
    currentPageResultIds,
    listings,
    pagination,
    queryInProgress,
    queryListingsError,
    queryParams,
    scrollingDisabled: isScrollingDisabled(state),
    openingListing,
    openingListingError,
    closingListing,
    closingListingError,
    discardingDraft,
    discardingDraftError,
  };
};

const mapDispatchToProps = dispatch => ({
  onCloseListing: listingId => dispatch(closeListing(listingId)),
  onOpenListing: listingId => dispatch(openListing(listingId)),
  onDiscardDraft: listingId => dispatch(discardDraft(listingId)),
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
});

const ManageListingsPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(ManageListingsPageComponent);

export default ManageListingsPage;
