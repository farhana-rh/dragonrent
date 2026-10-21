import React, { useState } from 'react';
import classNames from 'classnames';
import { Form as FinalForm } from 'react-final-form';
import { useHistory } from 'react-router-dom';

// Contexts
import { useConfiguration } from '../../../context/configurationContext';
import { useRouteConfiguration } from '../../../context/routeConfigurationContext';

// Utils
import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { createResourceLocatorString } from '../../../util/routes';
import { getMapProviderApiAccess } from '../../../util/maps';

// Shared components
import { Form, IconSearch, PrimaryButton } from '../../../components';

// Search fields shared with the PageBuilder's SearchCTA, so both forms behave the same
import { getSearchQueryParams } from '../../PageBuilder/Primitives/SearchCTA/SearchCTA';
import FilterKeyword from '../../PageBuilder/Primitives/SearchCTA/FilterKeyword/FilterKeyword';
import FilterLocation from '../../PageBuilder/Primitives/SearchCTA/FilterLocation/FilterLocation';

import css from './HeroSearchForm.module.css';

/**
 * Which search fields can actually be used with the current marketplace configuration.
 * - Location search needs a map provider access token (Mapbox or Google Maps).
 * - Date search needs the dates filter to be enabled in Console (Listings → Search).
 *
 * @param {Object} config app configuration
 * @returns {Object} { keywords, location, dates } booleans
 */
export const getAvailableSearchFields = config => {
  const hasMapAccess = !!(config?.maps && getMapProviderApiAccess(config.maps));
  const hasDatesFilter = !!config?.search?.defaultFilters?.find(f => f.key === 'dates');
  return { keywords: true, location: hasMapAccess, dates: hasDatesFilter };
};

// A labelled field: the label sits above the input (DESIGN.md: labels above fields)
const SearchField = props => {
  const { id, label, icon, className, children } = props;
  const labelId = `${id}-label`;
  return (
    <div role="group" aria-labelledby={labelId} className={classNames(css.field, className)}>
      <span id={labelId} className={css.fieldLabel}>
        {label}
      </span>
      <div className={css.fieldBox}>
        {icon ? <span className={css.fieldIcon}>{icon}</span> : null}
        {children}
      </div>
    </div>
  );
};

/**
 * Search card for the landing page hero: "What do you need?" (keywords) and "Where?" (location),
 * as in the Main and HomeDesktop mockups. Submits to the SearchPage with the same query parameters
 * as the PageBuilder's SearchCTA. Dates are picked later, on the search and listing pages.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to component's own css.root
 * @returns {JSX.Element} search form
 */
const HeroSearchForm = props => {
  const { className } = props;
  const config = useConfiguration();
  const routeConfiguration = useRouteConfiguration();
  const history = useHistory();
  const intl = useIntl();
  const [submitDisabled, setSubmitDisabled] = useState(false);

  const fields = getAvailableSearchFields(config);

  const onSubmit = values => {
    const queryParams = getSearchQueryParams(values, config);
    history.push(createResourceLocatorString('SearchPage', routeConfiguration, {}, queryParams));
  };

  return (
    <FinalForm
      onSubmit={onSubmit}
      render={({ handleSubmit }) => (
        <Form
          role="search"
          aria-label={intl.formatMessage({ id: 'LandingPage.hero.searchLabel' })}
          onSubmit={handleSubmit}
          className={classNames(css.root, className)}
        >
          <SearchField
            id="hero-search-what"
            className={css.whatField}
            label={<FormattedMessage id="LandingPage.hero.whatLabel" />}
            icon={<IconSearch rootClassName={css.inputIcon} />}
          >
            <FilterKeyword className={css.filter} />
          </SearchField>

          {fields.location ? (
            <SearchField
              id="hero-search-where"
              className={css.whereField}
              label={<FormattedMessage id="LandingPage.hero.whereLabel" />}
            >
              <FilterLocation
                className={css.filter}
                setSubmitDisabled={setSubmitDisabled}
                alignLeft={true}
              />
            </SearchField>
          ) : null}

          <PrimaryButton className={css.submitButton} type="submit" disabled={submitDisabled}>
            <IconSearch rootClassName={css.buttonIcon} />
            <FormattedMessage id="LandingPage.hero.searchButton" />
          </PrimaryButton>
        </Form>
      )}
    />
  );
};

export default HeroSearchForm;
