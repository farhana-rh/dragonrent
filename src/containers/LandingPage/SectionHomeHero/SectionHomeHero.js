import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../../util/reactIntl';

import CategoryIcon from '../CategoryIcon/CategoryIcon';
import HeroSearchForm from '../HeroSearchForm/HeroSearchForm';
import { heroStack } from '../landingPageConfig';

import css from './SectionHomeHero.module.css';

const ACCENT_CLASSES = {
  coral: css.accentCoral,
  marigold: css.accentMarigold,
  mint: css.accentMint,
  electric: css.accentElectric,
};

/**
 * Landing page hero in the sticker design (HomeSticker.html): headline with a marigold
 * highlight, the search card and a fanned stack of category cards. The cards are decoration
 * (category names only), never pretend listings. No area sticker: DragonRent is open worldwide
 * (user, 21 Nov), and "Spin the block" was removed the same day.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @returns {JSX.Element} hero section
 */
const SectionHomeHero = props => {
  const { sectionId } = props;
  const titleId = `${sectionId}-title`;

  return (
    <section id={sectionId} className={css.root} aria-labelledby={titleId}>
      <div className={css.content}>
        <div className={css.text}>
          <h1 id={titleId} className={css.title}>
            <FormattedMessage
              id="LandingPage.hero.titleSticker"
              values={{
                highlight: chunks => <span className={css.highlight}>{chunks}</span>,
              }}
            />
          </h1>
          <p className={css.description}>
            <FormattedMessage id="LandingPage.hero.descriptionSticker" />
          </p>
          <HeroSearchForm className={css.search} />
        </div>

        <div className={css.stack} aria-hidden="true">
          {heroStack.map(card => (
            <div key={card.id} className={css.stackCard}>
              <div className={classNames(css.stackCardTop, ACCENT_CLASSES[card.accent])}>
                <CategoryIcon className={css.stackIcon} name={card.icon} />
              </div>
              <span className={css.stackCardLabel}>
                <FormattedMessage id={`LandingPage.hero.tile.${card.id}`} />
              </span>
            </div>
          ))}
          <span className={css.stackSticker}>
            <FormattedMessage id="LandingPage.hero.stackSticker" />
          </span>
        </div>
      </div>
    </section>
  );
};

export default SectionHomeHero;
