import React from 'react';
import classNames from 'classnames';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Form as FinalForm } from 'react-final-form';

import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { categorySearchTo } from '../../util/search';
import { isScrollingDisabled } from '../../ducks/ui.duck';

import { FieldTextInput, LayoutSingleColumn, NamedLink, Page } from '../../components';

import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';
import CategoryIcon from '../LandingPage/CategoryIcon/CategoryIcon';
import { categoryVisuals, STICKER_ACCENTS } from '../LandingPage/landingPageConfig';

import css from './CategoriesPage.module.css';

const ACCENT_CLASSES = {
  coral: css.accentCoral,
  marigold: css.accentMarigold,
  mint: css.accentMint,
  electric: css.accentElectric,
};

/**
 * Categories whose name contains the query, ignoring case and surrounding spaces. Accent
 * colours are picked before filtering, so a tile keeps its colour while you type.
 *
 * @param {Array<Object>} categories top-level categories ({ id, name })
 * @param {string?} query text typed in "Find a category"
 * @returns {Array<Object>} matching categories, each with its `accent`
 */
export const filterCategories = (categories, query) => {
  const withAccents = categories.map((category, i) => ({
    ...category,
    accent: STICKER_ACCENTS[i % STICKER_ACCENTS.length],
  }));
  const needle = (query || '').trim().toLocaleLowerCase();
  return needle
    ? withAccents.filter(c => (c.name || '').toLocaleLowerCase().includes(needle))
    : withAccents;
};

/**
 * Category tiles and the "Find a category" box. The box filters the tiles in the browser.
 *
 * @component
 * @param {Object} props
 * @param {Array<Object>} props.categories top-level categories
 * @returns {JSX.Element} form with the tile grid
 */
const CategoryFinder = props => {
  const { categories } = props;
  const intl = useIntl();

  return (
    <FinalForm
      onSubmit={() => {}}
      render={({ handleSubmit, values }) => {
        const query = values.query || '';
        const shown = filterCategories(categories, query);

        return (
          <form className={css.finder} onSubmit={handleSubmit} role="search">
            <div className={css.findField}>
              <svg
                className={css.findIcon}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
              <FieldTextInput
                id="categories-find"
                name="query"
                type="search"
                autoComplete="off"
                className={css.findInputRoot}
                inputRootClass={css.findInput}
                label={intl.formatMessage({ id: 'CategoriesPage.findLabel' })}
                placeholder={intl.formatMessage({ id: 'CategoriesPage.findPlaceholder' })}
              />
            </div>

            {shown.length > 0 ? (
              <ul className={css.list}>
                {shown.map(category => (
                  <li key={category.id} className={css.item}>
                    <NamedLink
                      className={css.tile}
                      name="SearchPage"
                      to={categorySearchTo(category.id)}
                    >
                      <span
                        className={classNames(css.iconWrapper, ACCENT_CLASSES[category.accent])}
                      >
                        <CategoryIcon
                          className={css.icon}
                          name={categoryVisuals[category.id]?.icon}
                        />
                      </span>
                      <span className={css.name}>{category.name}</span>
                    </NamedLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={css.noMatches} role="status">
                <FormattedMessage id="CategoriesPage.noMatches" values={{ query: query.trim() }} />
              </p>
            )}
          </form>
        );
      }}
    />
  );
};

/**
 * "All categories" page (/categories, user 21 Nov): every top-level category from Console
 * (Listings → Categories) as a sticker tile linking to its search, with a box that filters the
 * tiles. Opened from the "All categories" button on the homepage. No listing counts: those
 * would need one search request per category.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.scrollingDisabled
 * @param {Array<Object>?} props.categories overrides the categories from configuration (tests)
 * @returns {JSX.Element} page
 */
export const CategoriesPageComponent = props => {
  const { scrollingDisabled } = props;
  const config = useConfiguration();
  const intl = useIntl();
  const categories = props.categories || config.categoryConfiguration?.categories || [];
  const marketplaceName = config.marketplaceName;

  const title = intl.formatMessage({ id: 'CategoriesPage.metaTitle' }, { marketplaceName });
  const description = intl.formatMessage(
    { id: 'CategoriesPage.metaDescription' },
    { marketplaceName }
  );

  return (
    <Page title={title} description={description} scrollingDisabled={scrollingDisabled}>
      <LayoutSingleColumn topbar={<TopbarContainer />} footer={<FooterContainer />}>
        <div className={css.root}>
          <div className={css.content}>
            <nav
              className={css.breadcrumbs}
              aria-label={intl.formatMessage({ id: 'CategoriesPage.breadcrumbsLabel' })}
            >
              <NamedLink className={css.breadcrumbLink} name="LandingPage">
                <FormattedMessage id="CategoriesPage.breadcrumbHome" />
              </NamedLink>
              <span className={css.breadcrumbSeparator} aria-hidden="true">
                /
              </span>
              <span aria-current="page">
                <FormattedMessage id="CategoriesPage.heading" />
              </span>
            </nav>

            <div className={css.header}>
              <span className={css.eyebrow}>
                <FormattedMessage id="CategoriesPage.eyebrow" />
              </span>
              <h1 className={css.heading}>
                <FormattedMessage id="CategoriesPage.heading" />
              </h1>
              <p className={css.description}>
                <FormattedMessage id="CategoriesPage.description" />
              </p>
            </div>

            {categories.length > 0 ? (
              <CategoryFinder categories={categories} />
            ) : (
              <p className={css.noMatches}>
                <FormattedMessage id="CategoriesPage.noCategories" />
              </p>
            )}
          </div>
        </div>
      </LayoutSingleColumn>
    </Page>
  );
};

const mapStateToProps = state => ({
  scrollingDisabled: isScrollingDisabled(state),
});

const CategoriesPage = compose(connect(mapStateToProps))(CategoriesPageComponent);

export default CategoriesPage;
