import React from 'react';
import classNames from 'classnames';

import { useConfiguration } from '../../context/configurationContext';

import css from './SupportEmailLink.module.css';

/**
 * DragonRent's customer support address (config.supportEmail) as a selectable mail link. The
 * address itself is the link text, so it can be copied as well as clicked.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to component's own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @returns {JSX.Element|null} mailto link, or null if no address is configured
 */
const SupportEmailLink = props => {
  const { className, rootClassName } = props;
  const config = useConfiguration();
  const email = config?.supportEmail;
  if (!email) {
    return null;
  }
  return (
    <a className={classNames(rootClassName || css.root, className)} href={`mailto:${email}`}>
      {email}
    </a>
  );
};

export default SupportEmailLink;
