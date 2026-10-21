import React from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { getBookedQuantity, getBookingTimeRange } from '../../../util/bookingTimeRange';
import { DATE_TYPE_DATETIME } from '../../../util/types';

import { NamedLink } from '../../../components';

import css from './RentalSummary.module.css';

// "Sat 10 Oct", plus the time for hourly bookings
const formatDate = (intl, date, range) =>
  intl.formatDate(date, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: range.timeZone,
    ...(range.dateType === DATE_TYPE_DATETIME ? { hour: 'numeric', minute: 'numeric' } : {}),
  });

/**
 * "Your rental" card on the checkout page: the booked dates and duration, from the
 * (speculated) transaction, with a link back to the listing page to change them.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to component's own css.root
 * @param {Object} props.transaction transaction with booking included
 * @param {string?} props.timeZone listing time zone
 * @param {Object} props.listingLinkProps NamedLink props for the listing page
 * @returns {JSX.Element|null} rental summary, or null when the transaction has no booking
 */
const RentalSummary = props => {
  const { className, transaction, timeZone, listingLinkProps } = props;
  const intl = useIntl();
  const range = getBookingTimeRange(transaction, timeZone);
  if (!range) {
    return null;
  }
  const booked = getBookedQuantity(transaction);

  return (
    <section className={classNames(css.root, className)} aria-labelledby="checkout-rental-title">
      <div className={css.header}>
        <h2 id="checkout-rental-title" className={css.title}>
          <FormattedMessage id="CheckoutPage.rental.title" />
        </h2>
        <NamedLink className={css.changeLink} {...listingLinkProps}>
          <FormattedMessage id="CheckoutPage.rental.changeDates" />
        </NamedLink>
      </div>
      <dl className={css.details}>
        <div className={css.detail}>
          <dt className={css.label}>
            <FormattedMessage id="CheckoutPage.rental.starts" />
          </dt>
          <dd className={css.value}>{formatDate(intl, range.start, range)}</dd>
        </div>
        <div className={css.detail}>
          <dt className={css.label}>
            <FormattedMessage id="CheckoutPage.rental.ends" />
          </dt>
          <dd className={css.value}>{formatDate(intl, range.end, range)}</dd>
        </div>
        {booked ? (
          <div className={css.detail}>
            <dt className={css.label}>
              <FormattedMessage id="CheckoutPage.rental.duration" />
            </dt>
            <dd className={css.value}>
              <FormattedMessage
                id="CheckoutPage.rental.durationValue"
                values={{ quantity: booked.quantity, unit: booked.unit }}
              />
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
};

export default RentalSummary;
