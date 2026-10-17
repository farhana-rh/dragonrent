import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../../../util/testHelpers';

import SectionFooter, { getBlockHeading } from './SectionFooter';

const { screen, userEvent, waitFor } = testingLibrary;

const markdownBlock = (blockId, content) => ({
  blockType: 'footerBlock',
  blockId,
  text: { fieldType: 'markdown', content },
});

describe('getBlockHeading', () => {
  it('returns the first markdown heading as plain text', () => {
    const block = markdownBlock('company', '##### Company\n- [About](/p/about)');
    expect(getBlockHeading(block)).toEqual('Company');
  });

  it('strips inline markdown from the heading', () => {
    const block = markdownBlock(
      'trust',
      '### **Trust** and [policies](/p/policies)\n- [Fees](/p/fees)'
    );
    expect(getBlockHeading(block)).toEqual('Trust and policies');
  });

  it('returns null when there is no heading', () => {
    expect(getBlockHeading(markdownBlock('links', '- [Terms](/terms-of-service)'))).toEqual(null);
    expect(getBlockHeading({ blockType: 'footerBlock' })).toEqual(null);
  });
});

describe('SectionFooter', () => {
  const props = {
    sectionId: 'footer',
    sectionType: 'footer',
    numberOfColumns: 2,
    copyright: { fieldType: 'text', content: '© 2026 DragonRent' },
    blocks: [
      markdownBlock('company', '##### Company\n- [About](/p/about)'),
      markdownBlock('legal', '- [Terms](/terms-of-service)'),
    ],
  };

  it('renders link groups, copyright and marketplace locale info', async () => {
    render(<SectionFooter {...props} />);

    await waitFor(() => {
      expect(screen.getByText('© 2026 DragonRent')).toBeInTheDocument();
    });
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Terms')).toBeInTheDocument();
    expect(screen.getByText('SectionFooter.marketplaceCountry')).toBeInTheDocument();
  });

  it('toggles a link group that has a heading', async () => {
    const user = userEvent.setup();
    render(<SectionFooter {...props} />);

    const toggle = await screen.findByRole('button', { name: 'Company' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    // Groups without a heading are rendered without a toggle
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
