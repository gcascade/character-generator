import {
  Casino as RandomIcon,
  DeleteSweep as ClearIcon,
  GroupAdd as PartyIcon,
  PersonAdd as PersonIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import React, { FC, useState } from 'react';
import { type FillShape, MAX_CONTESTANTS } from '../../../content/arena';
import { renderParty } from '../../../content/party';
import { useLocale, useT } from '../../../i18n';
import type { Character } from '../../../types/character';
import type { Party } from '../../../types/party';

type RosterBuilderProps = {
  count: number;
  current?: Character;
  saved: Character[];
  party?: Party;
  savedParties: Party[];
  onAddCharacter: (character: Character, sourceId?: string) => void;
  onAddParty: (party: Party) => void;
  onAddRandom: (count: number) => void;
  /** Fills the arena up to a number of contestants, as solos, teams of a size, or a mix. */
  onFill: (target: number, shape: FillShape) => void;
  onRandomLoadouts: VoidFunction;
  onClear: VoidFunction;
};

const RANDOM_COUNTS = [1, 4, 8, 12];
const FILL_TARGETS = [8, 12, 16, 24, 32, 48];
const FILL_SHAPES: FillShape[] = [1, 2, 3, 4, 'mixed'];

/** Ways to fill the arena: current, saved, parties as teams, random characters (spec 012 FR-007). */
const RosterBuilder: FC<RosterBuilderProps> = ({
  count,
  current,
  saved,
  party,
  savedParties,
  onAddCharacter,
  onAddParty,
  onAddRandom,
  onFill,
  onRandomLoadouts,
  onClear,
}) => {
  const t = useT();
  const { locale } = useLocale();
  const [characterId, setCharacterId] = useState('');
  const [partyId, setPartyId] = useState('');
  const [randomCount, setRandomCount] = useState(4);
  const [fillTarget, setFillTarget] = useState(16);
  const [fillShape, setFillShape] = useState<FillShape>(4);
  const shapeLabel = (shape: FillShape) =>
    shape === 'mixed'
      ? t('arena.fillMixed')
      : shape === 1
        ? t('arena.fillSolo')
        : t('arena.fillTeams', { size: shape });
  const full = count >= MAX_CONTESTANTS;
  const nameOf = (c: Character) => `${c.firstName} ${c.lastName}`.trim();

  const row = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1,
    alignItems: 'center',
  };
  const select = { minWidth: 200, flexGrow: 1, maxWidth: 360 };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={row}>
        <Button
          variant="outlined"
          startIcon={<PersonIcon />}
          disabled={full || !current}
          onClick={() => current && onAddCharacter(current, current.id)}
        >
          {t('arena.addCurrent')}
        </Button>
        <Button
          variant="outlined"
          startIcon={<PartyIcon />}
          disabled={full || !party}
          onClick={() => party && onAddParty(party)}
        >
          {t('arena.addParty')}
        </Button>
      </Box>
      {saved.length > 0 && (
        <Box sx={row}>
          <FormControl size="small" sx={select}>
            <InputLabel id="arena-saved-label">
              {t('arena.pickCharacter')}
            </InputLabel>
            <Select
              labelId="arena-saved-label"
              label={t('arena.pickCharacter')}
              value={characterId}
              onChange={(event) => setCharacterId(event.target.value)}
            >
              {saved.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {nameOf(c)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            disabled={full || !characterId}
            aria-label={t('arena.addSaved')}
            onClick={() => {
              const character = saved.find((c) => c.id === characterId);
              if (character) onAddCharacter(character, character.id);
            }}
          >
            {t('arena.add')}
          </Button>
        </Box>
      )}
      {savedParties.length > 0 && (
        <Box sx={row}>
          <FormControl size="small" sx={select}>
            <InputLabel id="arena-party-label">
              {t('arena.pickParty')}
            </InputLabel>
            <Select
              labelId="arena-party-label"
              label={t('arena.pickParty')}
              value={partyId}
              onChange={(event) => setPartyId(event.target.value)}
            >
              {savedParties.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {renderParty(p, locale).name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            disabled={full || !partyId}
            aria-label={t('arena.addSavedParty')}
            onClick={() => {
              const chosen = savedParties.find((p) => p.id === partyId);
              if (chosen) onAddParty(chosen);
            }}
          >
            {t('arena.add')}
          </Button>
        </Box>
      )}
      <Box sx={row}>
        <FormControl size="small" sx={{ width: 90 }}>
          <Select
            value={randomCount}
            inputProps={{ 'aria-label': t('arena.addRandom', { count: '' }) }}
            onChange={(event) => setRandomCount(Number(event.target.value))}
          >
            {RANDOM_COUNTS.map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          startIcon={<RandomIcon />}
          disabled={full}
          onClick={() => onAddRandom(randomCount)}
        >
          {t('arena.addRandom', { count: randomCount })}
        </Button>
      </Box>
      <Box sx={row}>
        <FormControl size="small" sx={{ width: 110 }}>
          <InputLabel id="arena-fill-target">{t('arena.fillUpTo')}</InputLabel>
          <Select
            labelId="arena-fill-target"
            label={t('arena.fillUpTo')}
            value={fillTarget}
            onChange={(event) => setFillTarget(Number(event.target.value))}
          >
            {FILL_TARGETS.map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="arena-fill-shape">{t('arena.fillAs')}</InputLabel>
          <Select
            labelId="arena-fill-shape"
            label={t('arena.fillAs')}
            value={String(fillShape)}
            onChange={(event) =>
              setFillShape(
                event.target.value === 'mixed'
                  ? 'mixed'
                  : Number(event.target.value),
              )
            }
          >
            {FILL_SHAPES.map((shape) => (
              <MenuItem key={shape} value={String(shape)}>
                {shapeLabel(shape)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          startIcon={<PartyIcon />}
          disabled={count >= Math.min(fillTarget, MAX_CONTESTANTS)}
          onClick={() => onFill(fillTarget, fillShape)}
        >
          {t('arena.fill')}
        </Button>
      </Box>
      <Box sx={{ ...row, justifyContent: 'space-between' }}>
        <Typography aria-live="polite" sx={{ color: 'text.secondary' }}>
          {full
            ? t('arena.full', { max: MAX_CONTESTANTS })
            : t('arena.rosterCount', { count, max: MAX_CONTESTANTS })}
        </Typography>
        <Box sx={row}>
          <Button
            startIcon={<RandomIcon />}
            disabled={!count}
            onClick={onRandomLoadouts}
          >
            {t('arena.randomLoadouts')}
          </Button>
          <Button startIcon={<ClearIcon />} disabled={!count} onClick={onClear}>
            {t('arena.clear')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default RosterBuilder;
