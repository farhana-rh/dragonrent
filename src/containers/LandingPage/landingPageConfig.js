/**
 * Presentation config for the DragonRent landing page.
 *
 * Copy lives in translation files (LandingPage.* keys). This file only holds layout data:
 * which image placeholder tone and icon to use, which category a tile links to, and which
 * trust items are live.
 *
 * Images: every entry has an `image` property. While it's null, a tinted placeholder is shown.
 * To use real photography, import the image file and set it here, e.g.
 *   import bikesImage from '../../assets/landing/bikes.jpg';
 *   bikes: { tone: 'sage', image: bikesImage },
 */

// Placeholder tones map to --colorPlaceholder* tokens in marketplaceDefaults.css
export const TONES = ['sage', 'sand', 'blush', 'slate', 'stone'];

// Hero image mosaic: one tall tile and two short ones. Each tile has a short caption.
export const heroMosaic = [
  { id: 'outdoors', tone: 'sage', image: null },
  { id: 'camping', tone: 'sand', image: null },
  { id: 'events', tone: 'slate', image: null },
];

// Section ids that other sections link to
export const HOW_IT_WORKS_SECTION_ID = 'how-dragonrent-works';

/**
 * Visuals for top-level categories, keyed by category id (Console → Listings → Categories).
 * `icon` is used by the category tiles (see CategoryIcon.js for the available icons), and
 * `tone`/`image` by the image tiles in "Browse by use case".
 * Categories without an entry here still render, with a default icon and a tone picked by position.
 */
export const categoryVisuals = {
  // Categories currently in Console
  'tools-and-equipment': { icon: 'tools', tone: 'blush', image: null },
  'sports-and-outdoor': { icon: 'sports', tone: 'sage', image: null },
  'cameras-and-photography': { icon: 'camera', tone: 'sand', image: null },
  'home-and-appliances': { icon: 'home', tone: 'stone', image: null },
  'furniture-and-events': { icon: 'event', tone: 'slate', image: null },
  // Other common categories, in case they are added later
  bikes: { icon: 'bike', tone: 'sage', image: null },
  cameras: { icon: 'camera', tone: 'sand', image: null },
  tools: { icon: 'tools', tone: 'blush', image: null },
  camping: { icon: 'camping', tone: 'sage', image: null },
  vehicles: { icon: 'vehicle', tone: 'slate', image: null },
  sports: { icon: 'sports', tone: 'stone', image: null },
  electronics: { icon: 'electronics', tone: 'slate', image: null },
  events: { icon: 'event', tone: 'blush', image: null },
  music: { icon: 'music', tone: 'sand', image: null },
  party: { icon: 'party', tone: 'blush', image: null },
};

// Shown as quick links under the hero search, if these categories exist
export const popularCategoryIds = [
  'cameras-and-photography',
  'tools-and-equipment',
  'sports-and-outdoor',
  'furniture-and-events',
];

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

// "How it works" steps for each audience. The first audience is selected by default.
export const howItWorksSteps = {
  rent: ['find', 'request', 'pickUp', 'return'],
  lend: ['list', 'accept', 'handOver', 'getPaid'],
};

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

/**
 * Console page (Content → Pages) linked from the trust section as "Read how we protect you".
 * Keep this null until the page exists, so the link is never broken. Example: 'trust-and-safety'.
 */
export const trustPageId = null;
