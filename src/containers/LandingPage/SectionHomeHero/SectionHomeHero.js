import React from 'react';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';

import { useRouteConfiguration } from '../../../context/routeConfigurationContext';
import { FormattedMessage } from '../../../util/reactIntl';
import { createResourceLocatorString } from '../../../util/routes';
import { createSlug } from '../../../util/urlHelpers';

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

const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ShuffleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M3 7h3.5c2 0 3.2 1 4.3 2.7l2.4 4.6C14.3 16 15.5 17 17.5 17H21M18 14l3 3-3 3M3 17h3.5c1.4 0 2.4-.5 3.2-1.4M14.3 8.4C15.1 7.5 16.1 7 17.5 7H21M18 4l3 3-3 3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Listings already loaded for the page by the featured listings section (Console:
 * Content → Pages → landing-page → Featured listings). Nothing is fetched here.
 *
 * @param {Object?} featuredListings options.featuredListings from PageBuilder
 * @returns {Array<Object>} listing entities
 */
export const getLoadedListings = featuredListings => {
  const { featuredListingData, getListingEntitiesById } = featuredListings || {};
  const ids = Object.values(featuredListingData || {}).flatMap(d => d?.listingIds || []);
  return ids.length > 0 && getListingEntitiesById ? getListingEntitiesById(ids) : [];
};

/**
 * "Spin the block": opens a random real listing from the ones the page has loaded. Hidden when
 * no listings are loaded, so it never points at made-up items. Server and first client render
 * both have no listings (they load after mount), so it can't cause a hydration mismatch.
 *
 * @component
 * @param {Object} props
 * @param {Object?} props.featuredListings options.featuredListings from PageBuilder
 * @param {Function?} props.random returns a number in [0, 1); Math.random by default (tests)
 * @returns {JSX.Element|null} button and hint
 */
export const SpinTheBlock = props => {
  const { featuredListings, random = Math.random } = props;
  const history = useHistory();
  const routeConfiguration = useRouteConfiguration();
  const listings = getLoadedListings(featuredListings);

  if (listings.length === 0) {
    return null;
  }

  const onSpin = () => {
    const listing = listings[Math.floor(random() * listings.length)];
    const params = { id: listing.id.uuid, slug: createSlug(listing.attributes.title || '') };
    history.push(createResourceLocatorString('ListingPage', routeConfiguration, params, {}));
  };

  return (
    <div className={css.spin}>
      <button type="button" className={css.spinButton} onClick={onSpin}>
        <ShuffleIcon />
        <FormattedMessage id="LandingPage.hero.spin" />
      </button>
      <span className={css.spinHint}>
        <FormattedMessage id="LandingPage.hero.spinHint" />
      </span>
    </div>
  );
};

/**
 * Landing page hero in the sticker design (HomeSticker.html): area sticker, headline with a
 * marigold highlight, the search card, "Spin the block", and a fanned stack of category cards.
 * The cards are decoration (category names only), never pretend listings.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @param {Object?} props.options PageBuilder options; options.featuredListings feeds the spin
 * @returns {JSX.Element} hero section
 */
const SectionHomeHero = props => {
  const { sectionId, options } = props;
  const titleId = `${sectionId}-title`;

  return (
    <section id={sectionId} className={css.root} aria-labelledby={titleId}>
      <div className={css.content}>
        <div className={css.text}>
          <span className={css.areaSticker}>
            <PinIcon />
            <FormattedMessage id="LandingPage.hero.areaSticker" />
          </span>
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
          <SpinTheBlock featuredListings={options?.featuredListings} />
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
