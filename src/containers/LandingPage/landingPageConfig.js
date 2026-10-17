/**
 * Presentation config for the DragonRent landing page.
 *
 * Copy lives in translation files (LandingPage.* keys). This file only holds layout data:
 * which image placeholder tone to use, which category a tile links to, and which
 * "Rent with confidence" items are live.
 *
 * Images: every entry has an `image` property. While it's null, a tinted placeholder is shown.
 * To use real photography, import the image file and set it here, e.g.
 *   import bikesImage from '../../assets/landing/bikes.jpg';
 *   bikes: { tone: 'sage', image: bikesImage },
 */

// Placeholder tones map to --colorPlaceholder* tokens in marketplaceDefaults.css
export const TONES = ['sage', 'sand', 'blush', 'slate', 'stone'];

export const heroImage = { tone: 'sage', image: null };
export const hostCtaImage = { tone: 'blush', image: null };

/**
 * Visuals for top-level categories, keyed by category id (Console → Listings → Categories).
 * Categories without an entry here still render, with a tone picked by position.
 */
export const categoryVisuals = {
  bikes: { tone: 'sage', image: null },
  cameras: { tone: 'sand', image: null },
  tools: { tone: 'blush', image: null },
  camping: { tone: 'sage', image: null },
  vehicles: { tone: 'slate', image: null },
  sports: { tone: 'stone', image: null },
  electronics: { tone: 'slate', image: null },
  events: { tone: 'blush', image: null },
};

// Shown as quick links under the hero search, if these categories exist
export const popularCategoryIds = ['bikes', 'cameras', 'tools', 'camping'];

// Maximum number of category tiles in "Explore rentals"
export const MAX_CATEGORY_TILES = 8;

/**
 * "Browse by use case" tiles. The search page filters by one category at a time,
 * so each use case links to its primary category. A tile is hidden if its category
 * doesn't exist in Console.
 */
export const useCases = [
  { id: 'outdoorAdventures', categoryId: 'camping', tone: 'sage', image: null },
  { id: 'photography', categoryId: 'cameras', tone: 'sand', image: null },
  { id: 'diyAndTools', categoryId: 'tools', tone: 'blush', image: null },
  { id: 'eventsAndParties', categoryId: 'events', tone: 'blush', image: null },
  { id: 'sports', categoryId: 'sports', tone: 'stone', image: null },
  { id: 'transport', categoryId: 'vehicles', tone: 'slate', image: null },
];

export const howItWorksSteps = ['find', 'book', 'enjoy'];

/**
 * "Rent with confidence" items. Only items marked `enabled` are shown: an item should be
 * enabled only once the feature it describes is live on the marketplace.
 *
 * - securePayments: enable when Stripe is configured (publishable key + Console secret key).
 * - support: enable when the support channel and hours are decided, and update the
 *   LandingPage.trust.support.text translation.
 */
export const trustItems = [
  { id: 'transparentPricing', icon: 'pricing', enabled: true },
  { id: 'clearAvailability', icon: 'calendar', enabled: true },
  { id: 'reviews', icon: 'star', enabled: true },
  { id: 'profiles', icon: 'profile', enabled: true },
  { id: 'securePayments', icon: 'lock', enabled: false },
  { id: 'support', icon: 'message', enabled: false },
];
