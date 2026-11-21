import React, { FC, useContext } from 'react';
import { label } from '../../../content/labels';
import {
  sameTraits,
  subjectOfNpc,
  traitsOf,
} from '../../../content/portraitPrompt';
import { PortraitContext } from '../../../contexts/PortraitContext';
import { useLocale } from '../../../i18n';
import type { Npc } from '../../../types/npc';
import RaceEmblem from '../../character/raceEmblem/RaceEmblem';
import PaintedImage from '../../portrait/paintedImage/PaintedImage';

type NpcPortraitProps = {
  npc: Npc;
  height: string | number;
  width: string | number;
  crop?: boolean;
};

/** A side character's painted portrait (spec 011), or their emblem. */
const NpcPortrait: FC<NpcPortraitProps> = ({ npc, height, width, crop }) => {
  const { locale } = useLocale();
  const painted = useContext(PortraitContext)?.get(npc.portraitId);

  if (!painted) {
    return (
      <RaceEmblem
        race={npc.race}
        occupation={npc.occupation}
        gender={npc.gender}
        height={height}
        width={width}
      />
    );
  }
  return (
    <PaintedImage
      image={painted.image}
      alt={`${label('race', npc.race, npc.gender, locale)} ${label('occupation', npc.occupation, npc.gender, locale)}`}
      height={height}
      width={width}
      crop={crop}
      outdated={!sameTraits(painted.traits, traitsOf(subjectOfNpc(npc)))}
    />
  );
};

export default NpcPortrait;
