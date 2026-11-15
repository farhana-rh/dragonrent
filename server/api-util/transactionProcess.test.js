const fs = require('fs');
const path = require('path');

// The client copies the exact pick-up address into the transaction's protectedData when the
// owner accepts (src/containers/TransactionPage/TransactionPage.duck.js). Sharetribe only
// takes that parameter if the transition has :action/update-protected-data, so this test
// keeps the process definition in the repo in step with the client. The process still has to
// be pushed with flex-cli (docs/LAUNCH.md section 1b).

const PROCESS_FILE = path.join(
  __dirname,
  '..',
  '..',
  'ext',
  'transaction-processes',
  'default-booking',
  'process.edn'
);

// The text of one transition's map, from its name to the matching closing brace
const transitionBlock = (edn, transitionName) => {
  const start = edn.indexOf(`{:name :transition/${transitionName},`);
  if (start < 0) {
    return null;
  }
  let depth = 0;
  for (let i = start; i < edn.length; i++) {
    if (edn[i] === '{') depth++;
    if (edn[i] === '}') depth--;
    if (depth === 0) {
      return edn.slice(start, i + 1);
    }
  }
  return null;
};

describe('default-booking process', () => {
  const edn = fs.readFileSync(PROCESS_FILE, 'utf8');

  it('lets the owner attach protected data (the pick-up address) when accepting', () => {
    const accept = transitionBlock(edn, 'accept');
    expect(accept).not.toBeNull();
    expect(accept).toContain(':action/update-protected-data');
    expect(accept).toContain(':action/accept-booking');
    expect(accept).toContain(':action/stripe-capture-payment-intent');
  });

  it('keeps the request transition privileged, so prices are set on the server', () => {
    const request = transitionBlock(edn, 'request-payment');
    expect(request).toContain(':action/privileged-set-line-items');
    expect(request).toContain(':privileged? true');
  });
});
