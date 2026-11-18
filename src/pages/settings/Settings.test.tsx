import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { KEYS_KEY, SETTINGS_KEY } from '../../ai/storage';
import { json, queuedFetch } from '../../ai/providers/testing';
import { AlertManagerProvider } from '../../contexts/AlertManagerContext';
import { SettingsProvider } from '../../contexts/SettingsContext';
import { LocaleProvider } from '../../i18n';
import Settings from './Settings';

vi.unmock('../../hooks/useSettings');

const renderSettings = (locale: 'en' | 'fr' = 'en') =>
  render(
    <LocaleProvider initial={locale}>
      <AlertManagerProvider>
        <SettingsProvider>
          <Settings />
        </SettingsProvider>
      </AlertManagerProvider>
    </LocaleProvider>,
  );

const chooseProvider = async (label: string) => {
  await userEvent.click(screen.getByRole('combobox', { name: 'Provider' }));
  await userEvent.click(
    within(screen.getByRole('listbox')).getByRole('option', { name: label }),
  );
};

const storedSettings = () => JSON.parse(localStorage.getItem(SETTINGS_KEY)!);

describe('Settings', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('defaults to "No AI" with no provider fields', () => {
    renderSettings();
    expect(
      screen.getByRole('combobox', { name: 'Provider' }),
    ).toHaveTextContent('No AI');
    expect(screen.queryByLabelText('Address')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Model')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Test connection' }),
    ).not.toBeInTheDocument();
  });

  it('shows the Ollama defaults and saves the choice', async () => {
    renderSettings();
    await chooseProvider('Ollama (local)');

    expect(screen.getByLabelText('Address')).toHaveValue(
      'http://localhost:11434',
    );
    expect(screen.getByLabelText('Model')).toHaveValue('llama3');
    expect(screen.queryByLabelText(/API key/)).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Save settings' }),
    );
    expect(storedSettings().activeType).toBe('ollama');
  });

  it('keeps typed values when switching provider back and forth', async () => {
    renderSettings();
    await chooseProvider('OpenAI-compatible');
    const address = screen.getByLabelText('Address');
    await userEvent.clear(address);
    await userEvent.type(address, 'https://api.openai.com/v1');

    await chooseProvider('Claude (Anthropic)');
    await chooseProvider('OpenAI-compatible');

    expect(screen.getByLabelText('Address')).toHaveValue(
      'https://api.openai.com/v1',
    );
  });

  it('refuses to save an invalid address', async () => {
    renderSettings();
    await chooseProvider('Ollama (local)');
    const address = screen.getByLabelText('Address');
    await userEvent.clear(address);
    await userEvent.type(address, 'localhost');
    await userEvent.click(
      screen.getByRole('button', { name: 'Save settings' }),
    );

    expect(
      screen.getByText('Enter an http or https address'),
    ).toBeInTheDocument();
    expect(localStorage.getItem(SETTINGS_KEY)).not.toContain('"localhost"');
  });

  it('explains where the key is stored and remembers it by default', async () => {
    renderSettings();
    await chooseProvider('Claude (Anthropic)');

    expect(
      screen.getByText(
        'Your key is stored only in this browser and sent only to Claude.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'Remember on this device' }),
    ).toBeChecked();

    await userEvent.type(screen.getByLabelText(/API key/), 'sk-123');
    await userEvent.click(
      screen.getByRole('button', { name: 'Save settings' }),
    );

    expect(JSON.parse(localStorage.getItem(KEYS_KEY)!)).toEqual({
      anthropic: 'sk-123',
    });
  });

  it('keeps the key for the session only when "remember" is unchecked, and forgets it', async () => {
    renderSettings();
    await chooseProvider('Claude (Anthropic)');
    await userEvent.type(screen.getByLabelText(/API key/), 'sk-123');
    await userEvent.click(
      screen.getByRole('button', { name: 'Save settings' }),
    );

    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Remember on this device' }),
    );
    expect(localStorage.getItem(KEYS_KEY)).toBeNull();
    expect(sessionStorage.getItem(KEYS_KEY)).toContain('sk-123');
    expect(
      screen.getByText('The key will be deleted when you close this tab.'),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Forget key' }));
    expect(sessionStorage.getItem(KEYS_KEY)).toBeNull();
    expect(screen.getByLabelText(/API key/)).toHaveValue('');
  });

  it('tests the connection and offers the available models', async () => {
    vi.stubGlobal(
      'fetch',
      queuedFetch(
        json({ data: [{ id: 'llama3:latest' }, { id: 'mistral:latest' }] }),
        json({ choices: [{ message: { content: '{"ok":true}' } }] }),
      ),
    );
    renderSettings();
    await chooseProvider('Ollama (local)');
    await userEvent.click(
      screen.getByRole('button', { name: 'Test connection' }),
    );

    expect(
      await screen.findByText(/Connected to Ollama with the model "llama3"/),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Model'));
    expect(
      await screen.findByRole('option', { name: 'mistral:latest' }),
    ).toBeInTheDocument();
  });

  it('names the cause when the connection fails', async () => {
    vi.stubGlobal(
      'fetch',
      queuedFetch(
        new TypeError('Failed to fetch'),
        new TypeError('Failed to fetch'),
      ),
    );
    renderSettings();
    await chooseProvider('Ollama (local)');
    await userEvent.click(
      screen.getByRole('button', { name: 'Test connection' }),
    );

    expect(
      await screen.findByText(
        /Couldn't reach Ollama at http:\/\/localhost:11434/,
      ),
    ).toBeInTheDocument();
  });

  it('is fully in French when the interface is French', () => {
    renderSettings('fr');
    expect(
      screen.getByRole('heading', { name: 'Réglages du générateur' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'Fournisseur' }),
    ).toHaveTextContent("Pas d'IA");
    expect(
      screen.getByRole('button', { name: 'Enregistrer' }),
    ).toBeInTheDocument();
  });

  it('changes the interface language', async () => {
    renderSettings('en');
    await userEvent.click(screen.getByRole('combobox', { name: 'Language' }));
    await userEvent.click(screen.getByRole('option', { name: 'French' }));
    expect(
      screen.getByRole('button', { name: 'Enregistrer' }),
    ).toBeInTheDocument();
  });
});
