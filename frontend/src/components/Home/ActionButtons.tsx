import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Box } from '@mui/material';
import {
  Settings as SettingsIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

const ActionButtons: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 6, justifyContent: 'center' }}>
      <Box sx={{ flex: { xs: '1', md: '0 1 300px' } }}>
        <Button
          component={Link}
          to="/manage"
          variant="outlined"
          color="secondary"
          size="large"
          fullWidth
          startIcon={<EditIcon />}
          sx={{
            py: 3,
            fontSize: '1.1rem',
            borderRadius: 3,
            border: '3px solid',
            borderColor: 'secondary.main',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 8px 32px rgba(0, 191, 174, 0.2)',
              transform: 'translateY(-2px)',
              borderColor: 'secondary.main',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Manage Content
        </Button>
      </Box>
      <Box sx={{ flex: { xs: '1', md: '0 1 300px' } }}>
        <Button
          component={Link}
          to="/configure"
          variant="outlined"
          color="inherit"
          size="large"
          fullWidth
          startIcon={<SettingsIcon />}
          sx={{
            py: 3,
            fontSize: '1.1rem',
            borderRadius: 3,
            borderWidth: 3,
            borderColor: '#00BFAE',
            color: '#00BFAE',
            '&:hover': {
              borderWidth: 3,
              borderColor: '#00BFAE',
              color: '#00BFAE',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 32px rgba(0, 191, 174, 0.2)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          First Time Configuration
        </Button>
      </Box>
    </Box>
  );
};

export default ActionButtons;
