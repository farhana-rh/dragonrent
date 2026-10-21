import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../../../../util/reactIntl';
import { NamedLink } from '../../../../../components';

import css from './PrimaryNav.module.css';

// Console pages (Content → Pages) the top bar links to
export const HOW_IT_WORKS_PAGE_ID = 'how-it-works';
export const HELP_PAGE_ID = 'faq';

const NAV_LINKS = [
  { id: 'howItWorks', pageId: HOW_IT_WORKS_PAGE_ID, messageId: 'TopbarDesktop.howItWorks' },
  { id: 'help', pageId: HELP_PAGE_ID, messageId: 'TopbarDesktop.help' },
];

/**
 * Primary navigation next to the logo on the desktop homepage: "How it works" and "Help"
 * (HomeDesktop mockup). Both link to Console pages.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.currentPage
 * @returns {JSX.Element} list of primary navigation links
 */
const PrimaryNav = props => {
  const { currentPage } = props;

  return (
    <ul className={css.root}>
      {NAV_LINKS.map(link => {
        const isCurrent = currentPage === `CMSPage:${link.pageId}`;
        return (
          <li key={link.id} className={css.navItem}>
            <NamedLink
              name="CMSPage"
              params={{ pageId: link.pageId }}
              className={classNames(css.navLink, { [css.active]: isCurrent })}
            >
              <FormattedMessage id={link.messageId} />
            </NamedLink>
          </li>
        );
      })}
    </ul>
  );
};

export default PrimaryNav;
