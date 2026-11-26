import { Box, Tooltip } from '@mui/material';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { PeekTooltip } from '../contestantPeek/ContestantPeek';
import { useT } from '../../../i18n';
import type { Character } from '../../../types/character';
import CharacterImage from '../../character/characterImage/CharacterImage';

type PortraitStackProps = {
  characters: Character[];
  size?: number;
  /** Greyed portraits (defeated in this event). */
  faded?: boolean[];
  /** A card for the portrait in front, shown on hover, focus or tap. */
  peek?: (index: number) => ReactNode;
};

const OFFSET = 10;
const CYCLE_MS = 900;

/**
 * One or more portraits, stacked; hovering or focusing the stack brings each one
 * to the front in turn (maintainer feedback).
 */
const PortraitStack: FC<PortraitStackProps> = ({
  characters,
  size = 44,
  faded = [],
  peek,
}) => {
  const t = useT();
  const [front, setFront] = useState(0);
  const [cycling, setCycling] = useState(false);
  const many = characters.length > 1;

  useEffect(() => {
    if (!cycling || !many) return;
    const timer = setInterval(
      () => setFront((i) => (i + 1) % characters.length),
      CYCLE_MS,
    );
    return () => clearInterval(timer);
  }, [cycling, many, characters.length]);

  if (!characters.length) return <Box sx={{ width: size, flexShrink: 0 }} />;
  const names = characters.map((c) => c.firstName).join(', ');
  const order = characters.map((_, i) => (i + front) % characters.length);

  const stack = (
    <Box
      role="img"
      aria-label={t('arena.portraits', { names })}
      tabIndex={many || peek ? 0 : undefined}
      onMouseEnter={() => setCycling(true)}
      onMouseLeave={() => setCycling(false)}
      onFocus={() => setCycling(true)}
      onBlur={() => setCycling(false)}
      sx={{
        position: 'relative',
        flexShrink: 0,
        width: size + OFFSET * (characters.length - 1),
        height: size,
      }}
    >
      {order
        .slice()
        .reverse()
        .map((index, layer) => {
          const c = characters[index];
          const depth = order.length - 1 - layer;
          return (
            <Box
              key={index}
              aria-hidden
              sx={{
                position: 'absolute',
                top: 0,
                left: depth * OFFSET,
                zIndex: order.length - depth,
                opacity: faded[index] ? 0.45 : 1,
                filter: faded[index] ? 'grayscale(1)' : undefined,
                transition: 'left 200ms',
              }}
            >
              <CharacterImage
                race={c.race}
                characterClass={c.characterClass}
                gender={c.gender}
                firstName={c.firstName}
                lastName={c.lastName}
                portraitId={c.portraitId}
                age={c.age}
                height={size}
                width={size}
                crop
              />
            </Box>
          );
        })}
    </Box>
  );
  return peek ? (
    <PeekTooltip title={peek(front)}>{stack}</PeekTooltip>
  ) : (
    <Tooltip title={characters[front]?.firstName ?? names} describeChild>
      {stack}
    </Tooltip>
  );
};

export default PortraitStack;
