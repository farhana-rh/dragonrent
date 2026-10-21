import React from 'react';

import { FormattedMessage } from '../../../util/reactIntl';

import { NamedLink } from '../../../components';

import css from './SectionHostCta.module.css';

/**
 * "Have things you rarely use?" banner for people who want to lend their items, as in the
 * Main and HomeDesktop mockups. The search is the page's one primary action, so this button
 * is a secondary one.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @returns {JSX.Element} lend call-to-action section
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
              <FormattedMessage id="LandingPage.lendBanner.title" />
            </h2>
            <p className={css.description}>
              <FormattedMessage id="LandingPage.lendBanner.text" />
            </p>
          </div>
          <NamedLink name="NewListingPage" className={css.button}>
            <FormattedMessage id="LandingPage.lendBanner.button" />
          </NamedLink>
        </div>
      </div>
    </section>
  );
};

export default SectionHostCta;
