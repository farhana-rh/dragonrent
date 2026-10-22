import React from 'react';

import { FormattedMessage } from '../../../util/reactIntl';

import css from './SectionWhatYouGet.module.css';

// Console listing field (text) that lists what comes with the item
export const INCLUDED_ACCESSORIES_KEY = 'includedAccessories';

/**
 * Splits the owner's "Included accessories" text into list items. Owners write the items
 * separated by commas, semicolons or line breaks.
 *
 * @param {string} text field value
 * @returns {Array<string>} items
 */
export const splitIncludedItems = text =>
  typeof text === 'string'
    ? text
        .split(/[\n,;]+/)
        .map(item => item.trim())
        .filter(item => item.length > 0)
    : [];

const IconCheck = () => (
  <svg className={css.check} width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/**
 * "What you get" check list, from the listing's Included accessories field (Console listing
 * field `includedAccessories`). Hidden when the owner left the field empty.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.publicData listing's public data
 * @returns {JSX.Element|null} what you get section
 */
const SectionWhatYouGet = props => {
  const { publicData } = props;
  const items = splitIncludedItems(publicData?.[INCLUDED_ACCESSORIES_KEY]);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={css.root} aria-labelledby="listing-what-you-get-title">
      <h2 className={css.title} id="listing-what-you-get-title">
        <FormattedMessage id="ListingPage.whatYouGetTitle" />
      </h2>
      <ul className={css.list}>
        {items.map((item, i) => (
          <li key={`${i}-${item}`} className={css.item}>
            <IconCheck />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SectionWhatYouGet;
