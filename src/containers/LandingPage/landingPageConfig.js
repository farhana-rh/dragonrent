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

// Accent colours of the sticker design, in the order repeated elements use them
// (category tiles, step numbers, hero cards). Each maps to a --color* token.
export const STICKER_ACCENTS = ['coral', 'marigold', 'mint', 'electric'];

// Hero: a fanned stack of three decorative category cards (not listings). The caption is
// LandingPage.hero.tile.<id>; `icon` is a CategoryIcon name.
export const heroStack = [
  { id: 'camping', icon: 'camping', accent: 'mint' },
  { id: 'events', icon: 'event', accent: 'coral' },
  { id: 'outdoors', icon: 'bike', accent: 'marigold' },
];

// Number of rotating search prompts (LandingPage.hero.prompt.1 … .N)
export const HERO_PROMPT_COUNT = 5;

// Section ids that other sections and the top bar link to
export const HOW_IT_WORKS_SECTION_ID = 'how-dragonrent-works';
export const TRUST_SECTION_ID = 'trust-and-safety';

/**
 * "How paying works" facts in the payments dialog (LandingPage.trustStrip.fact.<id>).
 * Every one describes how the marketplace works today: Stripe holds the amount on request,
 * charges on accept and releases it on decline or expiry; the 24-hour cancellation rule
 * (decided 7 Nov) is applied by DragonRent; lenders are verified by Stripe.
 */
export const trustFacts = ['request', 'accept', 'decline', 'cancel', 'stripe', 'lenders'];

/**
 * "What if something breaks?" points for lenders (LandingPage.lenderPath.<id>.title/.text).
 * Only real behaviour: the lender accepts or declines, Stripe pays out, the address is private
 * until acceptance, and disputes go to DragonRent under the damage policy. No insurance,
 * deposits, ID checks or payout-time promises (concept-only in the mockup).
 */
export const lenderPoints = [
  { id: 'choose', icon: 'userCheck' },
  { id: 'paid', icon: 'card' },
  { id: 'address', icon: 'pin' },
  { id: 'breaks', icon: 'lifebuoy' },
];

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

// "How it works" steps, in order (Main and HomeDesktop mockups)
export const howItWorksSteps = ['find', 'request', 'pickUp'];

/**
 * Trust points shown with "How it works" ("Safe and simple" on phones). Each one describes how
 * the marketplace already works: card payments go through Stripe, reviews come from completed
 * rentals, and Stripe verifies an owner's identity before paying them out.
 */
export const trustPoints = [
  { id: 'payments', icon: 'lock' },
  { id: 'reviews', icon: 'star' },
  { id: 'identity', icon: 'shield' },
];
