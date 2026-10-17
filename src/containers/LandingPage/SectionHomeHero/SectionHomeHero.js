import React from 'react';

import { useConfiguration } from '../../../context/configurationContext';
import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { categorySearchTo } from '../../../util/search';

import { NamedLink } from '../../../components';

import HeroSearchForm from '../HeroSearchForm/HeroSearchForm';
import HomeMedia from '../HomeMedia/HomeMedia';
import { heroImage, popularCategoryIds } from '../landingPageConfig';

import css from './SectionHomeHero.module.css';

/**
 * Pick the categories shown as quick links under the hero search.
 *
 * @param {Array<Object>} categories top-level categories from Console
 * @returns {Array<Object>} categories that exist, in the preferred order
 */
export const getPopularCategories = categories =>
  popularCategoryIds.map(id => categories.find(c => c.id === id)).filter(Boolean);

/**
 * Landing page hero: headline, search and quick links to popular categories.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @param {Array<Object>?} props.categories overrides the categories from configuration
 * @returns {JSX.Element} hero section
 */
const SectionHomeHero = props => {
  const { sectionId } = props;
  const config = useConfiguration();
  const intl = useIntl();
  // props.categories allows examples and tests to provide categories directly
  const categories = props.categories || config.categoryConfiguration?.categories || [];
  const popularCategories = getPopularCategories(categories);
  const titleId = `${sectionId}-title`;

  return (
    <section id={sectionId} className={css.root} aria-labelledby={titleId}>
      <div className={css.content}>
        <div className={css.text}>
          <h1 id={titleId} className={css.title}>
            <FormattedMessage id="LandingPage.hero.title" />
          </h1>
          <p className={css.description}>
            <FormattedMessage id="LandingPage.hero.description" />
          </p>

          <HeroSearchForm className={css.search} />

          {popularCategories.length > 0 ? (
            <nav
              className={css.popular}
              aria-label={intl.formatMessage({ id: 'LandingPage.hero.popularLabel' })}
            >
              <span className={css.popularLabel}>
                <FormattedMessage id="LandingPage.hero.popular" />
              </span>
              <ul className={css.popularList}>
                {popularCategories.map(category => (
                  <li key={category.id}>
                    <NamedLink
                      className={css.popularLink}
                      name="SearchPage"
                      to={categorySearchTo(category.id)}
                    >
                      {category.name}
                    </NamedLink>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>

        <HomeMedia
          className={css.media}
          image={heroImage.image}
          tone={heroImage.tone}
          aspectRatio={null}
          loading="eager"
          alt={intl.formatMessage({ id: 'LandingPage.hero.imageAlt' })}
        />
      </div>
    </section>
  );
};

export default SectionHomeHero;
