import React, { useEffect, useRef, useState } from 'react';

import { useConfiguration } from '../../../context/configurationContext';
import { FormattedMessage, useIntl } from '../../../util/reactIntl';

import { ListingCard, NamedLink } from '../../../components';

import css from './SectionPopularRentals.module.css';

// Shown as soon as there is one listing (user, 17 Nov: the tester preview should show the
// cards; DESIGN.md first said to wait for 8). Every fetched listing goes into the carousel: the
// featuredListings duck fetches at most 10.
export const MIN_LISTINGS_TO_SHOW = 1;

// Title depends on how the listings were selected in Console, so the heading stays accurate:
// "newest" shows recently published listings, "queryString" shows a hand-picked selection.
const TITLE_IDS = {
  newest: 'LandingPage.popularRentals.titleNewest',
  queryString: 'LandingPage.popularRentals.titleFeatured',
};

// How far one arrow click scrolls, as a share of the visible width (keeps one card in view)
const SCROLL_SHARE = 0.85;

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M6 3.5L10.5 8 6 12.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronIcon = props => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d={props.direction === 'previous' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Whether the carousel can scroll further back or forward.
 *
 * @param {Object?} el the scrolling list element
 * @returns {Object} { atStart, atEnd }
 */
export const getScrollEdges = el => {
  if (!el) {
    return { atStart: true, atEnd: false };
  }
  const maxScroll = el.scrollWidth - el.clientWidth;
  return { atStart: el.scrollLeft <= 1, atEnd: el.scrollLeft >= maxScroll - 1 };
};

/**
 * Listings carousel on the landing page (user, 21 Nov): one row of listings from every
 * category, scrolled sideways. Phones swipe (the next card peeks in); from tablet up there are
 * also arrow buttons. Cards are the shared ListingCard in its compact size.
 *
 * Driven by a "Featured listings" section in Console (Content → Pages → landing-page): the
 * listing selection (newest or a search query) is configured there and fetched with the shared
 * featuredListings duck. Nothing is shown while loading, on errors or with fewer than
 * MIN_LISTINGS_TO_SHOW listings.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @param {('newest'|'queryString')} props.listingSelection
 * @param {Array<Object>} props.allSections all sections on the page (needed by the fetch)
 * @param {Object} props.options contains featuredListings data and fetch function
 * @returns {JSX.Element|null} listings section
 */
const SectionPopularRentals = props => {
  const { sectionId, listingSelection, allSections, options } = props;
  const config = useConfiguration();
  const intl = useIntl();
  const listRef = useRef(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: false });
  const { onFetchFeaturedListings, getListingEntitiesById, parentPage, featuredListingData } =
    options?.featuredListings || {};

  const sectionData = featuredListingData?.[sectionId] || {};
  const { listingIds, fetched = false, inProgress, error } = sectionData;
  const listings = listingIds && getListingEntitiesById ? getListingEntitiesById(listingIds) : [];

  useEffect(() => {
    // Same trigger as PageBuilder's SectionListings: fetch once on the client
    if (onFetchFeaturedListings && !fetched && inProgress !== true && !error) {
      onFetchFeaturedListings(sectionId, parentPage, config.layout.listingImage, allSections);
    }
  }, []);

  // Arrow states follow the scroll position and the window size
  useEffect(() => {
    const update = () => setEdges(getScrollEdges(listRef.current));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [listings.length]);

  if (!fetched || error || listings.length < MIN_LISTINGS_TO_SHOW) {
    return null;
  }

  const titleId = `${sectionId}-title`;

  const scrollList = direction => {
    const el = listRef.current;
    if (!el) {
      return;
    }
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const left = direction * el.clientWidth * SCROLL_SHARE;
    if (typeof el.scrollBy === 'function') {
      el.scrollBy({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
    } else {
      el.scrollLeft += left;
    }
  };

  return (
    <section id={sectionId} className={css.root} aria-labelledby={titleId}>
      <div className={css.content}>
        <div className={css.header}>
          <h2 id={titleId} className={css.title}>
            <FormattedMessage id={TITLE_IDS[listingSelection] || TITLE_IDS.queryString} />
          </h2>
          <div className={css.controls}>
            <NamedLink className={css.link} name="SearchPage">
              <FormattedMessage id="LandingPage.popularRentals.seeAllRentals" />
              <ArrowIcon />
            </NamedLink>
            {/* Hidden when every card already fits (e.g. one or two listings) */}
            <div className={css.arrows} hidden={edges.atStart && edges.atEnd}>
              <button
                type="button"
                className={css.arrow}
                onClick={() => scrollList(-1)}
                disabled={edges.atStart}
                aria-label={intl.formatMessage({ id: 'LandingPage.popularRentals.previous' })}
              >
                <ChevronIcon direction="previous" />
              </button>
              <button
                type="button"
                className={css.arrow}
                onClick={() => scrollList(1)}
                disabled={edges.atEnd}
                aria-label={intl.formatMessage({ id: 'LandingPage.popularRentals.next' })}
              >
                <ChevronIcon direction="next" />
              </button>
            </div>
          </div>
        </div>

        <ul
          ref={listRef}
          className={css.list}
          onScroll={() => setEdges(getScrollEdges(listRef.current))}
        >
          {listings.map(listing => (
            <li key={listing.id.uuid} className={css.item}>
              <ListingCard
                listing={listing}
                showAuthorInfo={false}
                compact
                renderSizes="(max-width: 767px) 220px, 272px"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default SectionPopularRentals;
