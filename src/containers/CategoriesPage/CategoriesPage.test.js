import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import { CategoriesPageComponent, filterCategories } from './CategoriesPage';

const { screen, fireEvent } = testingLibrary;

const categories = [
  { id: 'bikes', name: 'Bikes' },
  { id: 'cameras', name: 'Cameras' },
  { id: 'camping', name: 'Camping' },
];

describe('filterCategories', () => {
  it('matches names ignoring case and spaces, and keeps each accent while filtering', () => {
    expect(filterCategories(categories, '').map(c => c.id)).toEqual([
      'bikes',
      'cameras',
      'camping',
    ]);
    expect(filterCategories(categories, '  CAM ').map(c => c.id)).toEqual(['cameras', 'camping']);
    expect(filterCategories(categories, 'xyz')).toEqual([]);
    // Camping is the third category, so it keeps the third accent when shown alone
    expect(filterCategories(categories, 'camping')[0].accent).toEqual('mint');
  });
});

describe('CategoriesPage', () => {
  it('shows every category as a tile linking to its search', () => {
    render(<CategoriesPageComponent scrollingDisabled={false} categories={categories} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('CategoriesPage.heading');
    expect(screen.getByText('Bikes').closest('a')).toHaveAttribute(
      'href',
      '/s?pub_categoryLevel1=bikes'
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    // The breadcrumb leads back home
    expect(screen.getByText('CategoriesPage.breadcrumbHome').closest('a')).toHaveAttribute(
      'href',
      '/'
    );
  });

  it('shows every category at once, with no "Show all" button', () => {
    const many = [...Array(52).keys()].map(i => ({ id: `cat${i}`, name: `Category ${i}` }));
    render(<CategoriesPageComponent scrollingDisabled={false} categories={many} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(52);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('filters the tiles as you type', () => {
    render(<CategoriesPageComponent scrollingDisabled={false} categories={categories} />);

    const input = screen.getByLabelText('CategoriesPage.findLabel');
    fireEvent.change(input, { target: { value: 'cam' } });
    expect(screen.queryByText('Bikes')).not.toBeInTheDocument();
    expect(screen.getByText('Cameras')).toBeInTheDocument();
    expect(screen.getByText('Camping')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'kayak' } });
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(screen.getByRole('status')).toHaveTextContent('CategoriesPage.noMatches');
  });

  it('renders a category with no configured icon', () => {
    render(
      <CategoriesPageComponent
        scrollingDisabled={false}
        categories={[{ id: 'misc', name: 'Misc' }]}
      />
    );

    expect(
      screen
        .getByText('Misc')
        .closest('a')
        .querySelector('svg')
    ).toBeInTheDocument();
  });

  it('says so when Console has no categories', () => {
    render(<CategoriesPageComponent scrollingDisabled={false} categories={[]} />);

    expect(screen.getByText('CategoriesPage.noCategories')).toBeInTheDocument();
    expect(screen.queryByLabelText('CategoriesPage.findLabel')).not.toBeInTheDocument();
  });
});
