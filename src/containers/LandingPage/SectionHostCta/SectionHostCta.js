import React from 'react';

import { FormattedMessage } from '../../../util/reactIntl';

import { NamedLink } from '../../../components';

import { lenderPoints } from '../landingPageConfig';

import css from './SectionHostCta.module.css';

// 24px line icons with a 2px stroke, always next to a heading
const ICON_PATHS = {
  userCheck: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM3 21v-1a6 6 0 0 1 12 0v1M16 11l2 2 4-4',
  card: 'M3 6h18v12H3zM3 10h18M7 15h4',
  pin:
    'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  lifebuoy:
    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6',
};

const PointIcon = props => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d={ICON_PATHS[props.name]}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <path
      d="M10 4v12M4 10h12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * "What if something breaks?" for people who lend (HomeSticker.html lender protection path),
 * with the one call to action to start lending. A trust zone: white, hairlines, plain words.
 * Every point is how DragonRent works today (see lenderPoints in landingPageConfig); the
 * mockup's insurance, deposits, ID checks and payout-time promises are left out.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @returns {JSX.Element} lender section
 */
const SectionHostCta = props => {
  const { sectionId } = props;
  const titleId = `${sectionId}-title`;

  return (
    <section id={sectionId} className={css.root} aria-labelledby={titleId}>
      <div className={css.band}>
        <div className={css.content}>
          <div className={css.intro}>
            <span className={css.eyebrow}>
              <FormattedMessage id="LandingPage.lenderPath.eyebrow" />
            </span>
            <h2 id={titleId} className={css.title}>
              <FormattedMessage id="LandingPage.lenderPath.title" />
            </h2>
            <p className={css.description}>
              <FormattedMessage id="LandingPage.lenderPath.text" />
            </p>
            <NamedLink name="NewListingPage" className={css.button}>
              <PlusIcon />
              <FormattedMessage id="LandingPage.lenderPath.button" />
            </NamedLink>
            <p className={css.feeNote}>
              <FormattedMessage id="LandingPage.lenderPath.feeNote" />
            </p>
          </div>

          <ul className={css.points}>
            {lenderPoints.map(point => (
              <li key={point.id} className={css.point}>
                <span className={css.pointIcon}>
                  <PointIcon name={point.icon} />
                </span>
                <div className={css.pointText}>
                  <h3 className={css.pointTitle}>
                    <FormattedMessage id={`LandingPage.lenderPath.${point.id}.title`} />
                  </h3>
                  <p className={css.pointDescription}>
                    <FormattedMessage
                      id={`LandingPage.lenderPath.${point.id}.text`}
                      values={{
                        damagePolicyLink: (
                          <NamedLink
                            className={css.inlineLink}
                            name="CMSPage"
                            params={{ pageId: 'damage-policy' }}
                          >
                            <FormattedMessage id="LandingPage.lenderPath.damagePolicyLink" />
                          </NamedLink>
                        ),
                      }}
                    />
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default SectionHostCta;
