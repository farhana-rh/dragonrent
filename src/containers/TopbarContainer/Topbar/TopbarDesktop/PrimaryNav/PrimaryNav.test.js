import React from 'react';
import '@testing-library/jest-dom';

import { fakeIntl } from '../../../../../util/testData';
import { categorySearchTo } from '../../../../../util/search';
import { renderWithProviders as render, testingLibrary } from '../../../../../util/testHelpers';

import PrimaryNav from './PrimaryNav';

const { screen, userEvent } = testingLibrary;

const categories = [{ id: 'bikes', name: 'Bikes' }, { id: 'cameras', name: 'Cameras' }];

describe('PrimaryNav', () => {
  it('renders Browse and How it works links', () => {
    render(<PrimaryNav currentPage="LandingPage" categories={[]} intl={fakeIntl} />);

    expect(screen.getByText('TopbarDesktop.browse').closest('a')).toHaveAttribute('href', '/s');
    expect(screen.getByText('TopbarDesktop.howItWorks').closest('a')).toHaveAttribute(
      'href',
      '/p/how-it-works'
    );
    // No categories configured: no dropdown
    expect(screen.queryByText('TopbarDesktop.categories')).not.toBeInTheDocument();
  });

  it('renders category links only after the categories menu is opened', async () => {
    const user = userEvent.setup();
    render(<PrimaryNav currentPage="LandingPage" categories={categories} intl={fakeIntl} />);

    expect(screen.queryByText('Bikes')).not.toBeInTheDocument();

    await user.click(screen.getByText('TopbarDesktop.categories'));

    expect(screen.getByText('Bikes').closest('a')).toHaveAttribute(
      'href',
      '/s?pub_categoryLevel1=bikes'
    );
    expect(screen.getByText('Cameras')).toBeInTheDocument();
    expect(screen.getByText('TopbarDesktop.allCategories').closest('a')).toHaveAttribute(
      'href',
      '/s'
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
