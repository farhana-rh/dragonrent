import React from 'react';

import { useConfiguration } from '../../../context/configurationContext';
import { FormattedMessage } from '../../../util/reactIntl';
import { categorySearchTo } from '../../../util/search';

import { NamedLink } from '../../../components';

import CategoryIcon from '../CategoryIcon/CategoryIcon';
import SectionHeader from '../SectionHeader/SectionHeader';
import { categoryVisuals, MAX_CATEGORY_TILES } from '../landingPageConfig';

import css from './SectionExploreRentals.module.css';

/**
 * "Browse by category" tiles. Categories come from Console (Listings → Categories); the
 * section is not rendered when the marketplace has no categories.
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
        <SectionHeader
          titleId={titleId}
          title={<FormattedMessage id="LandingPage.categories.title" />}
          linkText={<FormattedMessage id="LandingPage.categories.seeAll" />}
          linkProps={{ name: 'SearchPage' }}
        />
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
      </div>
    </section>
  );
};

export default SectionExploreRentals;
