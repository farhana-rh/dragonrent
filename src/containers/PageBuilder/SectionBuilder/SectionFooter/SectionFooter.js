import React from 'react';

import { useConfiguration } from '../../../../context/configurationContext';
import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import { openCookieSettings } from '../../../../util/cookieConsent';
import { pickFieldOptions } from '../../PageBuilder.helpers';

import { NamedLink } from '../../../../components';

import Field from '../../Field';
import BlockBuilder from '../../BlockBuilder';

import SectionContainer from '../SectionContainer';
import css from './SectionFooter.module.css';

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
 * Footer section, styled after the Main and HomeDesktop mockups: a Navy band with the
 * marketplace name and slogan, and the footer links in one grid (2 columns on phones, 3 on
 * desktop). Content (slogan, link blocks, social media links, copyright) comes from the hosted
 * footer asset (Console → Content → Footer); the links in every block are laid out together.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param {string} props.sectionId id of the section
 * @param {'footer'} props.sectionType
 * @param {Array<SocialMediaLinkConfig>?} props.socialMediaLinks array of social media link configs
 * @param {Object?} props.slogan
 * @param {Object?} props.copyright
 * @param {Object?} props.appearance
 * @param {Array<BlockConfig>?} props.blocks array of block configs
 * @param {Object} props.options extra options for the section component (e.g. custom fieldComponents)
 * @param {Object<string,FieldComponentConfig>?} props.options.fieldComponents custom fields
 * @returns {JSX.Element} footer section
 */
const SectionFooter = props => {
  const {
    sectionId,
    className,
    rootClassName,
    socialMediaLinks = [],
    slogan,
    appearance,
    copyright,
    blocks = [],
    options,
  } = props;
  const config = useConfiguration();
  const intl = useIntl();

  // If external mapping has been included for fields
  // E.g. { h1: { component: MyAwesomeHeader } }
  const fieldOptions = pickFieldOptions(options);
  const linksWithBlockId = socialMediaLinks?.map(sml => ({
    ...sml,
    blockId: sml.link.platform,
  }));
  const showSocialMediaLinks = socialMediaLinks?.length > 0;

  return (
    <SectionContainer
      as="footer"
      id={sectionId}
      className={className}
      // Replace SectionContainer's own root class: it paints odd sections white, which would
      // override the Navy footer band
      rootClassName={rootClassName || css.root}
      appearance={appearance}
      options={fieldOptions}
    >
      <div className={css.footer}>
        <div className={css.brand}>
          <NamedLink name="LandingPage" className={css.brandName}>
            {config.marketplaceName}
          </NamedLink>
          <Field data={slogan} className={css.slogan} />
          {showSocialMediaLinks ? (
            <div className={css.icons}>
              <BlockBuilder blocks={linksWithBlockId} sectionId={sectionId} options={options} />
            </div>
          ) : null}
        </div>

        {blocks.length > 0 ? (
          <nav
            className={css.links}
            aria-label={intl.formatMessage({ id: 'SectionFooter.linksLabel' })}
          >
            <BlockBuilder blocks={blocks} sectionId={sectionId} options={options} />
          </nav>
        ) : null}

        <div className={css.bottomRow}>
          <Field data={copyright} className={css.copyright} />
          <button type="button" className={css.cookieSettings} onClick={openCookieSettings}>
            <FormattedMessage id="SectionFooter.cookieSettings" />
          </button>
        </div>
      </div>
    </SectionContainer>
  );
};

export default SectionFooter;
