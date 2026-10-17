import React from 'react';

import { useConfiguration } from '../../../context/configurationContext';
import { FormattedMessage } from '../../../util/reactIntl';
import { categorySearchTo } from '../../../util/search';

import HomeTile from '../HomeTile/HomeTile';
import SectionHeader from '../SectionHeader/SectionHeader';
import { useCases } from '../landingPageConfig';

import css from './SectionUseCases.module.css';

/**
 * Pick the use cases whose primary category exists in the marketplace.
 *
 * @param {Array<Object>} categories top-level categories from Console
 * @returns {Array<Object>} use case configs that can be linked
 */
export const getAvailableUseCases = categories =>
  useCases.filter(useCase => categories.some(c => c.id === useCase.categoryId));

/**
 * "Browse by use case" tiles. Each tile links to its primary category.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @param {Array<Object>?} props.categories overrides the categories from configuration
 * @returns {JSX.Element|null} use case section
 */
const SectionUseCases = props => {
  const { sectionId } = props;
  const config = useConfiguration();
  // props.categories allows examples and tests to provide categories directly
  const categories = props.categories || config.categoryConfiguration?.categories || [];
  const available = getAvailableUseCases(categories);

  if (available.length === 0) {
    return null;
  }

  const titleId = `${sectionId}-title`;

  return (
    <section id={sectionId} className={css.root} aria-labelledby={titleId}>
      <div className={css.content}>
        <SectionHeader
          titleId={titleId}
          title={<FormattedMessage id="LandingPage.useCases.title" />}
        />
        <ul className={css.list}>
          {available.map(useCase => (
            <li key={useCase.id}>
              <HomeTile
                size="large"
                aspectRatio="wide"
                title={<FormattedMessage id={`LandingPage.useCases.${useCase.id}.title`} />}
                subtitle={<FormattedMessage id={`LandingPage.useCases.${useCase.id}.subtitle`} />}
                linkProps={{ name: 'SearchPage', to: categorySearchTo(useCase.categoryId) }}
                visual={useCase}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default SectionUseCases;
