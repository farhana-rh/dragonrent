import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../../../util/testHelpers';

import SectionFooter from './SectionFooter';

const { screen } = testingLibrary;

describe('SectionFooter', () => {
  const props = { sectionId: 'footer', sectionType: 'footer' };

  it('has the brand, the digest and the Explore, Lend and Help columns', () => {
    render(<SectionFooter {...props} />);

    expect(screen.getByText('SectionFooter.slogan')).toBeInTheDocument();
    expect(screen.getByText('SectionFooter.digest.title')).toBeInTheDocument();

    const nav = screen.getByRole('navigation', { name: 'SectionFooter.linksLabel' });
    ['explore', 'lend', 'help'].forEach(column =>
      expect(nav).toHaveTextContent(`SectionFooter.column.${column}`)
    );
    expect(screen.getByText('SectionFooter.link.tools').closest('a')).toHaveAttribute(
      'href',
      '/s?pub_categoryLevel1=Tools'
    );
    expect(screen.getByText('SectionFooter.link.lendAnItem').closest('a')).toHaveAttribute(
      'href',
      '/l/new'
    );
    expect(screen.getByText('SectionFooter.link.damagePolicy').closest('a')).toHaveAttribute(
      'href',
      '/p/damage-policy'
    );
    expect(screen.getByText('SectionFooter.paymentsNote')).toBeInTheDocument();
  });

  it('shows the support email under Help as a mail link', () => {
    render(<SectionFooter {...props} />, {
      messages: { 'SectionFooter.contact': 'Questions or cancellations: {email}' },
    });

    const link = screen.getByRole('link', { name: 'support@dragonrent.com' });
    expect(link).toHaveAttribute('href', 'mailto:support@dragonrent.com');
    expect(link.closest('p')).toHaveTextContent(
      'Questions or cancellations: support@dragonrent.com'
    );
  });

  it('keeps the digest switched off until a newsletter service is connected', () => {
    render(<SectionFooter {...props} />);

    expect(screen.getByText('SectionFooter.digest.soon')).toBeInTheDocument();
    expect(screen.getByLabelText('SectionFooter.digest.emailLabel')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'SectionFooter.digest.button' })).toBeDisabled();
  });

  it('ignores the Console footer placeholders and keeps Cookie settings', () => {
    render(
      <SectionFooter
        {...props}
        slogan={{ fieldType: 'text', content: 'In Console, go to Content → Footer' }}
        copyright={{ fieldType: 'text', content: '© 2026 Your marketplace' }}
      />
    );

    expect(screen.queryByText('In Console, go to Content → Footer')).not.toBeInTheDocument();
    expect(screen.queryByText('© 2026 Your marketplace')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'SectionFooter.cookieSettings' })
    ).toBeInTheDocument();
  });
});
