import React from 'react';
import { HelmetProvider } from 'react-helmet-async';

import { renderWithProviders as render } from './testHelpers';
import { IncludeScripts } from './includeScripts';

const config = {
  marketplaceRootURL: 'http://localhost:3000',
  maps: { mapProvider: 'mapbox', mapboxAccessToken: 'token' },
  analytics: { googleAnalyticsId: 'G-TEST123', plausibleDomains: 'example.com' },
  stripe: {},
};

// Render the scripts the way the server does and read them from Helmet's context
const renderedScripts = analyticsConsent => {
  const helmetContext = {};
  const canUseDOM = HelmetProvider.canUseDOM;
  HelmetProvider.canUseDOM = false;
  render(
    <HelmetProvider context={helmetContext}>
      <IncludeScripts config={config} initialPathname="/" analyticsConsent={analyticsConsent} />
    </HelmetProvider>
  );
  HelmetProvider.canUseDOM = canUseDOM;
  return helmetContext.helmet.script.toString();
};

describe('IncludeScripts', () => {
  afterEach(() => {
    delete window.gtag;
    delete window.dataLayer;
  });

  it('leaves analytics out without consent', () => {
    const scripts = renderedScripts(false);
    expect(scripts).not.toContain('googletagmanager');
    expect(scripts).not.toContain('plausible');
    expect(window.gtag).toBeUndefined();
  });

  it('adds analytics after consent', () => {
    const scripts = renderedScripts(true);
    expect(scripts).toContain('googletagmanager.com/gtag/js?id=G-TEST123');
    expect(scripts).toContain('plausible.io');
  });
});
