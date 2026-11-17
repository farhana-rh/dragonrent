import React from 'react';

import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import { openCookieSettings } from '../../../../util/cookieConsent';
import { categorySearchTo } from '../../../../util/search';
import { pickFieldOptions } from '../../PageBuilder.helpers';

import { NamedLink } from '../../../../components';

import SectionContainer from '../SectionContainer';
import css from './SectionFooter.module.css';

// Link columns, as in the HomeSticker.html footer. Explore links go to a category search
// (Console category ids); Help pages are Console pages (/p/<pageId>).
// "Lender protection" is the lender section on the homepage (LandingPage TRUST_SECTION_ID).
const COLUMNS = [
  {
    id: 'explore',
    links: [
      { id: 'tools', categoryId: 'Tools' },
      { id: 'partyEvents', categoryId: 'Party-Event' },
      { id: 'sports', categoryId: 'Sports' },
      { id: 'cameras', categoryId: 'Cameras' },
    ],
  },
  {
    id: 'lend',
    links: [
      { id: 'lendAnItem', route: 'NewListingPage' },
      { id: 'lenderProtection', href: '/#trust-and-safety' },
      { id: 'howItWorks', pageId: 'how-it-works' },
    ],
  },
  {
    id: 'help',
    links: [
      { id: 'faq', pageId: 'faq' },
      { id: 'cancellationPolicy', pageId: 'cancellation-policy' },
      { id: 'damagePolicy', pageId: 'damage-policy' },
      { id: 'terms', pageId: 'terms-of-service' },
      { id: 'privacy', pageId: 'privacy-policy' },
      { id: 'cookiePolicy', pageId: 'cookie-policy' },
    ],
  },
];

/**
 * DragonRent logo mark (dragon eye with a keyhole pupil), cream outlines for the ink footer.
 * Same drawing as dragonrent-design/brand/dragonrent-logo-on-ink.png.
 */
const LogoMarkOnInk = () => (
  <svg
    className={css.brandMark}
    width="40"
    height="35"
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

  if (link.categoryId) {
    return (
      <NamedLink className={css.link} name="SearchPage" to={categorySearchTo(link.categoryId)}>
        {label}
      </NamedLink>
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
 * "The neighbourhood digest" sign-up from the mockup. DragonRent has no newsletter service yet,
 * so the form is shown but switched off and labelled "Coming soon": it never collects an address
 * it can't use. To turn it on, connect an email tool (e.g. Mailchimp, Brevo) and submit there.
 */
const NeighbourhoodDigest = () => {
  const intl = useIntl();
  return (
    <form
      className={css.digest}
      aria-describedby="footer-digest-note"
      onSubmit={e => e.preventDefault()}
    >
      <p className={css.digestTitle}>
        <FormattedMessage id="SectionFooter.digest.title" />
        <span className={css.soonSticker}>
          <FormattedMessage id="SectionFooter.digest.soon" />
        </span>
      </p>
      <p id="footer-digest-note" className={css.digestText}>
        <FormattedMessage id="SectionFooter.digest.text" />
      </p>
      <div className={css.digestRow}>
        <label htmlFor="footer-digest-email" className={css.visuallyHidden}>
          <FormattedMessage id="SectionFooter.digest.emailLabel" />
        </label>
        <input
          id="footer-digest-email"
          className={css.digestInput}
          type="email"
          placeholder={intl.formatMessage({ id: 'SectionFooter.digest.emailPlaceholder' })}
          disabled
        />
        <label htmlFor="footer-digest-area" className={css.visuallyHidden}>
          <FormattedMessage id="SectionFooter.digest.areaLabel" />
        </label>
        <select id="footer-digest-area" className={css.digestSelect} disabled defaultValue="">
          <option value="">
            {intl.formatMessage({ id: 'SectionFooter.digest.areaPlaceholder' })}
          </option>
        </select>
        <button type="submit" className={css.digestButton} disabled>
          <FormattedMessage id="SectionFooter.digest.button" />
        </button>
      </div>
    </form>
  );
};

/**
 * DragonRent footer, built from the HomeSticker.html mockup: an ink band with the brand,
 * slogan and neighbourhood digest in the first column, then Explore, Lend and Help link
 * columns, and a bottom row with the copyright, Stripe note and Cookie settings. Copy lives in
 * translations (SectionFooter.*) and links in COLUMNS, so the Console footer content (template
 * placeholders) is not shown.
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
        <div className={css.grid}>
          <div className={css.brand}>
            <NamedLink name="LandingPage" className={css.brandLink}>
              <LogoMarkOnInk />
              <span className={css.brandName}>DragonRent</span>
            </NamedLink>
            <p className={css.slogan}>
              <FormattedMessage id="SectionFooter.slogan" />
            </p>
            <NeighbourhoodDigest />
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

        <div className={css.bottomRow}>
          <p className={css.bottomText}>
            <FormattedMessage id="SectionFooter.copyright" values={{ year }} />
          </p>
          <div className={css.bottomRight}>
            <p className={css.bottomText}>
              <FormattedMessage id="SectionFooter.paymentsNote" />
            </p>
            {/* Reopens the cookie banner, so visitors can change their choice */}
            <button type="button" className={css.cookieSettings} onClick={openCookieSettings}>
              <FormattedMessage id="SectionFooter.cookieSettings" />
            </button>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};

export default SectionFooter;
