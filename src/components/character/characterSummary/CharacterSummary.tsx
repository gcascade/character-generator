import { Character } from '@Types/character';
import { Delete as DeleteIcon } from '@mui/icons-material';
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
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
import { capitalize } from '../../../content/renderText';
import WrittenInNotice from '../writtenInNotice/WrittenInNotice';

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

  const { firstName, lastName, age, race, characterClass, gender, alignment } =
    character;
  const rendered = renderCharacter(character, locale);

  const onDeleteClick = () => {
    if (confirmDelete) {
      removeCharacter(character);
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
        sx={{ paddingBottom: 0 }}
        title={
          <Typography variant="h5" align="center">
            {`${firstName} ${lastName}`}
          </Typography>
        }
        subheader={
          <Typography variant="subtitle1" align="center">
            {capitalize(rendered.epithet)}
          </Typography>
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
        <Divider />
        <Typography variant="body2" align="left">
          <strong>
            {t('field.gender')}
            {t('punct.colon')}
          </strong>{' '}
          {label('gender', gender, gender, locale)}
        </Typography>
        <Typography variant="body2" align="left">
          <strong>
            {t('field.age')}
            {t('punct.colon')}
          </strong>{' '}
          {age}
        </Typography>
        <Typography variant="body2" align="left">
          <strong>
            {t('field.race')}
            {t('punct.colon')}
          </strong>{' '}
          {label('race', race, gender, locale)}
        </Typography>
        <Typography variant="body2" align="left">
          <strong>
            {t('field.class')}
            {t('punct.colon')}
          </strong>{' '}
          {label('class', characterClass, gender, locale)}
        </Typography>
        <Typography variant="body2" align="left">
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
