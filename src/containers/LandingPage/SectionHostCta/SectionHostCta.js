import React from 'react';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';

import { NamedLink } from '../../../components';

import HomeMedia from '../HomeMedia/HomeMedia';
import { hostCtaImage } from '../landingPageConfig';

import css from './SectionHostCta.module.css';

/**
 * Call to action for people who want to rent out their items.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @returns {JSX.Element} host call-to-action section
 */
const SectionHostCta = props => {
  const { sectionId } = props;
  const intl = useIntl();
  const titleId = `${sectionId}-title`;

  return (
    <section id={sectionId} className={css.root} aria-labelledby={titleId}>
      <div className={css.content}>
        <div className={css.card}>
          <div className={css.text}>
            <h2 id={titleId} className={css.title}>
              <FormattedMessage id="LandingPage.hostCta.title" />
            </h2>
            <p className={css.description}>
              <FormattedMessage id="LandingPage.hostCta.text" />
            </p>
            <NamedLink name="NewListingPage" className={css.button}>
              <FormattedMessage id="LandingPage.hostCta.button" />
            </NamedLink>
          </div>
          <HomeMedia
            className={css.media}
            image={hostCtaImage.image}
            tone={hostCtaImage.tone}
            aspectRatio={null}
            alt={intl.formatMessage({ id: 'LandingPage.hostCta.imageAlt' })}
          />
        </div>
      </div>
    </section>
  );
};

export default SectionHostCta;
