import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../../../util/testHelpers';

import SectionFooter from './SectionFooter';

const { screen, waitFor } = testingLibrary;

const markdownBlock = (blockId, content) => ({
  blockId,
  blockType: 'footerBlock',
  text: { fieldType: 'markdown', content },
});

describe('SectionFooter', () => {
  const props = {
    sectionId: 'footer',
    sectionType: 'footer',
    numberOfColumns: 2,
    slogan: { fieldType: 'text', content: "Rent from people nearby. Lend what you don't use." },
    copyright: { fieldType: 'text', content: '© 2026 DragonRent' },
    blocks: [
      markdownBlock('company', '- [How it works](/p/how-it-works)\n- [Help and FAQ](/p/faq)'),
      markdownBlock('legal', '- [Terms](/terms-of-service)'),
    ],
  };

  it('renders the marketplace name, slogan, links from every block and copyright', async () => {
    render(<SectionFooter {...props} />);

    await waitFor(() => {
      expect(screen.getByText('© 2026 DragonRent')).toBeInTheDocument();
    });
    expect(
      screen.getByText("Rent from people nearby. Lend what you don't use.")
    ).toBeInTheDocument();

    const nav = screen.getByRole('navigation', { name: 'SectionFooter.linksLabel' });
    expect(nav).toHaveTextContent('How it works');
    expect(nav).toHaveTextContent('Help and FAQ');
    expect(nav).toHaveTextContent('Terms');
    expect(screen.getByText('Terms').closest('a')).toHaveAttribute('href', '/terms-of-service');
  });

  it('has no collapsible groups or locale labels', async () => {
    render(<SectionFooter {...props} />);

    await screen.findByText('Terms');
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryByText('SectionFooter.marketplaceCountry')).not.toBeInTheDocument();
  });
});
