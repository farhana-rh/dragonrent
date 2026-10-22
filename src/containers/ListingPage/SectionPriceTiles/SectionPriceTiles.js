import React from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { formatMoney } from '../../../util/currency';
import { getDurationPriceTiles } from '../../../util/durationPricing';

import css from './SectionPriceTiles.module.css';

/**
 * Price section of a daily listing (Listing and ListingDesktop mockups): one tile per price the
 * owner has set (1 day, 3 days, 7 days) with the price per day. The tile with the lowest price
 * per day is marked "Best price".
 *
 * @component
 * @param {Object} props
 * @param {Money} props.price listing's day price
 * @param {Object} props.publicData listing's public data
 * @param {string} props.marketplaceCurrency
 * @returns {JSX.Element|null} price tiles section
 */
const SectionPriceTiles = props => {
  const { price, publicData, marketplaceCurrency } = props;
  const intl = useIntl();

  if (!price || price.currency !== marketplaceCurrency) {
    return null;
  }
  const tiles = getDurationPriceTiles(price, publicData);
  if (tiles.length === 0) {
    return null;
  }

  return (
    <section className={css.root} aria-labelledby="listing-price-title">
      <h2 className={css.title} id="listing-price-title">
        <FormattedMessage id="ListingPage.priceTitle" />
      </h2>
      <ul className={css.tiles}>
        {tiles.map(tile => (
          <li
            key={tile.days}
            className={classNames(css.tile, { [css.bestTile]: tile.isBestPrice })}
          >
            {tile.isBestPrice ? (
              <span className={css.bestPrice}>
                <FormattedMessage id="ListingPage.bestPrice" />
              </span>
            ) : null}
            <span className={css.days}>
              <FormattedMessage id="ListingPage.priceTileDays" values={{ days: tile.days }} />
            </span>
            <span className={css.total}>{formatMoney(intl, tile.total)}</span>
            <span className={css.perDay}>
              <FormattedMessage
                id="ListingPage.pricePerDay"
                values={{ price: formatMoney(intl, tile.perDay) }}
              />
            </span>
          </li>
        ))}
      </ul>
      {tiles.length > 1 ? (
        <p className={css.note}>
          <FormattedMessage id="ListingPage.priceNote" />
        </p>
      ) : null}
    </section>
  );
};

export default SectionPriceTiles;
