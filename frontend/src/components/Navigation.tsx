import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container, Chip, Divider } from '@mui/material';
import { Home as HomeIcon, Settings as SettingsIcon, Edit as EditIcon } from '@mui/icons-material';
import { getNavButtonSx } from './navStyles';
import ProfileSelector from './ProfileSelector';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  customColor?: string;
}

type NavigationProps = {
  profiles: string[];
  profile: string;
  hasDbCreds: boolean;
  setProfile: React.Dispatch<React.SetStateAction<string>>;
  setProfiles: React.Dispatch<React.SetStateAction<string[]>>;
};

const Navigation: React.FC<NavigationProps> = ({ profiles, profile, hasDbCreds, setProfile, setProfiles }) => {
  const location = useLocation();

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const navItems: NavItem[] = [
    { path: '/', label: 'Home', icon: <HomeIcon /> },
    { path: '/manage', label: 'Manage', icon: <EditIcon /> },
    { path: '/configure', label: 'Configure', icon: <SettingsIcon />, customColor: '#666666' } // Dark gray
  ];

  // no local state here; all state lifted to App

  return (
    <AppBar position="static" elevation={0}>
      <Container maxWidth="xl">
        <Toolbar sx={{ minHeight: 70 }}>
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'primary.main',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&:hover': {
                color: 'primary.light',
              },
            }}
          >
            <Chip
              label="SS"
              color="primary"
              size="small"
              sx={{
                fontWeight: 'bold',
                fontSize: '0.8rem',
                backgroundColor: '#6c5ce7',
                color: '#ffffff',
              }}
            />
            Stream Save
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {navItems.map((item, index) => (
              <React.Fragment key={item.path}>
                <Button
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  variant={isActive(item.path) ? 'outlined' : 'text'}
                  color={isActive(item.path) ? 'primary' : 'inherit'}
                  sx={getNavButtonSx(
                    isActive(item.path),
                    item.path === '/manage' ? 'manage' : item.path === '/configure' ? 'configure' : item.path === '/' ? 'home' : 'default'
                  )}
                >
                  {item.label}
                </Button>
                {index < navItems.length - 1 && (
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      height: 32,
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                      mx: 0.5
                    }}
                  />
                )}
              </React.Fragment>
            ))}
            <Divider orientation="vertical" flexItem sx={{ height: 32, borderColor: 'rgba(255, 255, 255, 0.12)', mx: 1 }} />
            <ProfileSelector
              profiles={profiles}
              profile={profile}
              hasDbCreds={hasDbCreds}
              setProfile={setProfile}
              setProfiles={setProfiles}
              size="medium"
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 48,
                  alignItems: 'center',
                },
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                },
              }}
            />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation;
