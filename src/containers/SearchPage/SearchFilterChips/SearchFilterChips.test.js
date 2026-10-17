import React from 'react';
import '@testing-library/jest-dom';

import { fakeIntl } from '../../../util/testData';
import {
  getDefaultConfiguration,
  renderWithProviders as render,
  testingLibrary,
} from '../../../util/testHelpers';

import SearchFilterChips, { getFilterChips } from './SearchFilterChips';

const { screen, userEvent } = testingLibrary;

const config = {
  ...getDefaultConfiguration(),
  currency: 'EUR',
  categoryConfiguration: {
    key: 'categoryLevel',
    scope: 'public',
    categoryLevelKeys: ['categoryLevel1', 'categoryLevel2'],
    categories: [
      { id: 'bikes', name: 'Bikes', subcategories: [{ id: 'cargo', name: 'Cargo bikes' }] },
    ],
  },
};

describe('getFilterChips', () => {
  it('creates chips for active built-in filters', () => {
    const chips = getFilterChips(
      { pub_categoryLevel1: 'bikes', price: '0,40', dates: '2026-10-12,2026-10-15' },
      config,
      fakeIntl
    );
    expect(chips.map(c => c.key)).toEqual(['category', 'price', 'dates']);
    expect(chips[0]).toMatchObject({
      label: 'Bikes',
      paramNames: ['pub_categoryLevel1', 'pub_categoryLevel2', 'pub_categoryLevel3'],
    });
    expect(chips[1].paramNames).toEqual(['price']);
  });

  it('uses the deepest selected category name', () => {
    const chips = getFilterChips(
      { pub_categoryLevel1: 'bikes', pub_categoryLevel2: 'cargo' },
      config,
      fakeIntl
    );
    expect(chips[0].label).toEqual('Cargo bikes');
  });

  it('ignores unknown categories and malformed values', () => {
    expect(getFilterChips({ pub_categoryLevel1: 'boats', price: 'abc' }, config, fakeIntl)).toEqual(
      []
    );
  });
});

describe('SearchFilterChips', () => {
  it('removes a filter and clears all', async () => {
    const user = userEvent.setup();
    const onRemove = jest.fn();
    const onClearAll = jest.fn();
    render(
      <SearchFilterChips
        urlQueryParams={{ pub_categoryLevel1: 'bikes' }}
        config={config}
        intl={fakeIntl}
        onRemove={onRemove}
        onClearAll={onClearAll}
      />
    );

    await user.click(screen.getByRole('button', { name: 'SearchFilterChips.removeFilter' }));
    expect(onRemove).toHaveBeenCalledWith({
      pub_categoryLevel1: null,
      pub_categoryLevel2: null,
      pub_categoryLevel3: null,
    });

    await user.click(screen.getByText('SearchFilterChips.clearAll'));
    expect(onClearAll).toHaveBeenCalled();
  });

  it('renders nothing without active filters', () => {
    const { container } = render(
      <SearchFilterChips
        urlQueryParams={{}}
        config={config}
        intl={fakeIntl}
        onRemove={jest.fn()}
        onClearAll={jest.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
