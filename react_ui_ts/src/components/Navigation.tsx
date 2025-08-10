import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Chip,
  Divider
} from '@mui/material';
import {
  Home as HomeIcon,
  Settings as SettingsIcon,
  Edit as EditIcon
} from '@mui/icons-material';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  customColor?: string;
}

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const navItems: NavItem[] = [
    { path: '/', label: 'Home', icon: <HomeIcon /> },
    { path: '/manage', label: 'Manage', icon: <EditIcon /> }, // Use default primary color
    { path: '/configure', label: 'Configure', icon: <SettingsIcon />, customColor: '#666666' } // Dark gray
  ];

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
                  variant={isActive(item.path) ? "contained" : "text"}
                  color={isActive(item.path) ? "primary" : "inherit"}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    minWidth: 120,
                    justifyContent: 'center',
                    // Add borders with feature card colors
                    ...(item.path === '/manage' && {
                      border: '2px solid',
                      borderColor: 'secondary.main',
                      '&:hover': {
                        borderColor: 'secondary.main',
                        backgroundColor: 'rgba(108, 92, 231, 0.1)',
                      },
                    }),
                    ...(item.path === '/configure' && {
                      border: '2px solid',
                      borderColor: '#00BFAE',
                      '&:hover': {
                        borderColor: '#00BFAE',
                        backgroundColor: 'rgba(0, 191, 174, 0.1)',
                      },
                    }),
                    // Custom colors for specific navigation items
                    ...(item.customColor && {
                      color: isActive(item.path) ? 'white' : item.customColor,
                      backgroundColor: isActive(item.path) ? item.customColor : 'transparent',
                      '&:hover': {
                        backgroundColor: isActive(item.path)
                          ? item.customColor
                          : `${item.customColor}20`, // 20% opacity for hover
                      },
                    }),
                    // Default hover behavior for items without custom colors
                    ...(!item.customColor && {
                      '&:hover': {
                        backgroundColor: isActive(item.path)
                          ? '#5f3dc4'
                          : 'rgba(108, 92, 231, 0.1)',
                      },
                    }),
                  }}
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
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation;
