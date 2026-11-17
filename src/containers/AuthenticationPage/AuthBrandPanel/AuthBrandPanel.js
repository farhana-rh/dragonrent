import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../../util/reactIntl';

import css from './AuthBrandPanel.module.css';

// Copy per page: sign up, log in, password recovery (AuthenticationPage.brandPanel.<variant>.*)
const VARIANTS = ['signup', 'login', 'recovery'];

// Trust points: how the marketplace works today (no promises it can't keep)
const TRUST_POINTS = ['payOnAccept', 'stripeVerified', 'privateAddress'];

/**
 * DragonRent logo mark: a dragon eye with a keyhole pupil (dragonrent-design/brand/).
 * Decorative here, the panel's heading carries the meaning.
 */
const LogoMark = () => (
  <svg
    className={css.mark}
    width="96"
    height="84"
    viewBox="0 1 64 55"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M16 25 C14 17 10.5 10 5 4.5 C13 6.5 21 12 27.5 19 Z"
      fill="#FF5733"
      stroke="#111"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path
      d="M48 25 C50 17 53.5 10 59 4.5 C51 6.5 43 12 36.5 19 Z"
      fill="#FF5733"
      stroke="#111"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path
      d="M4 34 C14 20 23 15.5 32 15.5 C41 15.5 50 20 60 34 C50 48 41 52.5 32 52.5 C23 52.5 14 48 4 34 Z"
      fill="#FF5733"
      stroke="#111"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <circle cx="32" cy="34" r="13" fill="#FFC300" stroke="#111" strokeWidth="3" />
    <circle cx="32" cy="30.5" r="4" fill="#111" />
    <path d="M30 32 L34 32 L35.6 42 L28.4 42 Z" fill="#111" />
  </svg>
);

const CheckIcon = () => (
  <svg
    className={css.checkIcon}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M5 12.5l4.5 4.5L19 7.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Brand panel next to the sign-up, log-in and password-recovery forms on desktop (sticker design):
 * the logo mark, a headline for the page, and three trust points. Hidden on phones and tablets,
 * where the form comes first.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to component's own css.root
 * @param {('signup'|'login'|'recovery')} props.variant which page the panel sits on
 * @returns {JSX.Element} brand panel
 */
const AuthBrandPanel = props => {
  const { className, variant } = props;
  const key = VARIANTS.includes(variant) ? variant : 'login';

  return (
    <aside className={classNames(css.root, className)}>
      <LogoMark />
      <span className={css.areaSticker}>
        <FormattedMessage id="AuthenticationPage.brandPanel.area" />
      </span>
      <p className={css.title}>
        <FormattedMessage id={`AuthenticationPage.brandPanel.${key}.title`} />
      </p>
      <p className={css.text}>
        <FormattedMessage id={`AuthenticationPage.brandPanel.${key}.text`} />
      </p>
      <ul className={css.points}>
        {TRUST_POINTS.map(point => (
          <li key={point} className={css.point}>
            <CheckIcon />
            <span>
              <FormattedMessage id={`AuthenticationPage.brandPanel.point.${point}`} />
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default AuthBrandPanel;
