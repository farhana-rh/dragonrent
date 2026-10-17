import React from 'react';

import { FormattedMessage } from '../../../util/reactIntl';

import { Heading, IconArrowHead, NamedLink } from '../../../components';

import css from './SectionPolicies.module.css';

// Marketplace-wide policy pages (Console → Content → Pages). Created in Phase 4.
const POLICIES = [
  { id: 'cancellation', pageId: 'cancellation' },
  { id: 'depositAndDamage', pageId: 'deposit-and-damage' },
  { id: 'fees', pageId: 'fees' },
];

/**
 * Links to the marketplace's policy pages. These are marketplace-wide policies, not
 * listing-specific terms.
 *
 * @component
 * @returns {JSX.Element} policies section
 */
const SectionPolicies = () => {
  return (
    <section className={css.root} aria-labelledby="listing-policies-title">
      <Heading as="h2" rootClassName={css.title} id="listing-policies-title">
        <FormattedMessage id="ListingPage.policiesTitle" />
      </Heading>
      <ul className={css.list}>
        {POLICIES.map(policy => (
          <li key={policy.id} className={css.item}>
            <NamedLink className={css.link} name="CMSPage" params={{ pageId: policy.pageId }}>
              <span className={css.linkText}>
                <span className={css.linkTitle}>
                  <FormattedMessage id={`ListingPage.policies.${policy.id}.title`} />
                </span>
                <span className={css.linkDescription}>
                  <FormattedMessage id={`ListingPage.policies.${policy.id}.text`} />
                </span>
              </span>
              <IconArrowHead direction="right" size="small" rootClassName={css.arrow} />
            </NamedLink>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SectionPolicies;
