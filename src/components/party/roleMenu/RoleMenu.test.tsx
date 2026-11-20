import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { LocaleProvider } from '../../../i18n';
import RoleMenu from './RoleMenu';

describe('RoleMenu', () => {
  it('shows the role read-only without a handler', () => {
    render(<RoleMenu role="role-scout" gender="Male" name="Ash" />);
    expect(screen.getByText('Scout')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('offers every role and "Random"', async () => {
    const onChange = vi.fn();
    render(
      <RoleMenu
        role="role-scout"
        gender="Male"
        name="Ash"
        onChange={onChange}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Role of Ash: Scout' }),
    );
    expect(screen.getAllByRole('menuitem')).toHaveLength(11);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Healer' }));
    expect(onChange).toHaveBeenCalledWith('role-healer');
    await userEvent.click(
      screen.getByRole('button', { name: 'Role of Ash: Scout' }),
    );
    await userEvent.click(screen.getByRole('menuitem', { name: 'Random' }));
    expect(onChange).toHaveBeenLastCalledWith('random');
  });

  it('agrees with the gender in French', () => {
    render(
      <LocaleProvider initial="fr">
        <RoleMenu role="role-healer" gender="Female" name="Ilde" />
      </LocaleProvider>,
    );
    expect(screen.getByText('Soigneuse')).toBeInTheDocument();
  });
});
