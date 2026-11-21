import React from 'react';

import { useConfiguration } from '../../../context/configurationContext';
import { FormattedMessage } from '../../../util/reactIntl';

import { NamedLink } from '../../../components';

import css from './SectionAllCategories.module.css';

const GridIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M5 12h14M13 6l6 6-6 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * "All categories" button under the listings carousel (user, 21 Nov). It opens the
 * CategoriesPage (/categories), which lists every Console category. Not rendered when Console
 * has no categories.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @param {Array<Object>?} props.categories overrides the categories from configuration (tests)
 * @returns {JSX.Element|null} section with one button
 */
const SectionAllCategories = props => {
  const { sectionId } = props;
  const config = useConfiguration();
  const categories = props.categories || config.categoryConfiguration?.categories || [];

  if (categories.length === 0) {
    return null;
  }

  return (
    <section id={sectionId} className={css.root}>
      <div className={css.content}>
        <NamedLink className={css.button} name="CategoriesPage">
          <GridIcon />
          <FormattedMessage id="LandingPage.allCategories.button" />
          <ArrowIcon />
        </NamedLink>
      </div>
    </section>
  );
};

export default SectionAllCategories;
