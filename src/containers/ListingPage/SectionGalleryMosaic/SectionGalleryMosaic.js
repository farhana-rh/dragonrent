import React, { useState } from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';

import { Modal, ResponsiveImage } from '../../../components';

import ImageCarousel from '../ImageCarousel/ImageCarousel';

import css from './SectionGalleryMosaic.module.css';

const SHOW_ALL_PHOTOS_BUTTON_ID = 'showAllPhotosButton';
const MAX_TILES = 5;
const IMAGE_VARIANTS = ['scaled-small', 'scaled-medium', 'scaled-large', 'scaled-xlarge'];
// Same sizes as ListingImageGallery's main slide, so the browser can reuse the image it
// already downloaded for the (hidden on desktop) mobile gallery.
const MAIN_IMAGE_SIZES =
  '(max-width: 1024px) 100vw, (max-width: 1200px) calc(100vw - 192px), 708px';
const SMALL_IMAGE_SIZES = '(max-width: 1120px) 25vw, 264px';

const IconGrid = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
    <path
      d="M1 1h5v5H1zM8 1h5v5H8zM1 8h5v5H1zM8 8h5v5H8z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
    />
  </svg>
);

/**
 * Desktop photo mosaic: one large photo and up to four smaller ones.
 * "Show all photos" opens the full image carousel in a modal.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.listing API entity with images
 * @param {Function} props.onManageDisableScrolling
 * @returns {JSX.Element|null} gallery mosaic
 */
const SectionGalleryMosaic = props => {
  const { listing, onManageDisableScrolling } = props;
  const intl = useIntl();
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const images = listing.images || [];

  if (images.length === 0) {
    return null;
  }

  const tiles = images.slice(0, MAX_TILES);
  const openCarousel = () => setIsCarouselOpen(true);

  return (
    <section className={css.root}>
      <div className={classNames(css.grid, css[`count${tiles.length}`])}>
        {tiles.map((image, i) => (
          <button
            key={image.id.uuid}
            type="button"
            className={classNames(css.tile, { [css.mainTile]: i === 0 })}
            onClick={openCarousel}
            aria-label={intl.formatMessage(
              { id: 'ListingPage.openPhoto' },
              { index: i + 1, count: images.length }
            )}
          >
            <ResponsiveImage
              rootClassName={css.image}
              image={image}
              alt=""
              variants={IMAGE_VARIANTS}
              sizes={i === 0 ? MAIN_IMAGE_SIZES : SMALL_IMAGE_SIZES}
              loading="lazy"
            />
          </button>
        ))}
      </div>
      <button
        id={SHOW_ALL_PHOTOS_BUTTON_ID}
        type="button"
        className={css.showAllButton}
        onClick={openCarousel}
      >
        <IconGrid />
        <FormattedMessage id="ListingPage.showAllPhotos" values={{ count: images.length }} />
      </button>

      <Modal
        id="ListingPage.galleryMosaicCarousel"
        scrollLayerClassName={css.carouselModalScrollLayer}
        containerClassName={css.carouselModalContainer}
        lightCloseButton
        isOpen={isCarouselOpen}
        onClose={() => setIsCarouselOpen(false)}
        usePortal
        onManageDisableScrolling={onManageDisableScrolling}
        focusElementId={SHOW_ALL_PHOTOS_BUTTON_ID}
      >
        {isCarouselOpen ? <ImageCarousel images={images} imageVariants={IMAGE_VARIANTS} /> : null}
      </Modal>
    </section>
  );
};

export default SectionGalleryMosaic;
