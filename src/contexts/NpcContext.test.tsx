import { act, renderHook } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { generateNpc } from '../content/npc';
import { NPC_KEY, NPCS_KEY } from '../content/storedNpc';
import useNpcs from '../hooks/useNpcs';
import { NpcProvider } from './NpcContext';

const wrapper = ({ children }: { children: ReactNode }) => (
  <NpcProvider>{children}</NpcProvider>
);
const setup = () => renderHook(useNpcs, { wrapper });
const stored = (key: string) => JSON.parse(localStorage.getItem(key)!);

describe('NpcProvider', () => {
  beforeEach(() => localStorage.clear());

  it('shows an NPC from the start and stores it', () => {
    const { result } = setup();
    expect(result.current.npc.firstName).toBeTruthy();
    expect(stored(NPC_KEY).current).toEqual(result.current.npc);
  });

  it('generates within the constraints and keeps locked values', () => {
    const { result } = setup();
    act(() => result.current.setConstraint('occupation', 'Sailor'));
    act(() => result.current.toggleLock('lastName'));
    const lastName = result.current.npc.lastName;
    for (let i = 0; i < 20; i++) {
      act(() => {
        result.current.generate();
      });
      expect(result.current.npc.occupation).toBe('Sailor');
      expect(result.current.npc.lastName).toBe(lastName);
    }
  });

  it('generates a batch and opens one of its NPCs', () => {
    const { result } = setup();
    act(() => result.current.generateBatch());
    expect(result.current.batch).toHaveLength(5);
    act(() => result.current.openFromBatch(2));
    expect(result.current.npc).toBe(result.current.batch[2]);
  });

  it('rerolls one section, and tells when nothing else fits', () => {
    const { result } = setup();
    const before = result.current.npc;
    let changed = false;
    act(() => {
      changed = result.current.reroll('secret');
    });
    expect(changed).toBe(true);
    expect(result.current.npc.content.secret).not.toBe(before.content.secret);
    expect(result.current.npc.content.rumour).toBe(before.content.rumour);

    act(() => result.current.setNpc(generateNpc({ race: 'Elf', age: 480 })));
    act(() => result.current.toggleLock('age'));
    act(() => {
      changed = result.current.reroll('race');
    });
    expect(changed).toBe(false);
  });

  it('saves, finds and deletes NPCs; a change makes a new NPC', () => {
    const { result } = setup();
    act(() => result.current.saveNpc());
    const saved = result.current.npc;
    expect(saved.id).toBeTruthy();
    expect(result.current.isSaved(saved)).toBe(true);
    expect(stored(NPCS_KEY).npcs).toEqual([saved]);
    act(() => result.current.saveNpc());
    expect(result.current.savedNpcs).toHaveLength(1);

    act(() => {
      result.current.reroll('quirk');
    });
    expect(result.current.npc.id).toBeUndefined();

    act(() => result.current.deleteNpc(saved.id!));
    expect(result.current.savedNpcs).toEqual([]);
  });

  it('saves an NPC of the batch without opening it', () => {
    const { result } = setup();
    act(() => result.current.generateBatch());
    const card = result.current.batch[0];
    act(() => result.current.saveNpc(card));
    expect(result.current.savedNpcs).toHaveLength(1);
    expect(result.current.isSaved(result.current.batch[0])).toBe(true);
  });

  it('comes back after a reload', () => {
    const view = setup();
    act(() => view.result.current.setConstraint('race', 'Gnome'));
    act(() => view.result.current.saveNpc());
    const npc = view.result.current.npc;
    view.unmount();
    const { result } = setup();
    expect(result.current.npc).toEqual(npc);
    expect(result.current.constraints).toEqual({ race: 'Gnome' });
    expect(result.current.savedNpcs).toEqual([npc]);
  });

  it('requires its provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(useNpcs)).toThrow(/NpcProvider/);
  });
});
