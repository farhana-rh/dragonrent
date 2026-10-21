import React from 'react';

import { FormattedMessage } from '../../../util/reactIntl';

import { NamedLink } from '../../../components';

import { trustItems, trustPageId } from '../landingPageConfig';

import css from './SectionRentWithConfidence.module.css';

// Simple 16px line icons. Decorative: the item title carries the meaning.
const ICON_PATHS = {
  pricing: 'M3 5h10M3 8h10M3 11h6',
  calendar: 'M3 4.5h10v9H3zM3 7.5h10M5.5 2.5v3M10.5 2.5v3',
  star: 'M8 2.5l1.7 3.5 3.8.5-2.8 2.6.7 3.8L8 11.1l-3.4 1.8.7-3.8-2.8-2.6 3.8-.5z',
  profile:
    'M8 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3.5 13.5c.6-2.3 2.4-3.5 4.5-3.5s3.9 1.2 4.5 3.5',
  lock: 'M4 7.5h8v6H4zM5.5 7.5V5.5a2.5 2.5 0 0 1 5 0v2',
  message: 'M2.5 3.5h11v7.5H7l-3 2.5v-2.5H2.5z',
};

const TrustIcon = ({ name }) => (
  <span className={css.iconWrapper} aria-hidden="true">
    <svg className={css.icon} width="16" height="16" viewBox="0 0 16 16" focusable="false">
      <path
        d={ICON_PATHS[name]}
        fill={name === 'star' ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

/**
 * Trust section: an introduction with an optional link to the trust page, and a grid of
 * trust items. Only items enabled in landingPageConfig.js are shown, so the section never
 * promises a feature that is not live yet.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @returns {JSX.Element|null} trust section
 */
const SectionRentWithConfidence = props => {
  const { sectionId } = props;
  const items = trustItems.filter(item => item.enabled);

  if (items.length === 0) {
    return null;
  }

  const titleId = `${sectionId}-title`;

  return (
    <section id={sectionId} className={css.root} aria-labelledby={titleId}>
      <div className={css.content}>
        <div className={css.intro}>
          <p className={css.eyebrow}>
            <FormattedMessage id="LandingPage.trust.eyebrow" />
          </p>
          <h2 id={titleId} className={css.title}>
            <FormattedMessage id="LandingPage.trust.titleNew" />
          </h2>
          <p className={css.description}>
            <FormattedMessage id="LandingPage.trust.description" />
          </p>
          {trustPageId ? (
            <NamedLink className={css.link} name="CMSPage" params={{ pageId: trustPageId }}>
              <FormattedMessage id="LandingPage.trust.learnMore" />
            </NamedLink>
          ) : null}
        </div>

        <ul className={css.list}>
          {items.map(item => (
            <li key={item.id} className={css.item}>
              <TrustIcon name={item.icon} />
              <div className={css.itemText}>
                <h3 className={css.itemTitle}>
                  <FormattedMessage id={`LandingPage.trust.${item.id}.title`} />
                </h3>
                <p className={css.itemDescription}>
                  <FormattedMessage id={`LandingPage.trust.${item.id}.text`} />
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default SectionRentWithConfidence;
