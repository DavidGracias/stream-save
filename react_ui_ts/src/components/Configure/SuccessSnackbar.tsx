import React from 'react';
import { Snackbar } from '@mui/material';

interface SuccessSnackbarProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

const SuccessSnackbar: React.FC<SuccessSnackbarProps> = ({ open, message, onClose }) => {
  return (
    <Snackbar
      open={open}
      onClose={onClose}
      autoHideDuration={2000}
      message={message}
    />
  );
};

export default SuccessSnackbar;
