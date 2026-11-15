import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../../util/reactIntl';
import { getPublicArea } from '../../../util/listingLocation';
import { Heading } from '../../../components';

import AddressLinkMaybe from './AddressLinkMaybe';

import css from './TransactionPanel.module.css';

/**
 * Pick-up location on the booking page, shown once the owner has accepted. The address comes
 * from the transaction's protected data, where the owner's client copied it on accept
 * (TransactionPage.duck.js). Listings saved before the address became private still carry it in
 * public data. Without either (e.g. accepted from Console), the renter is asked to get it in
 * the messages.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className
 * @param {string?} props.rootClassName
 * @param {Object?} props.listing
 * @param {Object?} props.protectedData transaction protected data (pickup: { address, building, lat, lng })
 * @param {string?} props.providerName owner's display name, for the "ask" text
 * @param {boolean} props.showBookingLocation
 * @returns {JSX.Element|null}
 */
const BookingLocationMaybe = props => {
  const {
    className,
    rootClassName,
    listing,
    protectedData,
    providerName,
    showBookingLocation,
  } = props;
  const classes = classNames(rootClassName || css.bookingLocationContainer, className);

  if (!showBookingLocation) {
    return null;
  }

  const pickup = protectedData?.pickup;
  const legacyLocation = listing?.attributes?.publicData?.location;
  const hasPickup = !!pickup?.address;
  const hasLegacyAddress = !hasPickup && !!legacyLocation?.address;

  const addressProps = hasPickup
    ? {
        location: { address: pickup.address, building: pickup.building },
        geolocation:
          pickup.lat != null && pickup.lng != null ? { lat: pickup.lat, lng: pickup.lng } : null,
      }
    : hasLegacyAddress
    ? { location: legacyLocation, geolocation: listing?.attributes?.geolocation }
    : null;

  const area = getPublicArea(listing?.attributes?.publicData);

  return (
    <div className={classes}>
      <Heading as="h3" rootClassName={css.sectionHeading}>
        <FormattedMessage id="TransactionPanel.bookingLocationHeading" />
      </Heading>
      <div className={css.bookingLocationContent}>
        {addressProps ? (
          <AddressLinkMaybe
            linkRootClassName={css.bookingLocationAddress}
            location={addressProps.location}
            geolocation={addressProps.geolocation}
            showAddress={true}
          />
        ) : (
          <p className={css.bookingLocationAsk}>
            <FormattedMessage
              id={
                area
                  ? 'TransactionPanel.bookingLocationAskWithArea'
                  : 'TransactionPanel.bookingLocationAsk'
              }
              values={{ name: providerName, area }}
            />
          </p>
        )}
      </div>
    </div>
  );
};

export default BookingLocationMaybe;
