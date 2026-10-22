import React from 'react';
import '@testing-library/jest-dom';
import { Form as FinalForm } from 'react-final-form';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import FieldTextInput from './FieldTextInput';

const { screen, userEvent } = testingLibrary;

const renderField = type =>
  render(
    <FinalForm
      onSubmit={() => {}}
      render={() => <FieldTextInput id="field" name="field" type={type} label="Field" />}
    />
  );

describe('FieldTextInput', () => {
  it('shows and hides a password', async () => {
    const user = userEvent.setup();
    renderField('password');
    const input = screen.getByLabelText('Field');
    expect(input).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'FieldTextInput.showPassword' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'FieldTextInput.hidePassword' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    await user.click(screen.getByRole('button', { name: 'FieldTextInput.hidePassword' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('has no toggle for other fields', () => {
    renderField('text');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
