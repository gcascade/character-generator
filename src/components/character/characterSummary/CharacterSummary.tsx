import { Character } from '@Types/character';
import { Delete as DeleteIcon } from '@mui/icons-material';
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';

import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import { DataContext } from '../../../contexts/DataContext';
import useAlert from '../../../hooks/useAlert';
import '../Character.css';
import CharacterImage from '../characterImage/CharacterImage';
import { useLocale, useT } from '../../../i18n';
import { label } from '../../../content/labels';
import { renderCharacter } from '../../../content/character';
import WrittenInNotice from '../writtenInNotice/WrittenInNotice';
import CharacterHeader from '../characterHeader/CharacterHeader';

type CharacterSummaryProps = {
  character: Character;
  width?: number | string | undefined;
  height?: number | string | undefined;
};

const CharacterSummary: FC<CharacterSummaryProps> = ({
  character,
  width,
  height,
}) => {
  const dataContext = useContext(DataContext);

  if (!dataContext) {
    throw new Error('Character must be used within a DataProvider');
  }

  const { addSuccess } = useAlert();

  const { removeCharacter } = dataContext;

  const [confirmDelete, setConfirmDelete] = useState(false);
  const t = useT();
  const { locale } = useLocale();
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  const { gender, alignment } = character;
  const rendered = renderCharacter(character, locale);

  const onDeleteClick = () => {
    if (confirmDelete) {
      if (character.id) removeCharacter(character.id);
      addSuccess(t('character.removedAlert'));
    } else {
      setConfirmDelete(true);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      deleteButtonRef.current &&
      !deleteButtonRef.current.contains(event.target as Node)
    ) {
      setConfirmDelete(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Card
      sx={{
        width: width,
        height: height,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'start',
      }}
    >
      <CardHeader
        sx={{ paddingBottom: 1, alignItems: 'flex-start' }}
        title={
          <CharacterHeader character={character} compact headingLevel="h3" />
        }
        action={
          <Tooltip
            title={confirmDelete ? t('character.confirmDelete') : ''}
            open={confirmDelete}
            placement="top"
            arrow
          >
            <IconButton
              edge="end"
              aria-label={t('character.delete')}
              onClick={onDeleteClick}
              ref={deleteButtonRef}
              sx={{ marginRight: '5px' }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <CharacterImage height={256} width={'100%'} {...character} />
      <CardContent style={{ display: 'flex', flexDirection: 'column' }}>
        {rendered.writtenIn && rendered.writtenBy && (
          <WrittenInNotice
            language={rendered.writtenIn}
            by={rendered.writtenBy}
          />
        )}
        <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
          <strong>
            {t('field.alignment')}
            {t('punct.colon')}
          </strong>{' '}
          {label('alignment', alignment, gender, locale)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CharacterSummary;
