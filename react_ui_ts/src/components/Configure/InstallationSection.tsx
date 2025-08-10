import React from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Tooltip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  InstallDesktop as InstallDesktopIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import stremioSymbol from '../../assets/stremio_symbol.png';

interface InstallationSectionProps {
  installUrl: string;
  formData: any;
  showPassword: boolean;
  onOpenInStremio: () => void;
  onCopyUrl: () => void;
}

const InstallationSection: React.FC<InstallationSectionProps> = ({
  installUrl,
  formData,
  showPassword,
  onOpenInStremio,
  onCopyUrl,
}) => {
  if (!installUrl) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <img
          src={stremioSymbol}
          alt="Stremio"
          style={{
            width: 32,
            height: 32,
            marginRight: 16
          }}
        />
        <Typography variant="h6" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
          Install to Stremio
        </Typography>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', alignItems: 'stretch' }}>
        <Button
          variant="contained"
          onClick={onOpenInStremio}
          disabled={!installUrl}
          startIcon={
            <InstallDesktopIcon sx={{ color: 'white' }} />
          }
          sx={{
            px: 3,
            py: 1,
            borderRadius: '8px 0 0 8px',
            fontSize: '1rem',
            background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5f3dc4 0%, #8b7ae6 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 16px rgba(108, 92, 231, 0.3)',
            },
            transition: 'all 0.3s ease',
            border: 'none',
            minWidth: 'auto',
            height: '56px',
          }}
        >
          Open in Stremio
        </Button>
        <TextField
          fullWidth
          label="Addon URL (manifest.json)"
          value={showPassword ? installUrl : installUrl.replace(formData.pass, '<db_password>')}
          variant="outlined"
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Copy URL">
                  <IconButton
                    onClick={onCopyUrl}
                    sx={{
                      color: '#4caf50',
                      '&:hover': {
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      },
                    }}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '0 8px 8px 0',
              '& fieldset': {
                borderColor: '#2d2d2d',
                borderLeft: 'none',
              },
              '&:hover fieldset': {
                borderColor: 'primary.main',
                borderLeft: 'none',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
                borderLeft: 'none',
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default InstallationSection;
