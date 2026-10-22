import React from 'react';
import '@testing-library/jest-dom';
import { act } from 'react';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';
import { openCookieSettings, readCookieConsent } from '../../util/cookieConsent';

import CookieConsent from './CookieConsent';

const { screen, userEvent } = testingLibrary;

describe('CookieConsent', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('asks until the visitor chooses, then hides', async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);

    expect(screen.getByTestId('cookieConsent')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'CookieConsent.necessaryOnly' }));

    expect(screen.queryByTestId('cookieConsent')).not.toBeInTheDocument();
    expect(readCookieConsent()).toMatchObject({ analytics: false });
  });

  it('saves "Allow analytics"', async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);
    await user.click(screen.getByRole('button', { name: 'CookieConsent.allowAnalytics' }));
    expect(readCookieConsent()).toMatchObject({ analytics: true });
  });

  it('stays hidden after a choice, and opens again from "Cookie settings"', () => {
    window.localStorage.setItem(
      'dragonrentCookieConsent',
      JSON.stringify({ version: 1, analytics: false })
    );
    render(<CookieConsent />);
    expect(screen.queryByTestId('cookieConsent')).not.toBeInTheDocument();

    act(() => openCookieSettings());
    expect(screen.getByTestId('cookieConsent')).toBeInTheDocument();
  });
});
