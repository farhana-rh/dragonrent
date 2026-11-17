import React from 'react';
import classNames from 'classnames';

import { useConfiguration } from '../../../context/configurationContext';
import { useIntl, FormattedMessage } from '../../../util/reactIntl';
import {
  LISTING_STATE_DRAFT,
  LISTING_STATE_PENDING_APPROVAL,
  STOCK_MULTIPLE_ITEMS,
  propTypes,
} from '../../../util/types';
import { ensureOwnListing } from '../../../util/data';
import {
  LISTING_PAGE_DRAFT_VARIANT,
  LISTING_PAGE_PENDING_APPROVAL_VARIANT,
  LISTING_PAGE_PARAM_TYPE_DRAFT,
  LISTING_PAGE_PARAM_TYPE_EDIT,
  createSlug,
} from '../../../util/urlHelpers';
import { isBookingProcessAlias, isPurchaseProcessAlias } from '../../../transactions/transaction';

import { NamedLink, IconSpinner, InlineTextButton, SecondaryButton } from '../../../components';

import CardThumbnail, { getOverlayType, getShowOutOfStockOverlay } from './CardThumbnail';
import Overlay from './Overlay';
import PriceInfo from './PriceInfo';
import css from './ManageListingCard.module.css';

const MAX_LENGTH_FOR_WORDS_IN_TITLE = 7;

// Card status → sticker text, sticker colour class and the one-line note under the price
const STATUS_PUBLISHED = 'published';
const STATUS_INFO = {
  published: { sticker: 'ManageListingCard.statusLive', className: css.statusLive },
  draft: { sticker: 'ManageListingCard.statusDraft', className: css.statusDraft },
  closed: { sticker: 'ManageListingCard.statusClosed', className: css.statusClosed },
  pendingApproval: {
    sticker: 'ManageListingCard.statusPendingApproval',
    className: css.statusPending,
  },
  outOfStock: { sticker: 'ManageListingCard.statusOutOfStock', className: css.statusClosed },
};

/**
 * Splits a title to break long words into spans so that
 * flexbox card layouts don't expand excessively.
 *
 * @param {string} title - Listing title
 * @param {number} maxLength - Maximum allowed word length before breaking
 * @returns {Array<React.ReactNode>} Formatted title parts
 */
export const formatTitle = (title, maxLength) => {
  const nonWhiteSpaceSequence = /([^\s]+)/gi;
  return title.split(nonWhiteSpaceSequence).map((word, index) => {
    return word.length > maxLength ? (
      <span key={index} style={{ wordBreak: 'break-all' }}>
        {word}
      </span>
    ) : (
      word
    );
  });
};

/**
 * Where the card's photo and title lead: the draft or pending-approval preview, or the
 * listing page.
 */
const getListingLinkProps = ({ state, id, slug, title, intl }) => ({
  ...(state === LISTING_STATE_DRAFT || state === LISTING_STATE_PENDING_APPROVAL
    ? {
        name: 'ListingPageVariant',
        params: {
          id,
          slug,
          variant:
            state === LISTING_STATE_DRAFT
              ? LISTING_PAGE_DRAFT_VARIANT
              : LISTING_PAGE_PENDING_APPROVAL_VARIANT,
        },
      }
    : {
        name: 'ListingPage',
        params: { id, slug },
      }),
  ariaLabel: intl.formatMessage({ id: 'ManageListingCard.screenreader.viewListing' }, { title }),
});

const IconCalendar = () => (
  <svg
    className={css.linkIcon}
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
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 11h18" />
  </svg>
);

/**
 * Small icon in the status sticker, so the status isn't shown by colour alone.
 */
