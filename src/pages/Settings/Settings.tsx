import { Box, Container, Paper, Typography } from '@mui/material';
import React from 'react';

const Settings: React.FC = () => {
  return (
    <Container maxWidth={false} sx={{}}>
      <Paper
        elevation={3}
        sx={{
          minHeight: '95vh',
          padding: '20px',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Character Generator Settings
        </Typography>
        <Box sx={{ marginBottom: '1.5rem' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            General Settings
          </Typography>
          <Typography variant="body1" gutterBottom>
            Here you can adjust the general settings of the character generator.
          </Typography>
        </Box>
        <Box sx={{ marginBottom: '1.5rem' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            API Integration
          </Typography>
          <Typography variant="body1" gutterBottom>
            Configure API settings for generative AI and other integrations.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Settings;
