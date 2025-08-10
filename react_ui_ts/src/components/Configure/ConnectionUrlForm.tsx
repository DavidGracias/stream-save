import React from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import type { FormData } from '../../types';

interface ConnectionUrlFormProps {
  formData: FormData;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  onUrlChange: (url: string) => void;
}

const ConnectionUrlForm: React.FC<ConnectionUrlFormProps> = ({
  formData,
  showPassword,
  setShowPassword,
  onUrlChange,
}) => {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SecurityIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Enter MongoDB Connection URL
        </Typography>
      </Box>

      {/* Input Field */}
      <Box sx={{ mb: 4 }}>
        {/* Normal input field with overlay */}
        <Box sx={{ position: 'relative', mb: 2 }}>
          <TextField
            fullWidth
            label="MongoDB Connection URL"
            value={formData.db_url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="mongodb+srv://<db_username>:<db_password>@<db_cluster>.mongodb.net"
            variant="outlined"
            multiline
            rows={2}
            sx={{
              fontFamily: 'monospace',
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'rgba(108, 92, 231, 0.1)',
                      },
                    }}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Overlay when password is hidden - covers most of TextField but leaves eye icon visible */}
          {!showPassword && formData.db_url && (
            <Box
              sx={{
                position: 'absolute',
                top: '8px', // Add padding from top
                left: '8px', // Add padding from left
                right: '68px', // Leave space for eye icon + padding
                bottom: '8px', // Add padding from bottom
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  px: 2,
                  fontWeight: 400,
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
                }}
              >
                Password hidden - Click eye icon to reveal
              </Typography>
            </Box>
          )}
        </Box>

        {/* Colored display underneath */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic', fontSize: '0.9em' }}>
          <span style={{ color: '#666666' }}>Example: </span>mongodb+srv://
          <span style={{ color: '#87CEEB' }}>
            {formData.user || '<db_username>'}
          </span>
          :
          <span style={{ color: '#FFB6C1' }}>
            {
              formData.pass && showPassword ? formData.pass : '<db_password>'
            }
          </span>
          @
          <span style={{ color: '#FFD700' }}>
            {formData.cluster || '<db_cluster>'}
          </span>
          .mongodb.net
        </Typography>
      </Box>
    </Box>
  );
};

export default ConnectionUrlForm;
