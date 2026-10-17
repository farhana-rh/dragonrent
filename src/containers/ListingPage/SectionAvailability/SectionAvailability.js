import React from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import {
  getDayOfWeek,
  getStartOf,
  getStartOfWeek,
  monthIdString,
  stringifyDateToISO8601,
} from '../../../util/dates';
import { timeSlotsPerDate } from '../../../util/generators';

import { Heading } from '../../../components';
import {
  getAllTimeSlots,
  getMonthlyFetchRange,
  getMonthStartInTimeZone,
} from '../../../components/OrderPanel/booking.shared';

import css from './SectionAvailability.module.css';

const MAX_MONTHS = 2;

// Months whose time slots have been fetched, e.g. ['2026-10', '2026-11']
const getFetchedMonthIds = monthlyTimeSlots =>
  Object.entries(monthlyTimeSlots || {})
    .filter(([, data]) => Array.isArray(data?.timeSlots))
    .map(([monthId]) => monthId)
    .sort();

/**
 * Build calendar weeks for a month in the listing's time zone.
 *
 * @param {string} monthId 'YYYY-MM'
 * @param {string} timeZone IANA time zone
 * @param {number} firstDayOfWeek 0 (Sun) ... 6 (Sat)
 * @returns {Array<Array<Date|null>>} weeks of days; null for padding cells
 */
export const getMonthWeeks = (monthId, timeZone, firstDayOfWeek) => {
  const monthStart = getMonthStartInTimeZone(monthId, timeZone);
  const days = [];
  for (let i = 0; i < 31; i++) {
    const day = getStartOf(monthStart, 'day', timeZone, i, 'days');
    if (monthIdString(day, timeZone) !== monthId) break;
    days.push(day);
  }

  const leadingBlanks = (getDayOfWeek(monthStart, timeZone) - firstDayOfWeek + 7) % 7;
  const cells = [...Array(leadingBlanks).fill(null), ...days];
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
};

const Month = props => {
  const { monthId, timeZone, firstDayOfWeek, dayData, todayId, intl } = props;
  const weeks = getMonthWeeks(monthId, timeZone, firstDayOfWeek);
  const monthStart = getMonthStartInTimeZone(monthId, timeZone);
  const monthLabel = intl.formatDate(monthStart, { month: 'long', year: 'numeric', timeZone });

  // Weekday headers starting from the configured first day of week
  const weekStart = getStartOfWeek(monthStart, timeZone, firstDayOfWeek);
  const weekdayHeaders = [0, 1, 2, 3, 4, 5, 6].map(i =>
    intl.formatDate(getStartOf(weekStart, 'day', timeZone, i, 'days'), {
      weekday: 'short',
      timeZone,
    })
  );

  return (
    <div className={css.month}>
      <h3 className={css.monthTitle}>{monthLabel}</h3>
      <table className={css.table}>
        <thead>
          <tr>
            {weekdayHeaders.map(label => (
              <th key={label} scope="col" className={css.weekday}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={`${monthId}-w${wi}`}>
              {week.map((day, di) => {
                if (!day) {
                  return <td key={`${monthId}-${wi}-${di}`} className={css.emptyCell} />;
                }
                const dayId = stringifyDateToISO8601(day, timeZone);
                const isPast = dayId < todayId;
                const isToday = dayId === todayId;
                const isAvailable = !isPast && dayData[dayId]?.hasAvailability === true;
                const label = intl.formatDate(day, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  timeZone,
                });
                const status = isPast
                  ? intl.formatMessage({ id: 'SectionAvailability.dayPast' })
                  : isAvailable
                  ? intl.formatMessage({ id: 'SectionAvailability.dayAvailable' })
                  : intl.formatMessage({ id: 'SectionAvailability.dayUnavailable' });
                return (
                  <td key={dayId} className={css.dayCell}>
                    <span
                      className={classNames(css.day, {
                        [css.dayPast]: isPast,
                        [css.dayAvailable]: isAvailable,
                        [css.dayUnavailable]: !isPast && !isAvailable,
                        [css.dayToday]: isToday,
                      })}
                      aria-label={`${label}: ${status}`}
                    >
                      {intl.formatDate(day, { day: 'numeric', timeZone })}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Read-only availability calendar for the next two months. It uses the time slots that the
 * listing page already fetches for the booking panel; picking dates happens in the booking panel.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.listing API entity
 * @param {Object} props.monthlyTimeSlots e.g. { '2026-10': { timeSlots: [], fetchTimeSlotsInProgress } }
 * @param {number} props.firstDayOfWeek 0 (Sun) ... 6 (Sat)
 * @returns {JSX.Element|null} availability section
 */
const SectionAvailability = props => {
  const { listing, monthlyTimeSlots, firstDayOfWeek = 1 } = props;
  const intl = useIntl();
  const timeZone = listing?.attributes?.availabilityPlan?.timezone;

  if (!timeZone) {
    return null;
  }

  const monthIds = getFetchedMonthIds(monthlyTimeSlots).slice(0, MAX_MONTHS);
  const fetchErrors = Object.values(monthlyTimeSlots || {}).some(m => m?.fetchTimeSlotsError);
  const hasData = monthIds.length > 0;

  let dayData = {};
  if (hasData) {
    const allTimeSlots = getAllTimeSlots(monthlyTimeSlots);
    const [start, end] = getMonthlyFetchRange(monthlyTimeSlots, timeZone);
    dayData = timeSlotsPerDate(start, end, allTimeSlots, timeZone);
  }
  const todayId = stringifyDateToISO8601(getStartOf(new Date(), 'day', timeZone), timeZone);

  return (
    <section className={css.root} aria-labelledby="listing-availability-title">
      <Heading as="h2" rootClassName={css.title} id="listing-availability-title">
        <FormattedMessage id="SectionAvailability.title" />
      </Heading>
      <p className={css.description}>
        <FormattedMessage id="SectionAvailability.description" />
      </p>

      {fetchErrors && !hasData ? (
        <p className={css.message} role="alert">
          <FormattedMessage id="SectionAvailability.error" />
        </p>
      ) : !hasData ? (
        <p className={css.message} role="status">
          <FormattedMessage id="SectionAvailability.loading" />
        </p>
      ) : (
        <>
          <div className={css.months}>
            {monthIds.map(monthId => (
              <Month
                key={monthId}
                monthId={monthId}
                timeZone={timeZone}
                firstDayOfWeek={firstDayOfWeek}
                dayData={dayData}
                todayId={todayId}
                intl={intl}
              />
            ))}
          </div>
          <ul className={css.legend}>
            <li className={css.legendItem}>
              <span
                className={classNames(css.legendSwatch, css.legendAvailable)}
                aria-hidden="true"
              />
              <FormattedMessage id="SectionAvailability.legendAvailable" />
            </li>
            <li className={css.legendItem}>
              <span className={css.legendUnavailable} aria-hidden="true">
                20
              </span>
              <FormattedMessage id="SectionAvailability.legendUnavailable" />
            </li>
            <li className={css.legendItem}>
              <span className={classNames(css.legendSwatch, css.legendToday)} aria-hidden="true" />
              <FormattedMessage id="SectionAvailability.legendToday" />
            </li>
          </ul>
        </>
      )}
    </section>
  );
};

export default SectionAvailability;
