import React from 'react';

import { FormattedMessage, useIntl } from '../../../../util/reactIntl';

import { NamedLink } from '../../../../components';

import css from './StepFrame.module.css';

const IconClose = () => (
  <svg
    className={css.icon}
    width="22"
    height="22"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

/**
 * Header of a lend-an-item step: "Close", "Step 3 of 5 · Prices" and a progress bar.
 *
 * @component
 * @param {Object} props
 * @param {number} props.step - Current step, starting from 1
 * @param {number} props.total - Number of steps
 * @param {string} props.label - Name of the current step
 * @returns {JSX.Element}
 */
export const StepHeader = props => {
  const { step, total, label } = props;
  const intl = useIntl();
  const progressLabel = intl.formatMessage(
    { id: 'EditListingWizard.stepProgress' },
    { step, total }
  );

  return (
    <div className={css.header}>
      <div className={css.headerRow}>
        {/* The draft is saved after each step, so closing keeps it in "Your items" */}
        <NamedLink name="ManageListingsPage" className={css.close}>
          <IconClose />
          <FormattedMessage id="EditListingWizard.close" />
        </NamedLink>
        <p className={css.stepCount}>
          <FormattedMessage id="EditListingWizard.stepCount" values={{ step, total, label }} />
        </p>
      </div>
      <div
        className={css.progress}
        role="progressbar"
        aria-label={progressLabel}
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={total}
      >
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={i < step ? css.progressStepDone : css.progressStep} />
        ))}
      </div>
    </div>
  );
};

/**
 * Bottom bar of a lend-an-item step. Holds Back; the step form's own submit button (Next or
 * Publish) is placed next to it with the `stepSubmit` class.
 *
 * @component
 * @param {Object} props
 * @param {Object} [props.backLinkProps] - NamedLink props for the previous step; none on step 1
 * @returns {JSX.Element}
 */
export const StepBar = props => {
  const { backLinkProps } = props;
  return (
    <>
      <div className={css.bar} aria-hidden="true" />
      {backLinkProps ? (
        <NamedLink className={css.back} {...backLinkProps}>
          <FormattedMessage id="EditListingWizard.back" />
        </NamedLink>
      ) : null}
    </>
  );
};

/**
 * One-line intro under a lend-an-item step heading, e.g. "Clear photos get more requests."
 *
 * @component
 * @param {Object} props
 * @param {string} props.id - Translation key
 * @returns {JSX.Element}
 */
export const StepIntro = props => (
  <p className={css.stepIntro}>
    <FormattedMessage id={props.id} />
  </p>
);

export { css as stepFrameCss };
