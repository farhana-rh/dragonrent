import React from 'react';

import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import { openCookieSettings } from '../../../../util/cookieConsent';
import { pickFieldOptions } from '../../PageBuilder.helpers';

import { NamedLink } from '../../../../components';

import SectionContainer from '../SectionContainer';
import css from './SectionFooter.module.css';

// Link columns. Pages with a pageId are Console pages (/p/<pageId>); the rest are app routes.
// "Trust & Safety" is the lender section on the homepage (LandingPage TRUST_SECTION_ID).
const COLUMNS = [
  {
    id: 'explore',
    links: [
      { id: 'browse', route: 'SearchPage' },
      { id: 'howItWorks', pageId: 'how-it-works' },
      { id: 'trustAndSafety', href: '/#trust-and-safety' },
    ],
  },
  {
    id: 'lend',
    links: [
      { id: 'lendAnItem', route: 'NewListingPage' },
      { id: 'yourListings', route: 'ManageListingsPage' },
      { id: 'dashboard', route: 'DashboardPage' },
    ],
  },
  {
    id: 'help',
    links: [
      { id: 'faq', pageId: 'faq' },
      { id: 'cancellationPolicy', pageId: 'cancellation-policy' },
      { id: 'damagePolicy', pageId: 'damage-policy' },
    ],
  },
  {
    id: 'legal',
    links: [
      { id: 'terms', pageId: 'terms-of-service' },
      { id: 'privacy', pageId: 'privacy-policy' },
      { id: 'cookieSettings', isCookieSettings: true },
    ],
  },
];

// Plain facts about how payments work today, shown as the footer's calm trust line
const TRUST_ITEMS = [
  { id: 'stripePayments', icon: 'lock' },
  { id: 'stripeVerified', icon: 'shield' },
  { id: 'euros', icon: 'tag' },
];

const TRUST_ICON_PATHS = {
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
  shield: 'M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6zM9 12l2 2 4-4',
  tag: 'M3 12V4h8l10 10-8 8zM7.5 8.5h.01',
};

const TrustIcon = props => (
  <svg
    className={css.trustIcon}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d={TRUST_ICON_PATHS[props.name]}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * DragonRent logo mark (dragon eye with a keyhole pupil), cream outlines for the ink footer.
 * Same drawing as dragonrent-design/brand/dragonrent-logo-on-ink.png.
 */
const LogoMarkOnInk = props => (
  <svg
    className={props.className}
    width="46"
    height="40"
    viewBox="0 1 64 55"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M16 25 C14 17 10.5 10 5 4.5 C13 6.5 21 12 27.5 19 Z"
      fill="#FF5733"
      stroke="#FAF8F5"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path
      d="M48 25 C50 17 53.5 10 59 4.5 C51 6.5 43 12 36.5 19 Z"
      fill="#FF5733"
      stroke="#FAF8F5"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path
      d="M4 34 C14 20 23 15.5 32 15.5 C41 15.5 50 20 60 34 C50 48 41 52.5 32 52.5 C23 52.5 14 48 4 34 Z"
      fill="#FF5733"
      stroke="#FAF8F5"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <circle cx="32" cy="34" r="13" fill="#FFC300" stroke="#FAF8F5" strokeWidth="3" />
    <circle cx="32" cy="30.5" r="4" fill="#111" />
    <path d="M30 32 L34 32 L35.6 42 L28.4 42 Z" fill="#111" />
  </svg>
);

const FooterLink = props => {
  const { link } = props;
  const label = <FormattedMessage id={`SectionFooter.link.${link.id}`} />;

  if (link.isCookieSettings) {
    // Reopens the cookie banner, so visitors can change their choice
    return (
      <button type="button" className={css.linkButton} onClick={openCookieSettings}>
        {label}
      </button>
    );
  }
  if (link.pageId) {
    return (
      <NamedLink className={css.link} name="CMSPage" params={{ pageId: link.pageId }}>
        {label}
      </NamedLink>
    );
  }
  if (link.route) {
    return (
      <NamedLink className={css.link} name={link.route}>
        {label}
      </NamedLink>
    );
  }
  return (
    <a className={css.link} href={link.href}>
      {label}
    </a>
  );
};

/**
 * DragonRent footer, sticker design (17 Nov): a playful "lend your things" sticker card on top,
 * then a calm ink band with the logo, four link columns, a trust line with how payments work,
 * and the copyright. Copy lives in translations (SectionFooter.*) and links in COLUMNS, so the
 * footer no longer shows the Console footer content (slogan, blocks, social links, copyright),
 * which still held the template's placeholders.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.sectionId id of the section
 * @param {string?} props.className add more style rules in addition to component's own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param {Object?} props.appearance section appearance from Console (background colour etc.)
 * @param {Object?} props.options extra options for the section component
 * @returns {JSX.Element} footer
 */
const SectionFooter = props => {
  const { sectionId, className, rootClassName, appearance, options } = props;
  const intl = useIntl();
  const fieldOptions = pickFieldOptions(options);
  const year = new Date().getFullYear();

  return (
    <SectionContainer
      as="footer"
      id={sectionId}
      className={className}
      // Replace SectionContainer's own root class: it paints odd sections white, which would
      // override the ink footer band
      rootClassName={rootClassName || css.root}
      appearance={appearance}
      options={fieldOptions}
    >
      <div className={css.inner}>
        <div className={css.cta}>
          <LogoMarkOnInk className={css.ctaMark} />
          <div className={css.ctaText}>
            <p className={css.ctaTitle}>
              <FormattedMessage id="SectionFooter.cta.title" />
            </p>
            <p className={css.ctaBody}>
              <FormattedMessage id="SectionFooter.cta.text" />
            </p>
          </div>
          <NamedLink name="NewListingPage" className={css.ctaButton}>
            <FormattedMessage id="SectionFooter.cta.button" />
          </NamedLink>
        </div>

        <div className={css.main}>
          <div className={css.brand}>
            <NamedLink name="LandingPage" className={css.brandLink}>
              <LogoMarkOnInk className={css.brandMark} />
              <span className={css.brandName}>
                Dragon<span className={css.brandNameAccent}>Rent</span>
              </span>
            </NamedLink>
            <p className={css.tagline}>
              <FormattedMessage id="SectionFooter.tagline" />
            </p>
            <span className={css.areaSticker}>
              <FormattedMessage id="SectionFooter.area" />
            </span>
          </div>

          <nav
            className={css.columns}
            aria-label={intl.formatMessage({ id: 'SectionFooter.linksLabel' })}
          >
            {COLUMNS.map(column => (
              <div key={column.id} className={css.column}>
                <p className={css.columnTitle}>
                  <FormattedMessage id={`SectionFooter.column.${column.id}`} />
                </p>
                <ul className={css.linkList}>
                  {column.links.map(link => (
                    <li key={link.id}>
                      <FooterLink link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <ul className={css.trustRow}>
          {TRUST_ITEMS.map(item => (
            <li key={item.id} className={css.trustItem}>
              <TrustIcon name={item.icon} />
              <FormattedMessage id={`SectionFooter.trust.${item.id}`} />
            </li>
          ))}
        </ul>

        <div className={css.bottomRow}>
          <p className={css.copyright}>
            <FormattedMessage id="SectionFooter.copyright" values={{ year }} />
          </p>
          <p className={css.madeFor}>
            <FormattedMessage id="SectionFooter.madeFor" />
          </p>
        </div>
      </div>
    </SectionContainer>
  );
};

export default SectionFooter;
