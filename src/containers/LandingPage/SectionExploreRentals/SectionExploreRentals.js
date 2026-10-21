import React from 'react';

import { useConfiguration } from '../../../context/configurationContext';
import { FormattedMessage } from '../../../util/reactIntl';
import { categorySearchTo } from '../../../util/search';

import { NamedLink } from '../../../components';

import CategoryIcon from '../CategoryIcon/CategoryIcon';
import { categoryVisuals, MAX_CATEGORY_TILES } from '../landingPageConfig';

import css from './SectionExploreRentals.module.css';

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M6 3.5L10.5 8 6 12.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * "Or pick a category" tiles, as in the Main and HomeDesktop mockups. Categories come from
 * Console (Listings → Categories); the section is not rendered when there are none.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @param {Array<Object>?} props.categories overrides the categories from configuration
 * @returns {JSX.Element|null} category section
 */
const SectionExploreRentals = props => {
  const { sectionId } = props;
  const config = useConfiguration();
  // props.categories allows examples and tests to provide categories directly
  const allCategories = props.categories || config.categoryConfiguration?.categories || [];
  const categories = allCategories.slice(0, MAX_CATEGORY_TILES);

  if (categories.length === 0) {
    return null;
  }

  const titleId = `${sectionId}-title`;

  return (
    <section id={sectionId} className={css.root} aria-labelledby={titleId}>
      <div className={css.content}>
        <div className={css.header}>
          <h2 id={titleId} className={css.title}>
            <FormattedMessage id="LandingPage.categories.titleV2" />
          </h2>
          <NamedLink className={css.link} name="SearchPage">
            <FormattedMessage id="LandingPage.categories.seeAll" />
            <ArrowIcon />
          </NamedLink>
        </div>

        <ul className={css.list}>
          {categories.map(category => (
            <li key={category.id} className={css.item}>
              <NamedLink className={css.tile} name="SearchPage" to={categorySearchTo(category.id)}>
                <span className={css.iconWrapper}>
                  <CategoryIcon className={css.icon} name={categoryVisuals[category.id]?.icon} />
                </span>
                <span className={css.name}>{category.name}</span>
              </NamedLink>
            </li>
          ))}
        </ul>

        <NamedLink className={css.buttonMobile} name="SearchPage">
          <FormattedMessage id="LandingPage.categories.seeAll" />
          <ArrowIcon />
        </NamedLink>
      </div>
    </section>
  );
};

export default SectionExploreRentals;
