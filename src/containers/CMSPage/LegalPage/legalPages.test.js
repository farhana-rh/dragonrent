import {
  getArticleMarkdown,
  getHeadings,
  getLegalPageConfig,
  getPlainText,
  slugify,
  splitLastUpdated,
} from './legalPages';

describe('legalPages', () => {
  it('knows the legal and help pages', () => {
    expect(getLegalPageConfig('cookie-policy')).toMatchObject({
      group: 'legal',
      underReview: true,
    });
    expect(getLegalPageConfig('faq')).toMatchObject({ group: 'help', underReview: false });
    expect(getLegalPageConfig('about')).toBeNull();
  });

  it('makes heading ids, keeping Finnish letters', () => {
    expect(slugify('2. Cookies we always use')).toBe('2-cookies-we-always-use');
    expect(slugify('Mitä evästeet ovat?')).toBe('mitä-evästeet-ovat');
    expect(slugify('***')).toBe('section');
  });

  it('reads plain text from React children', () => {
    expect(getPlainText(['Read the ', { props: { children: 'terms' } }, '.'])).toBe(
      'Read the terms.'
    );
  });

  it('finds the main headings as they will be rendered', () => {
    const markdown = [
      'Intro text.',
      '## 1. What cookies are',
      'Text.',
      '### A smaller heading',
      '## 2. Cookies we **always** use',
      '# 3. [Changing](https://example.com) your choice',
    ].join('\n\n');
    expect(getHeadings(markdown)).toEqual([
      { id: '1-what-cookies-are', text: '1. What cookies are' },
      { id: '2-cookies-we-always-use', text: '2. Cookies we always use' },
      { id: '3-changing-your-choice', text: '3. Changing your choice' },
    ]);
    expect(getHeadings('')).toEqual([]);
  });

  it('splits a "Last updated" first line off the text', () => {
    expect(splitLastUpdated('\n**Last updated 17 November 2026**\n\nFirst paragraph.')).toEqual({
      lastUpdated: 'Last updated 17 November 2026',
      body: 'First paragraph.',
    });
    expect(splitLastUpdated('Päivitetty 17.11.2026\n\nTeksti.').lastUpdated).toBe(
      'Päivitetty 17.11.2026'
    );
    expect(splitLastUpdated('No date here.\n\nMore.')).toEqual({
      lastUpdated: null,
      body: 'No date here.\n\nMore.',
    });
  });

  it('joins Console blocks into one text, block titles as headings', () => {
    const blocks = [
      { title: { content: '' }, text: { content: 'Last updated 1 Jan\n\nIntro.' } },
      { title: { content: 'Second part' }, text: { content: 'More text.' } },
      { title: { content: '' }, text: { fieldType: 'markdown' } },
    ];
    expect(getArticleMarkdown(blocks)).toBe(
      'Last updated 1 Jan\n\nIntro.\n\n## Second part\n\nMore text.'
    );
  });
});
