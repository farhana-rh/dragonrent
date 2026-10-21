import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../../util/testHelpers';

import SectionHowItWorks, { getAudienceTabId } from './SectionHowItWorks';

const { screen, userEvent, act } = testingLibrary;

describe('SectionHowItWorks', () => {
  afterEach(() => {
    window.location.hash = '';
  });

  it('shows the renter steps by default', () => {
    render(<SectionHowItWorks sectionId="how" />);

    const rentTab = screen.getByRole('tab', { name: 'LandingPage.howItWorks.tab.rent' });
    expect(rentTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'how-tab-rent');
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByText('LandingPage.howItWorks.rent.find.title')).toBeInTheDocument();
    expect(screen.queryByText('LandingPage.howItWorks.lend.list.title')).not.toBeInTheDocument();
  });

  it('switches to the lender steps on click', async () => {
    render(<SectionHowItWorks sectionId="how" />);

    await userEvent.click(screen.getByRole('tab', { name: 'LandingPage.howItWorks.tab.lend' }));

    expect(screen.getByRole('tab', { name: 'LandingPage.howItWorks.tab.lend' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByText('LandingPage.howItWorks.lend.list.title')).toBeInTheDocument();
    expect(screen.queryByText('LandingPage.howItWorks.rent.find.title')).not.toBeInTheDocument();
  });

  it('moves between tabs with the arrow keys', async () => {
    render(<SectionHowItWorks sectionId="how" />);

    const rentTab = screen.getByRole('tab', { name: 'LandingPage.howItWorks.tab.rent' });
    const lendTab = screen.getByRole('tab', { name: 'LandingPage.howItWorks.tab.lend' });
    expect(rentTab).toHaveAttribute('tabindex', '0');
    expect(lendTab).toHaveAttribute('tabindex', '-1');

    rentTab.focus();
    await userEvent.keyboard('{ArrowRight}');

    expect(lendTab).toHaveFocus();
    expect(lendTab).toHaveAttribute('aria-selected', 'true');
  });

  it('selects the audience from the URL hash', () => {
    window.location.hash = `#${getAudienceTabId('how', 'lend')}`;
    render(<SectionHowItWorks sectionId="how" />);

    expect(screen.getByText('LandingPage.howItWorks.lend.getPaid.title')).toBeInTheDocument();

    act(() => {
      window.location.hash = `#${getAudienceTabId('how', 'rent')}`;
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(screen.getByText('LandingPage.howItWorks.rent.return.title')).toBeInTheDocument();
  });
});
