import SectionLegalArticle from './SectionLegalArticle';
import { getLegalPageConfig } from './legalPages';

// Legal page layout with the Cookie policy draft (docs/legal/console/cookie-policy.md), for
// checking the layout before the text is in Console.
const cookiePolicyText = `Last updated [date]

## 1. What cookies are

Cookies are small files a website saves in your browser. Some are needed for the site to work, like keeping you signed in. Others, like analytics, are optional.

DragonRent also saves a few things in your browser's own storage. We list them here too, because they work the same way.

## 2. Cookies we always use

These are needed for signing in and paying. The site doesn't work without them, so they don't ask for your consent.

- **st-…-token** (set by DragonRent through our platform provider Sharetribe): lets the site load data for you and keeps you signed in. Kept for up to 180 days, and removed when you log out.
- **__stripe_mid** (set by Stripe): card payments and fraud prevention. Kept for 1 year.
- **__stripe_sid** (set by Stripe): card payments and fraud prevention. Kept for 30 minutes.
- **dragonrentCookieConsent** (DragonRent, stored in your browser): remembers your cookie choice, until you change it.

## 3. Analytics, only with your OK

Analytics tell us how many people visit and which pages they use. They load only after you click "Allow analytics" in the cookie banner.

## 4. Other services

Maps come from Mapbox, and error reports go to Sentry so we can fix problems. They don't set cookies on DragonRent, but your browser connects to them, so they see your IP address.

Read more in the [Privacy policy](/p/privacy-policy).

## 5. Changing your choice

Click "Cookie settings" at the bottom of any page to change your choice at any time. You can also delete cookies in your browser's settings.`;

export const CookiePolicy = {
  component: SectionLegalArticle,
  props: {
    sectionId: 'cookie-policy',
    sectionType: 'article',
    title: { fieldType: 'heading1', content: 'Cookie policy' },
    description: {
      fieldType: 'paragraph',
      content: 'Which cookies DragonRent uses, why, and how you can change your choice.',
    },
    blocks: [
      { blockType: 'defaultBlock', text: { fieldType: 'markdown', content: cookiePolicyText } },
    ],
    options: { legalPage: getLegalPageConfig('cookie-policy') },
  },
  group: 'page builder',
};
