import React from 'react';
import { Container, Box, CircularProgress, Typography } from '@mui/material';

const LoadingState: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="400px">
        <CircularProgress size={60} sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading your content...
        </Typography>
      </Box>
    </Container>
  );
};

export default LoadingState;
