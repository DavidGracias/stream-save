import React from 'react';
import { Box, Typography, Button, Tooltip, IconButton, Divider, Alert } from '@mui/material';
import {
  InstallDesktop as InstallDesktopIcon,
  ContentCopy as ContentCopyIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import stremioSymbol from '../../assets/stremio_symbol.png';
import ProfileSelector from '../ProfileSelector';

interface InstallationSectionProps {
  installUrl: string;
  formData: { user: string; pass: string; cluster: string; db_url: string };
  showPassword: boolean;
  onOpenInStremio: () => void;
  onCopyUrl: () => void;
  profiles?: string[];
  profile?: string;
  hasDbCreds?: boolean;
  setProfile: React.Dispatch<React.SetStateAction<string>>;
  setProfiles: React.Dispatch<React.SetStateAction<string[]>>;
}

const InstallationSection: React.FC<InstallationSectionProps> = ({
  installUrl,
  formData,
  showPassword,
  onOpenInStremio,
  onCopyUrl,
  profiles = [],
  profile = 'admin',
  hasDbCreds = true,
  setProfile,
  setProfiles,
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

      <Box sx={{ mb: 2, display: 'flex', alignItems: 'stretch', gap: 2, flexWrap: 'wrap' }}>
        <ProfileSelector
          profiles={profiles}
          profile={profile}
          hasDbCreds={hasDbCreds}
          setProfile={setProfile}
          setProfiles={setProfiles}
          label="Profile"
          size="medium"
          sx={{
            minWidth: 220,
            '& .MuiOutlinedInput-root': {
              height: 48,
              alignItems: 'center',
              '& fieldset': { borderColor: '#6c5ce7' },
              '&:hover fieldset': { borderColor: '#8b7ae6' },
              '&.Mui-focused fieldset': { borderColor: '#a29bfe' },
            },
            '& .MuiSelect-select': { display: 'flex', alignItems: 'center', paddingTop: '10px', paddingBottom: '10px' },
          }}
        />
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
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            border: '1px solid',
            borderColor: '#2d2d2d',
            borderLeft: 'none',
            borderRadius: '0 8px 8px 0',
            px: 2,
            height: '56px',
            overflow: 'hidden',
            '&:hover': { borderColor: 'primary.main' },
          }}
        >
          <Box sx={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.95rem', userSelect: 'text' }} aria-label="Addon URL (manifest.json)">
            {(() => {
              try {
                const u = new URL(installUrl);
                const parts = u.pathname.split('/').filter(Boolean);
                const [user, pass, cluster, maybeProfile, ...rest] = parts;
                const maskedPass = showPassword ? pass : '<db_password>';
                const hasProfile = !!maybeProfile && maybeProfile !== 'manifest.json' && maybeProfile !== 'catalog' && maybeProfile !== 'stream';
                const tail = rest.length ? '/' + rest.join('/') : '';
                return (
                  <>
                    <span>{u.origin}/</span>
                    <span style={{ color: '#87CEEB' }}>{user}</span>
                    <span>/</span>
                    <span style={{ color: '#FFB6C1' }}>{maskedPass}</span>
                    <span>/</span>
                    <span style={{ color: '#FFD700' }}>{cluster}</span>
                    {hasProfile && (
                      <>
                        <span>/</span>
                        <span style={{ color: '#6c5ce7' }}>{maybeProfile}</span>
                      </>
                    )}
                    <span>{tail}</span>
                  </>
                );
              } catch {
                const safeUrl = showPassword ? installUrl : installUrl.replace(formData.pass, '<db_password>');
                return <span>{safeUrl}</span>;
              }
            })()}
          </Box>
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
        </Box>
      </Box>

      {/* Installation Instructions */}
      <Alert
        severity="info"
        icon={<InfoIcon />}
        sx={{
          mb: 2,
          background: 'rgba(33, 150, 243, 0.1)',
          border: '1px solid rgba(33, 150, 243, 0.3)',
          '& .MuiAlert-icon': {
            color: '#2196f3'
          }
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
          📱 <strong>How to install in Stremio:</strong>
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          1. Copy the URL above (click the copy button)
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          2. Go to <a href="https://web.stremio.com/#/addons" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>web.stremio.com/#/addons</a>
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          3. Click the <strong>"+ Add addon"</strong> button
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          4. Paste the URL and click Install
        </Typography>
        <Typography variant="body2">
          5. Your Stream Save addon is now active in Stremio!
        </Typography>
      </Alert>
    </Box>
  );
};

export default InstallationSection;
