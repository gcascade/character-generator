import {
  ArrowBack as BackIcon,
  Delete as DeleteIcon,
  DoubleArrow as OpenIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { FC, useState } from 'react';
import { renderCharacter } from '../../../content/character';
import { useLocale, useT } from '../../../i18n';
import type { Character } from '../../../types/character';
import CharacterHeader from '../characterHeader/CharacterHeader';
import CharacterImage from '../characterImage/CharacterImage';
import PropertyList from '../propertyList/PropertyList';
import { storyParagraphSx } from '../storyDialog/StoryDialog';
import WrittenInNotice from '../writtenInNotice/WrittenInNotice';

type CharacterDetailProps = {
  character: Character;
  onBack?: VoidFunction;
  /** Label of the back action; "Back to my characters" by default. */
  backLabel?: string;
  onOpenInGenerator?: VoidFunction;
  onDelete?: VoidFunction;
  /** Offered for AI text written in another language. */
  onTranslate?: VoidFunction;
  translating?: boolean;
};

/**
 * Everything about one character, read-only (spec 006). Actions appear only
 * when their handler is given, so party members can reuse it.
 */
const CharacterDetail: FC<CharacterDetailProps> = ({
  character,
  onBack,
  backLabel,
  onOpenInGenerator,
  onDelete,
  onTranslate,
  translating,
}) => {
  const t = useT();
  const { locale } = useLocale();
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const rendered = renderCharacter(character, locale);
  const { title, content } = rendered.background;

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      {onBack && (
        <Button startIcon={<BackIcon />} onClick={onBack} sx={{ mb: 1.5 }}>
          {backLabel ?? t('details.back')}
        </Button>
      )}
      <Card>
        <CardContent sx={{ px: { xs: 1.5, sm: 3 }, pt: { xs: 1.5, sm: 3 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                sm: '240px minmax(0, 1fr)',
              },
              gap: { xs: 2, sm: 3 },
              alignItems: 'start',
            }}
          >
            <CharacterImage
              gender={character.gender}
              race={character.race}
              characterClass={character.characterClass}
              height={isPhone ? 220 : 340}
              width="100%"
              crop
            />
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ mb: 2 }}>
                <CharacterHeader character={character} headingLevel="h1" />
              </Box>
              <PropertyList character={character} />
            </Box>
          </Box>
          {(title || content.length > 0) && (
            <Box
              component="section"
              aria-labelledby="detail-story-title"
              sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}
            >
              <Typography
                id="detail-story-title"
                variant="h4"
                component="h2"
                sx={{ color: 'primary.main', mb: 1 }}
              >
                {title}
              </Typography>
              {rendered.writtenIn && (
                <WrittenInNotice
                  language={rendered.writtenIn}
                  by={rendered.writtenBy ?? 'legacy'}
                  onTranslate={
                    rendered.writtenBy === 'ai' ? onTranslate : undefined
                  }
                  translating={translating}
                />
              )}
              {content.map((paragraph, index) => (
                <Typography
                  key={index}
                  variant="story"
                  component="p"
                  sx={storyParagraphSx(index === 0)}
                >
                  {paragraph}
                </Typography>
              ))}
            </Box>
          )}
        </CardContent>
        {(onOpenInGenerator || onDelete) && (
          <CardActions
            sx={{
              px: { xs: 1.5, sm: 3 },
              pb: { xs: 1.5, sm: 3 },
              gap: 1.5,
              flexWrap: 'wrap',
            }}
          >
            {onOpenInGenerator && (
              <Button
                variant="contained"
                startIcon={<OpenIcon />}
                onClick={onOpenInGenerator}
              >
                {t('details.openInGenerator')}
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() =>
                  confirmDelete ? onDelete() : setConfirmDelete(true)
                }
                onBlur={() => setConfirmDelete(false)}
              >
                {confirmDelete
                  ? t('details.confirmDelete')
                  : t('details.delete')}
              </Button>
            )}
          </CardActions>
        )}
      </Card>
    </Box>
  );
};

export default CharacterDetail;
