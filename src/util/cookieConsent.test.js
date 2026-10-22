import {
  COOKIE_CONSENT_CHANGED_EVENT,
  readCookieConsent,
  saveCookieConsent,
} from './cookieConsent';

describe('cookieConsent', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('has no choice until the visitor makes one', () => {
    expect(readCookieConsent()).toBeNull();
  });

  it('saves the choice and announces it', () => {
    const listener = jest.fn();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, listener);

    saveCookieConsent({ analytics: true });

    expect(readCookieConsent()).toMatchObject({ analytics: true });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toMatchObject({ analytics: true });
    window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, listener);
  });

  it('ignores a choice saved for an older version of the banner', () => {
    window.localStorage.setItem(
      'dragonrentCookieConsent',
      JSON.stringify({ version: 0, analytics: true })
    );
    expect(readCookieConsent()).toBeNull();
  });

  it('ignores broken saved data', () => {
    window.localStorage.setItem('dragonrentCookieConsent', '{not json');
    expect(readCookieConsent()).toBeNull();
  });
});
