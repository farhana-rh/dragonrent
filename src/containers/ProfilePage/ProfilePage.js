import React, { useEffect, useState } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { REVIEW_TYPE_OF_PROVIDER, REVIEW_TYPE_OF_CUSTOMER, propTypes } from '../../util/types';
import {
  NO_ACCESS_PAGE_USER_PENDING_APPROVAL,
  NO_ACCESS_PAGE_VIEW_LISTINGS,
  PROFILE_PAGE_PENDING_APPROVAL_VARIANT,
} from '../../util/urlHelpers';
import {
  isErrorNoViewingPermission,
  isErrorUserPendingApproval,
  isForbiddenError,
  isNotFoundError,
} from '../../util/errors';
import {
  getDetailCustomFieldValue,
  getFieldValue,
  pickCustomFieldProps,
} from '../../util/fieldHelpers';
import {
  getCurrentUserTypeRoles,
  hasPermissionToViewData,
  isUserAuthorized,
} from '../../util/userHelpers';
import { richText } from '../../util/richText';
import { getReviewsSummary } from '../../util/reviews';

import { isScrollingDisabled } from '../../ducks/ui.duck';
import { getMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import {
  H2,
  Page,
  AvatarLarge,
  NamedLink,
  ListingCard,
  Reviews,
  IconReviewStar,
  LayoutSingleColumn,
  NamedRedirect,
  CustomExtendedDataSection,
} from '../../components';

import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';
import NotFoundPage from '../../containers/NotFoundPage/NotFoundPage';

import css from './ProfilePage.module.css';

const MIN_LENGTH_FOR_LONG_WORDS = 20;

const IconEditPencil = () => (
  <svg
    className={css.editIcon}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
  </svg>
);

/**
 * Sticker card at the top of the profile: avatar, "Hi, I'm {name}", the average rating of the
 * reviews the page has loaded (linked to the reviews), the bio and, on your own profile,
 * "Edit profile".
 *
 * @component
 * @param {Object} props
 * @param {propTypes.user|propTypes.currentUser} props.user - The profile's user
 * @param {string} props.displayName - The user's display name
 * @param {string} [props.bio] - The user's bio
 * @param {Array<propTypes.review>} props.reviews - Reviews of the user
 * @param {boolean} props.hideReviews - Whether reviews are hidden (no viewing rights)
 * @param {boolean} props.showLinkToProfileSettingsPage - Whether to show "Edit profile"
 * @returns {JSX.Element} profile header
 */
export const ProfileHeader = props => {
  const intl = useIntl();
  const { user, displayName, bio, reviews, hideReviews, showLinkToProfileSettingsPage } = props;
  const summary = hideReviews ? null : getReviewsSummary(reviews);

  const bioWithLinks = bio
    ? richText(bio, {
        linkify: true,
        longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS,
        longWordClass: css.longWord,
      })
    : null;

  return (
    <section className={css.header}>
      <AvatarLarge className={css.avatar} user={user} disableProfileLink />
      <div className={css.headerText}>
        <H2 as="h1" className={css.heading}>
          {displayName ? (
            <FormattedMessage id="ProfilePage.greeting" values={{ name: displayName }} />
          ) : null}
        </H2>
        {summary ? (
          <p className={css.rating}>
            <IconReviewStar className={css.ratingStar} isFilled />
            <span
              className={css.ratingValue}
              aria-label={intl.formatMessage(
                { id: 'ProfilePage.ratingLabel' },
                { rating: intl.formatNumber(summary.average) }
              )}
            >
              {intl.formatNumber(summary.average)}
            </span>
            <a className={css.ratingLink} href="#reviews">
              <FormattedMessage id="ProfilePage.reviewCount" values={{ count: summary.count }} />
            </a>
          </p>
        ) : null}
        {bioWithLinks ? <p className={css.bio}>{bioWithLinks}</p> : null}
      </div>
      {showLinkToProfileSettingsPage ? (
        <div className={css.headerActions}>
          <NamedLink className={css.editLink} name="ProfileSettingsPage">
            <IconEditPencil />
            <FormattedMessage id="ProfilePage.editProfileLinkDesktop" />
          </NamedLink>
        </div>
      ) : null}
    </section>
  );
};

export const ReviewsErrorMaybe = props => {
  const { queryReviewsError } = props;
  return queryReviewsError ? (
    <p className={css.error}>
      <FormattedMessage id="ProfilePage.loadingReviewsFailed" />
    </p>
  ) : null;
};

/**
 * Reviews section: "From renters" (reviews of the user as an owner) and "As a renter"
 * (reviews of the user as a renter) as pill buttons, the same on every screen size.
 *
 * @component
 * @param {Object} props
 * @param {Array<propTypes.review>} props.reviews - The reviews
 * @param {propTypes.error} props.queryReviewsError - The query reviews error
 * @param {Object} props.userTypeRoles - { customer, provider } roles of the profile's user
 * @returns {JSX.Element} reviews section
 */
export const ProfileReviews = props => {
  const { reviews, queryReviewsError, userTypeRoles } = props;
  const { customer: isCustomerUserType, provider: isProviderUserType } = userTypeRoles;

  const initialReviewState = !isProviderUserType
    ? REVIEW_TYPE_OF_CUSTOMER
    : REVIEW_TYPE_OF_PROVIDER;
  const [showReviewsType, setShowReviewsType] = useState(initialReviewState);

  const reviewsOfProvider = reviews.filter(r => r.attributes.type === REVIEW_TYPE_OF_PROVIDER);
  const reviewsOfCustomer = reviews.filter(r => r.attributes.type === REVIEW_TYPE_OF_CUSTOMER);

  const tabs = [
    ...(isProviderUserType
      ? [
          {
            type: REVIEW_TYPE_OF_PROVIDER,
            labelId: 'ProfilePage.reviewsFromRenters',
            count: reviewsOfProvider.length,
          },
        ]
      : []),
    ...(isCustomerUserType
      ? [
          {
            type: REVIEW_TYPE_OF_CUSTOMER,
            labelId: 'ProfilePage.reviewsAsRenter',
            count: reviewsOfCustomer.length,
          },
        ]
      : []),
  ];

  const shownReviews =
    showReviewsType === REVIEW_TYPE_OF_PROVIDER ? reviewsOfProvider : reviewsOfCustomer;

  return (
    <section id="reviews" className={css.section}>
      <H2 as="h2" className={css.sectionTitle}>
        <FormattedMessage id="ProfilePage.reviewsHeading" />
      </H2>
      {tabs.length > 1 ? (
        <div className={css.reviewTabs}>
          {tabs.map(tab => {
            const isSelected = tab.type === showReviewsType;
            return (
              <button
                key={tab.type}
                type="button"
                className={classNames(css.reviewTab, { [css.reviewTabSelected]: isSelected })}
                aria-pressed={isSelected}
                onClick={() => setShowReviewsType(tab.type)}
              >
                <FormattedMessage id={tab.labelId} values={{ count: tab.count }} />
              </button>
            );
          })}
        </div>
      ) : null}

      <ReviewsErrorMaybe queryReviewsError={queryReviewsError} />

      {!queryReviewsError && shownReviews.length === 0 ? (
        <p className={css.noReviews}>
          <FormattedMessage id="ProfilePage.noReviews" />
        </p>
      ) : null}
      <Reviews className={css.reviewsList} reviews={shownReviews} />
    </section>
  );
};

export const CustomUserFields = props => {
  const { publicData, metadata, userFieldConfig, intl } = props;

  const shouldPickUserField = fieldConfig =>
    ['public', 'metadata'].includes(fieldConfig?.scope) &&
    fieldConfig?.showConfig?.displayInProfile !== false;
  const propsForCustomFields =
    pickCustomFieldProps(
      { publicData, metadata },
      userFieldConfig,
      'userType',
      shouldPickUserField
    ) || [];

  const pickUserFields = (filteredConfigs, config) => {
    const { key, schemaType, enumOptions, userTypeConfig = {}, showConfig = {} } = config;
    const { limitToUserTypeIds, userTypeIds } = userTypeConfig;
    const userType = publicData.userType;
    const isTargetUserType = !limitToUserTypeIds || userTypeIds.includes(userType);

    const { label, displayInProfile } = showConfig;
    const publicDataValue = getFieldValue(publicData, key);
    const metadataValue = getFieldValue(metadata, key);
    const value = publicDataValue !== null ? publicDataValue : metadataValue;

    if (displayInProfile && isTargetUserType && value !== null) {
      const detailValue = getDetailCustomFieldValue(
        enumOptions,
        value,
        schemaType,
        key,
        label,
        intl,
        'ProfilePage'
      );

      return detailValue ? filteredConfigs.concat(detailValue) : filteredConfigs;
    }
    return filteredConfigs;
  };
  const sectionDetailsProps = {
    ...props,
    fieldConfigs: userFieldConfig,
    heading: 'ProfilePage.detailsTitle',
    rootClassName: css.userFieldSection,
  };

  return (
    <CustomExtendedDataSection
      sectionDetailsProps={sectionDetailsProps}
      propsForCustomFields={propsForCustomFields}
      idPrefix="profilePage"
      pickExtendedDataFields={pickUserFields}
      rootClassName={css.userFieldSection}
    />
  );
};

/**
 * Profile content: header card, Console user fields, the user's items and reviews.
 */
export const MainContent = props => {
  const {
    user,
    userShowError,
    bio,
    displayName,
    listings,
    queryListingsError,
    reviews = [],
    queryReviewsError,
    publicData,
    metadata,
    userFieldConfig,
    intl,
    hideReviews,
    userTypeRoles,
    showLinkToProfileSettingsPage,
  } = props;

  const hasListings = listings.length > 0;

  if (userShowError || queryListingsError) {
    return (
      <div className={css.content}>
        <p className={css.error}>
          <FormattedMessage id="ProfilePage.loadingDataFailed" />
        </p>
      </div>
    );
  }
  return (
    <div className={css.content}>
      <ProfileHeader
        user={user}
        displayName={displayName}
        bio={bio}
        reviews={reviews}
        hideReviews={hideReviews}
        showLinkToProfileSettingsPage={showLinkToProfileSettingsPage}
      />

      {displayName ? (
        <CustomUserFields
          publicData={publicData}
          metadata={metadata}
          userFieldConfig={userFieldConfig}
          intl={intl}
        />
      ) : null}

      {hasListings ? (
        <section className={css.section}>
          <div className={css.sectionTitleRow}>
            <H2 as="h2" className={css.sectionTitle}>
              <FormattedMessage id="ProfilePage.itemsTitle" values={{ name: displayName }} />
            </H2>
            <span className={css.countBadge}>{listings.length}</span>
          </div>
          <ul className={css.listings}>
            {listings.map(l => (
              <li className={css.listing} key={l.id.uuid}>
                <ListingCard listing={l} showAuthorInfo={false} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hideReviews ? null : (
        <ProfileReviews
          reviews={reviews}
          queryReviewsError={queryReviewsError}
          userTypeRoles={userTypeRoles}
        />
      )}
    </div>
  );
};

/**
 * ProfilePageComponent
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.scrollingDisabled - Whether the scrolling is disabled
 * @param {propTypes.currentUser} props.currentUser - The current user
 * @param {boolean} props.useCurrentUser - Whether to use the current user
 * @param {propTypes.user|propTypes.currentUser} props.user - The user
 * @param {propTypes.error} props.userShowError - The user show error
 * @param {propTypes.error} props.queryListingsError - The query listings error
 * @param {Array<propTypes.listing|propTypes.ownListing>} props.listings - The listings
 * @param {Array<propTypes.review>} props.reviews - The reviews
 * @param {propTypes.error} props.queryReviewsError - The query reviews error
 * @returns {JSX.Element} ProfilePageComponent
 */
export const ProfilePageComponent = props => {
  const config = useConfiguration();
  const intl = useIntl();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    scrollingDisabled,
    params: pathParams,
    currentUser,
    useCurrentUser,
    userShowError,
    user,
    ...rest
  } = props;
  const isVariant = pathParams.variant?.length > 0;
  const isPreview = isVariant && pathParams.variant === PROFILE_PAGE_PENDING_APPROVAL_VARIANT;

  // Stripe's onboarding needs a business URL for each seller, but the profile page can be
  // too empty for the provider at the time they are creating their first listing.
  // To remedy the situation, we redirect Stripe's crawler to the landing page of the marketplace.
  // TODO: When there's more content on the profile page, we should consider by-passing this redirection.
  const searchParams = rest?.location?.search;
  const isStorefront = searchParams
    ? new URLSearchParams(searchParams)?.get('mode') === 'storefront'
    : false;
  if (isStorefront) {
    return <NamedRedirect name="LandingPage" />;
  }

  const isCurrentUser = currentUser?.id && currentUser?.id?.uuid === pathParams.id;
  const profileUser = useCurrentUser ? currentUser : user;
  const { bio, displayName, publicData, metadata } = profileUser?.attributes?.profile || {};
  const { userFields } = config.user;
  const isPrivateMarketplace = config.accessControl.marketplace.private === true;
  const isUnauthorizedUser = currentUser && !isUserAuthorized(currentUser);
  const isUnauthorizedOnPrivateMarketplace = isPrivateMarketplace && isUnauthorizedUser;
  const hasUserPendingApprovalError = isErrorUserPendingApproval(userShowError);
  const hasNoViewingRightsUser = currentUser && !hasPermissionToViewData(currentUser);
  const hasNoViewingRightsOnPrivateMarketplace = isPrivateMarketplace && hasNoViewingRightsUser;

  const userTypeRoles = getCurrentUserTypeRoles(config, profileUser);

  const isDataLoaded = isPreview
    ? currentUser != null || userShowError != null
    : hasNoViewingRightsOnPrivateMarketplace
    ? currentUser != null || userShowError != null
    : user != null || userShowError != null;

  const schemaTitleVars = { name: displayName, marketplaceName: config.marketplaceName };
  const schemaTitle = intl.formatMessage({ id: 'ProfilePage.schemaTitle' }, schemaTitleVars);

  if (!isDataLoaded) {
    return null;
  } else if (!isPreview && isNotFoundError(userShowError)) {
    return <NotFoundPage staticContext={props.staticContext} />;
  } else if (!isPreview && (isUnauthorizedOnPrivateMarketplace || hasUserPendingApprovalError)) {
    return (
      <NamedRedirect
        name="NoAccessPage"
        params={{ missingAccessRight: NO_ACCESS_PAGE_USER_PENDING_APPROVAL }}
      />
    );
  } else if (
    (!isPreview && hasNoViewingRightsOnPrivateMarketplace && !isCurrentUser) ||
    isErrorNoViewingPermission(userShowError)
  ) {
    // Someone without viewing rights on a private marketplace is trying to
    // view a profile page that is not their own – redirect to NoAccessPage
    return (
      <NamedRedirect
        name="NoAccessPage"
        params={{ missingAccessRight: NO_ACCESS_PAGE_VIEW_LISTINGS }}
      />
    );
  } else if (!isPreview && isForbiddenError(userShowError)) {
    // This can happen if private marketplace mode is active, but it's not reflected through asset yet.
    return (
      <NamedRedirect
        name="SignupPage"
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  } else if (isPreview && mounted && !isCurrentUser) {
    // Someone is manipulating the URL, redirect to current user's profile page.
    return isCurrentUser === false ? (
      <NamedRedirect name="ProfilePage" params={{ id: currentUser?.id?.uuid }} />
    ) : null;
  } else if ((isPreview || isPrivateMarketplace) && !mounted) {
    // This preview of the profile page is not rendered on server-side
    // and the first pass on client-side should render the same UI.
    return null;
  }

  // This is rendering normal profile page (not preview for pending-approval)
  return (
    <Page
      scrollingDisabled={scrollingDisabled}
      title={schemaTitle}
      schema={{
        '@context': 'http://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
          '@type': 'Person',
          name: profileUser?.attributes?.profile?.displayName,
        },
        name: schemaTitle,
      }}
    >
      <LayoutSingleColumn topbar={<TopbarContainer />} footer={<FooterContainer />}>
        <MainContent
          user={profileUser}
          bio={bio}
          displayName={displayName}
          userShowError={userShowError}
          publicData={publicData}
          metadata={metadata}
          userFieldConfig={userFields}
          hideReviews={hasNoViewingRightsOnPrivateMarketplace}
          intl={intl}
          userTypeRoles={userTypeRoles}
          showLinkToProfileSettingsPage={mounted && isCurrentUser}
          {...rest}
        />
      </LayoutSingleColumn>
    </Page>
  );
};

const mapStateToProps = state => {
  const { currentUser } = state.user;
  const {
    userId,
    userShowError,
    queryListingsError,
    userListingRefs,
    reviews = [],
    queryReviewsError,
  } = state.ProfilePage;
  const userMatches = getMarketplaceEntities(state, [{ type: 'user', id: userId }]);
  const user = userMatches.length === 1 ? userMatches[0] : null;

  // Show currentUser's data if it's not approved yet
  const isCurrentUser = userId?.uuid === currentUser?.id?.uuid;
  const useCurrentUser =
    isCurrentUser && !(isUserAuthorized(currentUser) && hasPermissionToViewData(currentUser));

  return {
    scrollingDisabled: isScrollingDisabled(state),
    currentUser,
    useCurrentUser,
    user,
    userShowError,
    queryListingsError,
    listings: getMarketplaceEntities(state, userListingRefs),
    reviews,
    queryReviewsError,
  };
};

const ProfilePage = compose(connect(mapStateToProps))(ProfilePageComponent);

export default ProfilePage;
