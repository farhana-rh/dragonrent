import React from 'react';
import classNames from 'classnames';

import css from './StatCard.module.css';

/**
 * Card with a label, a large number and a detail line or link.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to component's own css.root
 * @param {ReactNode} props.label
 * @param {ReactNode} props.value
 * @param {ReactNode?} props.detail detail line; links in it can use StatCard's `linkClassName`
 * @param {boolean?} props.highlight brand-coloured card for the most important number
 * @returns {JSX.Element} stat card
 */
const StatCard = props => {
  const { className, label, value, detail, highlight = false } = props;

  return (
    <div className={classNames(css.root, { [css.highlight]: highlight }, className)}>
      <dt className={css.label}>{label}</dt>
      <dd className={css.value}>{value}</dd>
      {detail ? <dd className={css.detail}>{detail}</dd> : null}
    </div>
  );
};

// Class for links in the detail line, so they inherit the card's text colour
export const linkClassName = css.detailLink;

export default StatCard;
