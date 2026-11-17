import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../../util/testHelpers';

import SectionLegalArticle from './SectionLegalArticle';
import { getLegalPageConfig } from './legalPages';

const { screen } = testingLibrary;

const cookiePolicyText = [
  'Last updated 17 November 2026',
  '## 1. What cookies are',
  'Cookies are small files.',
  '## 2. Cookies we always use',
  '- **st-…-token** (DragonRent): keeps you signed in.',
  '## 3. Analytics, only with your OK',
  'Read the [Privacy policy](/p/privacy-policy).',
].join('\n\n');

const renderSection = (pageId, text = cookiePolicyText) =>
  render(
    <SectionLegalArticle
      sectionId="section-1"
      sectionType="article"
      title={{ fieldType: 'heading1', content: 'Cookie policy' }}
      description={{ fieldType: 'paragraph', content: 'Which cookies DragonRent uses.' }}
      blocks={[{ blockType: 'defaultBlock', text: { fieldType: 'markdown', content: text } }]}
      options={{ legalPage: getLegalPageConfig(pageId) }}
    />
  );

describe('SectionLegalArticle', () => {
  it('shows the title block with Last updated and the draft tag', () => {
    renderSection('cookie-policy');
    expect(screen.getByRole('heading', { level: 1, name: 'Cookie policy' })).toBeInTheDocument();
    expect(screen.getByText('LegalPage.eyebrowLegal')).toBeInTheDocument();
    expect(screen.getByText('Last updated 17 November 2026')).toBeInTheDocument();
    expect(screen.getByText('LegalPage.draftTag')).toBeInTheDocument();
    expect(screen.getByText('Which cookies DragonRent uses.')).toBeInTheDocument();
  });

  it('links the contents list to the text headings', () => {
    renderSection('cookie-policy');
    const heading = screen.getByRole('heading', { level: 2, name: '2. Cookies we always use' });
    expect(heading).toHaveAttribute('id', '2-cookies-we-always-use');
    // desktop nav and the folded phone list
    const links = screen.getAllByRole('link', { name: '2. Cookies we always use' });
    expect(links).toHaveLength(2);
    links.forEach(link => expect(link).toHaveAttribute('href', '#2-cookies-we-always-use'));
  });

  it('renders the markdown text and links', () => {
    renderSection('cookie-policy');
    expect(screen.getByText('st-…-token')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privacy policy' })).toHaveAttribute(
      'href',
      '/p/privacy-policy'
    );
  });

  it('links to the other policies, not to itself', () => {
    renderSection('cookie-policy');
    expect(screen.getByText('LegalPage.otherPolicies')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /LegalPage.link.terms/ })).toHaveAttribute(
      'href',
      '/p/terms-of-service'
    );
    expect(screen.queryByRole('link', { name: /LegalPage.link.cookiePolicy/ })).toBeNull();
  });

  it('FAQ: Help label, no draft tag, all policies', () => {
    renderSection('faq', 'Short answers.');
    expect(screen.getByText('LegalPage.eyebrowHelp')).toBeInTheDocument();
    expect(screen.queryByText('LegalPage.draftTag')).toBeNull();
    expect(screen.getByText('LegalPage.policies')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /LegalPage.link.cookiePolicy/ })).toBeInTheDocument();
    // fewer than three headings: no contents list
    expect(screen.queryByText('LegalPage.contentsTitle')).toBeNull();
  });
});
