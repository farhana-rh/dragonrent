import React, { useState } from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../../util/reactIntl';
import { richText } from '../../../util/richText';

import { Heading } from '../../../components';

import css from './SectionAboutRental.module.css';

const MIN_LENGTH_FOR_LONG_WORDS = 20;
// Descriptions longer than this are collapsed behind "Show more"
const COLLAPSE_THRESHOLD = 480;

/**
 * Listing description ("About this rental"). Long descriptions are collapsed with a
 * "Show more" toggle; the full text is always in the DOM for search engines.
 *
 * @component
 * @param {Object} props
 * @param {string} props.text listing description
 * @returns {JSX.Element|null} description section
 */
const SectionAboutRental = props => {
  const { text } = props;
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) {
    return null;
  }

  const isCollapsible = text.length > COLLAPSE_THRESHOLD;
  const content = richText(text, {
    linkify: true,
    longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS,
    longWordClass: css.longWord,
    breakChars: '/',
  });

  return (
    <section className={css.root} aria-labelledby="listing-about-title">
      <Heading as="h2" rootClassName={css.title} id="listing-about-title">
        <FormattedMessage id="ListingPage.aboutItemTitle" />
      </Heading>
      <p
        id="listing-description"
        className={classNames(css.text, { [css.collapsed]: isCollapsible && !isExpanded })}
      >
        {content}
      </p>
      {isCollapsible ? (
        <button
          type="button"
          className={css.toggle}
          aria-expanded={isExpanded}
          aria-controls="listing-description"
          onClick={() => setIsExpanded(expanded => !expanded)}
        >
          <FormattedMessage id={isExpanded ? 'ListingPage.showLess' : 'ListingPage.showMore'} />
        </button>
      ) : null}
    </section>
  );
};

export default SectionAboutRental;
