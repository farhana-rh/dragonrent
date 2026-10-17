import React from 'react';

import { FormattedMessage } from '../../../util/reactIntl';

import SectionHeader from '../SectionHeader/SectionHeader';
import { howItWorksSteps } from '../landingPageConfig';

import css from './SectionHowItWorks.module.css';

const ArrowIcon = () => (
  <svg
    className={css.arrow}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M3 8h10M9 4l4 4-4 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Three-step explanation of renting on DragonRent.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @returns {JSX.Element} how it works section
 */
const SectionHowItWorks = props => {
  const { sectionId } = props;
  const titleId = `${sectionId}-title`;

  return (
    <section id={sectionId} className={css.root} aria-labelledby={titleId}>
      <div className={css.content}>
        <SectionHeader
          titleId={titleId}
          title={<FormattedMessage id="LandingPage.howItWorks.title" />}
        />
        <ol className={css.steps}>
          {howItWorksSteps.map((step, i) => (
            <li key={step} className={css.step}>
              <div className={css.stepNumberRow}>
                <span className={css.stepNumber} aria-hidden="true">
                  {i + 1}
                </span>
                {i < howItWorksSteps.length - 1 ? <ArrowIcon /> : null}
              </div>
              <div className={css.stepText}>
                <h3 className={css.stepTitle}>
                  <FormattedMessage id={`LandingPage.howItWorks.${step}.title`} />
                </h3>
                <p className={css.stepDescription}>
                  <FormattedMessage id={`LandingPage.howItWorks.${step}.text`} />
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default SectionHowItWorks;
