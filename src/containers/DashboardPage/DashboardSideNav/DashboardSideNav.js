import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import { useRouteConfiguration } from '../../../context/routeConfigurationContext';
import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { pathByRouteName } from '../../../util/routes';

import { NamedLink, NotificationBadge } from '../../../components';

import css from './DashboardSideNav.module.css';

const LinkContent = props => {
  const { id, badge } = props;
  return (
    <>
      <span className={css.linkLabel}>
        <FormattedMessage id={`DashboardPage.nav.${id}`} />
      </span>
      {badge > 0 ? (
        <>
          <span aria-hidden="true">
            <NotificationBadge className={css.badge} count={badge} />
          </span>
          <span className={css.visuallyHidden}>
            <FormattedMessage id="DashboardPage.nav.badgeLabel" values={{ count: badge }} />
          </span>
        </>
      ) : null}
    </>
  );
};

/**
 * Navigation between the dashboard and the existing account pages. A sidebar on desktop,
 * a horizontally scrolling row of links on mobile.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to component's own css.root
 * @param {number} props.requestCount booking requests waiting for a reply (shown as a badge)
 * @param {boolean} props.showListingsLink whether the user can post listings
 * @returns {JSX.Element} navigation
 */
const DashboardSideNav = props => {
  const { className, requestCount = 0, showListingsLink = true } = props;
  const intl = useIntl();
  const routeConfiguration = useRouteConfiguration();

  const items = [
    { id: 'overview', linkProps: { name: 'DashboardPage' }, isCurrent: true },
    {
      id: 'bookingRequests',
      linkProps: { name: 'InboxPage', params: { tab: 'sales' } },
      badge: requestCount,
    },
    { id: 'myRentals', linkProps: { name: 'InboxPage', params: { tab: 'orders' } } },
    ...(showListingsLink ? [{ id: 'myListings', linkProps: { name: 'ManageListingsPage' } }] : []),
    { id: 'payouts', linkProps: { name: 'StripePayoutPage' } },
    { id: 'settings', linkProps: { name: 'AccountSettingsPage' } },
  ];

  return (
    <nav
      className={classNames(css.root, className)}
      aria-label={intl.formatMessage({ id: 'DashboardPage.nav.label' })}
    >
      <ul className={css.list}>
        {items.map(item => (
          <li key={item.id} className={css.item}>
            {item.isCurrent ? (
              // NamedLink doesn't pass aria-current through, so the current page uses Link
              <Link
                className={classNames(css.link, css.linkCurrent)}
                to={pathByRouteName(item.linkProps.name, routeConfiguration, item.linkProps.params)}
                aria-current="page"
              >
                <LinkContent id={item.id} badge={item.badge} />
              </Link>
            ) : (
              <NamedLink className={css.link} {...item.linkProps}>
                <LinkContent id={item.id} badge={item.badge} />
              </NamedLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default DashboardSideNav;
