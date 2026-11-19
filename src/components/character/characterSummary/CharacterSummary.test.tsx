import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { eryndorThorne } from '../../../../test/stubs/Character.stubs';
import { AlertManagerContext } from '../../../contexts/AlertManagerContext';
import { DataContext } from '../../../contexts/DataContext';
import useAlert from '../../../hooks/useAlert';
import CharacterSummary from './CharacterSummary';

vi.mock('../../../hooks/useAlert');

describe('CharacterSummary', () => {
  const mockRemoveCharacter = vi.fn();
  const mockAddSuccess = vi.fn();

  beforeEach(() => {
    vi.mocked(useAlert).mockReturnValue({
      addSuccess: mockAddSuccess,
      addError: vi.fn(),
      addWarning: vi.fn(),
      addInfo: vi.fn(),
    });
  });

  const renderComponent = () =>
    render(
      <DataContext.Provider
        value={{
          characters: [],
          saveCharacter: vi.fn(),
          removeCharacter: mockRemoveCharacter,
          updateCharacter: vi.fn(),
          findCharacter: vi.fn(),
        }}
      >
        <AlertManagerContext.Provider
          value={{ alerts: [], addAlert: vi.fn(), removeAlert: vi.fn() }}
        >
          <CharacterSummary character={{ ...eryndorThorne, id: 'eryndor' }} />
        </AlertManagerContext.Provider>
      </DataContext.Provider>,
    );

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText(/Eryndor Thorne/)).toBeInTheDocument();
    expect(screen.getByText(/The Unyielding/)).toBeInTheDocument();
    expect(screen.getByText(/Human/)).toBeInTheDocument();
    expect(screen.getByText(/Warrior/)).toBeInTheDocument();
    expect(screen.getByText(/Male/)).toBeInTheDocument();
    expect(screen.getByText(/53/)).toBeInTheDocument();
    expect(screen.getByText(/Lawful Good/)).toBeInTheDocument();
  });

  it('shows confirmation tooltip when delete button is clicked once', () => {
    renderComponent();
    const deleteButton = screen.getByLabelText('Delete');
    fireEvent.click(deleteButton);
    expect(screen.getByText('Click again to confirm')).toBeInTheDocument();
  });

  it('removes character and shows success alert when delete button is clicked twice', () => {
    renderComponent();
    const deleteButton = screen.getByLabelText('Delete');
    fireEvent.click(deleteButton);
    fireEvent.click(deleteButton);
    expect(mockRemoveCharacter).toHaveBeenCalledWith('eryndor');
    expect(mockAddSuccess).toHaveBeenCalledWith('Character removed');
  });

  it('resets confirmation if clicking outside the delete button', () => {
    renderComponent();
    const deleteButton = screen.getByLabelText('Delete');
    fireEvent.click(deleteButton);
    expect(screen.getByText('Click again to confirm')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(
      screen.queryByText('Click again to confirm'),
    ).not.toBeInTheDocument();
  });
});
