import React, { act } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { useHistory, useLocation } from 'react-router-dom';
import '@testing-library/jest-dom';

import { createCurrentUser } from '../../../util/testData';
import { TestProvider, getHostedConfiguration } from '../../../util/testHelpers';

import Topbar from './Topbar';

const noop = () => null;

// TopbarContainer passes history and location from withRouter
const TopbarWithRouter = props => {
  const history = useHistory();
  const location = useLocation();
  return <Topbar history={history} location={location} {...props} />;
};

const commonProps = {
  authInProgress: false,
  currentUserHasListings: false,
  currentPage: 'SearchPage',
  onLogout: noop,
  onManageDisableScrolling: noop,
  onResendVerificationEmail: noop,
  sendVerificationEmailInProgress: false,
  showGenericError: false,
};

const signedOutProps = { ...commonProps, isAuthenticated: false, currentUser: null };
const signedInProps = {
  ...commonProps,
  isAuthenticated: true,
  currentUser: createCurrentUser('user1'),
  notificationCount: 2,
};

const renderTopbar = props => (
  <TestProvider config={getHostedConfiguration()} initialEntries={['/s']}>
    <TopbarWithRouter {...props} />
  </TestProvider>
);

/**
 * Renders the server HTML with the server's props, hydrates it with the browser's props and
 * returns the container and the recoverable (hydration) errors React reported.
 */
const hydrate = async (serverProps, clientProps) => {
  // react-redux sees jsdom's window and warns about useLayoutEffect on the "server"
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  const serverHtml = renderToString(renderTopbar(serverProps));
  consoleError.mockClear();

  const container = document.createElement('div');
  container.innerHTML = serverHtml;
  document.body.appendChild(container);
  const onRecoverableError = jest.fn();
  let root;
  await act(async () => {
    root = hydrateRoot(container, renderTopbar(clientProps), { onRecoverableError });
  });
  const hydrationWarnings = consoleError.mock.calls.filter(args =>
    /hydrat|did not match/i.test(String(args[0]))
  );
  consoleError.mockRestore();
  const cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return { container, onRecoverableError, hydrationWarnings, cleanup };
};

describe('Topbar', () => {
  // The server renders every page signed out (server/dataLoader.js doesn't load auth), while
  // the browser loads the signed-in user before hydrating (src/index.js).
  it('hydrates server HTML for a signed-in user without a mismatch (React #418)', async () => {
    const { container, onRecoverableError, hydrationWarnings, cleanup } = await hydrate(
      signedOutProps,
      signedInProps
    );

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(hydrationWarnings).toEqual([]);
    // After mount the phone top bar shows the signed-in state: no "Log in" link
    expect(container.textContent).not.toContain('Topbar.logIn');
    expect(container.textContent).toContain('Topbar.menuButton');
    cleanup();
  });

  it('shows the phone "Log in" link after hydration when signed out', async () => {
    const { container, onRecoverableError, cleanup } = await hydrate(
      signedOutProps,
      signedOutProps
    );

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Topbar.logIn');
    cleanup();
  });
});
