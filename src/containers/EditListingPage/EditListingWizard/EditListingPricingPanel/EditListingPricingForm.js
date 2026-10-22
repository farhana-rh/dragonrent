import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

// Import configs and util modules
import appSettings from '../../../../config/settings';
import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import * as validators from '../../../../util/validators';
import { formatMoney } from '../../../../util/currency';
import { types as sdkTypes } from '../../../../util/sdkLoader';
import { FIXED, isBookingProcess } from '../../../../transactions/transaction';

// Import shared components
import { Button, Form, FieldCurrencyInput } from '../../../../components';

import BookingPriceVariants from './BookingPriceVariants';
import StartTimeInterval from './StartTimeInverval';

// Import modules from this directory
import css from './EditListingPricingForm.module.css';

const { Money } = sdkTypes;

const getPriceValidators = (listingMinimumPriceSubUnits, marketplaceCurrency, intl) => {
  const priceRequiredMsgId = { id: 'EditListingPricingForm.priceRequired' };
  const priceRequiredMsg = intl.formatMessage(priceRequiredMsgId);
  const priceRequired = validators.required(priceRequiredMsg);

  const minPriceRaw = new Money(listingMinimumPriceSubUnits, marketplaceCurrency);
  const minPrice = formatMoney(intl, minPriceRaw);
  const priceTooLowMsgId = { id: 'EditListingPricingForm.priceTooLow' };
  const priceTooLowMsg = intl.formatMessage(priceTooLowMsgId, { minPrice });
  const minPriceRequired = validators.moneySubUnitAmountAtLeast(
    priceTooLowMsg,
    listingMinimumPriceSubUnits
  );

  return listingMinimumPriceSubUnits
    ? validators.composeValidators(priceRequired, minPriceRequired)
    : priceRequired;
};

// DragonRent duration pricing (docs/SCOPE.md): optional 3-day and 7-day prices for daily listings.
// The server calculates the price from these (server/api-util/lineItems.js); these checks keep the
// prices sensible: a longer rental never costs less than a shorter one or more than paying by day.
const DAY = 'day';

const amountOf = money => (money instanceof Money ? money.amount : null);

/**
 * Validator for the optional 3-day price: at least the 1-day price, at most 3 × the 1-day price.
 *
 * @param {Object} intl
 * @returns {Function} final-form field validator (value, allValues)
 */
export const validatePrice3Days = intl => (value, allValues) => {
  const price3 = amountOf(value);
  const daily = amountOf(allValues?.price);
  if (price3 == null || daily == null) {
    return undefined;
  }
  if (price3 > daily * 3) {
    const max = formatMoney(intl, new Money(daily * 3, value.currency));
    return intl.formatMessage({ id: 'EditListingPricingForm.price3DaysTooHigh' }, { max });
  }
  if (price3 < daily) {
    const min = formatMoney(intl, new Money(daily, value.currency));
    return intl.formatMessage({ id: 'EditListingPricingForm.price3DaysTooLow' }, { min });
  }
  return undefined;
};

/**
 * Validator for the optional 7-day price: at least the 3-day price (or the 1-day price when there
 * is no 3-day price), at most 7 × the 1-day price.
 *
 * @param {Object} intl
 * @returns {Function} final-form field validator (value, allValues)
 */
export const validatePrice7Days = intl => (value, allValues) => {
  const price7 = amountOf(value);
  const daily = amountOf(allValues?.price);
  const price3 = amountOf(allValues?.price3Days);
  if (price7 == null || daily == null) {
    return undefined;
  }
  if (price7 > daily * 7) {
    const max = formatMoney(intl, new Money(daily * 7, value.currency));
    return intl.formatMessage({ id: 'EditListingPricingForm.price7DaysTooHigh' }, { max });
  }
  const minimum = price3 != null ? price3 : daily;
  if (price7 < minimum) {
    const min = formatMoney(intl, new Money(minimum, value.currency));
    return intl.formatMessage(
      { id: 'EditListingPricingForm.price7DaysTooLow' },
      { min, hasPrice3: price3 != null ? 'yes' : 'no' }
    );
  }
  return undefined;
};

const formatAmount = (intl, amount, currency) =>
  formatMoney(intl, new Money(Math.round(amount), currency));

/**
 * Live hints under the 3-day and 7-day prices (ListPrices mockup): what the price works out to
 * per day and how much renters save, or what renters pay when the field is left empty.
 * Invalid prices get no live hint: the field shows its validation error instead.
 *
 * @param {Object} values form values (price, price3Days, price7Days as Money)
 * @param {Object} intl
 * @returns {{ hint3: string|null, hint7: string|null }} null when there's no live hint to show
 */
