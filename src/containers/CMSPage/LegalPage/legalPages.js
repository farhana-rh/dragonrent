import { default as unified } from 'unified';
import remarkParse from 'remark-parse';
import remark2rehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';

// DragonRent legal and help pages (Console pages, /p/<pageId>). They share one calm layout
// (SectionLegalArticle, approved canvas 17 Nov): "Legal"/"Help" label, title, "Last updated", a
// "Draft, needs legal review" tag while the lawyer hasn't approved the page, a contents list
// built from the text's headings, and links to the other policies.
//
// When the lawyer approves a page, set its `underReview` to false.
export const LEGAL_PAGES = [
  { pageId: 'terms-of-service', labelId: 'LegalPage.link.terms', underReview: true },
  { pageId: 'privacy-policy', labelId: 'LegalPage.link.privacy', underReview: true },
  {
    pageId: 'cancellation-policy',
    labelId: 'LegalPage.link.cancellationPolicy',
    underReview: true,
  },
  { pageId: 'cookie-policy', labelId: 'LegalPage.link.cookiePolicy', underReview: true },
  { pageId: 'damage-policy', labelId: 'LegalPage.link.damagePolicy', underReview: true },
];

const HELP_PAGES = [{ pageId: 'faq', labelId: 'LegalPage.link.faq', underReview: false }];

// The contents list is shown when the text has at least this many sections
export const MIN_HEADINGS_FOR_CONTENTS = 3;

/**
 * Layout config of a legal or help page, or null for other Console pages.
 *
 * @param {string} pageId Console page id
 * @returns {Object|null} { pageId, labelId, underReview, group: 'legal' | 'help' }
 */
export const getLegalPageConfig = pageId => {
  const legal = LEGAL_PAGES.find(p => p.pageId === pageId);
  if (legal) {
    return { ...legal, group: 'legal' };
  }
  const help = HELP_PAGES.find(p => p.pageId === pageId);
  return help ? { ...help, group: 'help' } : null;
};

/**
 * Text of a heading as it is rendered: from a string, React children or a hast node.
 *
 * @param {*} node string, array, React element or hast node
 * @returns {string} plain text
 */
export const getPlainText = node => {
  if (node == null || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(getPlainText).join('');
  }
  if (node.type === 'text') {
    return node.value || '';
  }
  if (node.children) {
    return getPlainText(node.children);
  }
  if (node.props) {
    return getPlainText(node.props.children);
  }
  return '';
};

/**
 * Anchor id for a heading, e.g. "2. Cookies we always use" → "2-cookies-we-always-use".
 * Keeps letters of any language (ä, ö…).
 *
 * @param {string} text heading text
 * @returns {string} id
 */
export const slugify = text =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'section';

/**
 * Main headings (# and ##) of the markdown text, with the ids the rendered headings get.
 * Uses the same parser and sanitizer as the page, so the text matches what is shown.
 *
 * @param {string} markdown page text
 * @returns {Array<{ id: string, text: string }>} headings
 */
export const getHeadings = markdown => {
  if (!markdown) {
    return [];
  }
  const processor = unified()
    .use(remarkParse)
    .use(remark2rehype)
    .use(rehypeSanitize);
  const tree = processor.runSync(processor.parse(markdown));
  return (tree.children || [])
    .filter(node => node.type === 'element' && ['h1', 'h2'].includes(node.tagName))
    .map(node => getPlainText(node).trim())
    .filter(text => text.length > 0)
    .map(text => ({ id: slugify(text), text }));
};

const LAST_UPDATED_PATTERN = /^[*_\s]*(last updated|updated|päivitetty)\b/i;

/**
 * Splits a "Last updated …" first line off the page text, so the layout can show it under the
 * title. Other text is returned unchanged.
 *
 * @param {string} markdown page text
 * @returns {{ lastUpdated: string|null, body: string }}
 */
export const splitLastUpdated = markdown => {
  const text = markdown || '';
  const lines = text.split(/\r?\n/);
  const firstIndex = lines.findIndex(line => line.trim().length > 0);
  if (firstIndex === -1 || !LAST_UPDATED_PATTERN.test(lines[firstIndex])) {
    return { lastUpdated: null, body: text };
  }
  const lastUpdated = lines[firstIndex].replace(/[*_]/g, '').trim();
  const body = lines
    .slice(firstIndex + 1)
    .join('\n')
    .replace(/^\s+/, '');
  return { lastUpdated, body };
};

/**
 * The page text from a Console article section: each block's title becomes a "##" heading,
 * followed by the block's markdown text.
 *
 * @param {Array<Object>} blocks Console blocks
 * @returns {string} markdown
 */
export const getArticleMarkdown = (blocks = []) =>
  blocks
    .map(block => {
      const title = block?.title?.content?.trim();
      const text = block?.text?.content || '';
      return [title ? `## ${title}` : '', text].filter(Boolean).join('\n\n');
    })
    .filter(Boolean)
    .join('\n\n');
