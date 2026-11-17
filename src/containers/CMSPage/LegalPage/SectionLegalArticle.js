import React from 'react';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';

import { NamedLink } from '../../../components';

import renderMarkdown from '../../PageBuilder/markdownProcessor';
import { Link } from '../../PageBuilder/Primitives/Link';

import {
  LEGAL_PAGES,
  MIN_HEADINGS_FOR_CONTENTS,
  getArticleMarkdown,
  getHeadings,
  getPlainText,
  slugify,
  splitLastUpdated,
} from './legalPages';
import css from './SectionLegalArticle.module.css';

const IconWarning = () => (
  <svg
    className={css.draftIcon}
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 9v4M12 17h.01" />
    <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
  </svg>
);

const IconArrow = () => (
  <svg
    className={css.arrowIcon}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/**
 * Markdown elements in the legal text style. Main headings get the ids the contents list links to.
 */
const MainHeading = props => {
  const { children } = props;
  return (
    <h2 id={slugify(getPlainText(children).trim())} className={css.textHeading}>
      {children}
    </h2>
  );
};

const MARKDOWN_COMPONENTS = {
  h1: MainHeading,
  h2: MainHeading,
  h3: props => <h3 className={css.textSubheading}>{props.children}</h3>,
  h4: props => <h4 className={css.textMinorHeading}>{props.children}</h4>,
  h5: props => <h4 className={css.textMinorHeading}>{props.children}</h4>,
  h6: props => <h4 className={css.textMinorHeading}>{props.children}</h4>,
  p: props => <p className={css.textParagraph}>{props.children}</p>,
  ul: props => <ul className={css.textList}>{props.children}</ul>,
  ol: props => <ol className={css.textOrderedList}>{props.children}</ol>,
  li: props => <li className={css.textListItem}>{props.children}</li>,
  a: props => <Link {...props} className={css.textLink} />,
  img: () => null,
};

const ContentsLinks = ({ headings }) => (
  <ol className={css.contentsList}>
    {headings.map(heading => (
      <li key={heading.id}>
        <a className={css.contentsLink} href={`#${heading.id}`}>
          {heading.text}
        </a>
      </li>
    ))}
  </ol>
);

/**
 * Article section for DragonRent's legal and help Console pages (replaces PageBuilder's
 * "article" section on those pages). Title and description come from the Console section, the
 * text from its blocks; "Last updated" is the text's first line when it starts so.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @param {Object?} props.title Console title field
 * @param {Object?} props.description Console description field
 * @param {Array<Object>?} props.blocks Console blocks (markdown text)
 * @param {Object} props.options
 * @param {Object} props.options.legalPage { pageId, group, underReview } from legalPages.js
 * @returns {JSX.Element} legal page article
 */
const SectionLegalArticle = props => {
  const intl = useIntl();
  const { sectionId, title, description, blocks = [], options } = props;
  const { pageId, group, underReview } = options?.legalPage || {};

  const titleText = title?.content;
  const descriptionText = description?.content;
  const { lastUpdated, body } = splitLastUpdated(getArticleMarkdown(blocks));
  const headings = getHeadings(body);
  const showContents = headings.length >= MIN_HEADINGS_FOR_CONTENTS;
  const contentsLabel = intl.formatMessage({ id: 'LegalPage.contentsTitle' });

  const otherPolicies = LEGAL_PAGES.filter(p => p.pageId !== pageId);
  const isHelpPage = group === 'help';

  return (
    <section id={sectionId} className={css.root}>
      <div className={css.container}>
        <header className={css.header}>
          <span className={css.eyebrow}>
            <FormattedMessage
              id={isHelpPage ? 'LegalPage.eyebrowHelp' : 'LegalPage.eyebrowLegal'}
            />
          </span>
          {titleText ? <h1 className={css.title}>{titleText}</h1> : null}
          {lastUpdated || underReview ? (
            <div className={css.meta}>
              {lastUpdated ? <span>{lastUpdated}</span> : null}
              {underReview ? (
                <span className={css.draftTag}>
                  <IconWarning />
                  <FormattedMessage id="LegalPage.draftTag" />
                </span>
              ) : null}
            </div>
          ) : null}
          {descriptionText ? <p className={css.lead}>{descriptionText}</p> : null}
        </header>

        <div className={css.columns}>
          {showContents ? (
            <>
              <nav className={css.contentsDesktop} aria-label={contentsLabel}>
                <p className={css.contentsTitle}>{contentsLabel}</p>
                <ContentsLinks headings={headings} />
              </nav>
              <details className={css.contentsMobile}>
                <summary className={css.contentsSummary}>{contentsLabel}</summary>
                <nav aria-label={contentsLabel}>
                  <ContentsLinks headings={headings} />
                </nav>
              </details>
            </>
          ) : null}

          <article className={css.text}>{renderMarkdown(body, MARKDOWN_COMPONENTS)}</article>
        </div>

        <section className={css.policies} aria-labelledby={`${sectionId}-policies`}>
          <h2 id={`${sectionId}-policies`} className={css.policiesTitle}>
            <FormattedMessage id={isHelpPage ? 'LegalPage.policies' : 'LegalPage.otherPolicies'} />
          </h2>
          <ul className={css.policyList}>
            {otherPolicies.map(policy => (
              <li key={policy.pageId} className={css.policyItem}>
                <NamedLink
                  className={css.policyLink}
                  name="CMSPage"
                  params={{ pageId: policy.pageId }}
                >
                  <FormattedMessage id={policy.labelId} />
                  <IconArrow />
                </NamedLink>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
};

export default SectionLegalArticle;
