import React, {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  generateParty,
  rerollMember as rerollPartyMember,
} from '../content/party';
import {
  PARTIES_KEY,
  PARTY_KEY,
  type PartySettings,
  parseStoredParties,
  parseStoredParty,
  saveCurrentParty,
  saveParties,
} from '../content/storedParty';
import type { AlignmentMode, Party, PartyConstraints } from '../types/party';

export type PartyContextType = PartySettings & {
  party?: Party;
  savedParties: Party[];
  setSize: (size: number) => void;
  setConstraint: <K extends keyof PartyConstraints>(
    key: K,
    value: PartyConstraints[K] | undefined,
  ) => void;
  setAlignmentMode: (mode: AlignmentMode) => void;
  /** A new party from the app's content, keeping locked members. */
  generate: () => Party;
  /** Replaces the current party (e.g. with an AI-written story). */
  setParty: (party: Party) => void;
  rerollMember: (memberId: string) => void;
  toggleLock: (memberId: string) => void;
  saveParty: VoidFunction;
  isSaved: boolean;
  openParty: (id: string) => void;
  deleteParty: (id: string) => void;
};

export const PartyContext = createContext<PartyContextType | undefined>(
  undefined,
);

/** The party being built on the Party page, and the saved parties (spec 004). */
export const PartyProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [initial] = useState(() =>
    parseStoredParty(localStorage.getItem(PARTY_KEY)),
  );
  const [party, setParty] = useState<Party | undefined>(initial.party);
  const [settings, setSettings] = useState<PartySettings>(initial.settings);
  const [savedParties, setSavedParties] = useState<Party[]>(() =>
    parseStoredParties(localStorage.getItem(PARTIES_KEY)),
  );

  useEffect(() => saveCurrentParty(party, settings), [party, settings]);
  useEffect(() => saveParties(savedParties), [savedParties]);

  const generate = useCallback(() => {
    const next = generateParty({ ...settings, keep: party?.members });
    setParty(next);
    return next;
  }, [settings, party]);

  const value = useMemo<PartyContextType>(
    () => ({
      ...settings,
      party,
      savedParties,
      setSize: (size) => setSettings((s) => ({ ...s, size })),
      setConstraint: (key, constraintValue) =>
        setSettings((s) => {
          const constraints = { ...s.constraints };
          if (constraintValue === undefined) delete constraints[key];
          else constraints[key] = constraintValue;
          return { ...s, constraints };
        }),
      setAlignmentMode: (alignmentMode) =>
        setSettings((s) => ({ ...s, alignmentMode })),
      generate,
      setParty,
      // A changed party is a new party: it is no longer the saved one.
      rerollMember: (memberId) =>
        setParty(
          (p) =>
            p && { ...rerollPartyMember(p, memberId), id: crypto.randomUUID() },
        ),
      toggleLock: (memberId) =>
        setParty(
          (p) =>
            p && {
              ...p,
              members: p.members.map((m) =>
                m.id === memberId ? { ...m, locked: !m.locked } : m,
              ),
            },
        ),
      saveParty: () => {
        if (party && !savedParties.some((p) => p.id === party.id)) {
          setSavedParties((list) => [...list, party]);
        }
      },
      isSaved: !!party && savedParties.some((p) => p.id === party.id),
      openParty: (id) => {
        const saved = savedParties.find((p) => p.id === id);
        if (saved) {
          setParty(saved);
          setSettings({
            size: saved.members.length,
            constraints: saved.constraints,
            alignmentMode: saved.alignmentMode,
          });
        }
      },
      deleteParty: (id) =>
        setSavedParties((list) => list.filter((p) => p.id !== id)),
    }),
    [settings, party, savedParties, generate],
  );

  return (
    <PartyContext.Provider value={value}>{children}</PartyContext.Provider>
  );
};
