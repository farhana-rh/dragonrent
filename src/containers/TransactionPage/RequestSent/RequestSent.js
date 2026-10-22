import React from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { formatMoney } from '../../../util/currency';
import { getBookingTimeRange } from '../../../util/bookingTimeRange';
import { createSlug } from '../../../util/urlHelpers';

import { NamedLink } from '../../../components';

import css from './RequestSent.module.css';

const Icon = ({ className, size = 22, children }) => (
  <svg
    className={classNames(css.icon, className)}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

const formatDay = (intl, date, timeZone) =>
  intl.formatDate(date, { weekday: 'short', day: 'numeric', month: 'short', timeZone });

/**
 * "Request sent!" (Sent mockup): shown to the renter while the owner hasn't answered the
 * booking request yet, with what happens next in three steps. It describes the default booking
 * process: the card is charged when the owner accepts, and nothing is paid if they decline or
 * don't answer in time.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.transaction transaction with booking included
 * @param {Object} props.listing the requested item
 * @param {string} props.providerName owner's display name
 * @param {string} [props.timeZone] listing's time zone
 * @param {string} [props.messageInputId] id of the message field; "Message {name}" focuses it
 * @returns {JSX.Element}
 */
const RequestSent = props => {
  const { transaction, listing, providerName, timeZone, messageInputId } = props;
  const intl = useIntl();
  const payinTotal = transaction?.attributes?.payinTotal;
  const range = getBookingTimeRange(transaction, timeZone);

  const { title = '', deleted } = listing?.attributes || {};
  const listingId = listing?.id?.uuid;

  const focusMessage = () => {
    const input = document.getElementById(messageInputId);
    if (input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      input.focus({ preventScroll: true });
    }
  };

  const steps = [
    payinTotal
      ? intl.formatMessage(
          { id: 'RequestSent.stepAccept' },
          { name: providerName, total: formatMoney(intl, payinTotal) }
        )
      : null,
    intl.formatMessage({ id: 'RequestSent.stepAgree' }),
    range
      ? intl.formatMessage(
          { id: 'RequestSent.stepPickUp' },
          {
            start: formatDay(intl, range.start, range.timeZone),
            end: formatDay(intl, range.end, range.timeZone),
          }
        )
      : null,
  ].filter(Boolean);

  return (
    <section className={css.root} aria-labelledby="request-sent-heading">
      <div className={css.intro}>
        <span className={css.checkCircle}>
          <Icon size={44} className={css.checkIcon}>
            <path d="M20 6 9 17l-5-5" />
          </Icon>
        </span>
        <h1 id="request-sent-heading" className={css.heading}>
          <FormattedMessage id="RequestSent.heading" />
        </h1>
        <p className={css.lead}>
          <FormattedMessage id="RequestSent.lead" values={{ name: providerName }} />
        </p>
        {title ? (
          <p className={css.listingTitle}>
            {listingId && !deleted ? (
              <NamedLink name="ListingPage" params={{ id: listingId, slug: createSlug(title) }}>
                {title}
              </NamedLink>
            ) : (
              title
            )}
          </p>
        ) : null}
      </div>

      <div className={css.nextCard}>
        <h2 className={css.nextHeading}>
          <FormattedMessage id="RequestSent.nextHeading" />
        </h2>
        <ol className={css.steps}>
          {steps.map((text, i) => (
            <li key={i} className={css.step}>
              <span className={css.stepNumber} aria-hidden="true">
                {i + 1}
              </span>
              <p className={css.stepText}>{text}</p>
            </li>
          ))}
        </ol>
      </div>

      <p className={css.noCharge}>
        <FormattedMessage id="RequestSent.noCharge" values={{ name: providerName }} />
      </p>

      <div className={css.actions}>
        {messageInputId ? (
          <button type="button" className={css.messageButton} onClick={focusMessage}>
            <Icon>
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            </Icon>
            <FormattedMessage id="RequestSent.message" values={{ name: providerName }} />
          </button>
        ) : null}
        <NamedLink name="LandingPage" className={css.homeLink}>
          <FormattedMessage id="RequestSent.backToHome" />
        </NamedLink>
      </div>
    </section>
  );
};

export default RequestSent;
