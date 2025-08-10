import React from 'react';
import { Container, Alert, AlertTitle, Box, Button } from '@mui/material';

interface ErrorStateProps {
  error: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Alert severity="warning" sx={{
        textAlign: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d2d 100%)',
        border: '1px solid #2d2d2d',
      }}>
        <AlertTitle>Configuration Required</AlertTitle>
        {error}
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" href="/configure" sx={{ borderRadius: 2 }}>
            Go to Configuration
          </Button>
        </Box>
      </Alert>
    </Container>
  );
};

export default ErrorState;
