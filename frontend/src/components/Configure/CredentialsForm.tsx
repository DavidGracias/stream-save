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

interface CredentialsFormProps {
  formData: FormData;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  onFieldChange: (field: string, value: string) => void;
  profiles?: string[];
  profile?: string;
}

const CredentialsForm: React.FC<CredentialsFormProps> = ({
  formData,
  showPassword,
  setShowPassword,
  onFieldChange,
}) => {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SecurityIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Enter MongoDB Credentials
        </Typography>
      </Box>

      {/* Color Legend */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: '#87CEEB', borderRadius: 1 }} />
          <Typography variant="body2" color="text.secondary">Username</Typography>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: '#FFB6C1', borderRadius: 1 }} />
          <Typography variant="body2" color="text.secondary">Password</Typography>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: '#FFD700', borderRadius: 1 }} />
          <Typography variant="body2" color="text.secondary">Cluster</Typography>
        </Box>
      </Box>

      {/* Input Fields */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            label="Username"
            value={formData.user}
            onChange={(e) => onFieldChange('user', e.target.value)}
            placeholder="Your MongoDB username"
            variant="outlined"
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#87CEEB',
                },
                '&:hover fieldset': {
                  borderColor: '#5F9EA0',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#87CEEB',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#87CEEB',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#87CEEB',
              },
            }}
          />
        </Box>
        {/* Removed read-only Selected Profile field per request */}
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.pass}
            onChange={(e) => onFieldChange('pass', e.target.value)}
            placeholder="Your MongoDB Password"
            variant="outlined"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{
                      color: '#FFB6C1',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 182, 193, 0.1)',
                      },
                    }}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#FFB6C1',
                },
                '&:hover fieldset': {
                  borderColor: '#FF69B4',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#FFB6C1',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#FFB6C1',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#FFB6C1',
              },
            }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            label="Cluster Name"
            value={formData.cluster}
            onChange={(e) => onFieldChange('cluster', e.target.value)}
            placeholder="Your cluster name"
            variant="outlined"
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#FFD700',
                },
                '&:hover fieldset': {
                  borderColor: '#FFA500',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#FFD700',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#FFD700',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#FFD700',
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default CredentialsForm;
