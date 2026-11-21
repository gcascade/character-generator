import { stubHorde } from '@Test/stubs/horde';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { subjectOfCharacter } from '../../../content/portraitPrompt';
import { generateRandomCharacter } from '../../../content/generate';
import { AlertManagerProvider } from '../../../contexts/AlertManagerContext';
import { PortraitProvider } from '../../../contexts/PortraitContext';
import usePortraits from '../../../hooks/usePortraits';
import PaintPortrait, { NOTICE_KEY } from './PaintPortrait';

const character = generateRandomCharacter({
  race: 'Gnome',
  characterClass: 'Bard',
});

const Shown = ({ id }: { id?: string }) => {
  const portrait = usePortraits().get(id);
  return <p>shown: {portrait ? portrait.image.slice(0, 15) : 'default'}</p>;
};

const Harness = () => {
  const [portraitId, setPortraitId] = useState<string>();
  return (
    <>
      <PaintPortrait
        subject={subjectOfCharacter(character)}
        portraitId={portraitId}
        onPainted={setPortraitId}
        onRemoved={() => setPortraitId(undefined)}
      />
      <Shown id={portraitId} />
    </>
  );
};

const renderHarness = () =>
  render(
    <AlertManagerProvider>
      <PortraitProvider>
        <Harness />
      </PortraitProvider>
    </AlertManagerProvider>,
  );

describe('PaintPortrait (spec 011)', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('shows the privacy notice with the description, then paints and shows progress', async () => {
    const fetch = stubHorde({ queue: [4] });
    renderHarness();
    await userEvent.click(
      screen.getByRole('button', { name: 'Paint a portrait' }),
    );
    expect(screen.getByText(/sent to AI Horde/)).toBeInTheDocument();
    expect(screen.getByText(/gnome/)).toBeInTheDocument();
    expect(screen.queryByText(character.firstName)).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('checkbox', { name: "Don't show this again" }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Paint' }));
    expect(
      await screen.findByText(/In the queue: position 4/),
    ).toBeInTheDocument();
    await act(() => vi.advanceTimersByTimeAsync(5000));
    expect(
      await screen.findByText('shown: data:image/webp'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Paint again' }),
    ).toBeInTheDocument();
    expect(localStorage.getItem(NOTICE_KEY)).toBe('seen');
    expect(JSON.parse(localStorage.getItem('portraits')!).version).toBe(1);
    const body = JSON.parse(fetch.mock.calls[0][1]!.body as string);
    expect(body.prompt).not.toContain(character.firstName);
  });

  it('removes a painted portrait', async () => {
    localStorage.setItem(NOTICE_KEY, 'seen');
    stubHorde({ queue: [] });
    renderHarness();
    await userEvent.click(
      screen.getByRole('button', { name: 'Paint a portrait' }),
    );
    await screen.findByText('shown: data:image/webp');
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove the portrait' }),
    );
    expect(screen.getByText('shown: default')).toBeInTheDocument();
  });

  it('can be cancelled, keeping the previous picture', async () => {
    localStorage.setItem(NOTICE_KEY, 'seen');
    const fetch = stubHorde({ queue: [9, 9, 9, 9] });
    renderHarness();
    await userEvent.click(
      screen.getByRole('button', { name: 'Paint a portrait' }),
    );
    await screen.findByText(/In the queue/);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(
      await screen.findByRole('button', { name: 'Paint a portrait' }),
    ).toBeInTheDocument();
    expect(screen.getByText('shown: default')).toBeInTheDocument();
    expect(fetch.mock.calls.some(([, init]) => init?.method === 'DELETE')).toBe(
      true,
    );
  });

  it('keeps the previous picture when the service cannot be reached', async () => {
    localStorage.setItem(NOTICE_KEY, 'seen');
    stubHorde({ fail: 'unreachable' });
    renderHarness();
    await userEvent.click(
      screen.getByRole('button', { name: 'Paint a portrait' }),
    );
    expect(
      await screen.findByRole('button', { name: 'Paint a portrait' }),
    ).toBeInTheDocument();
    expect(screen.getByText('shown: default')).toBeInTheDocument();
  });

  it('is not offered without a portrait store', () => {
    render(
      <PaintPortrait
        subject={subjectOfCharacter(character)}
        onPainted={vi.fn()}
        onRemoved={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
