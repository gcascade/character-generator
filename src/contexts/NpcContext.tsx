import React, {
  FC,
  ReactNode,
  createContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  generateNpc,
  generateNpcs,
  npcTemplateOf,
  rerollNpc,
} from '../content/npc';
import {
  BATCH_SIZE,
  NPC_KEY,
  NPCS_KEY,
  type NpcConstraints,
  type NpcState,
  parseStoredNpcState,
  parseStoredNpcs,
  saveNpcState,
  saveNpcs,
} from '../content/storedNpc';
import type {
  LockableNpcProperty,
  Npc,
  NpcSection,
  NpcTemplate,
} from '../types/npc';

export type NpcContextType = {
  npc: Npc;
  batch: Npc[];
  locked: LockableNpcProperty[];
  constraints: NpcConstraints;
  savedNpcs: Npc[];
  /** The values a new NPC must keep: constraints and locked properties. */
  template: NpcTemplate;
  setConstraint: <K extends keyof NpcConstraints>(
    key: K,
    value: NpcConstraints[K] | undefined,
  ) => void;
  /** A new NPC from the app's content; returns it (AI may then write its sheet). */
  generate: () => Npc;
  /** Replaces the current NPC (e.g. with an AI-written sheet). */
  setNpc: (npc: Npc) => void;
  generateBatch: VoidFunction;
  /** Makes an NPC of the batch the current one. */
  openFromBatch: (index: number) => void;
  /** Rerolls a property or section; `false` when nothing else fits the locks. */
  reroll: (target: LockableNpcProperty | NpcSection) => boolean;
  toggleLock: (property: LockableNpcProperty) => void;
  /** Saves an NPC (the current one by default); the saved copy becomes current. */
  saveNpc: (npc?: Npc) => void;
  /** Saves an NPC received through a share link. */
  saveSharedNpc: (npc: Npc) => void;
  deleteNpc: (id: string) => void;
  /** Sets or clears the painted portrait of an NPC (current, batch or saved; spec 011). */
  attachPortrait: (npc: Npc, portraitId: string | undefined) => void;
  isSaved: (npc: Npc) => boolean;
};

export const NpcContext = createContext<NpcContextType | undefined>(undefined);

const withoutId = (npc: Npc): Npc => {
  const copy = { ...npc };
  delete copy.id;
  return copy;
};

/** The side-character page state and the saved side characters (spec 010). */
export const NpcProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NpcState & { current: Npc }>(() => {
    const stored = parseStoredNpcState(localStorage.getItem(NPC_KEY));
    return { ...stored, current: stored.current ?? generateNpc() };
  });
  const [savedNpcs, setSavedNpcs] = useState<Npc[]>(() =>
    parseStoredNpcs(localStorage.getItem(NPCS_KEY)),
  );

  useEffect(() => saveNpcState(state), [state]);
  useEffect(() => saveNpcs(savedNpcs), [savedNpcs]);

  const value = useMemo<NpcContextType>(() => {
    const { current, batch, locked, constraints } = state;
    const template: NpcTemplate = {
      ...constraints,
      ...npcTemplateOf(current, locked),
    };
    const isSaved = (npc: Npc) =>
      !!npc.id && savedNpcs.some((saved) => saved.id === npc.id);
    return {
      npc: current,
      batch,
      locked,
      constraints,
      savedNpcs,
      template,
      setConstraint: (key, constraintValue) =>
        setState((s) => {
          const next = { ...s.constraints };
          if (constraintValue === undefined) delete next[key];
          else next[key] = constraintValue;
          return { ...s, constraints: next };
        }),
      generate: () => {
        const npc = generateNpc(template, current);
        setState((s) => ({ ...s, current: npc }));
        return npc;
      },
      setNpc: (npc) => setState((s) => ({ ...s, current: npc })),
      generateBatch: () =>
        setState((s) => ({
          ...s,
          batch: generateNpcs(BATCH_SIZE, {
            ...s.constraints,
            ...npcTemplateOf(s.current, s.locked),
          }),
        })),
      openFromBatch: (index) =>
        setState((s) =>
          s.batch[index] ? { ...s, current: s.batch[index] } : s,
        ),
      reroll: (target) => {
        const next = rerollNpc(current, target, locked);
        if (next === current) return false;
        setState((s) => ({ ...s, current: withoutId(next) }));
        return true;
      },
      toggleLock: (property) =>
        setState((s) => ({
          ...s,
          locked: s.locked.includes(property)
            ? s.locked.filter((p) => p !== property)
            : [...s.locked, property],
        })),
      saveNpc: (npc = current) => {
        if (isSaved(npc)) return;
        const saved = { ...npc, id: crypto.randomUUID() };
        setSavedNpcs((list) => [...list, saved]);
        setState((s) => ({
          ...s,
          current: s.current === npc ? saved : s.current,
          batch: s.batch.map((b) => (b === npc ? saved : b)),
        }));
      },
      saveSharedNpc: (npc) =>
        setSavedNpcs((list) => [...list, { ...npc, id: crypto.randomUUID() }]),
      deleteNpc: (id) =>
        setSavedNpcs((list) => list.filter((npc) => npc.id !== id)),
      isSaved,
      attachPortrait: (target, portraitId) => {
        const next = { ...target, portraitId };
        if (!portraitId) delete next.portraitId;
        const same = (npc: Npc) =>
          npc === target || (!!target.id && npc.id === target.id);
        setState((s) => ({
          ...s,
          current: same(s.current) ? next : s.current,
          batch: s.batch.map((b) => (same(b) ? next : b)),
        }));
        if (target.id) {
          setSavedNpcs((list) => list.map((n) => (same(n) ? next : n)));
        }
      },
    };
  }, [state, savedNpcs]);

  return <NpcContext.Provider value={value}>{children}</NpcContext.Provider>;
};
