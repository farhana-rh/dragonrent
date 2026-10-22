import React from 'react';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { categorySearchTo } from '../../../util/search';

import { NamedLink } from '../../../components';

import css from './ListingBreadcrumbs.module.css';

const subcategorySearchTo = (categoryId, subcategoryId) => ({
  search: `${categorySearchTo(categoryId).search}&pub_categoryLevel2=${encodeURIComponent(
    subcategoryId
  )}`,
});

/**
 * Breadcrumb trail: Home › Category › Subcategory (ListingDesktop mockup). Without categories,
 * the listing title is the last item.
 *
 * @component
 * @param {Object} props
 * @param {string} props.title plain listing title
 * @param {Object?} props.category top-level category config of the listing ({ id, name })
 * @param {Object?} props.subcategory second-level category config of the listing ({ id, name })
 * @returns {JSX.Element} breadcrumb bar
 */
const ListingBreadcrumbs = props => {
  const { title, category, subcategory } = props;
  const intl = useIntl();

  return (
    <nav
      className={css.root}
      aria-label={intl.formatMessage({ id: 'ListingPage.breadcrumbsLabel' })}
    >
      <ol className={css.list}>
        <li className={css.item}>
          <NamedLink name="LandingPage" className={css.link}>
            <FormattedMessage id="ListingPage.breadcrumbHome" />
          </NamedLink>
        </li>
        {category ? (
          <li className={css.item}>
            <NamedLink name="SearchPage" to={categorySearchTo(category.id)} className={css.link}>
              {category.name}
            </NamedLink>
          </li>
        ) : null}
        {category && subcategory ? (
          <li className={css.item}>
            <NamedLink
              name="SearchPage"
              to={subcategorySearchTo(category.id, subcategory.id)}
              className={css.lastLink}
            >
              {subcategory.name}
            </NamedLink>
          </li>
        ) : (
          <li className={css.item}>
            <span className={css.current} aria-current="page">
              {title}
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
};

export default ListingBreadcrumbs;
