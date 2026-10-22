import React, { useState } from 'react';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';

import css from './SectionListingHeading.module.css';

const IconShare = () => (
  <svg className={css.icon} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="m16 6-4-4-4 4" />
    <path d="M12 2v13" />
  </svg>
);

/**
 * Share the current page with the Web Share API, or copy the link to the clipboard.
 *
 * @component
 * @param {Object} props
 * @param {string} props.title plain listing title
 * @returns {JSX.Element} share button with a status message for screen readers
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
    <div className={css.share}>
      <button type="button" className={css.shareButton} onClick={handleShare}>
        <IconShare />
        <FormattedMessage id="ListingPage.share" />
      </button>
      <span className={css.shareStatus} role="status" aria-live="polite">
        {copied ? intl.formatMessage({ id: 'ListingPage.linkCopied' }) : ''}
      </span>
    </div>
  );
};

export default ShareButton;
