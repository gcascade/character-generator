import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
} from '@mui/material';
import React, { FC, useEffect, useState } from 'react';
import useCharacterHistory from '../../hooks/useCharacterHistory';
import theme from '../../themes/themes';
import '../common/Common.css';
import EmptyHistory from './EmptyHistory';
import './History.css';
import HistoryList from './HistoryList';

const HistoryCard: FC = () => {
  const { history, clearHistory } = useCharacterHistory();
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const cancelClear = () => setConfirmClear(false);
    if (confirmClear) {
      document.addEventListener('click', cancelClear);
    }
    return () => {
      document.removeEventListener('click', cancelClear);
    };
  }, [confirmClear]);

  const handleClearHistoryClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirmClear) {
      clearHistory();
    }
    setConfirmClear(!confirmClear);
  };

  return (
    <Card
      className="paper-card"
      sx={{
        backgroundColor: theme.palette.background.paper,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'column',
      }}
    >
      <CardHeader
        title="History"
        titleTypographyProps={{ align: 'center', variant: 'h4' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        {history.length > 0 ? (
          <HistoryList history={history} />
        ) : (
          <EmptyHistory />
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'center' }}>
        <Button
          onClick={handleClearHistoryClick}
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          disabled={history.length === 0}
        >
          {confirmClear ? 'Confirm?' : 'Clear History'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default HistoryCard;
