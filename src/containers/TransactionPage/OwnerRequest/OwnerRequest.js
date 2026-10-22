import React from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { formatMoney } from '../../../util/currency';
import { getBookedQuantity, getBookingTimeRange } from '../../../util/bookingTimeRange';

import css from './OwnerRequest.module.css';

const Icon = ({ children }) => (
  <svg
    className={css.icon}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

// Status tags: always an icon plus a word (DESIGN.md → Status tag)
const STATUS_TAGS = {
  waiting: {
    className: css.tagWaiting,
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </Icon>
    ),
  },
  accepted: {
    className: css.tagAccepted,
    icon: (
      <Icon>
        <path d="M20 6 9 17l-5-5" />
      </Icon>
    ),
  },
  declined: {
    className: css.tagDeclined,
    icon: (
      <Icon>
        <path d="M18 6 6 18M6 6l12 12" />
      </Icon>
    ),
  },
};

const formatDay = (intl, date, timeZone) =>
  intl.formatDate(date, { weekday: 'short', day: 'numeric', month: 'short', timeZone });

/**
 * The owner's view of a booking request (OwnerRequest mockup): a status tag, who wants to rent
 * what, the dates and what the owner gets. "You get" is the transaction's payout total, so it
 * always matches the commission set in Console. Accept and Decline are the page's action buttons.
 *
 * @component
 * @param {Object} props
 * @param {'waiting'|'accepted'|'declined'} props.status
 * @param {Object} props.transaction transaction with booking included
 * @param {Object} props.listing the requested item
 * @param {string} props.customerName renter's display name
 * @param {string} [props.timeZone] listing's time zone
 * @returns {JSX.Element}
 */
const OwnerRequest = props => {
  const { status, transaction, listing, customerName, timeZone } = props;
  const intl = useIntl();
  const tag = STATUS_TAGS[status] || STATUS_TAGS.waiting;
  const range = getBookingTimeRange(transaction, timeZone);
  const booked = getBookedQuantity(transaction);
  const payoutTotal = transaction?.attributes?.payoutTotal;
  const title = listing?.attributes?.title || '';
  const values = { name: customerName, title };

  return (
    <section className={css.root} aria-labelledby="owner-request-heading">
      <div className={css.intro}>
        <span className={classNames(css.tag, tag.className)}>
          {tag.icon}
          <FormattedMessage id={`OwnerRequest.status.${status}`} />
        </span>
        <h1 id="owner-request-heading" className={css.heading}>
          <FormattedMessage id={`OwnerRequest.heading.${status}`} values={values} />
        </h1>
      </div>

      <div className={css.card}>
        <p className={css.listingTitle}>{title}</p>
        {range ? (
          <dl className={css.rows}>
            <div className={css.row}>
              <dt className={css.rowLabel}>
                <FormattedMessage id="BookingDatesForm.pickUpTitle" />
              </dt>
              <dd className={css.rowValue}>{formatDay(intl, range.start, range.timeZone)}</dd>
            </div>
            <div className={css.row}>
              <dt className={css.rowLabel}>
                <FormattedMessage id="BookingDatesForm.returnTitle" />
              </dt>
              <dd className={css.rowValue}>
                {formatDay(intl, range.end, range.timeZone)}
                {booked ? (
                  <>
                    {' · '}
                    <FormattedMessage
                      id="CheckoutPage.rental.durationValue"
                      values={{ quantity: booked.quantity, unit: booked.unit }}
                    />
                  </>
                ) : null}
              </dd>
            </div>
          </dl>
        ) : null}
        {payoutTotal ? (
          <div className={css.payout}>
            <span className={css.payoutLabel}>
              <FormattedMessage id="OwnerRequest.youGet" />
            </span>
            <span className={css.payoutValue}>{formatMoney(intl, payoutTotal)}</span>
          </div>
        ) : null}
      </div>

      {status === 'waiting' ? (
        <p className={css.note}>
          <FormattedMessage id="OwnerRequest.expiryNote" values={values} />
        </p>
      ) : (
        <div className={status === 'accepted' ? css.outcomeAccepted : css.outcomeDeclined}>
          <p className={css.outcomeTitle}>
            <FormattedMessage id={`OwnerRequest.outcomeTitle.${status}`} />
          </p>
          <p className={css.outcomeText}>
            <FormattedMessage id={`OwnerRequest.outcomeText.${status}`} values={values} />
          </p>
        </div>
      )}
    </section>
  );
};

export default OwnerRequest;
