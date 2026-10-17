/**
 *  TopbarMobileMenu prints the menu content for authenticated user or
 * shows login actions for those who are not authenticated.
 */
import React from 'react';
import classNames from 'classnames';

import { ACCOUNT_SETTINGS_PAGES } from '../../../../routing/routeConfiguration';
import { FormattedMessage } from '../../../../util/reactIntl';
import { ensureCurrentUser } from '../../../../util/data';

import {
  AvatarLarge,
  ExternalLink,
  InlineTextButton,
  NamedLink,
  NotificationBadge,
} from '../../../../components';

import { categorySearchTo } from '../../../../util/search';
import { HOW_IT_WORKS_PAGE_ID } from '../TopbarDesktop/PrimaryNav/PrimaryNav';

import css from './TopbarMobileMenu.module.css';

const SEARCH_PAGES = ['SearchPage', 'SearchPageWithListingType'];

/**
 * Marketplace-wide navigation: Browse, How it works and the top-level categories.
 * These mirror the PrimaryNav on the desktop topbar.
 */
const PrimaryLinks = ({ currentPage, categories }) => {
  const isSearchPage = SEARCH_PAGES.includes(currentPage);
  const isHowItWorksPage = currentPage === `CMSPage:${HOW_IT_WORKS_PAGE_ID}`;

  return (
    <>
      <ul className={css.primaryLinksWrapper}>
        <li className={classNames(css.navigationLink, { [css.currentPage]: isSearchPage })}>
          <NamedLink name="SearchPage">
            <FormattedMessage id="TopbarMobileMenu.browseLink" />
          </NamedLink>
        </li>
        <li className={classNames(css.navigationLink, { [css.currentPage]: isHowItWorksPage })}>
          <NamedLink name="CMSPage" params={{ pageId: HOW_IT_WORKS_PAGE_ID }}>
            <FormattedMessage id="TopbarMobileMenu.howItWorksLink" />
          </NamedLink>
        </li>
      </ul>
      {categories.length > 0 ? (
        <div className={css.categoriesSection}>
          <h2 className={css.sectionHeading}>
            <FormattedMessage id="TopbarMobileMenu.categoriesHeading" />
          </h2>
          <ul className={css.categoryLinksWrapper}>
            {categories.map(category => (
              <li key={category.id} className={css.categoryLink}>
                <NamedLink name="SearchPage" to={categorySearchTo(category.id)}>
                  {category.name}
                </NamedLink>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
};

const CustomLinkComponent = ({ linkConfig, currentPage }) => {
  const { group, text, type, href, route } = linkConfig;
  const getCurrentPageClass = page => {
    const hasPageName = name => currentPage?.indexOf(name) === 0;
    const isCMSPage = pageId => hasPageName('CMSPage') && currentPage === `${page}:${pageId}`;
    const isInboxPage = tab => hasPageName('InboxPage') && currentPage === `${page}:${tab}`;
    const isCurrentPage = currentPage === page;

    return isCMSPage(route?.params?.pageId) || isInboxPage(route?.params?.tab) || isCurrentPage
      ? css.currentPage
      : null;
  };

  // Note: if the config contains 'route' keyword,
  // then in-app linking config has been resolved already.
  if (type === 'internal' && route) {
    // Internal link
    const { name, params, to } = route || {};
    const className = classNames(css.navigationLink, getCurrentPageClass(name));
    return (
      <li className={className}>
        <NamedLink name={name} params={params} to={to}>
          <span className={css.menuItemBorder} />
          {text}
        </NamedLink>
      </li>
    );
  }
  return (
    <li className={css.navigationLink}>
      <ExternalLink href={href}>
        <span className={css.menuItemBorder} />
        {text}
      </ExternalLink>
    </li>
  );
};

/**
 * Menu for mobile layout (opens through hamburger icon)
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isAuthenticated
 * @param {string?} props.currentPage
 * @param {boolean} props.currentUserHasListings
 * @param {Object?} props.currentUser API entity
 * @param {number} props.notificationCount
 * @param {Array<Object>} props.customLinks Contains object like { group, text, type, href, route }
 * @param {Function} props.onLogout
 * @returns {JSX.Element} search icon
 */
const TopbarMobileMenu = props => {
  const {
    isAuthenticated,
    currentPage,
    inboxTab,
    currentUser,
    notificationCount = 0,
    customLinks,
    categories = [],
    onLogout,
    showCreateListingsLink,
  } = props;

  const user = ensureCurrentUser(currentUser);

  const extraLinks = customLinks.map((linkConfig, index) => {
    return (
      <CustomLinkComponent
        key={`${linkConfig.text}_${index}`}
        linkConfig={linkConfig}
        currentPage={currentPage}
      />
    );
  });

  const createListingsLinkMaybe = showCreateListingsLink ? (
    <NamedLink className={css.createNewListingLink} name="NewListingPage">
      <FormattedMessage id="TopbarMobileMenu.listAnItemLink" />
    </NamedLink>
  ) : null;

  if (!isAuthenticated) {
    const signup = (
      <NamedLink name="SignupPage" className={css.signupLink}>
        <FormattedMessage id="TopbarMobileMenu.signupLink" />
      </NamedLink>
    );

    const login = (
      <NamedLink name="LoginPage" className={css.loginLink}>
        <FormattedMessage id="TopbarMobileMenu.loginLink" />
      </NamedLink>
    );

    const signupOrLogin = (
      <span className={css.authenticationLinks}>
        <FormattedMessage
          id="TopbarMobileMenu.signupOrLogin"
          values={{ lineBreak: <br />, signup, login }}
        />
      </span>
    );
    return (
      <nav className={css.root}>
        <div className={css.content}>
          <div className={css.authenticationGreeting}>
            <FormattedMessage
              id="TopbarMobileMenu.unauthorizedGreeting"
              values={{ lineBreak: <br />, signupOrLogin }}
            />
          </div>

          <PrimaryLinks currentPage={currentPage} categories={categories} />
          <ul className={css.customLinksWrapper}>{extraLinks}</ul>

          <div className={css.spacer} />
        </div>
        <div className={css.footer}>{createListingsLinkMaybe}</div>
      </nav>
    );
  }

  const notificationCountBadge =
    notificationCount > 0 ? (
      <NotificationBadge className={css.notificationBadge} count={notificationCount} />
    ) : null;

  const displayName = user.attributes.profile.firstName;
  const currentPageClass = page => {
    const isAccountSettingsPage =
      page === 'AccountSettingsPage' && ACCOUNT_SETTINGS_PAGES.includes(currentPage);
    const isInboxPage = currentPage?.indexOf('InboxPage') === 0 && page?.indexOf('InboxPage') === 0;
    return currentPage === page || isAccountSettingsPage || isInboxPage ? css.currentPage : null;
  };

  const manageListingsLinkMaybe = showCreateListingsLink ? (
    <li className={classNames(css.navigationLink, currentPageClass('ManageListingsPage'))}>
      <NamedLink name="ManageListingsPage">
        <FormattedMessage id="TopbarMobileMenu.yourListingsLink" />
      </NamedLink>
    </li>
  ) : null;

  return (
    <div className={css.root}>
      <AvatarLarge className={css.avatar} user={currentUser} />
      <div className={css.content}>
        <span className={css.greeting}>
          <FormattedMessage id="TopbarMobileMenu.greeting" values={{ displayName }} />
        </span>
        <InlineTextButton rootClassName={css.logoutButton} onClick={onLogout}>
          <FormattedMessage id="TopbarMobileMenu.logoutLink" />
        </InlineTextButton>

        <ul className={css.accountLinksWrapper}>
          <li className={classNames(css.inbox, currentPageClass(`InboxPage:${inboxTab}`))}>
            <NamedLink name="InboxPage" params={{ tab: inboxTab }}>
              <FormattedMessage id="TopbarMobileMenu.inboxLink" />
              {notificationCountBadge}
            </NamedLink>
          </li>
          {manageListingsLinkMaybe}
          <li className={classNames(css.navigationLink, currentPageClass('ProfileSettingsPage'))}>
            <NamedLink name="ProfileSettingsPage">
              <FormattedMessage id="TopbarMobileMenu.profileSettingsLink" />
            </NamedLink>
          </li>
          <li className={classNames(css.navigationLink, currentPageClass('AccountSettingsPage'))}>
            <NamedLink name="AccountSettingsPage">
              <FormattedMessage id="TopbarMobileMenu.accountSettingsLink" />
            </NamedLink>
          </li>
        </ul>
        <PrimaryLinks currentPage={currentPage} categories={categories} />
        <ul className={css.customLinksWrapper}>{extraLinks}</ul>
        <div className={css.spacer} />
      </div>
      <div className={css.footer}>{createListingsLinkMaybe}</div>
    </div>
  );
};

export default TopbarMobileMenu;
