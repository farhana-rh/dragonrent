import React from 'react';
import classNames from 'classnames';

import { NamedLink } from '../../../components';

import HomeMedia from '../HomeMedia/HomeMedia';

import css from './HomeTile.module.css';

/**
 * Linked image tile with a title and optional subtitle (used for categories and use cases).
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to component's own css.root
 * @param {ReactNode} props.title
 * @param {ReactNode?} props.subtitle
 * @param {Object} props.linkProps NamedLink props: { name, params, to }
 * @param {Object} props.visual { tone, image } from landingPageConfig
 * @param {('landscape'|'wide')} props.aspectRatio
 * @param {('small'|'large')} props.size title size
 * @returns {JSX.Element} tile
 */
const HomeTile = props => {
  const {
    className,
    title,
    subtitle,
    linkProps,
    visual = {},
    aspectRatio = 'landscape',
    size = 'small',
  } = props;

  return (
    <NamedLink className={classNames(css.root, className)} {...linkProps}>
      <HomeMedia
        className={css.media}
        image={visual.image}
        tone={visual.tone}
        aspectRatio={aspectRatio}
      />
      <span className={classNames(css.title, { [css.titleLarge]: size === 'large' })}>{title}</span>
      {subtitle ? <span className={css.subtitle}>{subtitle}</span> : null}
    </NamedLink>
  );
};

export default HomeTile;
