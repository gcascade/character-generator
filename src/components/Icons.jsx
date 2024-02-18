import React from "react";
import {
  Forest,
  SportsKabaddi,
  Construction,
  PersonOutline,
  Security,
  AutoFixHigh,
  VisibilityOff,
  EmojiSymbols,
} from "@mui/icons-material";

const ElfIcon = () => {
  return <Forest style={{ color: "green" }} />;
};

const DwarfIcon = () => {
  return <Construction />;
};

const HumanIcon = () => {
  return <PersonOutline />;
};

const OrcIcon = () => {
  return <SportsKabaddi />;
};

const WarriorIcon = () => {
  return <Security />;
};

const MageIcon = () => {
  return <AutoFixHigh />;
};

const RogueIcon = () => {
  return <VisibilityOff />;
};

const ClercIcon = () => {
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
