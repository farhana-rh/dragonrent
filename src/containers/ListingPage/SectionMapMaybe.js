import React, { Component } from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { propTypes } from '../../util/types';
import { Heading, Map } from '../../components';

import css from './ListingPage.module.css';

/**
 * Pick-up and return: where to pick the item up and a map of the rough area. With fuzzy
 * location on (configMaps.js), the map shows a circle around the listing's public point. That
 * point is already 100–400 m off the real one (util/listingLocation.js), so it isn't moved
 * again here: the real point then always lies inside the 500 m circle.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {propTypes.latlng} [props.geolocation] - The geolocation
 * @param {propTypes.uuid} props.listingId - The listing id
 * @param {string} props.authorDisplayName - The owner's display name
 * @param {string?} props.area - Rough area of the listing (never the exact address)
 * @returns {JSX.Element} section map maybe component
 */
class SectionMapMaybe extends Component {
  constructor(props) {
    super(props);
    this.state = { isStatic: true };
  }

  render() {
    const {
      className,
      rootClassName,
      geolocation,
      publicData,
      listingId,
      mapsConfig,
      authorDisplayName,
      area,
    } = this.props;

    if (!geolocation) {
      return null;
    }

    const address = publicData && publicData.location ? publicData.location.address : '';
    const classes = classNames(rootClassName || css.sectionMap, className);

    const mapProps = mapsConfig.fuzzy.enabled
      ? { obfuscatedCenter: geolocation }
      : { address, center: geolocation };
    const map = <Map {...mapProps} useStaticMap={this.state.isStatic} />;

    return (
      <section className={classes} id="listing-location">
        <div className={css.pickUpText}>
          <Heading as="h2" rootClassName={css.sectionHeading}>
            <FormattedMessage id="ListingPage.pickUpTitle" />
          </Heading>
          <p className={css.pickUpDescription}>
            <FormattedMessage
              id={area ? 'ListingPage.pickUpText' : 'ListingPage.pickUpTextNoArea'}
              values={{ name: authorDisplayName, area }}
            />
          </p>
        </div>
        {this.state.isStatic ? (
          <button
            className={css.map}
            onClick={() => {
              this.setState({ isStatic: false });
            }}
          >
            {map}
          </button>
        ) : (
          <div className={css.map}>{map}</div>
        )}
      </section>
    );
  }
}

export default SectionMapMaybe;
