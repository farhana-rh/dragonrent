import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../../util/testHelpers';

import AuthBrandPanel from './AuthBrandPanel';

const { screen } = testingLibrary;

describe('AuthBrandPanel', () => {
  it('shows the headline for the page and the three trust points', () => {
    render(<AuthBrandPanel variant="signup" />);

    expect(screen.getByText('AuthenticationPage.brandPanel.signup.title')).toBeInTheDocument();
    ['payOnAccept', 'stripeVerified', 'privateAddress'].forEach(point =>
      expect(screen.getByText(`AuthenticationPage.brandPanel.point.${point}`)).toBeInTheDocument()
    );
  });

  it('falls back to the log-in copy for an unknown variant', () => {
    render(<AuthBrandPanel variant="other" />);

    expect(screen.getByText('AuthenticationPage.brandPanel.login.title')).toBeInTheDocument();
  });
});
