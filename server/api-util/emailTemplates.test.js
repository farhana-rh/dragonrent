const fs = require('fs');
const path = require('path');
const { types } = require('sharetribe-flex-sdk');
const { Money } = types;
const { transactionLineItems } = require('./lineItems');

// The booking emails list the transaction's line items by code. A line item that the server
// can emit but no email knows about is silently left out, so the email's rows no longer add up
// to its total (this happened with the duration discount: "€15 × 3 days = €45 … Total €30").
// This test keeps the emails in step with server/api-util/lineItems.js: every code the server
// emits for a booking must have a row in each email that shows that side of the breakdown.

const TEMPLATES_DIR = path.join(
  __dirname,
  '..',
  '..',
  'ext',
  'transaction-processes',
  'default-booking',
  'templates'
);

// Emails with a price breakdown, and whose side of the transaction they show
const BREAKDOWN_EMAILS = [
  { name: 'booking-new-request', role: 'provider' },
  { name: 'booking-accepted-request', role: 'customer' },
  { name: 'booking-money-paid', role: 'provider' },
];

const readTemplate = name =>
  fs.readFileSync(path.join(TEMPLATES_DIR, name, `${name}-html.html`), 'utf8');

const hasRowFor = (template, code) => template.includes(`{{#eq "${code}" code}}`);

const DAY = 24 * 60 * 60 * 1000;
const orderForDays = days => ({
  bookingStart: new Date(Date.UTC(2026, 9, 26)).toISOString(),
  bookingEnd: new Date(Date.UTC(2026, 9, 26) + days * DAY).toISOString(),
});

const dailyListing = {
  attributes: {
    price: new Money(1500, 'EUR'),
    publicData: { unitType: 'day', price3DaysInSubunits: 3000, price7DaysInSubunits: 5600 },
  },
};
const providerCommission = { percentage: 10, minimum_amount: 100 };
const customerCommission = { percentage: 0, minimum_amount: 0 };

describe('booking email templates', () => {
  // The line items of a discounted 3-day rental: day, duration discount, commission(s)
  const lineItems = transactionLineItems(
    dailyListing,
    orderForDays(3),
    providerCommission,
    customerCommission
  );

  it('emits the duration discount for the test booking (so the test is checking something)', () => {
    expect(lineItems.map(item => item.code)).toContain('line-item/duration-discount');
  });

  it.each(BREAKDOWN_EMAILS)('$name shows every $role-side line item the server emits', email => {
    const template = readTemplate(email.name);
    const itemsForRole = lineItems.filter(item => item.includeFor.includes(email.role));
    const missing = itemsForRole.map(item => item.code).filter(code => !hasRowFor(template, code));

    expect(missing).toEqual([]);
  });

  it('labels the discount row in every breakdown email', () => {
    BREAKDOWN_EMAILS.forEach(email => {
      expect(readTemplate(email.name)).toMatch(/DurationDiscountLabel" "Longer rental discount"/);
    });
  });
});
