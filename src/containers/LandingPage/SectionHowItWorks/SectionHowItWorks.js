import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';

import { howItWorksSteps } from '../landingPageConfig';

import css from './SectionHowItWorks.module.css';

const AUDIENCES = Object.keys(howItWorksSteps);

/**
 * Id of the tab for an audience. Linking to `#<tab id>` (e.g. from the host call to action)
 * scrolls to the tabs and selects that audience.
 *
 * @param {string} sectionId
 * @param {string} audience 'rent' or 'lend'
 * @returns {string} element id
 */
export const getAudienceTabId = (sectionId, audience) => `${sectionId}-tab-${audience}`;

/**
 * Four-step explanation of renting and lending on DragonRent, with tabs to switch between
 * the renter's and the lender's steps.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @returns {JSX.Element} how it works section
 */
const SectionHowItWorks = props => {
  const { sectionId } = props;
  const intl = useIntl();
  const [selected, setSelected] = useState(AUDIENCES[0]);
  const tabRefs = useRef({});
  const titleId = `${sectionId}-title`;
  const panelId = `${sectionId}-panel`;

  // Select an audience when the page is opened or navigated to with its tab id as the hash
  useEffect(() => {
    const selectFromHash = () => {
      const audience = AUDIENCES.find(
        a => window.location.hash === `#${getAudienceTabId(sectionId, a)}`
      );
      if (audience) {
        setSelected(audience);
      }
    };
    selectFromHash();
    window.addEventListener('hashchange', selectFromHash);
    return () => window.removeEventListener('hashchange', selectFromHash);
  }, [sectionId]);

  // Arrow keys move between tabs, as recommended for the ARIA tabs pattern
  const handleKeyDown = e => {
    const offset = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!offset) {
      return;
    }
    e.preventDefault();
    const index = AUDIENCES.indexOf(selected);
    const next = AUDIENCES[(index + offset + AUDIENCES.length) % AUDIENCES.length];
    setSelected(next);
    tabRefs.current[next]?.focus();
  };

  const steps = howItWorksSteps[selected];

  return (
    <section id={sectionId} className={css.root} aria-labelledby={titleId}>
      <div className={css.content}>
        <h2 id={titleId} className={css.title}>
          <FormattedMessage id="LandingPage.howItWorks.title" />
        </h2>

        <div
          className={css.tabs}
          role="tablist"
          aria-label={intl.formatMessage({ id: 'LandingPage.howItWorks.tabsLabel' })}
          onKeyDown={handleKeyDown}
        >
          {AUDIENCES.map(audience => {
            const isSelected = audience === selected;
            return (
              <button
                key={audience}
                ref={el => (tabRefs.current[audience] = el)}
                id={getAudienceTabId(sectionId, audience)}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls={panelId}
                tabIndex={isSelected ? 0 : -1}
                className={classNames(css.tab, { [css.tabSelected]: isSelected })}
                onClick={() => setSelected(audience)}
              >
                <FormattedMessage id={`LandingPage.howItWorks.tab.${audience}`} />
              </button>
            );
          })}
        </div>

        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={getAudienceTabId(sectionId, selected)}
          className={css.panel}
        >
          <ol className={css.steps}>
            {steps.map((step, i) => (
              <li key={step} className={css.step}>
                <span className={css.stepNumber} aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className={css.stepTitle}>
                  <FormattedMessage id={`LandingPage.howItWorks.${selected}.${step}.title`} />
                </h3>
                <p className={css.stepDescription}>
                  <FormattedMessage id={`LandingPage.howItWorks.${selected}.${step}.text`} />
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default SectionHowItWorks;
