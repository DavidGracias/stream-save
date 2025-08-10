import React from 'react';
import { Box, Typography } from '@mui/material';

const ConfigureHeader: React.FC = () => {
  return (
    <Box textAlign="center" mb={4}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Configure Stream Save
      </Typography>
            <Typography variant="h6" color="text.secondary">
        Configure your MongoDB connection for Stream Save
      </Typography>
    </Box>
  );
};

export default ConfigureHeader;
