import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import SupportEmailLink from './SupportEmailLink';

const { screen } = testingLibrary;

describe('SupportEmailLink', () => {
  it('shows the configured support address as a mail link', () => {
    render(<SupportEmailLink />);
    const link = screen.getByRole('link', { name: 'support@dragonrent.com' });
    expect(link).toHaveAttribute('href', 'mailto:support@dragonrent.com');
  });
});
