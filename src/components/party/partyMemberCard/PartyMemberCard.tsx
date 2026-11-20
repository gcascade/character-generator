import {
  Casino as RerollIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  MenuBook as ReadIcon,
  Save as SaveIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogContent,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { FC, useState } from 'react';
import { renderCharacter } from '../../../content/character';
import { label } from '../../../content/labels';
import { useLocale, useT } from '../../../i18n';
import type { PartyMember } from '../../../types/party';
import CharacterDetail from '../../character/characterDetail/CharacterDetail';
import CharacterHeader from '../../character/characterHeader/CharacterHeader';
import CharacterImage from '../../character/characterImage/CharacterImage';
import ShareButton from '../../common/share/ShareButton';
import { shareUrl } from '../../../content/share';

type PartyMemberCardProps = {
  member: PartyMember;
  onToggleLock?: VoidFunction;
  onReroll?: VoidFunction;
  onSave?: VoidFunction;
  /** Shows a share action for this member (spec 007). */
  shareable?: boolean;
  /** The member no longer matches the party's shared settings. */
  notMatching?: boolean;
  disabled?: boolean;
};

/** One adventurer of the party, with its own actions (spec 004 US1, US2). */
const PartyMemberCard: FC<PartyMemberCardProps> = ({
  member,
  onToggleLock,
  onReroll,
  onSave,
  shareable = false,
  notMatching = false,
  disabled = false,
}) => {
  const t = useT();
  const { locale } = useLocale();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [reading, setReading] = useState(false);
  const { character, locked } = member;
  const name = `${character.firstName} ${character.lastName}`;
  const firstParagraph = renderCharacter(character, locale).background
    .content[0];

  const action = (
    title: string,
    icon: React.ReactNode,
    onClick?: VoidFunction,
    pressed?: boolean,
  ) =>
    onClick && (
      <Tooltip title={title}>
        <IconButton
          aria-label={title}
          aria-pressed={pressed}
          onClick={onClick}
          disabled={disabled}
          sx={{ color: pressed ? 'secondary.main' : 'text.secondary' }}
        >
          {icon}
        </IconButton>
      </Tooltip>
    );

  return (
    <Card
      component="article"
      aria-label={name}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...(locked && {
          outline: '2px solid',
          outlineColor: 'secondary.main',
        }),
      }}
    >
      <CharacterImage
        gender={character.gender}
        race={character.race}
        characterClass={character.characterClass}
        firstName={character.firstName}
        lastName={character.lastName}
        height={200}
        width="100%"
        crop
        zoomable={false}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <CharacterHeader character={character} compact headingLevel="h3" />
        <Typography
          variant="body2"
          sx={{ textAlign: 'center', mt: 1, color: 'text.secondary' }}
        >
          {label('alignment', character.alignment, character.gender, locale)}
        </Typography>
        {notMatching && (
          <Alert
            severity="warning"
            icon={<WarningIcon fontSize="small" />}
            sx={{ mt: 1.5, py: 0 }}
          >
            {t('party.notMatching')}
          </Alert>
        )}
        {firstParagraph && (
          <Typography
            variant="story"
            component="p"
            sx={{
              mt: 1.5,
              fontSize: '1rem',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {firstParagraph}
          </Typography>
        )}
      </CardContent>
      <CardActions
        sx={{ justifyContent: 'space-between', flexWrap: 'wrap', px: 1.5 }}
      >
        <Button
          size="small"
          startIcon={<ReadIcon />}
          onClick={() => setReading(true)}
          aria-label={t('party.member.open', { name: character.firstName })}
          sx={{ textTransform: 'none' }}
        >
          {t('story.read')}
        </Button>
        <Box>
          {action(
            t(locked ? 'party.member.unlock' : 'party.member.lock', {
              name: character.firstName,
            }),
            locked ? <LockIcon /> : <LockOpenIcon />,
            onToggleLock,
            locked,
          )}
          {action(
            t('party.member.reroll', { name: character.firstName }),
            <RerollIcon />,
            locked ? undefined : onReroll,
          )}
          {action(
            t('party.member.save', { name: character.firstName }),
            <SaveIcon />,
            onSave,
          )}
          {shareable && (
            <ShareButton
              variant="icon"
              label={t('party.member.share', { name: character.firstName })}
              target={() => ({
                title: name,
                url: shareUrl({ kind: 'character', character }),
                copied: 'share.copied',
              })}
            />
          )}
        </Box>
      </CardActions>
      <Dialog
        open={reading}
        onClose={() => setReading(false)}
        fullScreen={fullScreen}
        maxWidth="lg"
        fullWidth
        aria-label={name}
      >
        <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
          <CharacterDetail
            character={character}
            onBack={() => setReading(false)}
            backLabel={t('story.close')}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PartyMemberCard;
