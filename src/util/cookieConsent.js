import { useEffect, useState } from 'react';

// Cookie consent (docs/SCOPE.md: analytics only after consent). Cookies that the marketplace
// needs to work (sign-in, payments, this choice itself) don't ask for consent; analytics scripts
// (Google Analytics, Plausible) load only after the visitor allows them.
//
// The choice is stored in the visitor's browser. Bump CONSENT_VERSION to ask everyone again,
// e.g. after adding a new kind of cookie.

const STORAGE_KEY = 'dragonrentCookieConsent';
const CONSENT_VERSION = 1;

/** Dispatched on `window` with the new consent as `detail` when the visitor makes a choice. */
export const COOKIE_CONSENT_CHANGED_EVENT = 'cookie-consent-changed';
/** Dispatched on `window` to show the cookie banner again ("Cookie settings" in the footer). */
export const OPEN_COOKIE_SETTINGS_EVENT = 'open-cookie-settings';

const isBrowser = () => typeof window !== 'undefined';

/**
 * The visitor's saved choice.
 *
 * @returns {Object|null} { analytics: boolean, decidedAt: string } or null if not decided yet
 */
export const readCookieConsent = () => {
  if (!isBrowser()) {
    return null;
  }
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return saved?.version === CONSENT_VERSION && typeof saved.analytics === 'boolean'
      ? { analytics: saved.analytics, decidedAt: saved.decidedAt }
      : null;
  } catch (e) {
    return null;
  }
};

// Google Analytics cookies (_ga, _ga_<id>) on this domain and its parent domains
const removeAnalyticsCookies = () => {
  const hostParts = window.location.hostname.split('.');
  const domains = hostParts.map((_, i) => hostParts.slice(i).join('.'));
  document.cookie
    .split(';')
    .map(c => c.split('=')[0].trim())
    .filter(name => name === '_ga' || name.startsWith('_ga_') || name === '_gid')
    .forEach(name => {
      [null, ...domains].forEach(domain => {
        const domainPart = domain ? `; domain=${domain}` : '';
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}`;
      });
    });
};

/**
 * Save the visitor's choice and tell the app about it. Withdrawing consent removes analytics
 * cookies and reloads the page, so scripts that were already running stop.
 *
 * @param {Object} choice
 * @param {boolean} choice.analytics whether analytics may load
 */
export const saveCookieConsent = ({ analytics }) => {
  if (!isBrowser()) {
    return;
  }
  const previous = readCookieConsent();
  const consent = { analytics: !!analytics, decidedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: CONSENT_VERSION, ...consent })
    );
  } catch (e) {
    // Storage can be blocked (private mode); the choice then lasts for this page view only
  }
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: consent }));

  if (previous?.analytics && !consent.analytics) {
    removeAnalyticsCookies();
    window.location.reload();
  }
};

/** Show the cookie banner again so the visitor can change their choice. */
export const openCookieSettings = () => {
  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS_EVENT));
  }
};

/**
 * The visitor's current choice, updated when it changes. Always null during server rendering
 * and the first client render, so analytics never load before the browser has checked.
 *
 * @returns {Object|null} { analytics, decidedAt } or null if not decided yet
 */
export const useCookieConsent = () => {
  const [consent, setConsent] = useState(null);

  useEffect(() => {
    setConsent(readCookieConsent());
    const handleChange = e => setConsent(e.detail);
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleChange);
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleChange);
  }, []);

  return consent;
};