export const getDurationPriceHints = (values, intl) => {
  const daily = amountOf(values?.price);
  if (daily == null) {
    return { hint3: null, hint7: null };
  }
  const { currency } = values.price;
  const price3 = amountOf(values.price3Days);
  const price7 = amountOf(values.price7Days);
  const isValid3 = price3 != null && !validatePrice3Days(intl)(values.price3Days, values);
  const isValid7 = price7 != null && !validatePrice7Days(intl)(values.price7Days, values);

  const tierHint = (total, days, shorterRatePerDay) => {
    const save = shorterRatePerDay * days - total;
    return intl.formatMessage(
      { id: 'EditListingPricingForm.durationHintPerDay' },
      {
        perDay: formatAmount(intl, total / days, currency),
        save: save >= 1 ? formatAmount(intl, save, currency) : 'none',
      }
    );
  };
  const emptyHint = ratePerDay =>
    intl.formatMessage(
      { id: 'EditListingPricingForm.durationHintEmpty' },
      { perDay: formatAmount(intl, ratePerDay, currency) }
    );

  // A week is compared with the best shorter rate: the 3-day price per day, when it's set
  const rateBeforeWeek = isValid3 ? Math.min(price3 / 3, daily) : daily;

  return {
    hint3: price3 == null ? emptyHint(daily) : isValid3 ? tierHint(price3, 3, daily) : null,
    hint7:
      price7 == null
        ? emptyHint(rateBeforeWeek)
        : isValid7
        ? tierHint(price7, 7, rateBeforeWeek)
        : null,
  };
};

// A price field with its label above and a hint below (DESIGN.md: labels above fields)
const DurationPriceField = props => {
  const {
    id,
    name,
    label,
    hint,
    isOptional,
    currencyConfig,
    validate,
    autoFocus,
    placeholder,
    intl,
  } = props;
  const labelWithOptional = isOptional ? (
    <>
      {label}{' '}
      <span className={css.optional}>
        {intl.formatMessage({ id: 'EditListingPricingForm.optional' })}
      </span>
    </>
  ) : (
    label
  );
  return (
    <div className={css.priceField}>
      <FieldCurrencyInput
        id={id}
        name={name}
        className={css.input}
        autoFocus={autoFocus}
        label={labelWithOptional}
        placeholder={
          placeholder || intl.formatMessage({ id: 'EditListingPricingForm.priceInputPlaceholder' })
        }
        currencyConfig={currencyConfig}
        validate={validate}
      />
      <p className={css.hint} aria-live="polite">
        {hint}
      </p>
    </div>
  );
};

const ErrorMessages = props => {
  const { fetchErrors } = props;
  const { updateListingError, showListingsError } = fetchErrors || {};

  return (
    <>
      {updateListingError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingPricingForm.updateFailed" />
        </p>
      ) : null}
      {showListingsError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingPricingForm.showListingFailed" />
        </p>
      ) : null}
    </>
  );
};

/**
 * The EditListingPricingForm component.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.formId] - The form id
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {string} props.unitType - The unitType from listing.attributes.publicData
 * @param {Object} [props.listingTypeConfig] - The listing type config that matches with listingType on publicData.
 * @param {Object} [props.listingTypeConfig.priceVariations] - The price variations config.
 * @param {boolean} props.listingTypeConfig.priceVariations.enabled - Whether the price variations are enabled.
 * @param {Object} [props.listingTypeConfig.transactionType] - The transaction type config.
 * @param {string} props.listingTypeConfig.transactionType.process - The transaction process config.
 * @param {string} props.marketplaceCurrency - The marketplace currency
 * @param {number} [props.listingMinimumPriceSubUnits] - The listing minimum price sub units
 * @param {boolean} [props.autoFocus] - Whether the input should be focused
 * @param {boolean} [props.disabled] - Whether the form is disabled
 * @param {boolean} [props.ready] - Whether the form is ready
 * @param {Function} props.onSubmit - The submit function
 * @param {boolean} [props.invalid] - Whether the form is invalid
 * @param {boolean} [props.pristine] - Whether the form is pristine
 * @param {string} props.saveActionMsg - The save action message
 * @param {boolean} [props.updated] - Whether the form is updated
 * @param {boolean} [props.updateInProgress] - Whether the form is updating
 * @param {Object} [props.fetchErrors] - The fetch errors
 * @returns {JSX.Element}
 */
