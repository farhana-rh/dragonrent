import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../../../../util/reactIntl';
import { NamedLink } from '../../../../../components';

import css from './PrimaryNav.module.css';

// Console pages (Content → Pages) the top bar links to
export const HOW_IT_WORKS_PAGE_ID = 'how-it-works';
export const HELP_PAGE_ID = 'faq';

// Section on the homepage with "What if something breaks?" (LandingPage TRUST_SECTION_ID).
// PrimaryNav only shows on the homepage, so a plain in-page anchor is enough.
export const TRUST_ANCHOR = '#trust-and-safety';

/**
 * Primary navigation next to the logo on the desktop homepage (sticker design, HomeSticker.html):
 * "Explore" (search), "How it works" (Console page) and "Trust & Safety" (homepage section).
 * "Help" stays in the footer and the mobile menu.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.currentPage
 * @returns {JSX.Element} list of primary navigation links
 */
const PrimaryNav = props => {
  const { currentPage } = props;
  const isHowItWorks = currentPage === `CMSPage:${HOW_IT_WORKS_PAGE_ID}`;

  return (
    <ul className={css.root}>
      <li className={css.navItem}>
        <NamedLink name="SearchPage" className={css.navLink}>
          <FormattedMessage id="TopbarDesktop.explore" />
        </NamedLink>
      </li>
      <li className={css.navItem}>
        <NamedLink
          name="CMSPage"
          params={{ pageId: HOW_IT_WORKS_PAGE_ID }}
          className={classNames(css.navLink, { [css.active]: isHowItWorks })}
        >
          <FormattedMessage id="TopbarDesktop.howItWorks" />
        </NamedLink>
      </li>
      <li className={css.navItem}>
        <a href={TRUST_ANCHOR} className={css.navLink}>
          <FormattedMessage id="TopbarDesktop.trustAndSafety" />
        </a>
      </li>
    </ul>
  );
};

export default PrimaryNav;
