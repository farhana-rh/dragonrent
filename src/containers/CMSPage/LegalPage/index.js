import SectionLegalArticle from './SectionLegalArticle';
import { getLegalPageConfig } from './legalPages';

export { LEGAL_PAGES, getLegalPageConfig } from './legalPages';

/**
 * PageBuilder options for a legal or help page: its "article" sections use the legal layout.
 * Returns undefined for other pages, so they keep the default PageBuilder sections.
 *
 * @param {string} pageId Console page id
 * @returns {Object|undefined} PageBuilder options
 */
export const getLegalPageOptions = pageId => {
  const legalPage = getLegalPageConfig(pageId);
  return legalPage
    ? { sectionComponents: { article: { component: SectionLegalArticle } }, legalPage }
    : undefined;
};
