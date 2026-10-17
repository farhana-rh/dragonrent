import React from 'react';
import classNames from 'classnames';

import { NamedLink } from '../../../components';

import css from './SectionHeader.module.css';

/**
 * Section title with an optional "View all" style link on the right.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to component's own css.root
 * @param {string} props.titleId id for the heading, so the section can reference it
 * @param {ReactNode} props.title
 * @param {ReactNode?} props.subtitle
 * @param {ReactNode?} props.linkText
 * @param {Object?} props.linkProps NamedLink props: { name, params, to }
 * @returns {JSX.Element} section header
 */
const SectionHeader = props => {
  const { className, titleId, title, subtitle, linkText, linkProps } = props;

  return (
    <div className={classNames(css.root, className)}>
      <div className={css.titleWrapper}>
        <h2 id={titleId} className={css.title}>
          {title}
        </h2>
        {subtitle ? <p className={css.subtitle}>{subtitle}</p> : null}
      </div>
      {linkText && linkProps ? (
        <NamedLink className={css.link} {...linkProps}>
          {linkText}
        </NamedLink>
      ) : null}
    </div>
  );
};

export default SectionHeader;
