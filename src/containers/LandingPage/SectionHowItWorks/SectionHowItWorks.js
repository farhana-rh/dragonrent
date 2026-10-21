import React from 'react';

import { FormattedMessage } from '../../../util/reactIntl';

import { howItWorksSteps, trustPoints } from '../landingPageConfig';

import css from './SectionHowItWorks.module.css';

// 24px line icons with a 2px stroke (DESIGN.md: Lucide-style), always next to a word
const TRUST_ICON_PATHS = {
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
  star: 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z',
  shield: 'M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6zM9 12l2 2 4-4',
};

const TrustIcon = props => {
  const { name } = props;
  return (
    <svg
      className={css.trustIcon}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={TRUST_ICON_PATHS[name]}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * "How it works" in three steps, followed by the trust points. On desktop the steps are cards
 * and the trust points a row; on phones the steps are a list and the trust points a
 * "Safe and simple" card. Matches the Main and HomeDesktop mockups.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @returns {JSX.Element} how it works section
 */
const SectionHowItWorks = props => {
  const { sectionId } = props;
  const titleId = `${sectionId}-title`;
  const trustTitleId = `${sectionId}-trust-title`;

  return (
    <section id={sectionId} className={css.root} aria-labelledby={titleId}>
      <div className={css.content}>
        <h2 id={titleId} className={css.title}>
          <FormattedMessage id="LandingPage.howItWorks.titleV2" />
        </h2>

        <ol className={css.steps}>
          {howItWorksSteps.map((step, i) => (
            <li key={step} className={css.step}>
              <span className={css.stepNumber} aria-hidden="true">
                {i + 1}
              </span>
              <div className={css.stepText}>
                <h3 className={css.stepTitle}>
                  <FormattedMessage id={`LandingPage.howItWorks.steps.${step}.title`} />
                </h3>
                <p className={css.stepDescription}>
                  <FormattedMessage id={`LandingPage.howItWorks.steps.${step}.text`} />
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className={css.trust} role="group" aria-labelledby={trustTitleId}>
          <h3 id={trustTitleId} className={css.trustTitle}>
            <FormattedMessage id="LandingPage.trustPoints.title" />
          </h3>
          <ul className={css.trustList}>
            {trustPoints.map(point => (
              <li key={point.id} className={css.trustItem}>
                <TrustIcon name={point.icon} />
                <span>
                  <FormattedMessage id={`LandingPage.trustPoints.${point.id}`} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default SectionHowItWorks;
