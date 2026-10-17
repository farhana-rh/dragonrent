import React from 'react';
import { types as sdkTypes } from '../../util/sdkLoader';
import { createListing, createUser } from '../../util/testData';

import SectionHomeHero from './SectionHomeHero/SectionHomeHero';
import SectionExploreRentals from './SectionExploreRentals/SectionExploreRentals';
import SectionPopularRentals from './SectionPopularRentals/SectionPopularRentals';
import SectionUseCases from './SectionUseCases/SectionUseCases';
import SectionHowItWorks from './SectionHowItWorks/SectionHowItWorks';
import SectionRentWithConfidence from './SectionRentWithConfidence/SectionRentWithConfidence';
import SectionHostCta from './SectionHostCta/SectionHostCta';

const { Money } = sdkTypes;

// Sample categories matching the ones recommended for Console → Listings → Categories
const categories = [
  { id: 'bikes', name: 'Bikes' },
  { id: 'cameras', name: 'Cameras' },
  { id: 'tools', name: 'Tools' },
  { id: 'camping', name: 'Camping' },
  { id: 'vehicles', name: 'Vehicles' },
  { id: 'sports', name: 'Sports' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'events', name: 'Events' },
];

const sampleListings = [
  ['l1', 'Sony A7 III', 3500],
  ['l2', 'Electric cargo bike', 2800],
  ['l3', 'Cordless drill set', 1200],
  ['l4', '4-person tent', 1800],
].map(([id, title, amount]) =>
  createListing(
    id,
    {
      title,
      price: new Money(amount, 'EUR'),
      publicData: { listingType: 'daily-rental', unitType: 'day' },
    },
    { author: createUser('host1') }
  )
);

const popularRentalsSection = (sectionData, listings = []) => {
  const section = {
    sectionType: 'listings',
    sectionId: 'popular-rentals',
    listingSelection: 'newest',
  };
  return {
    ...section,
    allSections: [section],
    options: {
      featuredListings: {
        parentPage: 'landing-page',
        featuredListingData: { 'popular-rentals': sectionData },
        getListingEntitiesById: () => listings,
        onFetchFeaturedListings: () => null,
      },
    },
  };
};

const HomePageSections = () => (
  <>
    <SectionHomeHero sectionId="hero" categories={categories} />
    <SectionExploreRentals sectionId="explore-rentals" categories={categories} />
    <SectionPopularRentals
      {...popularRentalsSection(
        { fetched: true, listingIds: sampleListings.map(l => l.id) },
        sampleListings
      )}
    />
    <SectionUseCases sectionId="use-cases" categories={categories} />
    <SectionHowItWorks sectionId="how-dragonrent-works" />
    <SectionRentWithConfidence sectionId="rent-with-confidence" />
    <SectionHostCta sectionId="list-an-item" />
  </>
);

export const HomePage = {
  component: HomePageSections,
  props: {},
  group: 'PageBuilder',
  rawOnly: true,
};

export const PopularRentalsLoading = {
  component: SectionPopularRentals,
  props: popularRentalsSection({ fetched: false, inProgress: true }),
  group: 'PageBuilder',
};

export const PopularRentalsEmpty = {
  component: SectionPopularRentals,
  props: popularRentalsSection({ fetched: true, listingIds: [] }),
  group: 'PageBuilder',
};

export const PopularRentalsError = {
  component: SectionPopularRentals,
  props: popularRentalsSection({
    fetched: false,
    error: { type: 'error', name: 'Error', message: 'Request failed', status: 500 },
  }),
  group: 'PageBuilder',
};
