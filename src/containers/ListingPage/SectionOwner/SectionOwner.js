import React, { useEffect, useState } from 'react';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { LISTING_STATE_PUBLISHED } from '../../../util/types';
import {
  isInquiryProcessAlias,
  isNegotiationProcessAlias,
  OFFER,
} from '../../../transactions/transaction';

import { AvatarMedium, Modal } from '../../../components';

import InquiryForm from '../InquiryForm/InquiryForm';

import css from './SectionOwner.module.css';

const CONTACT_USER_BUTTON_ID = 'inquiryModalContactUserLink';

const IconVerified = () => (
  <svg className={css.icon} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconMessage = () => (
  <svg className={css.icon} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

/**
 * Owner card (Listing and ListingDesktop mockups): avatar, "{name} owns this item", the
 * "Verified by Stripe" tag, member since year and "Ask {name} a question", which opens the
 * inquiry modal. The tag is shown on published listings: publishing a listing requires the
 * owner's Stripe account to be verified. Owner ratings are not shown here (they're on the
 * profile page).
 *
 * @component
 * @param {Object} props
 * @param {Object} props.listing API entity with author
 * @param {string} props.title plain listing title
 * @param {string} props.authorDisplayName
 * @param {Object?} props.currentUser
 * @param {Function} props.onContactUser
 * @param {boolean} props.isInquiryModalOpen
 * @param {Function} props.onCloseInquiryModal
 * @param {Object?} props.sendInquiryError
 * @param {boolean} props.sendInquiryInProgress
 * @param {Function} props.onSubmitInquiry
 * @param {Function} props.onManageDisableScrolling
 * @returns {JSX.Element|null} owner section
 */
const SectionOwner = props => {
  const {
    listing,
    title,
    authorDisplayName,
    currentUser,
    onContactUser,
    isInquiryModalOpen,
    onCloseInquiryModal,
    sendInquiryError,
    sendInquiryInProgress,
    onSubmitInquiry,
    onManageDisableScrolling,
  } = props;
  const intl = useIntl();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const author = listing.author;
  if (!author) {
    return null;
  }

  const { publicData, state } = listing.attributes;
  const transactionProcessAlias = publicData?.transactionProcessAlias || '';
  const isInquiryProcess = isInquiryProcessAlias(transactionProcessAlias);
  const isNegotiationProcess = isNegotiationProcessAlias(transactionProcessAlias);
  const canContact = !(
    isInquiryProcess ||
    (isNegotiationProcess && publicData?.unitType === OFFER)
  );
  // The current user is only known in the browser, so the button is hidden from the owner
  // after mounting (same as UserCard)
  const isOwner = currentUser?.id && currentUser.id.uuid === author.id?.uuid;
  const showContact = canContact && !(mounted && isOwner);

  const createdAt = author.attributes?.createdAt;
  const memberSince = createdAt ? intl.formatDate(createdAt, { year: 'numeric' }) : null;
  const isVerified = state === LISTING_STATE_PUBLISHED;

  return (
    <section id="author" className={css.root}>
      <div className={css.card}>
        <AvatarMedium className={css.avatar} user={author} />
        <div className={css.info}>
          <h2 className={css.name}>
            <FormattedMessage
              id="ListingPage.ownsThisItem"
              values={{
                name: <span className={css.nameValue}>{authorDisplayName}</span>,
              }}
            />
          </h2>
          <p className={css.meta}>
            {isVerified ? (
              <span className={css.verified}>
                <IconVerified />
                <FormattedMessage id="ListingPage.verifiedByStripe" />
              </span>
            ) : null}
            {memberSince ? (
              <span>
                <FormattedMessage id="ListingPage.memberSince" values={{ year: memberSince }} />
              </span>
            ) : null}
          </p>
        </div>
        {showContact ? (
          <button
            id={CONTACT_USER_BUTTON_ID}
            type="button"
            className={css.contactButton}
            onClick={() => onContactUser(author)}
          >
            <IconMessage />
            <FormattedMessage id="ListingPage.askOwner" values={{ name: authorDisplayName }} />
          </button>
        ) : null}
      </div>

      <Modal
        id="ListingPage.inquiry"
        contentClassName={css.inquiryModalContent}
        isOpen={isInquiryModalOpen}
        onClose={onCloseInquiryModal}
        usePortal
        onManageDisableScrolling={onManageDisableScrolling}
        focusElementId={CONTACT_USER_BUTTON_ID}
      >
        <InquiryForm
          className={css.inquiryForm}
          submitButtonWrapperClassName={css.inquirySubmitButtonWrapper}
          listingTitle={title}
          authorDisplayName={authorDisplayName}
          sendInquiryError={sendInquiryError}
          onSubmit={onSubmitInquiry}
          inProgress={sendInquiryInProgress}
        />
      </Modal>
    </section>
  );
};

export default SectionOwner;
