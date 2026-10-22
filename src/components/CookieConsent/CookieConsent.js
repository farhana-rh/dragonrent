import React, { useEffect, useState } from 'react';

import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import {
  OPEN_COOKIE_SETTINGS_EVENT,
  readCookieConsent,
  saveCookieConsent,
} from '../../util/cookieConsent';

import { NamedLink } from '../../components';

import css from './CookieConsent.module.css';

/**
 * Cookie banner: shown until the visitor chooses, and again from "Cookie settings" in the footer.
 * Saying no is as easy as saying yes: both buttons look the same. Analytics scripts load only
 * after "Allow analytics" (see util/cookieConsent.js and util/includeScripts.js).
 *
 * Renders nothing on the server and on the first client render, so it never causes a hydration
 * mismatch.
 *
 * @component
 * @returns {JSX.Element|null}
 */
const CookieConsent = () => {
  const config = useConfiguration();
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(readCookieConsent() === null);
    const open = () => setIsOpen(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, open);
  }, []);

  if (!isOpen) {
    return null;
  }

  const choose = analytics => {
    setIsOpen(false);
    saveCookieConsent({ analytics });
  };
  const marketplaceName = config.marketplaceName;

  return (
    <section
      className={css.root}
      aria-label={intl.formatMessage({ id: 'CookieConsent.label' })}
      data-testid="cookieConsent"
    >
      <div className={css.content}>
        <div className={css.text}>
          <h2 className={css.title}>
            <FormattedMessage id="CookieConsent.title" values={{ marketplaceName }} />
          </h2>
          <p className={css.description}>
            <FormattedMessage id="CookieConsent.text" values={{ marketplaceName }} />{' '}
            <NamedLink className={css.link} name="CMSPage" params={{ pageId: 'privacy-policy' }}>
              <FormattedMessage id="CookieConsent.readMore" />
            </NamedLink>
          </p>
        </div>
        <div className={css.buttons}>
          <button type="button" className={css.button} onClick={() => choose(false)}>
            <FormattedMessage id="CookieConsent.necessaryOnly" />
          </button>
          <button type="button" className={css.button} onClick={() => choose(true)}>
            <FormattedMessage id="CookieConsent.allowAnalytics" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CookieConsent;
