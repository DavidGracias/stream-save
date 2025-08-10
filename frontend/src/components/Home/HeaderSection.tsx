import React from 'react';
import { Typography, Box } from '@mui/material';

const HeaderSection: React.FC = () => {
  return (
    <Box textAlign="center" mb={6}>
      <Typography
        variant="h2"
        component="h1"
        color="primary"
        gutterBottom
        sx={{
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #6c5ce7 30%, #a29bfe 90%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2,
        }}
      >
        Stream Save
      </Typography>
      <Typography variant="h5" color="text.secondary" paragraph sx={{ maxWidth: 600, mx: 'auto' }}>
        Save and manage your custom stream links for movies and series in Stremio
      </Typography>
    </Box>
  );
};

export default HeaderSection;
