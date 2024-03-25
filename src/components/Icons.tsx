import React, { FC } from 'react';
import {
  Forest,
  SportsKabaddi,
  Construction,
  PersonOutline,
  Security,
  AutoFixHigh,
  VisibilityOff,
  EmojiSymbols,
} from '@mui/icons-material';

const ElfIcon: FC = () => {
  return <Forest style={{ color: 'green' }} />;
};

const DwarfIcon: FC = () => {
  return <Construction />;
};

const HumanIcon: FC = () => {
  return <PersonOutline />;
};

const OrcIcon: FC = () => {
  return <SportsKabaddi />;
};

const WarriorIcon: FC = () => {
  return <Security />;
};

const MageIcon: FC = () => {
  return <AutoFixHigh />;
};

const RogueIcon: FC = () => {
  return <VisibilityOff />;
};

const ClercIcon: FC = () => {
  return <EmojiSymbols />;
};

export {
  ElfIcon,
  DwarfIcon,
  HumanIcon,
  OrcIcon,
  WarriorIcon,
  MageIcon,
  RogueIcon,
  ClercIcon,
};
