import React from 'react';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { formatMoney } from '../../../util/currency';
import { getBookingTimeRange } from '../../../util/bookingTimeRange';

import { AvatarMedium, NamedLink, TimeRange, UserDisplayName } from '../../../components';

import css from './BookingRequestRow.module.css';

/**
 * A booking request waiting for the provider's reply. Accepting and declining happens on the
 * sale details page, where the provider sees the full price breakdown and messages.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.transaction transaction with customer, listing and booking included
 * @returns {JSX.Element} booking request row
 */
const BookingRequestRow = props => {
  const { transaction } = props;
  const intl = useIntl();
  const { customer, listing } = transaction;
  const timeRange = getBookingTimeRange(transaction);
  const payoutTotal = transaction.attributes?.payoutTotal;
  const listingTitle = listing?.attributes?.title;
  // Every row has the same button text, so the accessible name says which request it opens
  const reviewLabel = intl.formatMessage(
    { id: 'DashboardPage.requests.reviewLabel' },
    { customer: customer?.attributes?.profile?.displayName || '', listing: listingTitle || '' }
  );

  return (
    <div className={css.root}>
      <AvatarMedium className={css.avatar} user={customer} disableProfileLink />

      <div className={css.details}>
        <p className={css.customer}>
          <UserDisplayName user={customer} intl={intl} />
        </p>
        <div className={css.booking}>
          <span className={css.listingTitle}>{listingTitle}</span>
          {timeRange ? (
            <>
              <span aria-hidden="true"> · </span>
              <TimeRange
                rootClassName={css.timeRange}
                startDate={timeRange.start}
                endDate={timeRange.end}
                dateType={timeRange.dateType}
                timeZone={timeRange.timeZone}
              />
            </>
          ) : null}
        </div>
      </div>

      {payoutTotal ? (
        <p className={css.payout}>
          <span className={css.payoutLabel}>
            <FormattedMessage id="DashboardPage.requests.youEarn" />
          </span>
          <span className={css.payoutAmount}>{formatMoney(intl, payoutTotal)}</span>
        </p>
      ) : null}

      <NamedLink
        className={css.reviewLink}
        name="SaleDetailsPage"
        params={{ id: transaction.id.uuid }}
        ariaLabel={reviewLabel}
      >
        <FormattedMessage id="DashboardPage.requests.review" />
      </NamedLink>
    </div>
  );
};

export default BookingRequestRow;
