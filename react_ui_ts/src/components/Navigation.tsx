import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Chip
} from '@mui/material';
import {
  Home as HomeIcon,
  Settings as SettingsIcon,
  Edit as EditIcon
} from '@mui/icons-material';

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Home', icon: <HomeIcon /> },
    { path: '/manage', label: 'Manage', icon: <EditIcon /> },
    { path: '/configure', label: 'Configure', icon: <SettingsIcon /> }
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

          <Box sx={{ display: 'flex', gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
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
                  '&:hover': {
                    backgroundColor: isActive(item.path)
                      ? '#5f3dc4'
                      : 'rgba(108, 92, 231, 0.1)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation;
