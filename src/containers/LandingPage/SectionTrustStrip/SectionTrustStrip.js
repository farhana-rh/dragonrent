import React, { useRef } from 'react';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';

import { NamedLink } from '../../../components';

import { trustFacts } from '../landingPageConfig';

import css from './SectionTrustStrip.module.css';

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6zM9 12l2 2 4-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M3 8h10M9 4l4 4-4 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className={css.checkIcon}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M5 12.5l4.5 4.5L19 7.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M6 6l12 12M18 6L6 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * High-trust strip under the hero (HomeSticker.html "guarantee strip"), with the facts DragonRent
 * can stand behind today instead of the mockup's concept guarantee: renters pay only when the
 * lender accepts, and can cancel free within 24 hours. "How payments work" opens a native
 * <dialog> with the details. Calm styling on purpose: no stickers or jokes around money.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @returns {JSX.Element} trust strip section
 */
const SectionTrustStrip = props => {
  const { sectionId } = props;
  const intl = useIntl();
  const dialogRef = useRef(null);
  const titleId = `${sectionId}-title`;
  const dialogTitleId = `${sectionId}-dialog-title`;

  const openDialog = () => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  };

  const closeDialog = () => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
  };

  // A click on the backdrop lands on the <dialog> element itself
  const onDialogClick = e => {
    if (e.target === dialogRef.current) {
      closeDialog();
    }
  };

  return (
    <section id={sectionId} className={css.root} aria-labelledby={titleId}>
      <div className={css.content}>
        <span className={css.icon}>
          <ShieldIcon />
        </span>
        <div className={css.text}>
          <h2 id={titleId} className={css.title}>
            <FormattedMessage id="LandingPage.trustStrip.title" />
          </h2>
          <p className={css.description}>
            <FormattedMessage id="LandingPage.trustStrip.text" />
          </p>
        </div>
        <button
          type="button"
          className={css.detailsButton}
          onClick={openDialog}
          aria-haspopup="dialog"
        >
          <FormattedMessage id="LandingPage.trustStrip.button" />
          <ArrowIcon />
        </button>
      </div>

      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={dialogRef}
        className={css.dialog}
        aria-labelledby={dialogTitleId}
        onClick={onDialogClick}
      >
        <div className={css.dialogHeader}>
          <div>
            <span className={css.dialogEyebrow}>
              <FormattedMessage id="LandingPage.trustStrip.dialogEyebrow" />
            </span>
            <h2 id={dialogTitleId} className={css.dialogTitle}>
              <FormattedMessage id="LandingPage.trustStrip.dialogTitle" />
            </h2>
          </div>
          <button
            type="button"
            className={css.closeIcon}
            onClick={closeDialog}
            aria-label={intl.formatMessage({ id: 'LandingPage.trustStrip.close' })}
          >
            <CloseIcon />
          </button>
        </div>
        <ul className={css.facts}>
          {trustFacts.map(fact => (
            <li key={fact} className={css.fact}>
              <CheckIcon />
              <span>
                <FormattedMessage id={`LandingPage.trustStrip.fact.${fact}`} />
              </span>
            </li>
          ))}
        </ul>
        <p className={css.policies}>
          <FormattedMessage
            id="LandingPage.trustStrip.policies"
            values={{
              cancellationLink: (
                <NamedLink name="CMSPage" params={{ pageId: 'cancellation-policy' }}>
                  <FormattedMessage id="LandingPage.trustStrip.cancellationLink" />
                </NamedLink>
              ),
              termsLink: (
                <NamedLink name="CMSPage" params={{ pageId: 'terms-of-service' }}>
                  <FormattedMessage id="LandingPage.trustStrip.termsLink" />
                </NamedLink>
              ),
            }}
          />
        </p>
        <button type="button" className={css.closeButton} onClick={closeDialog}>
          <FormattedMessage id="LandingPage.trustStrip.close" />
        </button>
      </dialog>
    </section>
  );
};

export default SectionTrustStrip;
