import React from 'react';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';

import HeroSearchForm from '../HeroSearchForm/HeroSearchForm';
import HomeMedia from '../HomeMedia/HomeMedia';
import { heroMosaic } from '../landingPageConfig';

import css from './SectionHomeHero.module.css';

/**
 * Landing page hero: headline, a short description, the search card and an image mosaic.
 * Matches the Main (phone) and HomeDesktop mockups.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @returns {JSX.Element} hero section
 */
const SectionHomeHero = props => {
  const { sectionId } = props;
  const intl = useIntl();
  const titleId = `${sectionId}-title`;

  return (
    <section id={sectionId} className={css.root} aria-labelledby={titleId}>
      <div className={css.content}>
        <div className={css.text}>
          <h1 id={titleId} className={css.title}>
            <FormattedMessage id="LandingPage.hero.titleV2" />
          </h1>
          <p className={css.description}>
            <FormattedMessage id="LandingPage.hero.descriptionV2" />
          </p>
          <HeroSearchForm className={css.search} />
        </div>

        <div className={css.mosaic}>
          {heroMosaic.map((tile, i) => (
            <HomeMedia
              key={tile.id}
              className={css.mosaicTile}
              image={tile.image}
              tone={tile.tone}
              aspectRatio={null}
              // The first, largest tile is visible on first paint on desktop
              loading={i === 0 ? 'eager' : 'lazy'}
              sizes="(max-width: 1023px) 33vw, 300px"
              alt={intl.formatMessage({ id: `LandingPage.hero.tile.${tile.id}.imageAlt` })}
              label={<FormattedMessage id={`LandingPage.hero.tile.${tile.id}`} />}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectionHomeHero;
