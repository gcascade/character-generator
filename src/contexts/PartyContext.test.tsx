import { act, renderHook } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { PARTIES_KEY, PARTY_KEY } from '../content/storedParty';
import useParty from '../hooks/useParty';
import { PartyProvider } from './PartyContext';

const wrapper = ({ children }: { children: ReactNode }) => (
  <PartyProvider>{children}</PartyProvider>
);

describe('PartyProvider', () => {
  afterEach(() => localStorage.clear());

  it('generates a party with the chosen settings', () => {
    const { result } = renderHook(useParty, { wrapper });
    act(() => {
      result.current.setSize(3);
      result.current.setConstraint('race', 'Dwarf');
    });
    act(() => {
      result.current.generate();
    });
    expect(result.current.party?.members).toHaveLength(3);
    expect(
      result.current.party?.members.every((m) => m.character.race === 'Dwarf'),
    ).toBe(true);
    act(() => result.current.setConstraint('race', undefined));
    expect(result.current.constraints).toEqual({});
  });

  it('keeps locked members and rerolls a single one', () => {
    const { result } = renderHook(useParty, { wrapper });
    act(() => {
      result.current.generate();
    });
    const [first, second] = result.current.party!.members;
    act(() => result.current.toggleLock(first.id));
    act(() => {
      result.current.generate();
    });
    expect(result.current.party!.members[0].id).toBe(first.id);
    act(() => result.current.rerollMember(result.current.party!.members[1].id));
    expect(result.current.party!.members[1].id).not.toBe(second.id);
  });

  it('saves, reopens and deletes parties, and restores them after a reload', () => {
    const { result, unmount } = renderHook(useParty, { wrapper });
    act(() => {
      result.current.generate();
    });
    act(() => result.current.saveParty());
    expect(result.current.isSaved).toBe(true);
    const savedId = result.current.party!.id;
    act(() => result.current.rerollMember(result.current.party!.members[0].id));
    expect(result.current.isSaved).toBe(false);
    unmount();

    expect(localStorage.getItem(PARTY_KEY)).toBeTruthy();
    expect(localStorage.getItem(PARTIES_KEY)).toContain(savedId);
    const reloaded = renderHook(useParty, { wrapper }).result;
    expect(reloaded.current.party).toBeDefined();
    act(() => reloaded.current.openParty(savedId));
    expect(reloaded.current.isSaved).toBe(true);
    act(() => reloaded.current.deleteParty(savedId));
    expect(reloaded.current.savedParties).toEqual([]);
  });

  it('throws without a provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(useParty)).toThrow(
      'useParty must be used within a PartyProvider',
    );
  });

  it("sets a member's painted portrait, in the saved party too (spec 011)", () => {
    const { result } = renderHook(useParty, { wrapper });
    act(() => {
      result.current.generate();
    });
    act(() => result.current.saveParty());
    const member = result.current.party!.members[1];
    act(() => result.current.setMemberPortrait(member.id, 'p1'));
    expect(result.current.party!.members[1].character.portraitId).toBe('p1');
    expect(result.current.savedParties[0].members[1].character.portraitId).toBe(
      'p1',
    );
    expect(result.current.isSaved).toBe(true);
  });
});
