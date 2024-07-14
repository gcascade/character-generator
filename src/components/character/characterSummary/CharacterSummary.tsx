import { Character } from '@Types/character';
import DeleteIcon from '@mui/icons-material/Delete';
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
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  const {
    firstName,
    lastName,
    age,
    epithet,
    race,
    characterClass,
    gender,
    alignment,
  } = character;

  const onDeleteClick = () => {
    if (confirmDelete) {
      removeCharacter(character);
      addSuccess('Character removed');
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
            {epithet}
          </Typography>
        }
        action={
          <Tooltip
            title={confirmDelete ? 'Click again to confirm' : ''}
            open={confirmDelete}
            placement="top"
            arrow
          >
            <IconButton
              edge="end"
              aria-label="delete"
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
        <Divider />
        <Typography variant="body2" align="left">
          <strong>Gender:</strong> {gender}
        </Typography>
        <Typography variant="body2" align="left">
          <strong>Age:</strong> {age}
        </Typography>
        <Typography variant="body2" align="left">
          <strong>Race:</strong> {race}
        </Typography>
        <Typography variant="body2" align="left">
          <strong>Class:</strong> {characterClass}
        </Typography>
        <Typography variant="body2" align="left">
          <strong>Alignment:</strong> {alignment}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CharacterSummary;
