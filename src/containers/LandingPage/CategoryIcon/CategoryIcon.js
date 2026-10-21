import React from 'react';
import classNames from 'classnames';

import css from './CategoryIcon.module.css';

// 24px line icons drawn on a 24×24 grid. Add a new entry here to make it available in
// landingPageConfig.js (categoryVisuals → icon).
const ICON_PATHS = {
  camera: 'M4 8h3l1.5-2h7L17 8h3v11H4zM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  tools:
    'M14.5 4.5a4 4 0 0 0-4.7 5.3L4 15.6 6.4 18l5.8-5.8a4 4 0 0 0 5.3-4.7l-2.4 2.4-2.4-.6-.6-2.4z',
  camping: 'M12 4L3 20h18zM12 4v16M9 20l3-6 3 6',
  event: 'M7 3h10v18H7zM12 17.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  electronics: 'M5 5h14v10H5zM3 19h18M10 15v4M14 15v4',
  sports: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3.5 9.5c5 1 12 1 17 0M3.5 14.5c5-1 12-1 17 0',
  bike:
    'M6 18.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM18 18.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM6 15l4-7h5l3 7M9 8h2M12 15l-2-7',
  vehicle:
    'M3 16v-4l2-5h10l4 5h2v4zM7.5 18.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM16.5 18.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  music:
    'M9 18V5l11-2v13M6.5 20.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM17.5 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  home: 'M4 11l8-7 8 7M6 9.5V20h12V9.5M10 20v-5h4v5',
  party: 'M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.4l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z',
  default: 'M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8',
};

/**
 * Decorative line icon for a category tile. Falls back to a generic box icon when the
 * given name has no icon.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to component's own css.root
 * @param {string?} props.name icon name, e.g. 'camera'
 * @returns {JSX.Element} svg icon
 */
const CategoryIcon = props => {
  const { className, name } = props;
  const path = ICON_PATHS[name] || ICON_PATHS.default;

  return (
    <svg
      className={classNames(css.root, className)}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CategoryIcon;
