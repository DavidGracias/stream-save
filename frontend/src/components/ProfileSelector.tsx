import React from 'react';
import { TextField, MenuItem, Box, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export type ProfileSelectorProps = {
  profiles: string[];
  profile: string;
  hasDbCreds?: boolean;
  label?: string;
  size?: 'small' | 'medium';
  setProfile: React.Dispatch<React.SetStateAction<string>>;
  setProfiles: React.Dispatch<React.SetStateAction<string[]>>;
  sx?: any;
};

const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  profiles,
  profile,
  hasDbCreds = true,
  label = 'Profile',
  size = 'small',
  setProfile,
  setProfiles,
  sx,
}) => {
  return (
    <TextField
      size={size}
      label={label}
      variant="outlined"
      select
      value={profile}
      onChange={(e) => {
        const val = (e.target as any).value as string;
        if (val === '__add__') {
          const input = prompt('Enter new profile name');
          if (!input?.trim()) return;
          const trimmed = input.trim();
          const updatedProfiles = Array.from(new Set([...profiles, trimmed])) as string[];
          setProfiles(updatedProfiles);
          setProfile(trimmed);
          return;
        }
        setProfile(val);
      }}
      disabled={!hasDbCreds}
      sx={{
        minWidth: 180,
        '& .MuiOutlinedInput-root': {
          '& fieldset': { borderColor: '#2d2d2d' },
          '&:hover fieldset': { borderColor: 'primary.main' },
          '&.Mui-focused fieldset': { borderColor: 'primary.main' },
        },
        ...sx,
      }}
      SelectProps={{ renderValue: (selected) => (selected as string) || '' }}
    >
      {profiles.map((p) => (
        <MenuItem key={p} value={p}>
          {p}
        </MenuItem>
      ))}
      <MenuItem value="__add__" sx={{ whiteSpace: 'nowrap' }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, whiteSpace: 'nowrap' }}>
          <AddIcon fontSize="small" />
          <Typography variant="body2" noWrap>
            Add profile
          </Typography>
        </Box>
      </MenuItem>
    </TextField>
  );
};

export default ProfileSelector;


