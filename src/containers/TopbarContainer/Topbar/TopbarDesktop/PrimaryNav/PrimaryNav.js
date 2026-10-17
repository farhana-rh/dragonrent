import React, { useState } from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../../../../util/reactIntl';
import { categorySearchTo } from '../../../../../util/search';
import {
  IconArrowHead,
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
  NamedLink,
} from '../../../../../components';

import css from './PrimaryNav.module.css';

const SEARCH_PAGES = ['SearchPage', 'SearchPageWithListingType'];
export const HOW_IT_WORKS_PAGE_ID = 'how-it-works';

const CategoriesMenu = ({ categories, intl }) => {
  // Category links are rendered only while the menu is open, so the (hidden) dropdown
  // doesn't duplicate category names in the page content.
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Menu
      className={css.menu}
      skipFocusOnNavigation={true}
      isOpen={isOpen}
      onToggleActive={setIsOpen}
    >
      <MenuLabel
        id="categories-menu-label"
        className={css.navLink}
        isOpenClassName={css.navLinkOpen}
        ariaLabel={intl.formatMessage({ id: 'TopbarDesktop.screenreader.categoriesMenu' })}
      >
        <span className={css.navLinkLabel}>
          <FormattedMessage id="TopbarDesktop.categories" />
          <IconArrowHead direction="down" size="small" rootClassName={css.arrowIcon} />
        </span>
      </MenuLabel>
      <MenuContent className={css.menuContent}>
        {isOpen
          ? [
              ...categories.map(category => (
                <MenuItem key={category.id}>
                  <NamedLink
                    className={css.menuLink}
                    name="SearchPage"
                    to={categorySearchTo(category.id)}
                  >
                    {category.name}
                  </NamedLink>
                </MenuItem>
              )),
              <MenuItem key="all-categories">
                <NamedLink className={classNames(css.menuLink, css.menuLinkAll)} name="SearchPage">
                  <FormattedMessage id="TopbarDesktop.allCategories" />
                </NamedLink>
              </MenuItem>,
            ]
          : []}
      </MenuContent>
    </Menu>
  );
};

/**
 * Primary navigation shown next to the logo on desktop: Browse, Categories, How it works.
 * Categories come from the hosted listing-categories asset; the dropdown is omitted when
 * the marketplace has no categories configured.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.currentPage
 * @param {Array<Object>} props.categories top-level category configs ({ id, name })
 * @param {Object} props.intl
 * @returns {JSX.Element} list of primary navigation links
 */
const PrimaryNav = props => {
  const { currentPage, categories = [], intl } = props;
  const isSearchPage = SEARCH_PAGES.includes(currentPage);
  const isHowItWorksPage = currentPage === `CMSPage:${HOW_IT_WORKS_PAGE_ID}`;

  return (
    <ul className={css.root}>
      <li className={css.navItem}>
        <NamedLink
          name="SearchPage"
          className={classNames(css.navLink, { [css.active]: isSearchPage })}
        >
          <span className={css.navLinkLabel}>
            <FormattedMessage id="TopbarDesktop.browse" />
          </span>
        </NamedLink>
      </li>
      {categories.length > 0 ? (
        <li className={css.navItem}>
          <CategoriesMenu categories={categories} intl={intl} />
        </li>
      ) : null}
      <li className={css.navItem}>
        <NamedLink
          name="CMSPage"
          params={{ pageId: HOW_IT_WORKS_PAGE_ID }}
          className={classNames(css.navLink, { [css.active]: isHowItWorksPage })}
        >
          <span className={css.navLinkLabel}>
            <FormattedMessage id="TopbarDesktop.howItWorks" />
          </span>
        </NamedLink>
      </li>
    </ul>
  );
};

export default PrimaryNav;