const StatusIcon = ({ status }) => {
  const iconProps = {
    className: css.statusIcon,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2.6',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  };
  if (status === STATUS_PUBLISHED) {
    return (
      <svg {...iconProps} fill="currentColor" stroke="none">
        <circle cx="12" cy="12" r="7" />
      </svg>
    );
  }
  if (status === 'draft') {
    return (
      <svg {...iconProps}>
        <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
      </svg>
    );
  }
  if (status === 'pendingApproval') {
    return (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }
  // closed, out of stock: crossed-out eye ("not visible")
  return (
    <svg {...iconProps}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10 10 0 0112 5c6 0 9.5 7 9.5 7a17 17 0 01-2.3 3.2M6.6 6.6A16.6 16.6 0 002.5 12s3.5 7 9.5 7a9.6 9.6 0 004.4-1" />
    </svg>
  );
};

/**
 * "Manage availability" (booking) or "Manage stock" (purchase with stock) link, or nothing.
 */
const LinkToStockOrAvailabilityTab = props => {
  const intl = useIntl();
  const { listing, listingTypeConfig } = props;

  const id = listing.id.uuid;
  const { title = '', state, publicData } = listing.attributes || {};
  const slug = createSlug(title);

  const { listingType, transactionProcessAlias } = publicData || {};
  const isDraft = state === LISTING_STATE_DRAFT;
  const isBookable = isBookingProcessAlias(transactionProcessAlias);
  const isProductOrder = isPurchaseProcessAlias(transactionProcessAlias);
  const hasListingType = !!listingType;
  const hasStockManagementInUse =
    isProductOrder && listingTypeConfig?.stockType === STOCK_MULTIPLE_ITEMS;
  const currentStock = listing?.currentStock?.attributes?.quantity;

  const editListingLinkType = isDraft
    ? LISTING_PAGE_PARAM_TYPE_DRAFT
    : LISTING_PAGE_PARAM_TYPE_EDIT;

  if (!hasListingType || !(isBookable || hasStockManagementInUse)) {
    return null;
  }

  return isBookable ? (
    <NamedLink
      className={css.manageLink}
      name="EditListingPage"
      params={{ id, slug, type: editListingLinkType, tab: 'availability' }}
      ariaLabel={intl.formatMessage(
        { id: 'ManageListingCard.screenreader.manageAvailability' },
        { title }
      )}
    >
      <IconCalendar />
      <FormattedMessage id="ManageListingCard.manageAvailability" />
    </NamedLink>
  ) : (
    <NamedLink
      className={css.manageLink}
      name="EditListingPage"
      params={{ id, slug, type: editListingLinkType, tab: 'pricing-and-stock' }}
      ariaLabel={
        currentStock != null
          ? intl.formatMessage(
              { id: 'ManageListingCard.screenreader.manageStock' },
              { title, currentStock }
            )
          : intl.formatMessage({ id: 'ManageListingCard.screenreader.setPriceAndStock' }, { title })
      }
    >
      {currentStock != null ? (
        <FormattedMessage id="ManageListingCard.manageStock" values={{ currentStock }} />
      ) : (
        <FormattedMessage id="ManageListingCard.setPriceAndStock" />
      )}
    </NamedLink>
  );
};

/**
 * Manage listing card (DragonRent sticker card): photo, status sticker, title, price, a short
 * note on what the status means, and the actions for that status as visible buttons
 * (Edit / Close, Finish / Discard, Open / Edit, Preview / Edit).
 *
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {boolean} props.hasClosingError - Whether the closing error is present
 * @param {boolean} props.hasDiscardingError - Whether the discarding error is present
 * @param {boolean} props.hasOpeningError - Whether the opening error is present
 * @param {Object} [props.actionsInProgressListingId] - The actions in progress for the specific listing
 * @param {propTypes.uuid} [props.actionsInProgressListingId.uuid] - The uuid of the listing
 * @param {propTypes.ownListing} props.listing - The listing
 * @param {string} [props.renderSizes] - The render sizes for the ResponsiveImage component
 * @param {function} props.onCloseListing - The function to close the listing
 * @param {function} props.onOpenListing - The function to open the listing
 * @param {function} props.onDiscardDraft - The function to discard the draft
 * @returns {JSX.Element} Manage listing card component
 */
export const ManageListingCard = props => {
  const config = useConfiguration();
  const intl = props.intl || useIntl();
  const {
    className,
    rootClassName,
    hasClosingError,
    hasDiscardingError,
    hasOpeningError,
    actionsInProgressListingId,
    listing,
    renderSizes,
    onCloseListing,
    onOpenListing,
    onDiscardDraft,
  } = props;
  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureOwnListing(listing);
  const listingId = currentListing.id;
  const id = listingId.uuid;
  const { title = '', state, publicData, price } = currentListing.attributes;
  const slug = createSlug(title);

  const { listingType, transactionProcessAlias } = publicData || {};
  const isBookable = isBookingProcessAlias(transactionProcessAlias);

  const validListingTypes = config.listing.listingTypes;
  const listingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);
  const hasStockManagementInUse =
    isPurchaseProcessAlias(transactionProcessAlias) &&
    listingTypeConfig?.stockType === STOCK_MULTIPLE_ITEMS;

  const status =
    getOverlayType({
      state,
      showOutOfStockOverlay: getShowOutOfStockOverlay({ listing: currentListing, isBookable }),
    }) || STATUS_PUBLISHED;
  const statusInfo = STATUS_INFO[status];

  const hasError = hasOpeningError || hasClosingError || hasDiscardingError;
  const isActionInProgress = !!actionsInProgressListingId;
  const thisListingInProgress = isActionInProgress && actionsInProgressListingId.uuid === id;

  const listingLinkProps = getListingLinkProps({ state, id, slug, title, intl });

  const editLink = (
    <NamedLink
      className={css.actionButton}
      name="EditListingPage"
      params={{
        id,
        slug,
        type:
          state === LISTING_STATE_DRAFT
            ? LISTING_PAGE_PARAM_TYPE_DRAFT
            : LISTING_PAGE_PARAM_TYPE_EDIT,
        tab: 'details',
      }}
      ariaLabel={intl.formatMessage(
        { id: 'ManageListingCard.screenreader.editListing' },
        { title }
      )}
    >
      <FormattedMessage id="ManageListingCard.editListing" />
    </NamedLink>
  );

  const closeButton = (
    <SecondaryButton
      rootClassName={css.actionButton}
      type="button"
      disabled={isActionInProgress}
      onClick={() => onCloseListing(listingId)}
    >
      <FormattedMessage id="ManageListingCard.closeListing" />
    </SecondaryButton>
  );

  const stockOrAvailabilityLink = (
    <LinkToStockOrAvailabilityTab listing={currentListing} listingTypeConfig={listingTypeConfig} />
  );

  const actions =
    status === 'draft' ? (
      <>
        <NamedLink
          className={css.actionButtonWide}
          name="EditListingPage"
          params={{ id, slug, type: LISTING_PAGE_PARAM_TYPE_DRAFT, tab: 'photos' }}
          ariaLabel={`${intl.formatMessage({
            id: 'ManageListingCard.finishListingDraft',
          })}: ${title}`}
        >
          <FormattedMessage id="ManageListingCard.finishListingDraft" />
        </NamedLink>
        <InlineTextButton
          id={`discardButton_${id}`}
          rootClassName={css.textButton}
          disabled={isActionInProgress}
          onClick={() => onDiscardDraft(listingId)}
        >
          <FormattedMessage id="ManageListingCard.discardDraftLinkText" />
        </InlineTextButton>
      </>
    ) : status === 'closed' ? (
      <>
        <div className={css.actionRow}>
          <SecondaryButton
            rootClassName={css.actionButton}
            type="button"
            disabled={isActionInProgress}
            onClick={() => onOpenListing(listingId)}
          >
            <FormattedMessage id="ManageListingCard.openListing" />
          </SecondaryButton>
          {editLink}
        </div>
        {stockOrAvailabilityLink}
      </>
    ) : status === 'pendingApproval' ? (
      <>
        <div className={css.actionRow}>
          <NamedLink
            className={css.actionButton}
            name="ListingPageVariant"
            params={{ id, slug, variant: LISTING_PAGE_PENDING_APPROVAL_VARIANT }}
            ariaLabel={intl.formatMessage(
              { id: 'ManageListingCard.screenreader.previewListing' },
              { title }
            )}
          >
            <FormattedMessage id="ManageListingCard.previewListingLink" />
          </NamedLink>
          {editLink}
        </div>
        {stockOrAvailabilityLink}
      </>
    ) : status === 'outOfStock' ? (
      <>
        <div className={css.actionRow}>
          {editLink}
          {closeButton}
        </div>
        {hasStockManagementInUse ? stockOrAvailabilityLink : null}
      </>
    ) : (
      <>
        <div className={css.actionRow}>
          {editLink}
          {closeButton}
        </div>
        {stockOrAvailabilityLink}
      </>
    );

  const noteId =
    status === STATUS_PUBLISHED
      ? isBookable
        ? 'ManageListingCard.noteLive'
        : null
      : `ManageListingCard.note${status.charAt(0).toUpperCase()}${status.slice(1)}`;

  return (
    <div className={classes}>
      <div className={css.thumbnailContainer}>
        <CardThumbnail
          listing={currentListing}
          renderSizes={renderSizes}
          linkProps={listingLinkProps}
          isDimmed={status === 'closed' || status === 'outOfStock'}
        />

        {thisListingInProgress ? (
          <Overlay>
            <IconSpinner />
          </Overlay>
        ) : hasError ? (
          <Overlay errorMessage={intl.formatMessage({ id: 'ManageListingCard.actionFailed' })} />
        ) : null}
      </div>

      <div className={css.info}>
        <span className={classNames(css.statusSticker, statusInfo.className)}>
          <StatusIcon status={status} />
          <FormattedMessage id={statusInfo.sticker} />
        </span>

        <div className={css.mainInfo}>
          <NamedLink className={css.title} {...listingLinkProps}>
            {formatTitle(title, MAX_LENGTH_FOR_WORDS_IN_TITLE)}
          </NamedLink>
          <PriceInfo
            price={price}
            publicData={publicData}
            isBookable={isBookable}
            listingTypeConfig={listingTypeConfig}
          />
          {noteId ? (
            <p className={css.note}>
              <FormattedMessage id={noteId} />
            </p>
          ) : null}
        </div>

        <div className={css.actions}>{actions}</div>
      </div>
    </div>
  );
};

export default ManageListingCard;
