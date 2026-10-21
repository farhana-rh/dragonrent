import React from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';

import css from './CheckoutSteps.module.css';

const STEPS = ['dates', 'payment', 'requestSent'];

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
    <path
      d="M2.5 6.2l2.3 2.3 4.7-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Progress indicator for the booking checkout: dates are chosen on the listing page,
 * payment happens here, and the request is sent after payment.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to component's own css.root
 * @param {('dates'|'payment'|'requestSent')} props.currentStep
 * @returns {JSX.Element} step indicator
 */
const CheckoutSteps = props => {
  const { className, currentStep = 'payment' } = props;
  const intl = useIntl();
  const currentIndex = STEPS.indexOf(currentStep);

  return (
    <ol
      className={classNames(css.root, className)}
      aria-label={intl.formatMessage({ id: 'CheckoutPage.steps.label' })}
    >
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <li
            key={step}
            className={classNames(css.step, {
              [css.stepDone]: isDone,
              [css.stepCurrent]: isCurrent,
            })}
            aria-current={isCurrent ? 'step' : undefined}
          >
            <span className={css.marker} aria-hidden="true">
              {isDone ? <CheckIcon /> : i + 1}
            </span>
            <span className={css.label}>
              <FormattedMessage id={`CheckoutPage.steps.${step}`} />
              {isDone ? (
                <span className={css.visuallyHidden}>
                  <FormattedMessage id="CheckoutPage.steps.completed" />
                </span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
};

export default CheckoutSteps;
