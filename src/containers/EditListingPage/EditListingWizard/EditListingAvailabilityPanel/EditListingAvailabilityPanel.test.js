import React from 'react';
import '@testing-library/jest-dom';

import { useIntl } from '../../../../util/reactIntl';
import { createOwnListing } from '../../../../util/testData';
import {
  getDefaultConfiguration,
  getRouteConfiguration,
  renderWithProviders as render,
  testingLibrary,
} from '../../../../util/testHelpers';

import EditListingAvailabilityPanel from './EditListingAvailabilityPanel';

const { screen, userEvent, waitFor } = testingLibrary;

const listingTypes = [
  {
    listingType: 'daily-rental',
    availabilityType: 'oneSeat',
    transactionType: {
      process: 'default-booking',
      alias: 'default-booking/release-1',
      unitType: 'day',
    },
  },
];

const mondayEntry = { dayOfWeek: 'mon', startTime: '00:00', endTime: '00:00', seats: 1 };

const createDraft = availabilityPlan =>
  createOwnListing('listing-draft', {
    title: 'Bosch hammer drill',
    state: 'draft',
    publicData: {
      listingType: 'daily-rental',
      transactionProcessAlias: 'default-booking/release-1',
      unitType: 'day',
    },
    // null overrides the full default plan of createOwnListing: a brand-new draft
    availabilityPlan,
  });

// The panel gets intl from the wizard tab; the test gives it the same way
const PanelWithIntl = props => {
  const intl = useIntl();
  return <EditListingAvailabilityPanel {...props} intl={intl} />;
};

const renderPanel = listing => {
  const config = getDefaultConfiguration();
  const props = {
    listing,
    listingTypes,
    params: { id: listing.id.uuid, slug: 'slug', type: 'draft', tab: 'availability' },
    locationSearch: {},
    monthlyExceptionQueries: {},
    weeklyExceptionQueries: {},
    allExceptions: [],
    onAddAvailabilityException: jest.fn(() => Promise.resolve()),
    onDeleteAvailabilityException: jest.fn(() => Promise.resolve()),
    onFetchExceptions: jest.fn(() => Promise.resolve()),
    onSubmit: jest.fn(() => Promise.resolve()),
    onManageDisableScrolling: jest.fn(),
    onNextTab: jest.fn(),
    submitButtonText: 'Publish',
    updateInProgress: false,
    disabled: false,
    ready: false,
    errors: {},
    config,
    routeConfiguration: getRouteConfiguration(config.layout),
    history: { push: jest.fn(), replace: jest.fn() },
    updatePageTitle: () => null,
  };
  return render(<PanelWithIntl {...props} />, { config, withPortals: true });
};

describe('EditListingAvailabilityPanel (DragonRent)', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
  });

  it('keeps Publish disabled and says why when the schedule has no days', () => {
    renderPanel(
      createDraft({ type: 'availability-plan/time', timezone: 'Europe/Helsinki', entries: [] })
    );

    expect(screen.getByText('EditListingAvailabilityPanel.noOpenDays')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();
  });

  it('enables Publish once at least one day is open', () => {
    renderPanel(
      createDraft({
        type: 'availability-plan/time',
        timezone: 'Europe/Helsinki',
        entries: [mondayEntry],
      })
    );

    expect(screen.queryByText('EditListingAvailabilityPanel.noOpenDays')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publish' })).toBeEnabled();
  });

  it('starts a new schedule in Finnish time and waits for a ticked day before saving', async () => {
    const user = userEvent.setup();
    renderPanel(createDraft(null));

    // Without a plan the step can't continue yet
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();

    await user.click(
      screen.getByRole('button', { name: 'EditListingAvailabilityPanel.setAvailabilityPlan' })
    );
    await waitFor(() => {
      expect(screen.getByText('EditListingAvailabilityPlanForm.title')).toBeInTheDocument();
    });

    // Time zone defaults to Europe/Helsinki, not the browser's zone
    expect(document.getElementById('timezone')).toHaveValue('Europe/Helsinki');

    // No day is pre-ticked: the owner chooses, and Save waits
    const saveButton = screen.getByRole('button', {
      name: 'EditListingAvailabilityPlanForm.saveSchedule',
    });
    expect(saveButton).toBeDisabled();
    expect(screen.getByText('EditListingAvailabilityPlanForm.noDaysSelected')).toBeInTheDocument();
    const monday = screen.getByRole('checkbox', {
      name: /EditListingAvailabilityPlanForm.dayOfWeek.mon/i,
    });
    expect(monday).not.toBeChecked();

    await user.click(monday);

    expect(monday).toBeChecked();
    expect(saveButton).toBeEnabled();
    expect(
      screen.queryByText('EditListingAvailabilityPlanForm.noDaysSelected')
    ).not.toBeInTheDocument();
  });
});
