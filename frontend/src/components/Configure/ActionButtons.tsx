import React from 'react';
import {
  Box,
  Button,
} from '@mui/material';
import {
  Help as HelpIcon,
} from '@mui/icons-material';

interface ActionButtonsProps {
  onShowHelp: () => void;
  onUpdateCredentials: () => void;
  areCredentialsOriginal: boolean;
  isFormValid: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onShowHelp,
  onUpdateCredentials,
  areCredentialsOriginal,
  isFormValid,
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
      <Button
        variant="outlined"
        startIcon={<HelpIcon />}
        onClick={onShowHelp}
        sx={{
          borderRadius: 2,
          px: 4,
          py: 1.5,
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 32px rgba(108, 92, 231, 0.2)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        Need Help?
      </Button>

      <Button
        variant="contained"
        onClick={onUpdateCredentials}
        disabled={!isFormValid}
        sx={{
          px: 3,
          py: 1,
          borderRadius: 2,
          fontSize: '0.875rem',
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1565c0 0%, #1e88e5 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
          },
          '&:disabled': {
            background: '#2d2d2d',
            color: '#666',
          },
          transition: 'all 0.3s ease',
        }}
      >
        {areCredentialsOriginal ? '(Optional) Save Credentials' : '(Optional) Update Credentials'}
      </Button>
    </Box>
  );
};

export default ActionButtons;
