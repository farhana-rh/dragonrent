import React, { useState } from 'react';
import classNames from 'classnames';

// Import configs and util modules
import { FormattedMessage } from '../../../../util/reactIntl';
import { LISTING_STATE_DRAFT } from '../../../../util/types';
import { types as sdkTypes } from '../../../../util/sdkLoader';
import { areaFromAddress, offsetPublicLocation } from '../../../../util/listingLocation';

// Import shared components
import { H3, ListingLink } from '../../../../components';

// Import modules from this directory
import EditListingLocationForm from './EditListingLocationForm';
import { StepIntro, stepFrameCss } from '../StepFrame/StepFrame';
import css from './EditListingLocationPanel.module.css';

const { LatLng } = sdkTypes;

/**
 * Form values from the listing. The exact address lives in privateData.pickup (DragonRent,
 * util/listingLocation.js); listings saved before that keep it in publicData.location.
 *
 * @param {Object} props with the own listing
 * @returns {Object} { building, location } for the form
 */
export const getInitialValues = props => {
  const { listing } = props;
  const { geolocation, publicData, privateData } = listing?.attributes || {};
  const pickup = privateData?.pickup;

  if (pickup?.address && pickup.lat != null && pickup.lng != null) {
    const origin = new LatLng(pickup.lat, pickup.lng);
    return {
      building: pickup.building,
      location: { search: pickup.address, selectedPlace: { address: pickup.address, origin } },
    };
  }

  // Only render current search if full place object is available in the URL params
  // TODO bounds are missing - those need to be queried directly from Google Places
  const locationFieldsPresent = publicData?.location?.address && geolocation;
  const location = publicData?.location || {};
  const { address, building } = location;

  return {
    building,
    location: locationFieldsPresent
      ? {
          search: address,
          selectedPlace: { address, origin: geolocation },
        }
      : null,
  };
};

/**
 * Listing attributes to save for the chosen place: the exact address and point go to
 * privateData.pickup, public data gets the area name only, and the public geolocation is the
 * point moved 100–400 m (seeded with the listing id, so re-saving doesn't move it again).
 * Saving `address: null` and `building: null` in public data clears the values of listings
 * saved before this change.
 *
 * @param {Object} values form values: { building, location: { selectedPlace: { address, origin } } }
 * @param {Object?} listing the own listing (its id seeds the offset)
 * @returns {Object} { geolocation, publicData: { location }, privateData: { pickup } }
 */
export const getLocationUpdateValues = (values, listing) => {
  const { building = '', location } = values;
  const {
    selectedPlace: { address, origin },
  } = location;
  const seed = listing?.id?.uuid || address;

  return {
    geolocation: offsetPublicLocation(origin, seed),
    publicData: {
      location: { area: areaFromAddress(address), address: null, building: null },
    },
    privateData: {
      pickup: { address, building, lat: origin.lat, lng: origin.lng },
    },
  };
};

/**
 * The EditListingLocationPanel component.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {propTypes.ownListing} props.listing - The listing object
 * @param {boolean} props.disabled - Whether the form is disabled
 * @param {boolean} props.ready - Whether the form is ready
 * @param {Function} props.onSubmit - The submit function
 * @param {string} props.submitButtonText - The submit button text
 * @param {boolean} props.panelUpdated - Whether the panel is updated
 * @param {boolean} props.updateInProgress - Whether the update is in progress
 * @param {Object} props.errors - The errors object
 * @returns {JSX.Element}
 */
const EditListingLocationPanel = props => {
  // State is needed since LocationAutocompleteInput doesn't have internal state
  // and therefore re-rendering would overwrite the values during XHR call.
  const [state, setState] = useState({ initialValues: getInitialValues(props) });
  const {
    className,
    rootClassName,
    listing,
    disabled,
    ready,
    onSubmit,
    submitButtonText,
    panelUpdated,
    updateInProgress,
    errors,
    updatePageTitle: UpdatePageTitle,
    intl,
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const isPublished = listing?.id && listing?.attributes.state !== LISTING_STATE_DRAFT;

  const panelHeadingProps = isPublished
    ? {
        id: 'EditListingLocationPanel.title',
        values: { listingTitle: <ListingLink listing={listing} />, lineBreak: <br /> },
        messageProps: { listingTitle: listing.attributes.title },
      }
    : {
        id: 'EditListingWizard.stepHeading.location',
        values: { lineBreak: <br /> },
        messageProps: {},
      };

  return (
    <main className={classes}>
      <UpdatePageTitle
        panelHeading={intl.formatMessage(
          { id: panelHeadingProps.id },
          { ...panelHeadingProps.messageProps }
        )}
      />
      <H3 as="h1" rootClassName={isPublished ? null : stepFrameCss.stepHeading}>
        <FormattedMessage id={panelHeadingProps.id} values={{ ...panelHeadingProps.values }} />
      </H3>
      {isPublished ? null : <StepIntro id="EditListingWizard.stepIntro.location" />}
      <EditListingLocationForm
        className={css.form}
        initialValues={state.initialValues}
        onSubmit={values => {
          const { building = '', location } = values;
          const {
            selectedPlace: { address, origin },
          } = location;

          // New values for listing attributes (exact address private, area public)
          const updateValues = getLocationUpdateValues(values, listing);
          // Save the initialValues to state
          // LocationAutocompleteInput doesn't have internal state
          // and therefore re-rendering would overwrite the values during XHR call.
          setState({
            initialValues: {
              building,
              location: { search: address, selectedPlace: { address, origin } },
            },
          });
          onSubmit(updateValues);
        }}
        saveActionMsg={submitButtonText}
        disabled={disabled}
        ready={ready}
        updated={panelUpdated}
        updateInProgress={updateInProgress}
        fetchErrors={errors}
        autoFocus
      />
    </main>
  );
};

export default EditListingLocationPanel;
