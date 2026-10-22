import React from 'react';
import { FormattedMessage } from '../../../util/reactIntl';

import css from './SubmitFinePrint.module.css';

const IconLock = () => (
  <svg className={css.lockIcon} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <rect width="18" height="11" x="3" y="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

/**
 * A component that displays the fine print for the submit button.
 * Note: this is not in use for ProductOrderForm.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.payoutDetailsWarning] - The payout details warning
 * @param {boolean} [props.isOwnListing] - Whether the listing is owned by the current user
 * @param {boolean} [props.isBookingRequest] - Booking request (default booking process): the card
 * is only charged when the owner accepts, so the note says so (Listing mockups)
 */
const SubmitFinePrint = ({
  payoutDetailsWarning,
  isOwnListing,
  isBookingRequest = false,
  omitYouWontBeChargedMessage = false,
}) => {
  if (isBookingRequest && !payoutDetailsWarning && !isOwnListing) {
    return (
      <p className={css.lockNote}>
        <IconLock />
        <FormattedMessage id="OrderPanel.chargedOnlyIfAccepted" />
      </p>
    );
  }

  return (
    <p className={css.finePrint}>
      {payoutDetailsWarning ? (
        payoutDetailsWarning
      ) : isOwnListing ? (
        <FormattedMessage id="OrderPanel.ownListing" />
      ) : !omitYouWontBeChargedMessage ? (
        <FormattedMessage id="OrderPanel.youWontBeChargedInfo" />
      ) : null}
    </p>
  );
};

export default SubmitFinePrint;
