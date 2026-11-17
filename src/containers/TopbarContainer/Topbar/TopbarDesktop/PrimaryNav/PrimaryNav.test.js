import React from 'react';
import '@testing-library/jest-dom';

import { categorySearchTo } from '../../../../../util/search';
import { renderWithProviders as render, testingLibrary } from '../../../../../util/testHelpers';

import PrimaryNav from './PrimaryNav';

const { screen } = testingLibrary;

describe('PrimaryNav', () => {
  it('links to search, the How it works page and the Trust & Safety section', () => {
    render(<PrimaryNav currentPage="LandingPage" />);

    expect(screen.getByText('TopbarDesktop.explore').closest('a')).toHaveAttribute('href', '/s');
    expect(screen.getByText('TopbarDesktop.howItWorks').closest('a')).toHaveAttribute(
      'href',
      '/p/how-it-works'
    );
    expect(screen.getByText('TopbarDesktop.trustAndSafety').closest('a')).toHaveAttribute(
      'href',
      '#trust-and-safety'
    );
  });
});

describe('categorySearchTo', () => {
  it('encodes the category id into the search string', () => {
    expect(categorySearchTo('sports & outdoors')).toEqual({
      search: '?pub_categoryLevel1=sports%20%26%20outdoors',
    });
  });
});
