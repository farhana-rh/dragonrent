import React, { useState } from 'react';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { categorySearchTo } from '../../../util/search';

import { NamedLink } from '../../../components';

import css from './ListingBreadcrumbs.module.css';

const IconShare = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M8 10V2M5 5l3-3 3 3M3 9v4.5h10V9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Share the current page with the Web Share API, or copy the link to the clipboard.
 */
const ShareButton = props => {
  const { title } = props;
  const intl = useIntl();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => null);
    } else if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 3000);
        })
        .catch(() => null);
    }
  };

  return (
    <>
      <button type="button" className={css.shareButton} onClick={handleShare}>
        <IconShare />
        <span>
          <FormattedMessage id="ListingPage.share" />
        </span>
      </button>
      <span className={css.shareStatus} role="status" aria-live="polite">
        {copied ? intl.formatMessage({ id: 'ListingPage.linkCopied' }) : ''}
      </span>
    </>
  );
};

/**
 * Breadcrumb trail (Home › Category › Listing) and a share action.
 *
 * @component
 * @param {Object} props
 * @param {string} props.title plain listing title
 * @param {Object?} props.category top-level category config of the listing ({ id, name })
 * @returns {JSX.Element} breadcrumb bar
 */
const ListingBreadcrumbs = props => {
  const { title, category } = props;
  const intl = useIntl();

  return (
    <div className={css.root}>
      <nav aria-label={intl.formatMessage({ id: 'ListingPage.breadcrumbsLabel' })}>
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
          <li className={css.item}>
            <span className={css.current} aria-current="page">
              {title}
            </span>
          </li>
        </ol>
      </nav>
      <div className={css.actions}>
        <ShareButton title={title} />
      </div>
    </div>
  );
};

export default ListingBreadcrumbs;
