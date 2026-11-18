import React, {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { saveLocks } from '../content/storedLocks';
import {
  type LockableProperty,
  LOCKABLE_PROPERTIES,
  templateOf,
} from '../content/template';
import { CharacterContext } from './CharacterContext';

export type LockContextType = {
  locked: LockableProperty[];
  isLocked: (property: LockableProperty) => boolean;
  toggle: (property: LockableProperty) => void;
  unlockAll: VoidFunction;
};

export const LockContext = createContext<LockContextType | undefined>(
  undefined,
);

type LockProviderProps = {
  children: ReactNode;
  initialLocked?: readonly LockableProperty[];
};

/**
 * Which properties of the current character are locked (spec 003). Must sit
 * inside a CharacterProvider: locked values are read from the current
 * character, and saved with the locks whenever either changes.
 */
export const LockProvider: FC<LockProviderProps> = ({
  children,
  initialLocked = [],
}) => {
  const characterContext = useContext(CharacterContext);
  if (!characterContext) {
    throw new Error('LockProvider must be used within a CharacterProvider');
  }
  const { character } = characterContext;
  const [locked, setLocked] = useState<LockableProperty[]>(() => [
    ...initialLocked,
  ]);

  useEffect(() => {
    saveLocks(templateOf(character, locked));
  }, [character, locked]);

  const toggle = useCallback((property: LockableProperty) => {
    setLocked((current) =>
      current.includes(property)
        ? current.filter((p) => p !== property)
        : // Keep the display order whatever the click order.
          LOCKABLE_PROPERTIES.filter(
            (p) => p === property || current.includes(p),
          ),
    );
  }, []);

  const unlockAll = useCallback(() => setLocked([]), []);

  const value = useMemo(
    () => ({
      locked,
      isLocked: (property: LockableProperty) => locked.includes(property),
      toggle,
      unlockAll,
    }),
    [locked, toggle, unlockAll],
  );

  return <LockContext.Provider value={value}>{children}</LockContext.Provider>;
};
