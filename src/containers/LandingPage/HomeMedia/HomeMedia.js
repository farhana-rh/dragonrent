import React from 'react';
import classNames from 'classnames';

import css from './HomeMedia.module.css';

const TONE_CLASSES = {
  sage: css.sage,
  sand: css.sand,
  blush: css.blush,
  slate: css.slate,
  stone: css.stone,
};

/**
 * Image frame for landing page tiles. Renders the given image, or a tinted placeholder
 * while real photography is not available. Placeholders are decorative (hidden from
 * assistive technology) because the tile's text already describes the content.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to component's own css.root
 * @param {string?} props.image image URL (imported asset); null renders a placeholder
 * @param {string?} props.alt alt text for a real image; empty string marks it decorative
 * @param {('sage'|'sand'|'blush'|'slate'|'stone')} props.tone placeholder tint
 * @param {('square'|'landscape'|'wide'|null)} props.aspectRatio frame shape; null lets the parent set it
 * @param {('lazy'|'eager')} props.loading image loading strategy
 * @param {ReactNode?} props.label short caption shown on top of the image, e.g. a category name
 * @returns {JSX.Element} image frame
 */
const HomeMedia = props => {
  const {
    className,
    image,
    alt = '',
    tone = 'sand',
    aspectRatio = 'landscape',
    loading = 'lazy',
    sizes,
    label,
  } = props;
  const classes = classNames(css.root, css[aspectRatio], TONE_CLASSES[tone], className);

  const labelMaybe = label ? <span className={css.label}>{label}</span> : null;

  return image ? (
    <div className={classes}>
      <img className={css.image} src={image} alt={alt} loading={loading} sizes={sizes} />
      {labelMaybe}
    </div>
  ) : (
    <div className={classes} aria-hidden="true">
      {labelMaybe}
    </div>
  );
};

export default HomeMedia;
