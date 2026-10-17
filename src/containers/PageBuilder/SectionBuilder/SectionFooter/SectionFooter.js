import React, { useState } from 'react';
import classNames from 'classnames';

import { useConfiguration } from '../../../../context/configurationContext';
import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import { pickFieldOptions } from '../../PageBuilder.helpers';

import { IconArrowHead, LinkedLogo } from '../../../../components';

import Field from '../../Field';
import BlockBuilder from '../../BlockBuilder';

import SectionContainer from '../SectionContainer';
import css from './SectionFooter.module.css';

// The number of columns (numberOfColumns) affects styling
const GRID_CSS = [css.gridCol1, css.gridCol2, css.gridCol3, css.gridCol4];

const getGridCss = numberOfColumns => GRID_CSS[numberOfColumns - 1] || GRID_CSS[0];

// Matches the first markdown heading line, e.g. "##### Marketplace"
const HEADING_REGEX = /^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/m;

/**
 * Pick the first heading from a footer block's markdown content.
 * On mobile, the heading becomes the toggle button of a collapsible link group.
 *
 * @param {Object} block footer block config
 * @returns {string|null} plain-text heading or null if the block has no heading
 */
export const getBlockHeading = block => {
  const content = block?.text?.content;
  if (typeof content !== 'string') {
    return null;
  }
  const match = content.match(HEADING_REGEX);
  // Strip basic inline markdown (links, emphasis) from the heading text
  return match
    ? match[1]
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/[*_`]/g, '')
        .trim() || null
    : null;
};

/**
 * Footer link group. On mobile and tablet, groups with a heading collapse into an accordion;
 * on desktop all groups are always expanded.
 */
const FooterColumn = props => {
  const { block, sectionId, options } = props;
  const [isOpen, setIsOpen] = useState(false);
  const heading = getBlockHeading(block);
  const bodyId = `${sectionId}-${block.blockId || 'block'}-links`;

  if (!heading) {
    return (
      <div className={css.column}>
        <BlockBuilder blocks={[block]} sectionId={sectionId} options={options} />
      </div>
    );
  }

  return (
    <div className={classNames(css.column, css.collapsibleColumn)}>
      <h2 className={css.toggleHeading}>
        <button
          type="button"
          className={css.toggleButton}
          aria-expanded={isOpen}
          aria-controls={bodyId}
          onClick={() => setIsOpen(open => !open)}
        >
          <span>{heading}</span>
          <IconArrowHead
            direction={isOpen ? 'up' : 'down'}
            size="small"
            rootClassName={css.toggleIcon}
          />
        </button>
      </h2>
      <div id={bodyId} className={classNames(css.columnBody, { [css.columnBodyOpen]: isOpen })}>
        <BlockBuilder blocks={[block]} sectionId={sectionId} options={options} />
      </div>
    </div>
  );
};

/**
 * Informational labels for the marketplace's language, currency and country.
 * These are not switchers: the marketplace currently runs in one locale and one currency.
 */
const MarketplaceLocaleInfo = () => {
  const config = useConfiguration();
  const intl = useIntl();
  const { locale } = config.localization || {};
  const currency = config.currency;

  const language = locale ? locale.split('-')[0] : null;
  const languageName = language
    ? intl.formatDisplayName(language, { type: 'language' }) || language
    : null;

  const currencySymbol = currency
    ? intl
        .formatNumberToParts(0, {
          style: 'currency',
          currency,
          currencyDisplay: 'narrowSymbol',
        })
        .find(part => part.type === 'currency')?.value
    : null;
  const currencyLabel =
    currencySymbol && currencySymbol !== currency ? `${currencySymbol} ${currency}` : currency;

  return (
    <ul
      className={css.localeList}
      aria-label={intl.formatMessage({ id: 'SectionFooter.localeInfoLabel' })}
    >
      {languageName ? (
        <li className={css.localeItem}>
          <svg
            className={css.localeIcon}
            width="14"
            height="14"
            viewBox="0 0 16 16"
            aria-hidden="true"
            focusable="false"
          >
            <g fill="none" stroke="currentColor" strokeWidth="1.3">
              <circle cx="8" cy="8" r="6.5" />
              <path d="M1.5 8h13M8 1.5c1.8 1.8 2.7 4 2.7 6.5S9.8 12.7 8 14.5M8 1.5C6.2 3.3 5.3 5.5 5.3 8s.9 4.7 2.7 6.5" />
            </g>
          </svg>
          <span className={css.capitalize}>{languageName}</span>
        </li>
      ) : null}
      {currencyLabel ? <li className={css.localeItem}>{currencyLabel}</li> : null}
      <li className={css.localeItem}>
        <FormattedMessage id="SectionFooter.marketplaceCountry" />
      </li>
    </ul>
  );
};

/**
 * @typedef {Object} SocialMediaLinkConfig
 * @property {'socialMediaLink'} fieldType
 * @property {string} platform
 * @property {string} url
 */

/**
 * @typedef {Object} BlockConfig
 * @property {string} blockId
 * @property {string} blockName
 * @property {'defaultBlock' | 'footerBlock' | 'socialMediaLink'} blockType
 */

/**
 * @typedef {Object} FieldComponentConfig
 * @property {ReactNode} component
 * @property {Function} pickValidProps
 */

/**
 * Footer section. Content (link groups, slogan, copyright, social media links) comes from the
 * hosted footer asset (Console → Content → Footer). Each footer block is rendered as a link
 * column; a markdown heading at the start of a block becomes the column title.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param {string} props.sectionId id of the section
 * @param {'footer'} props.sectionType
 * @param {number} props.numberOfColumns columns for blocks in footer (1-4)
 * @param {Array<SocialMediaLinkConfig>?} props.socialMediaLinks array of social media link configs
 * @param {Object?} props.slogan
 * @param {Object?} props.copyright
 * @param {Object?} props.appearance
 * @param {Array<BlockConfig>?} props.blocks array of block configs
 * @param {Object} props.options extra options for the section component (e.g. custom fieldComponents)
 * @param {Object<string,FieldComponentConfig>?} props.options.fieldComponents custom fields
 * @returns {JSX.Element} Section for article content
 */
const SectionFooter = props => {
  const {
    sectionId,
    className,
    rootClassName,
    numberOfColumns = 1,
    socialMediaLinks = [],
    slogan,
    appearance,
    copyright,
    blocks = [],
    options,
    linkLogoToExternalSite,
  } = props;

  // If external mapping has been included for fields
  // E.g. { h1: { component: MyAwesomeHeader } }
  const fieldOptions = pickFieldOptions(options);
  const linksWithBlockId = socialMediaLinks?.map(sml => {
    return {
      ...sml,
      blockId: sml.link.platform,
    };
  });

  const showSocialMediaLinks = socialMediaLinks?.length > 0;

  return (
    <SectionContainer
      as="footer"
      id={sectionId}
      className={className || css.root}
      rootClassName={rootClassName}
      appearance={appearance}
      options={fieldOptions}
    >
      <div className={css.footer}>
        <div className={classNames(css.top, getGridCss(numberOfColumns))}>
          <div className={css.brand}>
            <LinkedLogo
              rootClassName={css.logoLink}
              logoClassName={css.logoWrapper}
              logoImageClassName={css.logoImage}
              linkToExternalSite={linkLogoToExternalSite}
              layout="desktop"
            />
            <Field data={slogan} className={css.slogan} />
            {showSocialMediaLinks ? (
              <div className={css.icons}>
                <BlockBuilder blocks={linksWithBlockId} sectionId={sectionId} options={options} />
              </div>
            ) : null}
          </div>
          {blocks.map((block, i) => (
            <FooterColumn
              key={block.blockId || `footer-block-${i}`}
              block={block}
              sectionId={sectionId}
              options={options}
            />
          ))}
        </div>
        <div className={css.bottom}>
          <Field data={copyright} className={css.copyright} />
          <MarketplaceLocaleInfo />
        </div>
      </div>
    </SectionContainer>
  );
};

export default SectionFooter;
