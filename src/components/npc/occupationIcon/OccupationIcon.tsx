import {
  Agriculture,
  BakeryDining,
  Castle,
  Church,
  ContentCut,
  Grain,
  Grass,
  Hardware,
  Healing,
  HistoryEdu,
  LocalBar,
  LocalPolice,
  Pets,
  Phishing,
  QueueMusic,
  Sailing,
  Science,
  Storefront,
  VolunteerActivism,
  Yard,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';
import type { SxProps, Theme } from '@mui/material';
import React, { FC } from 'react';
import type { Occupation } from '../../../types/npc';

const ICONS: Record<Occupation, SvgIconComponent> = {
  Blacksmith: Hardware,
  Innkeeper: LocalBar,
  Farmer: Agriculture,
  Beggar: VolunteerActivism,
  Priest: Church,
  Merchant: Storefront,
  Guard: LocalPolice,
  Fisher: Phishing,
  Healer: Healing,
  Scribe: HistoryEdu,
  Hunter: Pets,
  Miller: Grain,
  Baker: BakeryDining,
  Tailor: ContentCut,
  Stablehand: Grass,
  Minstrel: QueueMusic,
  Sailor: Sailing,
  Noble: Castle,
  Alchemist: Science,
  Gravedigger: Yard,
};

type OccupationIconProps = {
  occupation: Occupation;
  sx?: SxProps<Theme>;
};

/** Symbol of a side character's occupation (spec 010), in the accent colour. */
const OccupationIcon: FC<OccupationIconProps> = ({ occupation, sx }) => {
  const Icon = ICONS[occupation];
  return (
    <Icon
      sx={{ color: 'secondary.main', ...sx }}
      data-testid={`${occupation.toLowerCase()}-icon`}
    />
  );
};

export default OccupationIcon;
