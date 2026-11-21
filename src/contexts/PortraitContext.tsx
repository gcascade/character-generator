import React, {
  FC,
  ReactNode,
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { PortraitTraits } from '../content/portraitPrompt';
import {
  PORTRAITS_KEY,
  type Portraits,
  type StoredPortrait,
  parseStoredPortraits,
  savePortraits,
  withoutUnused,
} from '../content/storedPortraits';

export type PortraitContextType = {
  get: (id: string | undefined) => StoredPortrait | undefined;
  /** Stores a painted image; returns its id. */
  add: (image: string, traits: PortraitTraits) => string;
  remove: (id: string) => void;
  /** `false` after a save failed: new portraits only live for the session. */
  persisted: boolean;
};

export const PortraitContext = createContext<PortraitContextType | undefined>(
  undefined,
);

/** Painted portraits (spec 011), kept apart from the characters that point to them. */
export const PortraitProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [portraits, setPortraits] = useState<Portraits>(() =>
    withoutUnused(parseStoredPortraits(localStorage.getItem(PORTRAITS_KEY))),
  );
  const [persisted, setPersisted] = useState(true);
  // The cleaned store is written once at start-up; later changes are written as they happen.
  useEffect(() => {
    savePortraits(portraits);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Latest store, so two portraits added before a re-render both stay.
  const latest = useRef(portraits);
  const update = (next: Portraits) => {
    latest.current = next;
    setPortraits(next);
    setPersisted(savePortraits(next));
  };

  const value = useMemo<PortraitContextType>(
    () => ({
      get: (id) => (id ? portraits[id] : undefined),
      add: (image, traits) => {
        const id = crypto.randomUUID();
        update({
          ...latest.current,
          [id]: {
            image,
            traits,
            service: 'horde',
            paintedAt: new Date().toISOString(),
          },
        });
        return id;
      },
      remove: (id) => {
        const next = { ...latest.current };
        delete next[id];
        update(next);
      },
      persisted,
    }),
    [portraits, persisted],
  );

  return (
    <PortraitContext.Provider value={value}>
      {children}
    </PortraitContext.Provider>
  );
};
