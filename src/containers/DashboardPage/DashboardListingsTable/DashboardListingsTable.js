import React from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { formatMoney } from '../../../util/currency';
import {
  LISTING_STATE_CLOSED,
  LISTING_STATE_DRAFT,
  LISTING_STATE_PENDING_APPROVAL,
  LISTING_STATE_PUBLISHED,
} from '../../../util/types';
import {
  LISTING_PAGE_PARAM_TYPE_DRAFT,
  LISTING_PAGE_PARAM_TYPE_EDIT,
  createSlug,
} from '../../../util/urlHelpers';

import { NamedLink, ResponsiveImage } from '../../../components';

import css from './DashboardListingsTable.module.css';

const STATUS_CLASSES = {
  [LISTING_STATE_PUBLISHED]: css.statusPublished,
  [LISTING_STATE_CLOSED]: css.statusMuted,
  [LISTING_STATE_DRAFT]: css.statusMuted,
  [LISTING_STATE_PENDING_APPROVAL]: css.statusPending,
};

/**
 * Where a listing's title links to: the public listing page when it's published, otherwise
 * the listing editor.
 *
 * @param {Object} listing own listing
 * @returns {Object} NamedLink props
 */
export const getListingLinkProps = listing => {
  const { title = '', state } = listing.attributes;
  const id = listing.id.uuid;
  const slug = createSlug(title);

  if (state === LISTING_STATE_PUBLISHED) {
    return { name: 'ListingPage', params: { id, slug } };
  }
  const type =
    state === LISTING_STATE_DRAFT ? LISTING_PAGE_PARAM_TYPE_DRAFT : LISTING_PAGE_PARAM_TYPE_EDIT;
  return { name: 'EditListingPage', params: { id, slug, type, tab: 'details' } };
};

const Price = ({ listing, intl }) => {
  const { price, publicData } = listing.attributes;
  if (!price) {
    return <span className={css.muted}>–</span>;
  }
  return (
    <>
      {formatMoney(intl, price)}
      {publicData?.unitType ? (
        <span className={css.unit}>
          {' '}
          <FormattedMessage
            id="DashboardPage.listings.perUnit"
            values={{ unitType: publicData.unitType }}
          />
        </span>
      ) : null}
    </>
  );
};

/**
 * The current user's latest listings: image, title, price and status.
 * A table from tablet up, stacked rows on mobile.
 *
 * @component
 * @param {Object} props
 * @param {Array<Object>} props.listings own listings with images included
 * @returns {JSX.Element} listings table
 */
const DashboardListingsTable = props => {
  const { listings } = props;
  const intl = useIntl();

  return (
    <table className={css.root}>
      <thead className={css.head}>
        <tr>
          <th scope="col" className={css.headCell}>
            <FormattedMessage id="DashboardPage.listings.columnItem" />
          </th>
          <th scope="col" className={css.headCell}>
            <FormattedMessage id="DashboardPage.listings.columnPrice" />
          </th>
          <th scope="col" className={css.headCell}>
            <FormattedMessage id="DashboardPage.listings.columnStatus" />
          </th>
        </tr>
      </thead>
      <tbody className={css.body}>
        {listings.map(listing => {
          const { title, state } = listing.attributes;
          const image = listing.images?.[0];
          return (
            <tr key={listing.id.uuid} className={css.row}>
              <th scope="row" className={css.itemCell}>
                <div className={css.item}>
                  <div className={css.thumbnail}>
                    {image ? (
                      <ResponsiveImage
                        rootClassName={css.thumbnailImage}
                        alt=""
                        image={image}
                        variants={['square-small', 'square-small2x']}
                        sizes="48px"
                      />
                    ) : null}
                  </div>
                  <NamedLink className={css.title} {...getListingLinkProps(listing)}>
                    {title}
                  </NamedLink>
                </div>
              </th>
              <td className={css.priceCell}>
                <Price listing={listing} intl={intl} />
              </td>
              <td className={css.statusCell}>
                <span className={classNames(css.status, STATUS_CLASSES[state])}>
                  <FormattedMessage id="DashboardPage.listings.status" values={{ state }} />
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default DashboardListingsTable;
