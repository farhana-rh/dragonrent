import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../../../util/testHelpers';

import SectionFooter from './SectionFooter';

const { screen } = testingLibrary;

describe('SectionFooter', () => {
  const props = { sectionId: 'footer', sectionType: 'footer' };

  it('shows the lend call to action, four link columns and the trust line', () => {
    render(<SectionFooter {...props} />);

    expect(screen.getByText('SectionFooter.cta.title')).toBeInTheDocument();
    expect(screen.getByText('SectionFooter.cta.button').closest('a')).toHaveAttribute(
      'href',
      '/l/new'
    );

    const nav = screen.getByRole('navigation', { name: 'SectionFooter.linksLabel' });
    ['explore', 'lend', 'help', 'legal'].forEach(column =>
      expect(nav).toHaveTextContent(`SectionFooter.column.${column}`)
    );
    expect(screen.getByText('SectionFooter.link.browse').closest('a')).toHaveAttribute(
      'href',
      '/s'
    );
    expect(screen.getByText('SectionFooter.link.damagePolicy').closest('a')).toHaveAttribute(
      'href',
      '/p/damage-policy'
    );
    expect(screen.getByText('SectionFooter.link.trustAndSafety').closest('a')).toHaveAttribute(
      'href',
      '/#trust-and-safety'
    );
    ['stripePayments', 'stripeVerified', 'euros'].forEach(item =>
      expect(screen.getByText(`SectionFooter.trust.${item}`)).toBeInTheDocument()
    );
  });

  it('ignores the Console footer placeholders and keeps one Cookie settings button', () => {
    render(
      <SectionFooter
        {...props}
        slogan={{ fieldType: 'text', content: 'In Console, go to Content → Footer' }}
        copyright={{ fieldType: 'text', content: '© 2026 Your marketplace' }}
      />
    );

    expect(screen.queryByText('In Console, go to Content → Footer')).not.toBeInTheDocument();
    expect(screen.queryByText('© 2026 Your marketplace')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(
      screen.getByRole('button', { name: 'SectionFooter.link.cookieSettings' })
    ).toBeInTheDocument();
  });
});