export const EditListingPricingForm = props => (
  <FinalForm
    mutators={{ ...arrayMutators }}
    {...props}
    render={formRenderProps => {
      const {
        formId = 'EditListingPricingForm',
        form: formApi,
        autoFocus,
        className,
        rootClassName,
        disabled,
        ready,
        handleSubmit,
        marketplaceCurrency,
        unitType,
        listingTypeConfig,
        isPriceVariationsInUse,
        listingMinimumPriceSubUnits = 0,
        invalid,
        pristine,
        saveActionMsg,
        updated,
        updateInProgress = false,
        fetchErrors,
        initialValues: formInitialValues,
        values: formValues,
      } = formRenderProps;

      const intl = useIntl();
      const priceValidators = getPriceValidators(
        listingMinimumPriceSubUnits,
        marketplaceCurrency,
        intl
      );

      const classes = classNames(rootClassName || css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;
      const { transactionType } = listingTypeConfig || {};
      const { process } = transactionType || {};
      const isBooking = isBookingProcess(process);

      const isFixedLengthBooking = isBooking && unitType === FIXED;
      const isBookingPriceVariationsInUse = isBooking && isPriceVariationsInUse;
      const isUsingPriceVariants = isFixedLengthBooking || isBookingPriceVariationsInUse;
      const isDurationPricing = isBooking && unitType === DAY && !isUsingPriceVariants;
      const currencyConfig = appSettings.getCurrencyFormatting(marketplaceCurrency);
      const { hint3, hint7 } = isDurationPricing ? getDurationPriceHints(formValues, intl) : {};
      const optionalPlaceholder = intl.formatMessage({
        id: 'EditListingPricingForm.optionalPricePlaceholder',
      });

      return (
        <Form onSubmit={handleSubmit} className={classes}>
          <ErrorMessages fetchErrors={fetchErrors} />

          {isDurationPricing ? (
            <div className={css.durationPrices}>
              <p className={css.intro}>
                <FormattedMessage id="EditListingPricingForm.durationIntro" />
              </p>
              <DurationPriceField
                id={`${formId}price`}
                name="price"
                autoFocus={autoFocus}
                label={intl.formatMessage({ id: 'EditListingPricingForm.price1Day' })}
                hint={intl.formatMessage({ id: 'EditListingPricingForm.price1DayHint' })}
                currencyConfig={currencyConfig}
                validate={priceValidators}
                intl={intl}
              />
              <DurationPriceField
                id={`${formId}price3Days`}
                name="price3Days"
                isOptional
                label={intl.formatMessage({ id: 'EditListingPricingForm.price3Days' })}
                hint={hint3 || intl.formatMessage({ id: 'EditListingPricingForm.price3DaysHint' })}
                placeholder={optionalPlaceholder}
                currencyConfig={currencyConfig}
                validate={validatePrice3Days(intl)}
                intl={intl}
              />
              <DurationPriceField
                id={`${formId}price7Days`}
                name="price7Days"
                isOptional
                label={intl.formatMessage({ id: 'EditListingPricingForm.price7Days' })}
                hint={hint7 || intl.formatMessage({ id: 'EditListingPricingForm.price7DaysHint' })}
                placeholder={optionalPlaceholder}
                currencyConfig={currencyConfig}
                validate={validatePrice7Days(intl)}
                intl={intl}
              />
            </div>
          ) : isUsingPriceVariants ? (
            <BookingPriceVariants
              formId={formId}
              formApi={formApi}
              autoFocus={autoFocus}
              className={css.input}
              marketplaceCurrency={marketplaceCurrency}
              unitType={unitType}
              isPriceVariationsInUse={isBookingPriceVariationsInUse}
              initialLengthOfPriceVariants={formInitialValues?.priceVariants?.length || 0}
              listingMinimumPriceSubUnits={listingMinimumPriceSubUnits}
            />
          ) : (
            <FieldCurrencyInput
              id={`${formId}price`}
              name="price"
              className={css.input}
              autoFocus={autoFocus}
              label={intl.formatMessage(
                { id: 'EditListingPricingForm.pricePerProduct' },
                { unitType }
              )}
              placeholder={intl.formatMessage({
                id: 'EditListingPricingForm.priceInputPlaceholder',
              })}
              currencyConfig={appSettings.getCurrencyFormatting(marketplaceCurrency)}
              validate={priceValidators}
            />
          )}

          {isFixedLengthBooking ? (
            <StartTimeInterval
              name="startTimeInterval"
              idPrefix={`${formId}_startTimeInterval`}
              formValues={formValues}
              pristine={pristine}
            />
          ) : null}

          <Button
            className={css.submitButton}
            type="submit"
            inProgress={submitInProgress}
            disabled={submitDisabled}
            ready={submitReady}
          >
            {saveActionMsg}
          </Button>
        </Form>
      );
    }}
  />
);

export default EditListingPricingForm;
