import React from 'react';

import { FormattedMessage } from '../../../util/reactIntl';

import { NamedLink } from '../../../components';

import { getAudienceTabId } from '../SectionHowItWorks/SectionHowItWorks';
import { HOW_IT_WORKS_SECTION_ID } from '../landingPageConfig';

import css from './SectionHostCta.module.css';

/**
 * Call to action for people who want to rent out their items. The secondary link opens the
 * lender's steps in the "How it works" section.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @returns {JSX.Element} host call-to-action section
 */
const SectionHostCta = props => {
  const { sectionId } = props;
  const titleId = `${sectionId}-title`;

  return (
    <section id={sectionId} className={css.root} aria-labelledby={titleId}>
      <div className={css.content}>
        <div className={css.banner}>
          <div className={css.text}>
            <h2 id={titleId} className={css.title}>
              <FormattedMessage id="LandingPage.hostCta.titleNew" />
            </h2>
            <p className={css.description}>
              <FormattedMessage id="LandingPage.hostCta.description" />
            </p>
          </div>
          <div className={css.actions}>
            <NamedLink name="NewListingPage" className={css.primaryButton}>
              <FormattedMessage id="LandingPage.hostCta.primaryButton" />
            </NamedLink>
            <a
              className={css.secondaryButton}
              href={`#${getAudienceTabId(HOW_IT_WORKS_SECTION_ID, 'lend')}`}
            >
              <FormattedMessage id="LandingPage.hostCta.secondaryButton" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionHostCta;
