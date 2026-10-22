import React from 'react';
import classNames from 'classnames';

import css from './PopupOpenerButton.module.css';

// Selected filter chips show a check, so the state isn't shown by colour alone
const IconCheck = () => (
  <svg
    className={css.checkIcon}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/**
 * PopupOpenerButton component
 *
 * @component
 * @param {Object} props
 * @param {boolean} [props.isSelected] - Whether the filter is selected
 * @param {number} [props.labelMaxWidth] - The maximum width of the label
 * @param {Function} props.toggleOpen - The function to toggle the filter
 * @param {React.Node} props.children - The children
 * @returns {JSX.Element}
 */
const PopupOpenerButton = props => {
  const { isSelected = false, labelMaxWidth = null, toggleOpen, children, ...rest } = props;

  const labelStyles = isSelected ? css.labelSelected : css.label;
  const labelMaxWidthMaybe = labelMaxWidth ? { maxWidth: `${labelMaxWidth}px` } : {};
  const labelMaxWidthStyles = labelMaxWidth ? css.labelEllipsis : null;

  return (
    <button
      className={classNames(labelStyles, labelMaxWidthStyles)}
      style={labelMaxWidthMaybe}
      onClick={() => toggleOpen()}
      {...rest}
    >
      {isSelected ? <IconCheck /> : null}
      {children}
    </button>
  );
};

export default PopupOpenerButton;
