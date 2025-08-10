import React from 'react';
import { Box, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface AddContentButtonProps {
  onClick: () => void;
}

const AddContentButton: React.FC<AddContentButtonProps> = ({ onClick }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onClick}
        sx={{
          borderRadius: 2,
          background: 'linear-gradient(45deg, #2E7D32 30%, #388E3C 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1B5E20 30%, #2E7D32 90%)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 20px rgba(46, 125, 50, 0.3)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        Add Saved Stream Link
      </Button>
    </Box>
  );
};

export default AddContentButton;
