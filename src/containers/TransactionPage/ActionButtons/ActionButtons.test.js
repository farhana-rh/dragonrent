import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../../util/testHelpers';

import ActionButtons from './ActionButtons';

const { screen, userEvent } = testingLibrary;

const renderButtons = onDecline =>
  render(
    <ActionButtons
      containerId="desktop"
      showButtons
      primaryButtonProps={{ buttonText: 'Accept', onAction: () => {} }}
      secondaryButtonProps={{
        buttonText: 'Decline',
        onAction: onDecline,
        confirm: { name: 'Mikko' },
      }}
    />
  );

describe('ActionButtons', () => {
  it('asks before declining, and declines on "Yes, decline"', async () => {
    const user = userEvent.setup();
    const onDecline = jest.fn();
    renderButtons(onDecline);

    await user.click(screen.getByRole('button', { name: 'Decline' }));
    expect(onDecline).not.toHaveBeenCalled();
    expect(screen.getByText('ActionButtons.confirmDeclineTitle')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Accept' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ActionButtons.confirmDecline' }));
    expect(onDecline).toHaveBeenCalledTimes(1);
  });

  it('goes back to the buttons on "Go back"', async () => {
    const user = userEvent.setup();
    const onDecline = jest.fn();
    renderButtons(onDecline);

    await user.click(screen.getByRole('button', { name: 'Decline' }));
    await user.click(screen.getByRole('button', { name: 'ActionButtons.confirmGoBack' }));
    expect(onDecline).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument();
  });

  it('runs a secondary action without `confirm` straight away', async () => {
    const user = userEvent.setup();
    const onAction = jest.fn();
    render(
      <ActionButtons
        containerId="desktop"
        showButtons
        secondaryButtonProps={{ buttonText: 'Cancel', onAction }}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
