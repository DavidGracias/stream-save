import React from 'react';
import { Box, Typography } from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';

const ManageHeader: React.FC = () => {
  return (
    <Box mb={4}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <VisibilityIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #6c5ce7 30%, #a29bfe 90%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Manage Content
        </Typography>
      </Box>
      <Typography variant="h6" color="text.secondary">
        Browse and manage your saved stream links
      </Typography>
    </Box>
  );
};

export default ManageHeader;
